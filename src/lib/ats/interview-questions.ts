
import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";

export interface GenerateInterviewQuestionsInput {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
}

export interface InterviewQuestionsResponse {
  generated_at: string;
  role: string;
  technical: string[];
  project: string[];
  behavioral: string[];
  hr: string[];
}

export type InterviewQuestionsResult =
  | { success: true; data: InterviewQuestionsResponse }
  | { success: false; error: string; isQuotaError: boolean };

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function buildInterviewQuestionsPrompt(input: GenerateInterviewQuestionsInput): string {
  const jdBlock = input.jobDescription?.trim()
    ? `\nJOB DESCRIPTION:\n${input.jobDescription}\n`
    : "";
  return `You are an expert career coach and interviewer. Return ONLY valid JSON. No markdown, no explanations, no text outside JSON.

OUTPUT SCHEMA:
{
  "technical": ["question 1", "question 2", ...],
  "project": ["question 1", "question 2", ...],
  "behavioral": ["question 1", "question 2", ...],
  "hr": ["question 1", "question 2", ...]
}

Generate 5 questions for each category:
1. Technical: Questions about the skills and technologies from the resume
2. Project: Questions about the projects mentioned in the resume
3. Behavioral: STAR format (Situation, Task, Action, Result) questions
4. HR: Questions about motivation, company fit, etc.

TARGET ROLE:
${input.targetRole}${jdBlock}
RESUME:
${input.resumeText}
`;
}

function parseInterviewQuestionsJson(raw: string): {
  technical: string[];
  project: string[];
  behavioral: string[];
  hr: string[];
} | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    const parsed = JSON.parse(cleaned) as any;
    if (
      Array.isArray(parsed.technical) &&
      Array.isArray(parsed.project) &&
      Array.isArray(parsed.behavioral) &&
      Array.isArray(parsed.hr)
    ) {
      return {
        technical: parsed.technical,
        project: parsed.project,
        behavioral: parsed.behavioral,
        hr: parsed.hr,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function isQuotaOrRateLimitError(error: unknown): boolean {
  const errorStr = JSON.stringify(error).toLowerCase();
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    errorStr.includes("429") ||
    errorStr.includes("resource_exhausted") ||
    errorStr.includes("quota exceeded") ||
    errorStr.includes("rate limit") ||
    errorStr.includes("rate_limit") ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("rate limit")
  );
}

async function tryGroqInterviewQuestions(
  prompt: string,
): Promise<InterviewQuestionsResponse | null> {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: GROQ_ANALYSIS_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    const raw = response.choices[0]?.message?.content ?? "";
    return parseInterviewQuestionsJson(raw);
  } catch {
    return null;
  }
}

async function tryGeminiInterviewQuestions(
  prompt: string,
): Promise<InterviewQuestionsResponse | null> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const raw = response.text ?? "";
    return parseInterviewQuestionsJson(raw);
  } catch {
    return null;
  }
}

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput,
): Promise<InterviewQuestionsResult> {
  const prompt = buildInterviewQuestionsPrompt(input);

  let questions: {
    technical: string[];
    project: string[];
    behavioral: string[];
    hr: string[];
  } | null = null;

  try {
    const groqResult = await tryGroqInterviewQuestions(prompt);
    if (groqResult) {
      questions = groqResult;
    }
  } catch (error) {
    if (isQuotaOrRateLimitError(error)) {
      return {
        success: false,
        error: "Daily AI limit reached. Please try again later.",
        isQuotaError: true,
      };
    }
  }

  if (!questions) {
    try {
      const geminiResult = await tryGeminiInterviewQuestions(prompt);
      if (geminiResult) {
        questions = geminiResult;
      }
    } catch (error) {
      if (isQuotaOrRateLimitError(error)) {
        return {
          success: false,
          error: "Daily AI limit reached. Please try again later.",
          isQuotaError: true,
        };
      }
    }
  }

  if (!questions) {
    return {
      success: false,
      error: "Could not generate interview questions. Please try again.",
      isQuotaError: false,
    };
  }

  const fullQuestions: InterviewQuestionsResponse = {
    generated_at: new Date().toISOString(),
    role: input.targetRole,
    ...questions,
  };

  return { success: true, data: fullQuestions };
}

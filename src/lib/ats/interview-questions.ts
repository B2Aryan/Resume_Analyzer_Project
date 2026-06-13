
import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";

export interface GenerateInterviewQuestionsInput {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
}

export interface TechnicalQuestion {
  question: string;
  expectedAnswerPoints: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface InterviewQuestionsResponse {
  generated_at: string;
  role: string;
  project_questions: string[];
  technical_questions: TechnicalQuestion[];
  behavioral_questions: string[];
  system_design_questions: string[];
  follow_up_questions: string[];
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
  "project_questions": ["question 1", "question 2", ...],
  "technical_questions": [
    {
      "question": "question text",
      "expectedAnswerPoints": ["point 1", "point 2", ...],
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ],
  "behavioral_questions": ["question 1", "question 2", ...],
  "system_design_questions": ["question 1", "question 2", ...],
  "follow_up_questions": ["question 1", "question 2", ...]
}

DIFFICULTY DISTRIBUTION:
30% Easy, 40% Medium, 30% Hard across all questions.

PROJECT QUESTIONS REQUIREMENTS:
- For EVERY project mentioned in the resume, generate at least:
  1. Architecture question
  2. Tradeoff question
  3. Optimization question
- Directly reference project names, technologies, and achievements
- Total: 6-8 questions

TECHNICAL QUESTIONS REQUIREMENTS:
- Must directly reference skills, technologies, and experience from resume
- Include expectedAnswerPoints (key points the candidate should mention)
- Include difficulty level (Easy/Medium/Hard)
- 30% Easy, 40% Medium, 30% Hard
- Total: 8-10 questions

BEHAVIORAL QUESTIONS REQUIREMENTS:
- STAR format (Situation, Task, Action, Result)
- Reference specific experiences from the resume
- Total: 5-7 questions

SYSTEM DESIGN QUESTIONS REQUIREMENTS:
- Relevant to target role and resume experience
- Directly reference technologies from resume
- Total: 3-5 questions

FOLLOW UP QUESTIONS REQUIREMENTS:
- Questions that dig deeper into answers to the above questions
- For example: "Can you tell me more about X decision you made on project Y?"
- Total: 4-6 questions

GENERAL REQUIREMENTS:
- Prioritize questions that directly reference project names, technologies, achievements, and experience from the resume
- Avoid generic questions unless resume content is truly insufficient
- Make questions specific and tailored to the candidate's background

TARGET ROLE:
${input.targetRole}${jdBlock}
RESUME:
${input.resumeText}
`;
}

function parseInterviewQuestionsJson(raw: string): {
  project_questions: string[];
  technical_questions: TechnicalQuestion[];
  behavioral_questions: string[];
  system_design_questions: string[];
  follow_up_questions: string[];
} | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    const parsed = JSON.parse(cleaned) as any;
    if (
      Array.isArray(parsed.project_questions) &&
      Array.isArray(parsed.technical_questions) &&
      Array.isArray(parsed.behavioral_questions) &&
      Array.isArray(parsed.system_design_questions) &&
      Array.isArray(parsed.follow_up_questions)
    ) {
      const validateTechnical = (q: any) => 
        typeof q.question === "string" &&
        Array.isArray(q.expectedAnswerPoints) &&
        (q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard");
      
      return {
        project_questions: parsed.project_questions,
        technical_questions: parsed.technical_questions.filter(validateTechnical),
        behavioral_questions: parsed.behavioral_questions,
        system_design_questions: parsed.system_design_questions,
        follow_up_questions: parsed.follow_up_questions,
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
): Promise<{
  project_questions: string[];
  technical_questions: TechnicalQuestion[];
  behavioral_questions: string[];
  system_design_questions: string[];
  follow_up_questions: string[];
} | null> {
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
): Promise<{
  project_questions: string[];
  technical_questions: TechnicalQuestion[];
  behavioral_questions: string[];
  system_design_questions: string[];
  follow_up_questions: string[];
} | null> {
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
    project_questions: string[];
    technical_questions: TechnicalQuestion[];
    behavioral_questions: string[];
    system_design_questions: string[];
    follow_up_questions: string[];
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

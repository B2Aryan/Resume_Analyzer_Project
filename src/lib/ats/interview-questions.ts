
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
  return `You are an expert SDE internship interviewer at a product company. Return ONLY valid JSON. No markdown, no explanations, no text outside JSON.

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

STRICT QUESTION QUALITY FILTER:
REJECT ANY QUESTION THAT COULD BE ASKED TO A CANDIDATE WHO HAS NEVER SEEN THIS RESUME.

BEFORE RETURNING ANY QUESTION, VERIFY:
1. The question references AT LEAST ONE OF:
   - a specific project,
   - a specific implementation,
   - a specific architectural decision,
   - a specific bug,
   - a specific optimization,
   - a specific deployment choice.
2. If the project name is removed from the question and it still makes sense, REWRITE IT TO BE MORE SPECIFIC.

BAD EXAMPLES:
- "What is MongoDB?"
- "How does React work?"
- "What is Git?"
- "In the K A Gupta project, what is MongoDB?"

GOOD EXAMPLES:
- "In the K A Gupta website, how did you design the MongoDB schema for consultation requests and what indexes would you add if traffic increased 100x?"
- "Why did you choose MongoDB instead of PostgreSQL for the K A Gupta website and what tradeoffs did you accept?"

STRICT RULES:
1. NO TEXTBOOK QUESTIONS: Never ask "What is X?" for any technology, framework, or tool
2. ALL QUESTIONS MUST BE TIED TO RESUME CONTENT
3. FEWER, DEEPER QUESTIONS: Focus on depth over quantity
4. EXPECTED ANSWER POINTS: Focus on architecture, tradeoffs, scalability, performance, security, debugging, deployment

DIFFICULTY: SDE internship interview level at a product company

PROJECT QUESTIONS REQUIREMENTS:
- For EVERY project mentioned in the resume, generate questions about:
  - Architecture decisions and why they were made
  - Tradeoffs considered and choices made
  - Performance optimizations implemented
  - Bugs encountered and debugging process
  - Deployment strategies
- Directly reference project names, technologies, and achievements
- Total: 4-6 questions

TECHNICAL QUESTIONS REQUIREMENTS:
- EVERY QUESTION MUST BE TIED TO A SPECIFIC PROJECT, FEATURE, OR EXPERIENCE FROM THE RESUME
- NO TEXTBOOK QUESTIONS
- Include expectedAnswerPoints focusing on: architecture, tradeoffs, scalability, performance, security, debugging, deployment
- Include difficulty level (Easy/Medium/Hard)
- Total: 5-7 questions

BEHAVIORAL QUESTIONS REQUIREMENTS:
- STAR format (Situation, Task, Action, Result)
- Reference specific experiences from the resume
- Total: 3-5 questions

SYSTEM DESIGN QUESTIONS REQUIREMENTS:
- MUST BE DERIVED DIRECTLY FROM THE CANDIDATE'S PROJECTS (NO GENERIC INDUSTRY SYSTEMS)
- For example, if they built a chat app, ask them to redesign/scale that specific chat app
- Total: 2-3 questions

FOLLOW UP QUESTIONS REQUIREMENTS:
- Questions that dig deeper into answers to the above questions
- Total: 3-4 questions

GENERAL REQUIREMENTS:
- All questions must feel like a real SDE internship interview
- Prioritize questions that directly reference project names, technologies, achievements, and experience from the resume
- If resume content is insufficient, state that clearly in the JSON but still make best effort

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

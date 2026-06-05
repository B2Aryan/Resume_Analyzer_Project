
import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";

export interface InterviewFeedback {
  score: number;
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  strengths: string[];
  missingPoints: string[];
  summary: string;
  improvedAnswer: string;
}

export interface EvaluateInterviewAnswerInput {
  question: string;
  answer: string;
  role: string;
}

export interface EvaluateInterviewAnswerResult {
  success: boolean;
  data?: InterviewFeedback;
  error?: string;
  isQuotaError?: boolean;
}

interface InterviewFeedbackJson {
  score: number;
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  strengths: string[];
  missingPoints: string[];
  summary: string;
  improvedAnswer: string;
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function buildEvaluationPrompt(input: EvaluateInterviewAnswerInput): string {
  return `You are a senior technical interviewer specializing in the ${input.role} role.

Target Role:
${input.role}

Question:
${input.question}

Candidate Answer:
${input.answer}

Evaluate the answer specifically for the ${input.role} role.
- Adjust scoring based on role seniority and skill expectations
- Highlight role-specific strengths
- Mention role-relevant missing points
- Generate an improved answer appropriate for ${input.role}
- Provide detailed breakdown of scores

Return JSON only:

{
  "score": 0-10,
  "technicalAccuracy": 0-10,
  "communication": 0-10,
  "completeness": 0-10,
  "strengths": ["..."],
  "missingPoints": ["..."],
  "summary": "short interviewer-style assessment",
  "improvedAnswer": "..."
}

Be strict and realistic.`;
}

function parseEvaluationJson(raw: string): InterviewFeedback | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    // Extract first JSON object from response (non-greedy)
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (!match) {
      console.warn("[InterviewEvaluator] No valid JSON object found in response");
      return null;
    }
    const parsed = JSON.parse(match[0]) as InterviewFeedbackJson;
    
    const validateScore = (n: unknown): n is number => 
      typeof n === "number" && n >= 0 && n <= 10;

    if (
      validateScore(parsed.score) &&
      validateScore(parsed.technicalAccuracy) &&
      validateScore(parsed.communication) &&
      validateScore(parsed.completeness) &&
      Array.isArray(parsed.strengths) &&
      parsed.strengths.every(s => typeof s === "string") &&
      Array.isArray(parsed.missingPoints) &&
      parsed.missingPoints.every(m => typeof m === "string") &&
      typeof parsed.summary === "string" &&
      parsed.summary.trim().length > 0 &&
      typeof parsed.improvedAnswer === "string" &&
      parsed.improvedAnswer.trim().length > 0
    ) {
      return {
        score: parsed.score,
        technicalAccuracy: parsed.technicalAccuracy,
        communication: parsed.communication,
        completeness: parsed.completeness,
        strengths: parsed.strengths,
        missingPoints: parsed.missingPoints,
        summary: parsed.summary,
        improvedAnswer: parsed.improvedAnswer,
      };
    }
    console.warn("[InterviewEvaluator] JSON validation failed", parsed);
    return null;
  } catch (error) {
    console.warn("[InterviewEvaluator] Failed to parse JSON", error, "raw:", raw);
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

async function tryGroqEvaluation(
  prompt: string,
): Promise<InterviewFeedback | null> {
  console.log("[InterviewEvaluator] Using Groq provider");
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: GROQ_ANALYSIS_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });
  const raw = response.choices[0]?.message?.content ?? "";
  const result = parseEvaluationJson(raw);
  console.log("[InterviewEvaluator] Groq result success:", !!result);
  return result;
}

async function tryGeminiEvaluation(
  prompt: string,
): Promise<InterviewFeedback | null> {
  console.log("[InterviewEvaluator] Using Gemini provider (fallback)");
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const raw = response.text || "";
  const result = parseEvaluationJson(raw);
  console.log("[InterviewEvaluator] Gemini result success:", !!result);
  return result;
}

/**
 * Evaluate an interview answer using AI (Groq primary → Gemini fallback).
 */
export async function evaluateInterviewAnswer(
  input: EvaluateInterviewAnswerInput,
): Promise<EvaluateInterviewAnswerResult> {
  console.log("[InterviewEvaluator] Starting evaluation");
  // Validate answer length before any API call
  if (input.answer.trim().length < 20) {
    console.log("[InterviewEvaluator] Answer too short, rejecting");
    return {
      success: false,
      error: "Please provide a more detailed answer.",
      isQuotaError: false,
    };
  }

  const prompt = buildEvaluationPrompt(input);

  try {
    const groqResult = await tryGroqEvaluation(prompt);
    if (groqResult) {
      console.log("[InterviewEvaluator] Successfully evaluated with Groq");
      return { success: true, data: groqResult };
    }
  } catch (error) {
    console.warn("[InterviewEvaluator] Groq error:", error);
    if (isQuotaOrRateLimitError(error)) {
      console.warn("[InterviewEvaluator] Groq quota/rate limit hit");
      return {
        success: false,
        error: "Daily AI limit reached. Please try again later.",
        isQuotaError: true,
      };
    }
  }

  try {
    const geminiResult = await tryGeminiEvaluation(prompt);
    if (geminiResult) {
      console.log("[InterviewEvaluator] Successfully evaluated with Gemini fallback");
      return { success: true, data: geminiResult };
    }
  } catch (error) {
    console.warn("[InterviewEvaluator] Gemini error:", error);
    if (isQuotaOrRateLimitError(error)) {
      console.warn("[InterviewEvaluator] Gemini quota/rate limit hit");
      return {
        success: false,
        error: "Daily AI limit reached. Please try again later.",
        isQuotaError: true,
      };
    }
  }

  console.error("[InterviewEvaluator] All evaluation attempts failed");
  return {
    success: false,
    error: "Could not evaluate interview answer. Please try again.",
    isQuotaError: false,
  };
}

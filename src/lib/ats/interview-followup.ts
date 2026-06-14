import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";

export interface GenerateFollowUpInput {
  originalQuestion: string;
  candidateAnswer: string;
  score: number;
  strengths: string[];
  missingPoints: string[];
  role: string;
}

export interface FollowUpResponse {
  shouldAskFollowUp: boolean;
  followUpQuestion: string | null;
}

export interface GenerateFollowUpResult {
  success: boolean;
  data?: FollowUpResponse;
  error?: string;
  isQuotaError?: boolean;
}

interface FollowUpJson {
  shouldAskFollowUp: boolean;
  followUpQuestion: string | null;
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function buildFollowUpPrompt(input: GenerateFollowUpInput): string {
  return `You are a senior technical interviewer conducting a ${input.role} interview.

Original Question:
${input.originalQuestion}

Candidate Answer:
${input.candidateAnswer}

Evaluation Score: ${input.score}/10
Candidate Strengths:
${input.strengths.map(s => `- ${s}`).join("\n")}

Missing Points/Areas to Explore:
${input.missingPoints.map(m => `- ${m}`).join("\n")}

Rules:
1. Only ask a follow-up question if the overall score >= 6
2. Follow-up must NOT repeat the original question
3. Follow-up must probe deeper into: Tradeoffs, Scalability, Security, Performance, Architecture, Failure scenarios
4. Follow-up should feel like a real interviewer challenging the candidate's answer
5. Should feel conversational and natural, not robotic
6. If the candidate's answer is too short or irrelevant, shouldAskFollowUp = false

Return JSON only:
{
  "shouldAskFollowUp": true/false,
  "followUpQuestion": "string or null"
}

Be concise and realistic.`;
}

function parseFollowUpJson(raw: string): FollowUpResponse | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (!match) {
      console.warn("[InterviewFollowUp] No valid JSON object found in response");
      return null;
    }
    const parsed = JSON.parse(match[0]) as FollowUpJson;
    
    if (
      typeof parsed.shouldAskFollowUp === "boolean" &&
      (parsed.followUpQuestion === null || typeof parsed.followUpQuestion === "string")
    ) {
      return {
        shouldAskFollowUp: parsed.shouldAskFollowUp,
        followUpQuestion: parsed.followUpQuestion,
      };
    }
    console.warn("[InterviewFollowUp] JSON validation failed", parsed);
    return null;
  } catch (error) {
    console.warn("[InterviewFollowUp] Failed to parse JSON", error, "raw:", raw);
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

async function tryGroqFollowUp(
  prompt: string,
): Promise<FollowUpResponse | null> {
  console.log("[InterviewFollowUp] Using Groq provider");
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: GROQ_ANALYSIS_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });
  const raw = response.choices[0]?.message?.content ?? "";
  const result = parseFollowUpJson(raw);
  console.log("[InterviewFollowUp] Groq result success:", !!result);
  return result;
}

async function tryGeminiFollowUp(
  prompt: string,
): Promise<FollowUpResponse | null> {
  console.log("[InterviewFollowUp] Using Gemini provider (fallback)");
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const raw = response.text || "";
  const result = parseFollowUpJson(raw);
  console.log("[InterviewFollowUp] Gemini result success:", !!result);
  return result;
}

/**
 * Generate a follow-up question for a mock interview.
 */
export async function generateFollowUpQuestion(
  input: GenerateFollowUpInput,
): Promise<GenerateFollowUpResult> {
  console.log("[InterviewFollowUp] Starting follow-up generation");
  
  // Check if score is below threshold immediately
  if (input.score < 6) {
    return {
      success: true,
      data: {
        shouldAskFollowUp: false,
        followUpQuestion: null,
      },
    };
  }

  const prompt = buildFollowUpPrompt(input);

  try {
    const groqResult = await tryGroqFollowUp(prompt);
    if (groqResult) {
      console.log("[InterviewFollowUp] Successfully generated with Groq");
      return { success: true, data: groqResult };
    }
  } catch (error) {
    console.warn("[InterviewFollowUp] Groq error:", error);
    if (isQuotaOrRateLimitError(error)) {
      console.warn("[InterviewFollowUp] Groq quota/rate limit hit");
      return {
        success: false,
        error: "Daily AI limit reached. Please try again later.",
        isQuotaError: true,
      };
    }
  }

  try {
    const geminiResult = await tryGeminiFollowUp(prompt);
    if (geminiResult) {
      console.log("[InterviewFollowUp] Successfully generated with Gemini fallback");
      return { success: true, data: geminiResult };
    }
  } catch (error) {
    console.warn("[InterviewFollowUp] Gemini error:", error);
    if (isQuotaOrRateLimitError(error)) {
      console.warn("[InterviewFollowUp] Gemini quota/rate limit hit");
      return {
        success: false,
        error: "Daily AI limit reached. Please try again later.",
        isQuotaError: true,
      };
    }
  }

  console.error("[InterviewFollowUp] All follow-up generation attempts failed");
  return {
    success: false,
    error: "Could not generate follow-up question. Please try again.",
    isQuotaError: false,
  };
}

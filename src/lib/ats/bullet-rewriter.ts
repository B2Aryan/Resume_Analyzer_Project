import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";

export interface BulletRewriteResult {
  stronger: string;
  atsOptimized: string;
  impactFocused: string;
}

export type BulletRewriteResponse =
  | { success: true; data: BulletRewriteResult }
  | { success: false; error: string; isQuotaError: boolean };

export interface RewriteBulletInput {
  originalBullet: string;
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
}

interface BulletRewriteJson {
  stronger: string;
  atsOptimized: string;
  impactFocused: string;
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function buildBulletRewritePrompt(input: RewriteBulletInput): string {
  const jdBlock = input.jobDescription?.trim()
    ? `\nJOB DESCRIPTION:\n${input.jobDescription}\n`
    : "";

  return `You are an expert resume writer and ATS specialist.
Return ONLY valid JSON. No markdown. No code fences. No explanations. No text outside JSON.

OUTPUT SCHEMA:
{
  "stronger": string,
  "atsOptimized": string,
  "impactFocused": string
}

Rewrite the ORIGINAL BULLET into three improved versions for the TARGET ROLE.

ORIGINAL BULLET:
${input.originalBullet}

TARGET ROLE:
${input.targetRole}
${jdBlock}
FULL RESUME (for context — only use facts supported here):
${input.resumeText}

----------------------------------------------------
RULES (mandatory)
----------------------------------------------------

1. Improve wording, clarity, and professional tone only.

2. Do NOT fabricate achievements, employers, projects, technologies, or metrics not supported by the RESUME or ORIGINAL BULLET.

3. Do NOT invent numbers (%, users, revenue, team size) unless they appear in the resume or original bullet.

4. You MAY use technologies and tools explicitly mentioned elsewhere in the RESUME if they clearly relate to the same project described in the original bullet.

5. Each version must be a single resume bullet (one sentence, optionally two short clauses). Start with a strong action verb.

6. "stronger": Clearer, more professional phrasing with stronger verbs; same factual scope as the original.

7. "atsOptimized": Incorporate relevant keywords from the TARGET ROLE or JOB DESCRIPTION that are truthful given the resume; ATS-friendly phrasing.

8. "impactFocused": Emphasize outcomes and value delivered using language of impact — without inventing metrics. Use phrases like "improving", "streamlining", "enabling" only when consistent with the original work.

EXAMPLE (illustrative only):

Original: "Built an e-commerce website."

stronger: "Developed a full-stack e-commerce web application with a focus on usability and maintainable code."

atsOptimized: "Developed a full-stack e-commerce platform using React and Node.js, aligned with modern frontend hiring requirements."

impactFocused: "Developed a full-stack e-commerce platform using React and Node.js, improving user experience and streamlining product management workflows."

----------------------------------------------------`;
}

function parseBulletRewriteJson(raw: string): BulletRewriteResult | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    const parsed = JSON.parse(cleaned) as BulletRewriteJson;
    if (
      typeof parsed.stronger === "string" &&
      typeof parsed.atsOptimized === "string" &&
      typeof parsed.impactFocused === "string" &&
      parsed.stronger.trim() &&
      parsed.atsOptimized.trim() &&
      parsed.impactFocused.trim()
    ) {
      return {
        stronger: parsed.stronger.trim(),
        atsOptimized: parsed.atsOptimized.trim(),
        impactFocused: parsed.impactFocused.trim(),
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
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("rate limit")
  );
}

async function tryGroqBulletRewrite(
  prompt: string,
): Promise<BulletRewriteResult | null> {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: GROQ_ANALYSIS_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    });
    const raw = response.choices[0]?.message?.content ?? "";
    return parseBulletRewriteJson(raw);
  } catch {
    return null;
  }
}

async function tryGeminiBulletRewrite(
  prompt: string,
): Promise<BulletRewriteResult | null> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const raw = response.text ?? "";
    return parseBulletRewriteJson(raw);
  } catch {
    return null;
  }
}

/**
 * Rewrite a resume bullet (Groq primary → Gemini fallback).
 */
export async function rewriteResumeBullet(
  input: RewriteBulletInput,
): Promise<BulletRewriteResponse> {
  const bullet = input.originalBullet.trim();
  if (!bullet) {
    return { success: false, error: "Enter a bullet point to rewrite.", isQuotaError: false };
  }

  const prompt = buildBulletRewritePrompt({ ...input, originalBullet: bullet });

  try {
    const groqResult = await tryGroqBulletRewrite(prompt);
    if (groqResult) {
      return { success: true, data: groqResult };
    }
  } catch (error) {
    if (isQuotaOrRateLimitError(error)) {
      return { success: false, error: "Daily AI limit reached. Please try again later.", isQuotaError: true };
    }
  }

  try {
    const geminiResult = await tryGeminiBulletRewrite(prompt);
    if (geminiResult) {
      return { success: true, data: geminiResult };
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

  return {
    success: false,
    error: "Could not rewrite bullet. Please try again.",
    isQuotaError: false,
  };
}

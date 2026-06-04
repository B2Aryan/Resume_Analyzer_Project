import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";

export interface GenerateCoverLetterInput {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  candidateName?: string;
}

export interface CoverLetterResult {
  coverLetter: string;
}

export type CoverLetterResponse =
  | { success: true; data: CoverLetterResult }
  | { success: false; error: string; isQuotaError: boolean };

interface CoverLetterJson {
  coverLetter: string;
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function buildCoverLetterPrompt(input: GenerateCoverLetterInput): string {
  const jdBlock = input.jobDescription?.trim()
    ? `\nJOB DESCRIPTION:\n${input.jobDescription}\n`
    : "";
  const nameBlock = input.candidateName?.trim()
    ? `\nCANDIDATE NAME:\n${input.candidateName}\n`
    : "";

  return `You are an expert career coach and professional cover letter writer.
Return ONLY valid JSON. No markdown. No code fences. No explanations. No text outside JSON.

OUTPUT SCHEMA:
{
  "coverLetter": string
}

Generate a professional, ATS-friendly cover letter (250-400 words).

----------------------------------------------------
RULES (MANDATORY)
----------------------------------------------------

1. USE ONLY FACTS FROM THE RESUME. Do NOT invent experience, projects, metrics, employers, or skills not present in the resume.

2. If a job description is provided, tailor the letter specifically to that role and requirements.

3. NO PLACEHOLDERS like [Company Name], [Hiring Manager Name], [Date], etc. If company name isn't known, use a generic professional greeting like "Dear Hiring Manager,".

4. Format: Clean business letter format. No bullet points. 3-4 concise paragraphs.

5. ATS-friendly: Use keywords naturally from the target role and job description (only if supported by the resume).

6. Keep tone: Professional, confident, and authentic.

7. Word count: Between 250 and 400 words.

8. If candidate name is provided, sign the cover letter using that name at the end. If not provided, use a generic professional closing.

----------------------------------------------------
IMPORTANT FORMATTING RULES (MANDATORY)
----------------------------------------------------

Structure must be:

Dear Hiring Manager,

[Opening paragraph]

[Body paragraph]

[Body paragraph]

[Closing paragraph]

Sincerely,
Candidate Name

Formatting requirements:
- Insert blank lines between every paragraph.
- Greeting must be on its own line.
- Closing must be on separate lines.
- Candidate name must appear below "Sincerely,".
- Preserve all line breaks exactly.
- Do not return one large paragraph.
- Return natural paragraph spacing.
- Return plain text inside the JSON field.

----------------------------------------------------

TARGET ROLE:
${input.targetRole}
${jdBlock}
${nameBlock}
RESUME:
${input.resumeText}

----------------------------------------------------`;
}

function parseCoverLetterJson(raw: string): CoverLetterResult | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    const parsed = JSON.parse(cleaned) as CoverLetterJson;
    if (typeof parsed.coverLetter === "string" && parsed.coverLetter.trim()) {
      return { coverLetter: parsed.coverLetter.trim() };
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

async function tryGroqCoverLetter(
  prompt: string,
): Promise<CoverLetterResult | null> {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: GROQ_ANALYSIS_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });
    const raw = response.choices[0]?.message?.content ?? "";
    console.log("Raw Groq AI response (Groq):", JSON.stringify(raw, null, 2));
    return parseCoverLetterJson(raw);
  } catch {
    return null;
  }
}

async function tryGeminiCoverLetter(
  prompt: string,
): Promise<CoverLetterResult | null> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const raw = response.text ?? "";
    console.log("Raw Gemini AI response (Gemini):", JSON.stringify(raw, null, 2));
    return parseCoverLetterJson(raw);
  } catch {
    return null;
  }
}

/**
 * Generate a cover letter using AI (Groq primary → Gemini fallback).
 */
export async function generateCoverLetter(
  input: GenerateCoverLetterInput,
): Promise<CoverLetterResponse> {
  const prompt = buildCoverLetterPrompt(input);

  try {
    const groqResult = await tryGroqCoverLetter(prompt);
    if (groqResult) {
      return { success: true, data: groqResult };
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

  try {
    const geminiResult = await tryGeminiCoverLetter(prompt);
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
    error: "Could not generate cover letter. Please try again.",
    isQuotaError: false,
  };
}

import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";
import type { ImprovementSuggestion } from "@/lib/ats/types";

const MAX_SUGGESTIONS = 5;

export interface GenerateImprovementSuggestionsInput {
  resumeText: string;
  targetRole: string;
  missingKeywords: string[];
  jobDescription?: string;
}

interface ImprovementSuggestionsResponse {
  improvementSuggestions: ImprovementSuggestion[];
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function buildImprovementSuggestionsPrompt(
  input: GenerateImprovementSuggestionsInput,
): string {
  const keywords = input.missingKeywords.slice(0, MAX_SUGGESTIONS);
  const keywordList = keywords.map((k) => `- ${k}`).join("\n");
  const jdBlock = input.jobDescription?.trim()
    ? `\nJOB DESCRIPTION:\n${input.jobDescription}\n`
    : "";

  return `You are an expert resume coach helping a candidate improve their resume for a specific role.
Return ONLY valid JSON. No markdown. No code fences. No text outside JSON.

OUTPUT SCHEMA:
{
  "improvementSuggestions": [
    {
      "keyword": string,
      "whyItMatters": string,
      "suggestion": string
    }
  ]
}

Generate exactly one entry per missing keyword below (maximum ${keywords.length} entries).
Use the exact keyword string provided for the "keyword" field.

MISSING KEYWORDS:
${keywordList}

TARGET ROLE:
${input.targetRole}
${jdBlock}
RESUME:
${input.resumeText}

----------------------------------------------------
RULES (mandatory)
----------------------------------------------------

1. Base every suggestion on the RESUME content and TARGET ROLE. Do not invent employers, projects, metrics, or tools the candidate has not mentioned unless framed as optional/hypothetical.

2. The keyword is ABSENT from the resume. Do NOT write bullets that claim the candidate already used that skill extensively.

BAD (fabricated experience):
"Built 50 Jest test suites for production applications."

GOOD (honest, actionable):
"Consider adding a bullet describing unit or integration testing with Jest if you have used it in coursework, personal projects, or internships."

3. "whyItMatters": 1-2 sentences on why this keyword matters for the TARGET ROLE or job description.

4. "suggestion": Either:
   - A resume bullet they could adapt IF their resume hints at related work (internships, projects, labs), OR
   - Honest guidance to gain/describe the skill (courses, personal projects, certifications) without claiming false experience.

5. Reference real sections from the resume when possible (e.g. their project names or stack).

6. Keep suggestions concise and professional.

----------------------------------------------------`;
}

function parseImprovementSuggestionsJson(
  raw: string,
  allowedKeywords: string[],
): ImprovementSuggestion[] {
  const cleaned = cleanJsonResponse(raw);
  let parsed: ImprovementSuggestionsResponse;
  try {
    parsed = JSON.parse(cleaned) as ImprovementSuggestionsResponse;
  } catch {
    return [];
  }

  if (!Array.isArray(parsed.improvementSuggestions)) {
    return [];
  }

  const allowed = new Set(allowedKeywords.map((k) => k.toLowerCase()));

  return parsed.improvementSuggestions
    .filter(
      (item) =>
        item &&
        typeof item.keyword === "string" &&
        typeof item.whyItMatters === "string" &&
        typeof item.suggestion === "string",
    )
    .filter((item) => allowed.has(item.keyword.toLowerCase()))
    .slice(0, MAX_SUGGESTIONS);
}

async function tryGroqImprovementSuggestions(
  prompt: string,
  allowedKeywords: string[],
): Promise<ImprovementSuggestion[] | null> {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: GROQ_ANALYSIS_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    const raw = response.choices[0]?.message?.content ?? "";
    const items = parseImprovementSuggestionsJson(raw, allowedKeywords);
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

async function tryGeminiImprovementSuggestions(
  prompt: string,
  allowedKeywords: string[],
): Promise<ImprovementSuggestion[] | null> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const raw = response.text ?? "";
    const items = parseImprovementSuggestionsJson(raw, allowedKeywords);
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

/**
 * Generate AI improvement suggestions for missing keywords (Groq → Gemini).
 */
export async function generateImprovementSuggestions(
  input: GenerateImprovementSuggestionsInput,
): Promise<ImprovementSuggestion[]> {
  const keywords = input.missingKeywords.slice(0, MAX_SUGGESTIONS);
  if (keywords.length === 0) {
    return [];
  }

  const prompt = buildImprovementSuggestionsPrompt({
    ...input,
    missingKeywords: keywords,
  });

  const groqResult = await tryGroqImprovementSuggestions(prompt, keywords);
  if (groqResult) {
    return groqResult;
  }

  const geminiResult = await tryGeminiImprovementSuggestions(prompt, keywords);
  if (geminiResult) {
    return geminiResult;
  }

  return [];
}

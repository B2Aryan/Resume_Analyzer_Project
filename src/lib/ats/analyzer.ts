import { ATSAnalysisResult } from "@/lib/ats/types";
import { getGeminiClient } from "@/lib/ai/gemini";
import { getGroqClient, GROQ_ANALYSIS_MODEL } from "@/lib/ai/groq";
import { buildJDMatchResult } from "@/lib/ats/jd-keyword-matcher";
import { generateImprovementSuggestions } from "@/lib/ats/improvement-suggestions";
import type { AnalysisProgressReporter } from "@/lib/ats/analysis-progress";

export type AnalysisProvider = "groq" | "gemini";

export type AnalysisResult =
  | {
      success: true;
      data: ATSAnalysisResult;
      provider: AnalysisProvider;
      usedBackupProvider: boolean;
    }
  | { success: false; error: string; isQuotaError: boolean };

export interface AnalyzeResumeOptions {
  onProgress?: AnalysisProgressReporter;
  hasJobDescription?: boolean;
}

// Comprehensive skill database
const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
  "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Svelte", "Node.js", "Express", "FastAPI",
  "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
  "HTML", "CSS", "Tailwind CSS", "SASS", "LESS", "Bootstrap", "Material UI", "Chakra UI",
  "Git", "GitHub", "GitLab", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Heroku", "Vercel",
  "REST API", "GraphQL", "WebSocket", "gRPC", "SOAP",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase", "Prisma",
  "Jest", "Cypress", "Playwright", "Testing Library", "Mocha", "Chai", "Jasmine",
  "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
  "Agile", "Scrum", "Kanban", "Jira", "Confluence", "Slack", "Notion",
  "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator",
  "Machine Learning", "Data Science", "Deep Learning", "TensorFlow", "PyTorch",
  "React Native", "Flutter", "Swift", "Kotlin", "Objective-C", "Android", "iOS"
];

const STRONG_ACTION_VERBS = [
  "Built", "Created", "Developed", "Designed", "Implemented", "Shipped",
  "Led", "Managed", "Optimized", "Improved", "Increased", "Reduced",
  "Deployed", "Launched", "Maintained", "Refactored", "Scaled", "Automated",
  "Mentored", "Trained", "Architected", "Engineered", "Drove", "Delivered"
];

const ATS_SECTION_KEYWORDS = [
  "Summary", "About", "Objective",
  "Experience", "Work Experience", "Employment History", "Professional Experience",
  "Education", "Academic Background", "Academic History",
  "Skills", "Technical Skills", "Core Competencies", "Expertise",
  "Projects", "Personal Projects", "Side Projects",
  "Certifications", "Awards", "Publications"
];

const METRIC_PATTERNS = [
  /\d+%/, /\d+\+/, /\d+\s*(?:users|customers|requests|ms|seconds|minutes|hours|days|weeks|months|years)/i,
  /\$\d+/, /\d+\s*(?:kb|mb|gb|tb)/i, /\d+\s*(?:x|times)/i
];

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_PATTERN = /linkedin\.com\/in\/[a-zA-Z0-9-]+/i;
const GITHUB_PATTERN = /github\.com\/[a-zA-Z0-9-]+/i;

function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const skill of TECH_SKILLS) {
    if (lowerText.includes(skill.toLowerCase())) {
      if (!found.includes(skill)) {
        found.push(skill);
      }
    }
  }
  
  return found;
}

function extractJobDescriptionKeywords(jobDescription: string): string[] {
  const lowerJD = jobDescription.toLowerCase();
  const found: string[] = [];
  
  for (const skill of TECH_SKILLS) {
    if (lowerJD.includes(skill.toLowerCase())) {
      if (!found.includes(skill)) {
        found.push(skill);
      }
    }
  }
  
  return found;
}

function calculateATSCompatibility(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // 1. Section Detection (30 points total)
  const sectionsFound: string[] = [];
  for (const section of ATS_SECTION_KEYWORDS) {
    if (lowerText.includes(section.toLowerCase())) {
      const category = section.toLowerCase();
      if (!sectionsFound.some(s => category.includes(s.toLowerCase()))) {
        if (sectionsFound.length < 6) {
          sectionsFound.push(section);
        }
      }
    }
  }
  score += Math.min(sectionsFound.length * 5, 30);
  
  // 2. Contact Information (20 points total)
  if (EMAIL_PATTERN.test(text)) score += 5;
  if (PHONE_PATTERN.test(text)) score += 5;
  if (LINKEDIN_PATTERN.test(text)) score += 5;
  if (GITHUB_PATTERN.test(text)) score += 5;
  
  // 3. Formatting & Readability (25 points total)
  const hasBulletPoints = /•|\*|–|—/.test(text);
  if (hasBulletPoints) score += 10;
  
  // Check for clean formatting clues
  const hasConsistentSpacing = text.split("\n").filter(line => line.trim().length > 0).length > 10;
  if (hasConsistentSpacing) score += 5;
  
  // Check for no decorative elements (simple heuristic)
  score += 10; // Base score for being a standard resume
  
  // 4. Additional readability (25 points)
  score += 25; // Ensures total is 100
  
  return Math.min(score, 100);
}

function calculateKeywordMatch(resumeText: string, jobDescription: string): { score: number; present: string[]; missing: string[] } {
  const resumeLower = resumeText.toLowerCase();
  const jobKeywords = extractJobDescriptionKeywords(jobDescription);
  
  if (jobKeywords.length === 0) {
    const resumeSkills = extractSkills(resumeText);
    return { score: 50, present: resumeSkills, missing: [] };
  }
  
  const present: string[] = [];
  const missing: string[] = [];
  
  for (const keyword of jobKeywords) {
    if (resumeLower.includes(keyword.toLowerCase())) {
      present.push(keyword);
    } else {
      missing.push(keyword);
    }
  }
  
  const score = Math.round((present.length / jobKeywords.length) * 100);
  
  return { score, present, missing };
}

function calculateSkillsScore(resumeText: string, jobDescription: string): number {
  let score = 0;
  
  // 1. Technical skills count (40 points)
  const resumeSkills = extractSkills(resumeText);
  score += Math.min(resumeSkills.length * 2, 40);
  
  // 2. Role-relevant skills (40 points)
  const jobSkills = extractJobDescriptionKeywords(jobDescription);
  if (jobSkills.length > 0) {
    const relevantSkills = jobSkills.filter(skill => 
      resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
    );
    const relevanceScore = Math.round((relevantSkills.length / jobSkills.length) * 40);
    score += relevanceScore;
  } else {
    score += 20; // Base if no job description
  }
  
  // 3. Skill organization (20 points)
  const hasSkillsSection = ATS_SECTION_KEYWORDS.some(section => 
    section.toLowerCase().includes("skill") && 
    resumeText.toLowerCase().includes(section.toLowerCase())
  );
  if (hasSkillsSection) score += 20;
  
  return Math.min(score, 100);
}

function calculateProjectScore(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // 1. Project count (20 points)
  const hasProjectsSection = ATS_SECTION_KEYWORDS.some(section => 
    section.toLowerCase().includes("project") && 
    lowerText.includes(section.toLowerCase())
  );
  if (hasProjectsSection) score += 10;
  
  const projectMentions = lowerText.split(/project|projects/i).length - 1;
  score += Math.min(projectMentions * 5, 10);
  
  // 2. Action verbs (25 points)
  let verbCount = 0;
  for (const verb of STRONG_ACTION_VERBS) {
    if (lowerText.includes(verb.toLowerCase())) {
      verbCount++;
    }
  }
  score += Math.min(verbCount * 5, 25);
  
  // 3. Technology mentions (30 points)
  const techCount = extractSkills(text).length;
  score += Math.min(techCount * 3, 30);
  
  // 4. Measurable impact (25 points)
  let metricCount = 0;
  for (const pattern of METRIC_PATTERNS) {
    if (pattern.test(text)) {
      metricCount++;
    }
  }
  score += Math.min(metricCount * 10, 25);
  
  return Math.min(score, 100);
}

function generateStrengths(result: Omit<ATSAnalysisResult, "strengths" | "suggestions" | "summary">): string[] {
  const strengths: string[] = [];
  
  if (result.atsCompatibility >= 85) {
    strengths.push("Excellent ATS compatibility with clear section structure and complete contact information");
  } else if (result.atsCompatibility >= 70) {
    strengths.push("Good ATS compatibility and readable format");
  }
  
  if (result.keywordMatch >= 80) {
    strengths.push("Exceptional keyword match with the target role");
  } else if (result.keywordMatch >= 65) {
    strengths.push("Strong keyword alignment with the target role");
  }
  
  if (result.skillsScore >= 80) {
    strengths.push("Comprehensive and well-organized skill set highlighted");
  } else if (result.skillsScore >= 65) {
    strengths.push("Solid technical skills foundation");
  }
  
  if (result.projectScore >= 80) {
    strengths.push("Projects show excellent technical depth, impact, and strong action verbs");
  } else if (result.projectScore >= 65) {
    strengths.push("Good project experience with measurable outcomes");
  }
  
  if (strengths.length === 0) {
    strengths.push("Solid foundation to build upon with targeted improvements");
  }
  
  return strengths;
}

function generateSuggestions(result: Omit<ATSAnalysisResult, "strengths" | "suggestions" | "summary">): string[] {
  const suggestions: string[] = [];
  
  if (result.keywordMatch < 70 && result.missingKeywords.length > 0) {
    suggestions.push(`Naturally weave in missing keywords like "${result.missingKeywords.slice(0, 3).join(", ")}" where you have actual experience`);
  }
  
  if (result.projectScore < 70) {
    suggestions.push("Enhance project bullet points with strong action verbs and specific measurable outcomes");
  }
  
  if (result.atsCompatibility < 70) {
    suggestions.push("Add clear section headers (Experience, Education, Skills, Projects) and complete contact information");
  }
  
  if (result.skillsScore < 70) {
    suggestions.push("Create a dedicated Skills section and highlight more technical skills relevant to the target role");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Excellent work! Consider adding live project links or a portfolio URL if not already included");
  }
  
  return suggestions;
}

export function analyzeResume(resumeText: string, jobDescription: string): ATSAnalysisResult {
  const atsCompatibility = calculateATSCompatibility(resumeText);
  const keywordMatchResult = calculateKeywordMatch(resumeText, jobDescription);
  const skillsScore = calculateSkillsScore(resumeText, jobDescription);
  const projectScore = calculateProjectScore(resumeText);
  
  // Calculate overall score with weighted average
  const score = Math.round(
    atsCompatibility * 0.25 +
    keywordMatchResult.score * 0.35 +
    skillsScore * 0.2 +
    projectScore * 0.2
  );
  
  const resultWithoutStrengthsSuggestions = {
    score,
    atsCompatibility,
    keywordMatch: keywordMatchResult.score,
    skillsScore,
    projectScore,
    missingKeywords: keywordMatchResult.missing,
    presentKeywords: keywordMatchResult.present
  };
  
  return {
    ...resultWithoutStrengthsSuggestions,
    strengths: generateStrengths(resultWithoutStrengthsSuggestions),
    suggestions: generateSuggestions(resultWithoutStrengthsSuggestions),
    summary: ""
  };
}

function buildAnalysisPrompt(resumeText: string, targetRole: string): string {
  return `You are an expert ATS resume analyst and recruiter.
Return ONLY valid JSON.
No markdown.
No code fences.
No explanations.
No text outside JSON.

OUTPUT SCHEMA:
{
  "score": number,
  "atsCompatibility": number,
  "keywordMatch": number,
  "skillsScore": number,
  "projectScore": number,
  "strengths": string[],
  "suggestions": string[],
  "presentKeywords": string[],
  "missingKeywords": string[],
  "summary": string
}

----------------------------------------------------
ROLE ANALYSIS
----------------------------------------------------

Step 1:
Determine whether TARGET ROLE is:
A. A full job description
OR
B. A short role title (examples: Frontend Developer, Data Analyst, Java Developer, UI/UX Designer, AI Engineer)

If TARGET ROLE is only a role title:
Infer the most common technical requirements for that role.
Examples:
  Frontend Developer: HTML, CSS, JavaScript, React, TypeScript, Git, Responsive Design, REST API
  Data Analyst: Excel, SQL, Power BI, Tableau, Python, Data Visualization, Statistics
  Java Developer: Java, Spring Boot, SQL, REST API, OOP, Git
  AI Engineer: Python, Machine Learning, Deep Learning, TensorFlow, PyTorch, Data Processing
Use reasonable industry-standard requirements.

----------------------------------------------------
KEYWORD MATCHING
----------------------------------------------------

Create a required keyword list from:
A. The job description
OR
B. The inferred role requirements

presentKeywords:
Only keywords explicitly found in the resume text.

missingKeywords:
Only keywords required for the role but absent from the resume.

Do not infer that a keyword exists.
Do not use synonyms.
Do not count related technologies.
Match explicit evidence only.

keywordMatch scoring:
  90–100: Most critical keywords present.
  70–89:  Strong alignment with only a few missing requirements.
  40–69:  Partial alignment.
  10–39:  Weak alignment.
  0–9:    Almost no relevant keywords found.
Never automatically return 50.

----------------------------------------------------
ATS COMPATIBILITY
----------------------------------------------------

ATS Compatibility measures ONLY:
- Section structure
- Contact information
- Readability
- ATS-safe formatting
- Parsing friendliness

Do NOT consider role relevance.
A well-formatted resume can score high here even if it targets the wrong role.

----------------------------------------------------
SKILLS SCORE
----------------------------------------------------

Evaluate:
- Relevance of skills to TARGET ROLE
- Breadth of relevant skills
- Technical depth
- Organization of skills

A resume with strong skills unrelated to TARGET ROLE must receive a low skills score.
Example: Data Analyst resume evaluated for Frontend Developer — Skills Score should be very low even if the skills section is strong.

----------------------------------------------------
PROJECT SCORE
----------------------------------------------------

Evaluate:
- Relevance of projects to TARGET ROLE
- Technical depth
- Action verbs
- Quantifiable impact

Projects unrelated to TARGET ROLE should receive low scores regardless of quality.
Example: Power BI dashboards evaluated for Frontend Developer should receive a low project score.

----------------------------------------------------
TRANSFERABLE EXPERIENCE RULE
----------------------------------------------------

Do not assign near-zero Skills Score or Project Score simply because the resume belongs to a different technical domain than TARGET ROLE.

Distinguish between:
A. No meaningful technical experience
and
B. Technical experience in another domain

Examples:
- Data Analyst resume evaluated for Frontend Developer
- Power BI Developer resume evaluated for Java Developer
- QA Engineer resume evaluated for Data Analyst

In these cases:
- Keyword Match may be low due to missing role-specific technologies.
- Skills Score and Project Score should still recognize genuine technical work, tools, projects, certifications, analytical work, databases, scripting, dashboards, automation, software-related problem solving, and measurable achievements.

A technically strong resume from a different domain should generally receive moderate scores rather than near-zero scores.

Only assign extremely low Skills Score or Project Score when the resume contains little or no technical evidence at all.

----------------------------------------------------
OVERALL SCORE
----------------------------------------------------

Calculate:
  score = round(atsCompatibility * 0.20 + keywordMatch * 0.40 + skillsScore * 0.20 + projectScore * 0.20)

The overall score must reflect role fit.
A resume that is ATS-friendly but unrelated to the target role should not receive a high overall score.
Example:
  ATS Compatibility = 90, Keyword Match = 10, Skills Score = 10, Project Score = 10
  Overall score should be low.

----------------------------------------------------
EVIDENCE RULES
----------------------------------------------------

Every score must be justified by evidence found in the resume.
Do not invent:
- technologies
- projects
- certifications
- achievements
- metrics
- experience
- keywords

If evidence is not present, do not award points.

----------------------------------------------------
CONSISTENCY VALIDATION
----------------------------------------------------

Before generating the final JSON, perform a verification pass.

Keyword validation:
- Every keyword in presentKeywords must appear explicitly in the RESUME text.
- Every keyword in missingKeywords must NOT appear anywhere in the RESUME text.
- A keyword cannot appear in both presentKeywords and missingKeywords.
- If a keyword appears in the RESUME text, it must not be listed as missing.

Suggestion validation:
- Do not recommend adding a skill, technology, framework, certification, project, tool, platform, experience, or achievement that already appears in the RESUME.
- Before generating each suggestion, verify that the recommended item is actually absent.
- Remove any suggestion that recommends something already present.

Strength validation:
- Every strength must reference information explicitly found in the RESUME.
- Do not claim experience, projects, technologies, certifications, or achievements that are not present.

Internal consistency:
- Suggestions, strengths, presentKeywords, and missingKeywords must agree with each other.
- If a technology appears in presentKeywords, do not suggest adding it.
- If a technology appears in the RESUME, do not classify it as missing.
- Consistency is mandatory.

----------------------------------------------------
STRENGTHS
----------------------------------------------------

1–4 items.
Each strength must reference something explicitly present in the resume.
No generic praise.

----------------------------------------------------
SUGGESTIONS
----------------------------------------------------

1–5 items.
Each suggestion must reference a specific weakness or missing requirement relative to TARGET ROLE.
Do not suggest adding something already present.

----------------------------------------------------
SUMMARY
----------------------------------------------------

2–4 sentences.
Explain:
1. Overall fit for TARGET ROLE.
2. Strongest evidence found.
3. Biggest gap preventing a higher score.

----------------------------------------------------

TARGET ROLE:
${targetRole}

RESUME:
${resumeText}

----------------------------------------------------`;
}

function buildJDAnalysisPrompt(
  resumeText: string,
  targetRole: string,
  jobDescription: string,
): string {
  return `You are an expert ATS resume analyst and technical recruiter.
Return ONLY valid JSON.
No markdown.
No code fences.
No explanations.
No text outside JSON.

The candidate has provided a FULL JOB DESCRIPTION. Compare the RESUME against this job description.
Keyword matching and match scores are computed separately — do NOT output match percentages or keyword lists.

OUTPUT SCHEMA:
{
  "score": number,
  "atsCompatibility": number,
  "keywordMatch": number,
  "skillsScore": number,
  "projectScore": number,
  "strengths": string[],
  "suggestions": string[],
  "summary": string,
  "jdSummary": string
}

----------------------------------------------------
YOUR RESPONSIBILITIES (narrative only)
----------------------------------------------------

atsCompatibility: Section structure, contact info, readability, ATS-safe formatting only.

skillsScore / projectScore: Relevance of resume content to THIS job description (0-100).

keywordMatch: Set to 0 (calculated externally).

score: Temporary estimate (keyword component is recalculated after parsing).
  Use: round(atsCompatibility * 0.25 + skillsScore * 0.375 + projectScore * 0.375)

strengths: 1-4 items referencing resume evidence relevant to the JD.

suggestions: 1-5 improvement areas addressing gaps vs the JD. Do not suggest adding skills already in the resume.

summary: 2-3 sentences on ATS quality and general fit.

jdSummary: 2-4 sentences on overall fit for THIS job, strongest alignment, and biggest gaps vs the JD.

----------------------------------------------------
EVIDENCE RULES
----------------------------------------------------

- Do not invent technologies, projects, or experience.
- Every strength and suggestion must reference the RESUME and JOB DESCRIPTION.
- Do not output presentKeywords, missingKeywords, matchedKeywords, or jdMatch scores.

----------------------------------------------------

TARGET ROLE (label only):
${targetRole}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

----------------------------------------------------`;
}

/** Merge deterministic keyword match into AI narrative result */
function applyDeterministicJDMatch(
  result: ATSAnalysisResult,
  resumeText: string,
  jobDescription: string,
): ATSAnalysisResult {
  const aiSummary =
    (result as ATSAnalysisResult & { jdSummary?: string }).jdSummary?.trim() ||
    result.jdMatch?.jdSummary?.trim() ||
    "";

  const jdMatch = buildJDMatchResult(resumeText, jobDescription, aiSummary);

  const keywordMatch = jdMatch.jdMatchScore;
  const score = Math.round(
    result.atsCompatibility * 0.2 +
      keywordMatch * 0.4 +
      result.skillsScore * 0.2 +
      result.projectScore * 0.2,
  );

  return {
    ...result,
    score,
    keywordMatch,
    presentKeywords: jdMatch.matchedKeywords,
    missingKeywords: jdMatch.missingKeywords,
    jdMatch,
  };
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function parseAnalysisJson(raw: string): ATSAnalysisResult | null {
  const cleaned = cleanJsonResponse(raw);
  try {
    return JSON.parse(cleaned) as ATSAnalysisResult;
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

type ProviderAttempt =
  | { success: true; data: ATSAnalysisResult; provider: AnalysisProvider }
  | { success: false; isQuotaError: boolean };

async function tryGeminiAnalysis(prompt: string): Promise<ProviderAttempt> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text ?? "";
    const parsed = parseAnalysisJson(raw);
    if (!parsed) {
      return { success: false, isQuotaError: false };
    }

    return { success: true, data: parsed, provider: "gemini" };
  } catch (error) {
    return { success: false, isQuotaError: isQuotaOrRateLimitError(error) };
  }
}

async function tryGroqAnalysis(prompt: string): Promise<ProviderAttempt> {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: GROQ_ANALYSIS_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = parseAnalysisJson(raw);
    if (!parsed) {
      return { success: false, isQuotaError: false };
    }

    return { success: true, data: parsed, provider: "groq" };
  } catch (error) {
    return { success: false, isQuotaError: isQuotaOrRateLimitError(error) };
  }
}

async function runAnalysisProviderChain(prompt: string): Promise<AnalysisResult> {
  const groqResult = await tryGroqAnalysis(prompt);
  if (groqResult.success) {
    return {
      success: true,
      data: groqResult.data,
      provider: groqResult.provider,
      usedBackupProvider: false,
    };
  }

  const geminiResult = await tryGeminiAnalysis(prompt);
  if (geminiResult.success) {
    return {
      success: true,
      data: geminiResult.data,
      provider: geminiResult.provider,
      usedBackupProvider: true,
    };
  }

  return {
    success: false,
    error: "Failed to analyze resume",
    isQuotaError: groqResult.isQuotaError || geminiResult.isQuotaError,
  };
}

export async function analyzeResumeWithGemini(
  resumeText: string,
  targetRole: string,
  jobDescription?: string,
  options?: AnalyzeResumeOptions,
): Promise<AnalysisResult> {
  const progress = options?.onProgress;
  const hasJd = options?.hasJobDescription ?? Boolean(jobDescription?.trim());
  const jd = jobDescription?.trim();
  const prompt = jd
    ? buildJDAnalysisPrompt(resumeText, targetRole, jd)
    : buildAnalysisPrompt(resumeText, targetRole);

  progress?.("ats", "start");
  const chainResult = await runAnalysisProviderChain(prompt);
  progress?.("ats", "complete");

  if (!chainResult.success) {
    return chainResult;
  }

  let data = chainResult.data;
  if (jd) {
    progress?.("jd-match", "start");
    data = applyDeterministicJDMatch(data, resumeText, jd);
    progress?.("jd-match", "complete");
  } else {
    progress?.("jd-match", "skip");
  }

  const missingForSuggestions =
    jd && data.jdMatch ? data.jdMatch.missingKeywords : data.missingKeywords;

  progress?.("improvements", "start");
  const improvementSuggestions = await generateImprovementSuggestions({
    resumeText,
    targetRole,
    missingKeywords: missingForSuggestions,
    jobDescription: jd,
  });
  progress?.("improvements", "complete");

  return {
    success: true,
    data: { ...data, improvementSuggestions },
    provider: chainResult.provider,
    usedBackupProvider: chainResult.usedBackupProvider,
  };
}

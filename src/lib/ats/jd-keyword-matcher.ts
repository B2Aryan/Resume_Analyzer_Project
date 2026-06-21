import type { JDMatchResult } from "@/lib/ats/types";

/**
 * Concrete skills, tools, frameworks, platforms, and methodologies used for JD scoring.
 * Longest phrases should appear before shorter overlaps (sorted at runtime).
 */
export const TECHNICAL_KEYWORDS = [
  // Frontend Frameworks & Libraries
  "Spring Boot",
  "Ruby on Rails",
  "React Native",
  "Tailwind CSS",
  "Material UI",
  "Chakra UI",
  "Remix",
  "Astro",
  "Solid.js",
  "Vite",
  "Webpack",
  "Parcel",
  "Rollup",
  "Turborepo",
  "Testing Library",
  
  // CI/CD & DevOps
  "GitHub Actions",
  "GitLab CI",
  "CircleCI",
  "Travis CI",
  "Terraform",
  "Ansible",
  "Pulumi",
  "ArgoCD",
  "Helm",
  
  // AI/ML & Data
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "Natural Language Processing",
  "Computer Vision",
  "Large Language Models",
  "LangChain",
  "Hugging Face",
  "Scikit-learn",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "Apache Spark",
  "Apache Kafka",
  "Apache Airflow",
  "dbt",
  "Snowflake",
  "Databricks",
  
  // Web & API
  "REST API",
  "GraphQL",
  "WebSocket",
  "gRPC",
  "SOAP",
  "tRPC",
  "Swagger",
  "OpenAPI",
  
  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Scala",
  "Elixir",
  "Dart",
  "R",
  
  // Frontend Frameworks
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Nuxt.js",
  "Svelte",
  "SvelteKit",
  "Gatsby",
  "Qwik",
  
  // Backend Frameworks
  "Node.js",
  "Express",
  "Fastify",
  "NestJS",
  "FastAPI",
  "Django",
  "Flask",
  "ASP.NET",
  "Laravel",
  "Phoenix",
  
  // Styling & UI
  "HTML",
  "CSS",
  "SASS",
  "LESS",
  "Bootstrap",
  "Ant Design",
  "Styled Components",
  "Emotion",
  "shadcn/ui",
  
  // Version Control & Collaboration
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  
  // Cloud & Infrastructure
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Heroku",
  "Vercel",
  "Netlify",
  "Cloudflare",
  "DigitalOcean",
  "Linode",
  
  // Databases
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "DynamoDB",
  "Cassandra",
  "Neo4j",
  "Firebase",
  "Supabase",
  "PlanetScale",
  "Prisma",
  "Drizzle",
  "TypeORM",
  "Sequelize",
  
  // Testing
  "Jest",
  "Vitest",
  "Cypress",
  "Playwright",
  "Puppeteer",
  "Mocha",
  "Chai",
  "Jasmine",
  "Storybook",
  
  // Build Tools & Package Managers
  "CI/CD",
  "Jenkins",
  "npm",
  "Yarn",
  "pnpm",
  "Bun",
  
  // Project Management & Productivity
  "Agile",
  "Scrum",
  "Kanban",
  "Jira",
  "Confluence",
  "Linear",
  "Asana",
  "Monday.com",
  "Notion",
  "Slack",
  "Discord",
  
  // Design Tools
  "Figma",
  "Adobe XD",
  "Sketch",
  "Photoshop",
  "Illustrator",
  "InVision",
  "Framer",
  
  // AI/ML Frameworks
  "TensorFlow",
  "PyTorch",
  "Keras",
  "ONNX",
  "OpenCV",
  
  // Mobile Development
  "React Native",
  "Flutter",
  "Swift",
  "SwiftUI",
  "Kotlin",
  "Jetpack Compose",
  "Objective-C",
  "Android",
  "iOS",
  "Expo",
  
  // Authentication & Security
  "OAuth",
  "JWT",
  "Auth0",
  "Okta",
  "Clerk",
  "NextAuth.js",
  
  // State Management
  "Redux",
  "Zustand",
  "Recoil",
  "MobX",
  "Jotai",
  "Pinia",
  "Vuex",
  
  // Backend as a Service
  "Serverless",
  "AWS Lambda",
  "Google Cloud Functions",
  "Azure Functions",
  
  // Monitoring & Logging
  "Datadog",
  "New Relic",
  "Sentry",
  "LogRocket",
  "Splunk",
  "Grafana",
  "Prometheus",
  
  // CMS & E-commerce
  "WordPress",
  "Contentful",
  "Strapi",
  "Sanity",
  "Shopify",
  "WooCommerce",
  "Magento",
] as const;

/**
 * Role/domain labels — detected for reference but excluded from JD match scoring.
 */
export const GENERIC_ROLE_TERMS = [
  "software engineer",
  "software developer",
  "web development",
  "web developer",
  "full stack developer",
  "full-stack developer",
  "full stack",
  "fullstack",
  "full-stack",
  "frontend developer",
  "front-end developer",
  "frontend development",
  "frontend",
  "front-end",
  "front end",
  "backend developer",
  "back-end developer",
  "backend development",
  "backend",
  "back-end",
  "back end",
  "developer",
  "engineer",
  "programmer",
  "internship",
  "intern",
] as const;

/**
 * Terms removed from JD scoring (previously in KEYWORD_CATALOG or aliases).
 * @see TECHNICAL_KEYWORDS — only these count toward matched/missing/scores.
 */
export const REMOVED_FROM_JD_SCORING = [
  "frontend",
  "front-end",
  "backend",
  "back-end",
  "full stack",
  "fullstack",
  "frontend development (alias → frontend)",
  "front end (alias → frontend)",
] as const;

const GENERIC_ROLE_KEYS = new Set(
  GENERIC_ROLE_TERMS.map((t) => t.trim().toLowerCase()),
);

export const REST_API_CANONICAL = "REST API";

/**
 * Word-boundary patterns for REST/API variants (longest first).
 * Bare "api" / "apis" use \b — not substring includes — to avoid false hits like "rapid".
 */
const REST_API_DETECTION_PATTERNS: RegExp[] = [
  /\brestful\s+apis\b/i,
  /\brestful\s+api\b/i,
  /\brest\s+apis\b/i,
  /\brest\s+api\b/i,
  /\bapi\s+integrations\b/i,
  /\bapi\s+integration\b/i,
  /\bapis\b/i,
  /\bapi\b/i,
];

/** Maps variant text to a canonical technical label (never to generic role terms). */
const TECHNICAL_ALIASES: Record<string, string> = {
  "rest apis": REST_API_CANONICAL,
  "rest api": REST_API_CANONICAL,
  "restful api": REST_API_CANONICAL,
  "restful apis": REST_API_CANONICAL,
  "api integration": REST_API_CANONICAL,
  "api integrations": REST_API_CANONICAL,
  github: "GitHub",
  gitlab: "GitLab",
  nodejs: "Node.js",
  "node js": "Node.js",
  nextjs: "Next.js",
  "next js": "Next.js",
  nuxtjs: "Nuxt.js",
  "nuxt js": "Nuxt.js",
  "react.js": "React",
  reactjs: "React",
  "vue.js": "Vue",
  vuejs: "Vue",
  "svelte.js": "Svelte",
  sveltejs: "Svelte",
  typescript: "TypeScript",
  javascript: "JavaScript",
  "mongo db": "MongoDB",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  "my sql": "MySQL",
  "machine learning": "Machine Learning",
  "deep learning": "Deep Learning",
  "data science": "Data Science",
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  "llm": "Large Language Models",
  "llms": "Large Language Models",
  "nlp": "Natural Language Processing",
  "ci cd": "CI/CD",
  "aws lambda": "AWS Lambda",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  docker: "Docker",
  "scikit learn": "Scikit-learn",
  sklearn: "Scikit-learn",
  "natural language processing": "Natural Language Processing",
  "computer vision": "Computer Vision",
  vitejs: "Vite",
  bun: "Bun",
  "shadcn": "shadcn/ui",
  "next auth": "NextAuth.js",
  nextauth: "NextAuth.js",
};

const SORTED_TECHNICAL = [...TECHNICAL_KEYWORDS].sort((a, b) => b.length - a.length);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

function canonicalizeTechnical(term: string): string {
  const key = normalizeToken(term);
  return TECHNICAL_ALIASES[key] ?? term;
}

function termPattern(term: string): RegExp {
  const escaped = escapeRegex(term).replace(/\./g, "\\.");
  if (term.includes(" ")) {
    return new RegExp(escaped, "i");
  }
  return new RegExp(`\\b${escaped}\\b`, "i");
}

function isGenericRoleTerm(term: string): boolean {
  return GENERIC_ROLE_KEYS.has(normalizeToken(term));
}

function addCanonicalKeyword(found: Map<string, string>, canonical: string): void {
  if (isGenericRoleTerm(canonical)) return;
  const key = normalizeToken(canonical);
  if (!found.has(key)) {
    found.set(key, canonical);
  }
}

/** Detect REST/API phrasing and map to REST_API_CANONICAL. */
function applyRestApiAliasDetection(lower: string, found: Map<string, string>): void {
  if (REST_API_DETECTION_PATTERNS.some((pattern) => pattern.test(lower))) {
    addCanonicalKeyword(found, REST_API_CANONICAL);
  }
}

/**
 * Extract scorable technical keywords from text (case-insensitive).
 * GENERIC_ROLE_TERMS are never included.
 */
export function extractKeywordsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Map<string, string>();

  for (const term of SORTED_TECHNICAL) {
    if (termPattern(term).test(lower)) {
      addCanonicalKeyword(found, canonicalizeTechnical(term));
    }
  }

  applyRestApiAliasDetection(lower, found);

  for (const [alias, canonical] of Object.entries(TECHNICAL_ALIASES)) {
    if (lower.includes(alias)) {
      addCanonicalKeyword(found, canonical);
    }
  }

  return Array.from(found.values());
}

export interface JDKeywordMatchResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  jdMatchScore: number;
  isSufficientJD: boolean;
}

/**
 * Deterministic JD ↔ resume keyword comparison (technical terms only).
 *
 * jdMatchScore = round(matchedKeywords.length / totalJDKeywords × 100)
 * isSufficientJD = true if ≥6 technical keywords extracted from JD
 */
export function computeJDKeywordMatch(
  resumeText: string,
  jobDescription: string,
): JDKeywordMatchResult {
  const jdKeywords = extractKeywordsFromText(jobDescription);
  const isSufficientJD = jdKeywords.length >= 6;
  const resumeKeywords = extractKeywordsFromText(resumeText);
  const resumeKeywordSet = new Set(
    resumeKeywords.map((k) => normalizeToken(k)),
  );

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdKeywords) {
    const normalizedKw = normalizeToken(kw);
    if (resumeKeywordSet.has(normalizedKw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalJDKeywords = jdKeywords.length;
  const jdMatchScore =
    totalJDKeywords === 0
      ? 0
      : Math.round((matchedKeywords.length / totalJDKeywords) * 100);

  return {
    matchedKeywords,
    missingKeywords,
    jdMatchScore,
    isSufficientJD,
  };
}

export function buildJDMatchResult(
  resumeText: string,
  jobDescription: string,
  jdSummary: string,
): JDMatchResult {
  const scores = computeJDKeywordMatch(resumeText, jobDescription);
  return {
    ...scores,
    jdSummary,
  };
}

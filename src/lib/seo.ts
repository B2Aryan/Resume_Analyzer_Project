
/**
 * SEO Utility for ResumePilot
 */

export const SITE_URL = "https://resumepilot.com";
export const SITE_NAME = "ResumePilot";
export const SITE_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/407db6d2-0aa9-4f1f-ab75-259f4b3c297c";

export interface SEOConfig {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  schema?: Record<string, any>;
}

// Helper to build canonical URLs
export function buildCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

// Centralized title generation
export function buildTitle(pageTitle: string): string {
  if (pageTitle === "Home") {
    return "ResumePilot — Free ATS Resume Checker & AI Resume Analyzer";
  }
  return `${pageTitle} — ResumePilot`;
}

// Organization schema (reusable)
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ResumePilot",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

// SoftwareApplication schema (reusable)
export const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ResumePilot",
  description: "Free ATS Resume Checker for students and freshers. Analyze ATS score, generate AI interview questions, create cover letters, and improve your resume.",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available",
  },
  operatingSystem: "Web",
};

// Helper to generate SEO head content compatible with TanStack Router
export function createSeoHead(config: SEOConfig) {
  const canonical = buildCanonicalUrl(config.path);
  const fullTitle = buildTitle(config.title);

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: config.description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: config.description },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SITE_OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: config.description },
      { name: "twitter:image", content: SITE_OG_IMAGE },
      ...(config.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: config.schema
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(config.schema),
          },
        ]
      : [],
  };
}


import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/ai-cover-letter-generator")({
  head: () =>
    createSeoHead({
      title: "AI Cover Letter Generator",
      description: "Generate personalized, job-specific cover letters in seconds with ResumePilot's AI cover letter generator.",
      path: "/ai-cover-letter-generator",
      schema: {
        "@context": "https://schema.org",
        "@graph": [ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA],
      },
    }),
  component: AICoverLetterGeneratorPage,
});

function AICoverLetterGeneratorPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            AI Cover Letter Generator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Create professional, job-specific cover letters in seconds.
          </p>
          <div className="mt-8">
            <Button asChild variant="hero" size="lg">
              <Link to="/upload">
                Try It Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

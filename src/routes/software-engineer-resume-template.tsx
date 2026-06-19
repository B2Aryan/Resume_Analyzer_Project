
import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanSearch, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/software-engineer-resume-template")({
  head: () =>
    createSeoHead({
      title: "Software Engineer Resume Template",
      description: "Get a free, ATS-optimized software engineer resume template to land interviews at top tech companies.",
      path: "/software-engineer-resume-template",
      schema: {
        "@context": "https://schema.org",
        "@graph": [ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA],
      },
    }),
  component: SoftwareEngineerResumeTemplatePage,
});

function SoftwareEngineerResumeTemplatePage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Software Engineer Resume Template
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Get a free, ATS-optimized software engineer resume template and use our checker to ensure it passes every hiring system.
          </p>
          <div className="mt-8">
            <Button asChild variant="hero" size="lg">
              <Link to="/upload">
                Check My Resume <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

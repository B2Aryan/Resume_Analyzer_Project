
import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanSearch, FileText, Sparkles, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/ats-resume-checker")({
  head: () =>
    createSeoHead({
      title: "ATS Resume Checker",
      description: "Use ResumePilot's free ATS resume checker to analyze compatibility, optimize keywords, and improve your score to pass automated hiring systems.",
      path: "/ats-resume-checker",
      schema: {
        "@context": "https://schema.org",
        "@graph": [ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA],
      },
    }),
  component: ATSResumeCheckerPage,
});

function ATSResumeCheckerPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            ATS Resume Checker
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Analyze your resume's compatibility with Applicant Tracking Systems,
            identify missing keywords, and optimize your resume to pass every ATS.
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


import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/resume-score-checker")({
  head: () =>
    createSeoHead({
      title: "Resume Score Checker",
      description: "Get an instant ATS score with ResumePilot's free resume score checker. See how your resume performs and improve your score.",
      path: "/resume-score-checker",
      schema: {
        "@context": "https://schema.org",
        "@graph": [ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA],
      },
    }),
  component: ResumeScoreCheckerPage,
});

function ResumeScoreCheckerPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Resume Score Checker
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Get an instant ATS resume score and actionable tips to improve it.
          </p>
          <div className="mt-8">
            <Button asChild variant="hero" size="lg">
              <Link to="/upload">
                Check My Score <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

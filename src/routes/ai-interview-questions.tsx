
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareCode, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/ai-interview-questions")({
  head: () =>
    createSeoHead({
      title: "AI Interview Questions",
      description: "Get personalized AI-generated interview questions based on your resume and target role with ResumePilot.",
      path: "/ai-interview-questions",
      schema: {
        "@context": "https://schema.org",
        "@graph": [ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA],
      },
    }),
  component: AIInterviewQuestionsPage,
});

function AIInterviewQuestionsPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            AI Interview Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Prepare for your next interview with AI-generated questions tailored to your resume.
          </p>
          <div className="mt-8">
            <Button asChild variant="hero" size="lg">
              <Link to="/upload">
                Get My Questions <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

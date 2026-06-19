import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanSearch, MessageSquareCode, History, BookmarkCheck, Sparkles, FileText, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/features")({
  head: () => createSeoHead({
    title: "Features",
    description: "Explore ATS analysis, interview questions, cover letter generation, resume history, report sharing, and more.",
    path: "/features",
    schema: {
      "@context": "https://schema.org",
      "@graph": [ORGANIZATION_SCHEMA],
    },
  }),
  component: FeaturesPage,
});

const features = [
  { icon: ScanSearch, title: "ATS Analysis", desc: "Analyze ATS compatibility, keyword match, formatting issues, and recruiter readiness." },
  { icon: MessageSquareCode, title: "AI Interview Questions", desc: "Generate personalized interview questions based on your resume and target role." },
  { icon: Sparkles, title: "AI Improvement Suggestions", desc: "Receive actionable recommendations to improve ATS score and resume quality." },
  { icon: History, title: "Resume History", desc: "Track every resume analysis and monitor improvements over time." },
  { icon: BookmarkCheck, title: "Saved Reports", desc: "Save important ATS reports and revisit them whenever needed." },
  { icon: FileText, title: "Cover Letter Generator", desc: "Generate job-specific cover letters using your resume and job description." },
];

function FeaturesPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Everything you need to land interviews</h1>
          <p className="mt-3 text-muted-foreground">Resume analysis, interview preparation, report sharing, and career tools — all in one platform.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/upload">
                Analyze Resume
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feature-card feat-tinted feat-blue p-6 transition-all hover:-translate-y-1 hover:shadow-elegant relative overflow-hidden">
                <div className="feat-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}

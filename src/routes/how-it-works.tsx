import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, FileSearch, Sparkles, Target, KeyRound, FolderKanban, FileText, LayoutGrid, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — ResumePilot" },
      { name: "description", content: "Upload, analyze, and improve. See exactly how ResumePilot evaluates your resume." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { icon: Upload, title: "Upload your resume", desc: "Drop a PDF or paste your resume text. Add your target role or paste a job description." },
  { icon: FileSearch, title: "We run a recruiter-grade scan", desc: "Five engines check ATS compatibility, keywords, projects, summary and formatting in parallel." },
  { icon: Sparkles, title: "Apply specific suggestions", desc: "Get rewrites and quick wins tied to the exact line that needs fixing — not generic advice." },
];

const checks = [
  { icon: Target, title: "ATS Engine", desc: "Detects tables, columns, icons, exotic fonts and parses each section the way an ATS would." },
  { icon: KeyRound, title: "Keyword Engine", desc: "Extracts must-have keywords from the JD, then scores presence, density and naturalness." },
  { icon: FolderKanban, title: "Project Engine", desc: "Reviews every project bullet for action verbs, metrics, scope and tech stack clarity." },
  { icon: FileText, title: "Summary Engine", desc: "Checks if your headline + summary clearly position you for the role within 5 seconds." },
  { icon: LayoutGrid, title: "Format Engine", desc: "Catches spacing, hierarchy and consistency issues that hurt readability." },
];

function HowItWorks() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">From upload to interview-ready in minutes</h1>
          <p className="mt-4 text-muted-foreground">A focused, recruiter-style review you can act on right away.</p>
          <Button asChild variant="hero" size="lg" className="mt-7"><Link to="/upload">Try it free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="relative border-border/60">
                <CardContent className="p-7">
                  <div className="absolute right-5 top-5 font-display text-5xl font-bold text-muted/40">0{i+1}</div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">What runs on every scan</h2>
            <p className="mt-2 text-muted-foreground">Five focused engines. No vague AI fluff.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="border-border/60">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-5 w-5" /></div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

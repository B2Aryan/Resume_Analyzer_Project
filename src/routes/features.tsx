import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, KeyRound, FolderKanban, FileText, LayoutGrid, Sparkles, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ResumeCheck AI" },
      { name: "description", content: "ATS scoring, keyword detection, project review, summary checks and more." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: Target, title: "ATS Compatibility Score", desc: "An honest score out of 100 based on real ATS parser behavior." },
  { icon: KeyRound, title: "Keyword Detection", desc: "Match against your target role JD and surface missing keywords." },
  { icon: FolderKanban, title: "Project Review", desc: "Bullet-by-bullet feedback on impact, metrics, scope and stack." },
  { icon: FileText, title: "Summary & Skills Check", desc: "Make sure your headline and skills work in the recruiter's 6-second scan." },
  { icon: LayoutGrid, title: "Formatting Audit", desc: "Catch tables, columns, icons and fonts that break parsing." },
  { icon: Sparkles, title: "Smart Suggestions", desc: "Specific rewrites with stronger verbs and quantifiable outcomes." },
];

function FeaturesPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Every check you need, in one scan</h1>
          <p className="mt-3 text-muted-foreground">Six focused engines that deliver a recruiter-grade review every time.</p>
          <Button asChild variant="hero" size="lg" className="mt-7"><Link to="/upload">Run a free scan <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}

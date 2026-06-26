import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Target, Zap, Users } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileAbout } from "@/components/mobile/MobileAbout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ResumePilot" },
      { name: "description", content: "We help students beat the ATS and land their first interviews — for free." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Heart, title: "Student-first", desc: "Built around freshers and interns — not senior FAANG engineers." },
  { icon: Target, title: "Specific over generic", desc: "Every suggestion is tied to a line in your resume." },
  { icon: Zap, title: "Fast & free", desc: "Get value in seconds without paywalls blocking your first run." },
  { icon: Users, title: "Open to feedback", desc: "We ship improvements every week based on student requests." },
];

function AboutPage() {
  return (
    <>
      <div className="hidden lg:block">
        <MarketingLayout>
          <section className="hero-ambient py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Helping students land interviews</h1>
              <p className="mt-4 text-muted-foreground">
                ResumePilot started after watching too many great students get filtered out by automated systems before a human ever read their resume. We fix that.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <Card key={v.title} className="border-border/60">
                    <CardContent className="p-6">
                      <Icon className="h-6 w-6 text-primary" />
                      <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground shadow-elegant">
              <h2 className="font-display text-3xl font-bold">Ready to give your resume a real shot?</h2>
              <Button asChild size="lg" className="mt-6 bg-background text-foreground hover:bg-background/90"><Link to="/upload">Run a free analysis</Link></Button>
            </div>
          </section>
        </MarketingLayout>
      </div>

      <div className="block lg:hidden">
        <MobileShell>
          <MobileAbout />
        </MobileShell>
      </div>
    </>
  );
}

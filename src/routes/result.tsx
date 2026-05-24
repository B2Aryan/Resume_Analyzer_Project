import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, RotateCcw, Sparkles, CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing, ScoreBar } from "@/components/score-ring";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Analysis Result — ResumeCheck AI" },
      { name: "description", content: "Your ATS resume analysis with score, keywords and improvement suggestions." },
    ],
  }),
  component: ResultPage,
});

const breakdown = [
  { label: "ATS Compatibility", value: 86, hint: "Clean structure, no tables or columns detected." },
  { label: "Keyword Match", value: 64, hint: "5 of 14 priority keywords missing." },
  { label: "Project Section", value: 78, hint: "Strong stack mentions, weak quantifiable impact." },
  { label: "Skills Section", value: 90, hint: "Well-categorized and relevant." },
  { label: "Formatting Quality", value: 92, hint: "Recruiter-friendly, single column." },
];

const missing = ["TypeScript", "REST API", "Jest", "Tailwind CSS", "CI/CD"];
const present = ["React", "JavaScript", "Git", "HTML", "CSS", "Node.js"];

const strengths = [
  "Clear, ATS-friendly single-column layout",
  "Strong technical skill categorization",
  "Quantified impact in two project bullets",
  "Relevant coursework aligned with target role",
];

const suggestions = [
  { title: "Add measurable outcomes to projects", desc: "Use numbers in 3 of 4 project bullets — e.g. 'reduced load time by 38%'." },
  { title: "Sharpen your professional summary", desc: "Lead with a one-liner that names the role and your top 2 skills." },
  { title: "Surface missing keywords", desc: "Naturally weave in TypeScript, REST API and Jest where you've actually used them." },
  { title: "Replace weak verbs", desc: "Swap 'worked on' / 'helped with' for 'shipped', 'built', 'led', 'optimized'." },
];

const sections = [
  { name: "Summary", score: 70, status: "Needs work", note: "Too generic. Mention role and 2 standout skills." },
  { name: "Experience", score: 82, status: "Good", note: "Add 1 metric per bullet to make impact clearer." },
  { name: "Projects", score: 78, status: "Good", note: "Add a live link to your top project." },
  { name: "Education", score: 95, status: "Strong", note: "Concise and well-formatted." },
  { name: "Skills", score: 90, status: "Strong", note: "Add TypeScript, Jest under Frontend." },
];

function statusTone(s: string) {
  return s === "Strong" ? "text-success bg-success/10" : s === "Good" ? "text-primary bg-accent" : "text-warning bg-warning/10";
}

function ResultPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-border hero-ambient">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analysis Report</p>
              <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Aanya_Sharma_Resume.pdf</h1>
              <p className="mt-1 text-sm text-muted-foreground">Target: Frontend Developer Intern · Analyzed just now</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline"><Download className="h-4 w-4" /> Download report</Button>
              <Button asChild variant="hero"><Link to="/upload"><RotateCcw className="h-4 w-4" /> Try another resume</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left + middle */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60 shadow-soft animate-scale-in">
              <CardContent className="grid items-center gap-6 p-6 sm:grid-cols-[auto,1fr] sm:p-8">
                <ScoreRing score={78} />
                <div>
                  <h2 className="font-display text-2xl font-bold">You're almost interview-ready</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Solid foundation with clean formatting. Tighten the keyword match and add measurable impact to push your score above 90.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"><CheckCircle2 className="h-3 w-3" /> ATS-safe</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning"><AlertCircle className="h-3 w-3" /> Keyword gaps</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"><Sparkles className="h-3 w-3" /> 4 quick wins</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-display text-lg font-semibold">Score breakdown</h3>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {breakdown.map((b) => <ScoreBar key={b.label} {...b} />)}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-display text-base font-semibold">Missing keywords</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Try to add these naturally where relevant.</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {missing.map(k => <span key={k} className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">{k}</span>)}
                  </div>
                  <h3 className="mt-6 font-display text-base font-semibold">Detected keywords</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {present.map(k => <span key={k} className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">{k}</span>)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-display text-base font-semibold">What's working</h3>
                  <ul className="mt-3 space-y-2.5">
                    {strengths.map(s => (
                      <li key={s} className="flex gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-display text-lg font-semibold">Improvement suggestions</h3>
                <div className="mt-5 space-y-3">
                  {suggestions.map((s, i) => (
                    <div key={s.title} className="flex gap-4 rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-semibold">{i+1}</div>
                      <div>
                        <p className="font-semibold">{s.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-display text-lg font-semibold">Section-by-section analysis</h3>
                <div className="mt-5 divide-y divide-border">
                  {sections.map((s) => (
                    <div key={s.name} className="grid gap-2 py-4 sm:grid-cols-[140px,80px,1fr] sm:items-center">
                      <div className="font-semibold">{s.name}</div>
                      <div><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone(s.status)}`}>{s.status}</span></div>
                      <div className="text-sm text-muted-foreground">{s.note} <span className="ml-2 font-semibold text-foreground">{s.score}/100</span></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <aside className="space-y-6">
            <Card className="border-border/60 bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Quick tips</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>Keep your resume to <strong>one page</strong> as a fresher.</li>
                  <li>Use <strong>action verbs</strong> like built, shipped, led.</li>
                  <li>Quantify impact wherever possible.</li>
                  <li>Skip photos, icons, and exotic fonts.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="font-display text-base font-semibold">Next actions</h3>
                <div className="mt-4 space-y-2">
                  <Button asChild variant="hero" className="w-full"><Link to="/upload">Re-scan after edits <ArrowRight className="h-4 w-4" /></Link></Button>
                  <Button variant="outline" className="w-full"><Download className="h-4 w-4" /> Export PDF</Button>
                  <Button asChild variant="ghost" className="w-full"><Link to="/dashboard">Save to dashboard</Link></Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-accent/40">
              <CardContent className="p-6">
                <p className="font-display text-sm font-semibold">Want deeper feedback?</p>
                <p className="mt-1 text-xs text-muted-foreground">Pro unlocks unlimited scans, JD-tailored rewrites, and history exports.</p>
                <Button asChild size="sm" className="mt-4 w-full" variant="hero"><Link to="/pricing">See Pro plans</Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  );
}

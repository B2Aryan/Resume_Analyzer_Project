import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Upload, Sparkles, Target, CheckCircle2, FileSearch, KeyRound, FolderKanban, FileText, LayoutGrid, Zap, GraduationCap, Heart, Quote, Star, TrendingUp } from "lucide-react";
import { TypingText } from "@/components/typing-text";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing, ScoreBar } from "@/components/score-ring";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeCheck AI — Beat the ATS, land the interview" },
      { name: "description", content: "Free ATS resume analyzer for students. Upload, get a score, missing keywords and improvement tips in seconds." },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: Target, title: "ATS Compatibility Score", desc: "See exactly how parser-friendly your resume is, scored out of 100.", tone: "feat-blue" },
  { icon: KeyRound, title: "Keyword Detection", desc: "Match against the target role and surface missing high-impact keywords.", tone: "feat-blue" },
  { icon: FileText, title: "Summary & Skills Check", desc: "Make sure your headline, summary and skills section work for recruiters.", tone: "feat-purple" },
  { icon: Sparkles, title: "Smart Suggestions", desc: "Actionable rewrites with stronger verbs and quantifiable outcomes.", tone: "feat-purple" },
  { icon: FolderKanban, title: "Project Review", desc: "Get specific feedback on impact, metrics, and tech stack on every project.", tone: "feat-green" },
  { icon: LayoutGrid, title: "Formatting Audit", desc: "Catch tables, columns, icons and exotic fonts that break ATS parsing.", tone: "feat-green" },
];

const steps = [
  { icon: Upload, title: "Upload your resume", desc: "Drop a PDF or paste your text. No signup required to start." },
  { icon: FileSearch, title: "We analyze in seconds", desc: "Get an ATS score, keyword match, and section-by-section feedback." },
  { icon: Sparkles, title: "Improve and re-scan", desc: "Apply our suggestions and re-run the check until you're recruiter-ready." },
];

const why = [
  { icon: GraduationCap, title: "Built for students", desc: "Tuned for first jobs, internships and campus placements." },
  { icon: Zap, title: "Lightning fast", desc: "Results in under 10 seconds. No waiting, no fluff." },
  { icon: Heart, title: "Free to start", desc: "Run analyses on the free plan forever. Upgrade only when you need more." },
  { icon: CheckCircle2, title: "Actionable, not vague", desc: "Every suggestion is specific and rewritable, not a generic AI dump." },
];

const testimonials = [
  { name: "Aanya S.", role: "CSE, 3rd year", quote: "Got callbacks from 3 product companies after applying the keyword fixes. The ATS score view is addictive.", before: 62, after: 89 },
  { name: "Rohan M.", role: "Recent grad", quote: "I had no idea my two-column resume was getting nuked by the ATS. Fixed it in 20 minutes.", before: 54, after: 86 },
  { name: "Priya K.", role: "MBA fresher", quote: "The project section feedback is gold — finally taught me how to write impact bullets.", before: 71, after: 92 },
];

const faqs = [
  { q: "Is ResumeCheck AI really free?", a: "Yes. The free plan covers everything you need to analyze and improve your resume. Pro is for power users who want unlimited scans and deeper feedback." },
  { q: "Will my resume data be shared?", a: "Never. Your resume is processed for analysis and is never sold or used to train models." },
  { q: "What file formats do you support?", a: "PDF is recommended. You can also paste plain resume text. DOCX support is coming soon." },
  { q: "How accurate is the ATS score?", a: "Our scoring mimics the most common ATS parsers used by Indian and US recruiters. It's a strong proxy, not a guarantee." },
];

function LandingPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden hero-ambient">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-28 pb-12 sm:px-6 sm:pt-36 sm:pb-16 md:pt-40 md:pb-24 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Built for students &amp; freshers
            </span>
            <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Check your resume for{" "}
              <TypingText
                phrases={[
                  "ATS issues",
                  "Missing keywords",
                  "Formatting problems",
                  "Weak project bullets",
                  "Skill gaps",
                  "Resume mistakes",
                ]}
                className="text-gradient font-extrabold tracking-tight"
              />{" "}
              in seconds.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0">
              Upload your resume, paste a target role, and instantly get an ATS score, missing keywords, and clear improvement tips. Land more interviews — for free.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
              <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
                <Link to="/upload">Upload Resume <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/result">See Sample Report</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:text-sm lg:justify-start">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-gradient-primary sm:h-7 sm:w-7" />)}
              </div>
              <span>Trusted by 12,000+ students this semester</span>
            </div>
          </div>

          {/* Mockup card */}
          <div className="relative animate-scale-in lg:pl-8">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl sm:-inset-6" />
            <div className="premium-card p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Resume report</p>
                  <p className="mt-1 truncate text-sm font-semibold sm:text-base">Aanya_Sharma_Resume.pdf</p>
                  <p className="truncate text-xs text-muted-foreground">Target: Frontend Developer Intern</p>
                </div>
                <div className="shrink-0 sm:hidden"><ScoreRing score={82} size={84} label="ATS" /></div>
                <div className="hidden shrink-0 sm:block"><ScoreRing score={82} size={120} label="ATS" /></div>
              </div>
              <div className="mt-5 space-y-3 sm:mt-6">
                <ScoreBar label="Keyword Match" value={74} />
                <ScoreBar label="Project Quality" value={88} />
                <ScoreBar label="Formatting" value={92} />
              </div>
              <div className="mt-5 border-t border-border/60 pt-4 sm:mt-6 sm:pt-5">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Missing keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {["TypeScript", "Tailwind", "REST API", "Git", "Jest"].map(k => (
                    <span key={k} className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-foreground/90 backdrop-blur">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="ambient-spot section-divider py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps from messy draft to interview-ready resume.</p>
          </div>
          <div className="mt-10 sm:mt-12">
            <div className="grid gap-6 md:gap-8 md:grid-cols-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="feature-card relative p-7">
                    <div className="absolute right-5 top-4 font-display text-4xl font-semibold tracking-tight text-foreground/[0.04]">0{i+1}</div>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-divider section-soft py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">Everything you need to beat the ATS</h2>
            <p className="mt-3 text-muted-foreground">Six powerful checks running on every scan.</p>
          </div>
          <div className="mt-10 grid sm:mt-12 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`feature-card feat-tinted ${f.tone} p-6`}>
                  <div className="feat-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section-divider py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">Why students choose ResumeCheck AI</h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                Generic AI tools throw a wall of text at you. We give you a focused, recruiter-style review you can act on in minutes.
              </p>
              <Button asChild className="mt-6" variant="hero" size="lg">
                <Link to="/upload">Try a free scan <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {why.map((w) => {
                const Icon = w.icon;
                return (
                  <div key={w.title} className="feature-card p-5">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold">{w.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-divider section-soft py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">Loved by students across campuses</h2>
          </div>
          <div className="mt-10 grid sm:mt-12 gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="feature-card relative p-6">
                <Quote className="absolute right-5 top-4 h-8 w-8 text-primary/15" />
                <div className="mb-3 flex gap-0.5 text-warning">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                    <TrendingUp className="h-3 w-3" />
                    {t.before} → {t.after}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-divider py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-divider py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <CTAPanel>
            <div className="px-6 py-14 text-center sm:px-12 sm:py-20 md:px-16 md:py-24">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                Free to start
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Ready to land
                <br className="hidden sm:block" />{" "}
                <span className="text-gradient">more interviews?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
                Run your first analysis in under a minute. No card, no friction.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="hero" className="group w-full sm:w-auto">
                  <Link to="/upload">
                    Analyze My Resume
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                  <Link to="/how-it-works">See how it works</Link>
                </Button>
              </div>
            </div>
          </CTAPanel>
        </div>
      </section>
    </MarketingLayout>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Upload, Sparkles, Target, CheckCircle2, FileSearch, KeyRound, FolderKanban, FileText, LayoutGrid, Zap, GraduationCap, Heart, Quote, Star, TrendingUp, ScanSearch, MessageSquareCode, History, BookmarkCheck } from "lucide-react";
import { TypingText } from "@/components/typing-text";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing, ScoreBar } from "@/components/score-ring";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CTAPanel } from "@/components/marketing/CTAPanel";
import { SpotlightCard } from "@/components/marketing/SpotlightCard";
import { useAnalysisStore } from "@/store/analysisStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumePilot — Beat the ATS, land the interview" },
      { name: "description", content: "An AI-powered career toolkit for students, freshers, and job seekers — resume analysis, interview prep, report sharing, and more." },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: ScanSearch, title: "ATS Analysis", desc: "Analyze ATS compatibility, keyword match, formatting issues, and recruiter readiness.", tone: "feat-blue" },
  { icon: MessageSquareCode, title: "AI Interview Questions", desc: "Generate personalized interview questions based on your resume and target role.", tone: "feat-blue" },
  { icon: Sparkles, title: "AI Improvement Suggestions", desc: "Receive actionable recommendations to improve ATS score and resume quality.", tone: "feat-purple" },
  { icon: History, title: "Resume History", desc: "Track every resume analysis and monitor improvements over time.", tone: "feat-purple" },
  { icon: BookmarkCheck, title: "Saved Reports", desc: "Save important ATS reports and revisit them whenever needed.", tone: "feat-green" },
  { icon: FileText, title: "Cover Letter Generator", desc: "Generate job-specific cover letters using your resume and job description.", tone: "feat-green" },
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
  { q: "Is ResumePilot really free?", a: "Yes. The free plan covers everything you need to analyze and improve your resume. Pro is for power users who want unlimited scans and deeper feedback." },
  { q: "Will my resume data be shared?", a: "Never. Your resume is processed for analysis and is never sold or used to train models." },
  { q: "What file formats do you support?", a: "PDF is recommended. You can also paste plain resume text. DOCX support is coming soon." },
  { q: "How accurate is the ATS score?", a: "Our scoring mimics the most common ATS parsers used by Indian and US recruiters. It's a strong proxy, not a guarantee." },
];

function LandingPage() {
  const navigate = useNavigate();
  const setResult = useAnalysisStore((state) => state.setResult);

  const handleSeeSampleReport = () => {
    const sampleResult = {
      score: 82,
      atsCompatibility: 88,
      keywordMatch: 74,
      skillsScore: 80,
      projectScore: 86,
      presentKeywords: [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Node.js",
        "Git",
        "REST API",
        "Jest",
      ],
      missingKeywords: [
        "Next.js",
        "GraphQL",
        "Docker",
        "AWS",
        "CI/CD",
        "Redux",
      ],
      strengths: [
        "Clear, chronological work history",
        "Action verbs used effectively in project descriptions",
        "Technical skills section is well-organized",
        "Resume is ATS-friendly with standard section headers",
      ],
      suggestions: [
        "Add quantifiable metrics to your project outcomes",
        "Include more modern frontend technologies like Next.js",
        "Add a brief professional summary at the top",
      ],
      summary:
        "Your resume is strong and ATS-friendly! Focus on adding measurable achievements and modern tech skills to stand out.",
      improvementSuggestions: [
        {
          keyword: "Next.js",
          whyItMatters:
            "Next.js is the most popular React framework for production apps",
          suggestion:
            "Add a Next.js project to your portfolio or mention experience with SSR/SSG",
        },
        {
          keyword: "GraphQL",
          whyItMatters: "Many modern APIs use GraphQL instead of REST",
          suggestion:
            "Add GraphQL to your skills or include a project that uses it",
        },
        {
          keyword: "Docker",
          whyItMatters:
            "Containerization is essential for DevOps and deployment",
          suggestion:
            "Mention Docker in your skills or add a Dockerfile to your projects",
        },
      ],
    };

    setResult(
      sampleResult,
      "Frontend Developer Intern",
      "Aanya_Sharma_Resume.pdf",
      "Sample resume text...",
      undefined,
      { animateEntry: true }
    );
    navigate({ to: "/result" });
  };
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden hero-ambient">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-28 pb-12 sm:px-6 sm:pt-36 sm:pb-16 md:pt-40 md:pb-24 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="animate-fade-up text-center lg:text-left mt-10 sm:mt-12">
            <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="block">Check your resume for</span>
              <span className="block my-1">
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
                />
              </span>
              <span className="block">in seconds.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0">
              Upload your resume, paste a target role, and instantly get an ATS score, missing keywords, and clear improvement tips. Land more interviews — for free.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
              <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
                <Link to="/upload">Upload Resume <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleSeeSampleReport}
              >
                See Sample Report
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:text-sm lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>ATS score</span>
                <span>•</span>
                <span>Keyword analysis</span>
                <span>•</span>
                <span>Actionable improvements</span>
              </div>
            </div>
          </div>

          {/* Mockup card */}
          <div className="relative animate-scale-in lg:pl-8">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl sm:-inset-6" />
            <SpotlightCard className="premium-card p-5 sm:p-7">
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
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-14 sm:py-20">
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
      <section id="features" className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">Everything you need to land interviews</h2>
            <p className="mt-3 text-muted-foreground">An AI-powered career toolkit for students, freshers, and job seekers.</p>
          </div>
          <div className="mt-10 grid sm:mt-12 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`feature-card feat-tinted ${f.tone} p-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-elegant`}>
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
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">Why students choose ResumePilot</h2>
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

      {/* FAQ */}
      <section className="py-14 sm:py-20">
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
    </MarketingLayout>
  );
}

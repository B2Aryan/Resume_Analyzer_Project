import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ScanSearch,
  Sparkles,
  FileText,
  MessageSquare,
  ArrowRight,
  FileCheck2,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "ATS Resume Analysis",
    desc: "Get instant ATS compatibility score and keyword insights.",
    color: "bg-blue-500/15 text-blue-400",
    available: true,
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    desc: "Personalized improvements to boost your resume score.",
    color: "bg-purple-500/15 text-purple-400",
    available: true,
  },
  {
    icon: FileText,
    title: "Resume Optimization",
    desc: "Tailored keyword matching for any job description.",
    color: "bg-green-500/15 text-green-400",
    available: true,
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    desc: "AI-powered interview prep based on your resume.",
    color: "bg-amber-500/15 text-amber-400",
    available: false,
  },
] as const;

const stats = [
  { value: "10s", label: "Analysis time" },
  { value: "Free", label: "To start" },
  { value: "ATS", label: "Score + tips" },
] as const;

export function MobileLanding() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-[0_0_16px_rgba(59,130,246,0.4)]">
            <FileCheck2 className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            ResumePilot
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!user && (
            <Link
              to="/login"
              className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-colors active:bg-muted"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="px-5 pb-28">
        {/* Hero */}
        <section className="mt-10 text-center">

          <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight">
            Land More{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Interviews
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Get your ATS score, missing keywords, and AI-powered resume improvements in under 10 seconds.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98]"
            >
              <ScanSearch className="h-4 w-4" />
              Analyze My Resume
              <ArrowRight className="h-4 w-4" />
            </Link>

            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-semibold text-foreground transition-all active:scale-[0.98]"
              >
                Go to Dashboard
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-semibold text-foreground transition-all active:scale-[0.98]"
              >
                Sign In to Dashboard
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex items-center justify-center gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-lg font-bold text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-base font-bold">
            Everything you need
          </h2>
          <div className="space-y-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-4 transition-all active:scale-[0.99]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{f.title}</p>
                      {!f.available && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Guest CTA band */}
        {!user && (
          <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <p className="font-display text-base font-bold">No sign-up required</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Analyze your resume instantly. Create a free account to save reports and track progress.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all active:scale-[0.97]"
            >
              Try for free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

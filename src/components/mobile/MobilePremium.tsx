import { Sparkles, Bell, FileText, CheckCircle2, Rocket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface MobilePremiumProps {
  user: User | null;
  isProcessing: boolean;
  handleNotifyMe: () => Promise<void>;
  handleSurvey: () => void;
}

export function MobilePremium({
  user,
  isProcessing,
  handleNotifyMe,
  handleSurvey,
}: MobilePremiumProps) {
  // Features preview list
  const features = [
    {
      icon: Sparkles,
      title: "Unlimited ATS Analyses",
      description: "Analyze as many resumes as you need without monthly limits",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      icon: FileText,
      title: "Unlimited Cover Letter Generation",
      description: "Generate personalized cover letters tailored to job descriptions",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      icon: CheckCircle2,
      title: "Unlimited AI Mock Interviews",
      description: "Practice with AI-powered mock interviews and get feedback",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      icon: Rocket,
      title: "Advanced Resume Analysis",
      description: "Deep ATS compatibility analysis with detailed recommendations",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
    {
      icon: Bell,
      title: "Priority Support",
      description: "Get help when you need it with priority email support",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      icon: CheckCircle2,
      title: "Export & History",
      description: "Save and export all your analysis reports and history",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
  ];

  // Benefits list
  const benefits = [
    { text: "Early-bird lifetime discounts" },
    { text: "Priority access to new AI models" },
    { text: "Exclusive invites to beta features" },
    { text: "Direct support channel to creators" },
  ];

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
      {/* Premium Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-4">
          <Star className="h-6 w-6 animate-pulse" />
        </div>
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight">
          Premium Coming Soon
        </h1>
        <p className="mt-2 text-gradient font-display text-lg font-bold">
          Something Amazing
        </p>
        <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          We're building ResumePilot Premium with powerful features to supercharge your job search. Be the first to know when we launch!
        </p>
      </div>

      {/* Premium Benefits */}
      <div className="mb-8 rounded-2xl border border-border/40 bg-card p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Premium Benefits</h3>
        <ul className="space-y-3">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-foreground">{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Feature Cards */}
      <div className="mb-8 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">What's Coming in Premium</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", feature.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-sm font-bold text-foreground">{feature.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waitlist CTA */}
      <div className="mb-10 rounded-2xl border border-border/40 bg-card p-5 text-center">
        <h4 className="font-display text-base font-bold text-foreground">Secure Your Priority Spot</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Join the waitlist today and get notified immediately when we launch.
        </p>
        <div className="mt-4">
          <Button
            onClick={handleNotifyMe}
            disabled={isProcessing}
            className="relative w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>{isProcessing ? "Joining Waitlist..." : "Join Waitlist"}</span>
          </Button>
        </div>
      </div>

      {/* Survey CTA Section */}
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-blue-950/20 to-purple-950/20 p-6 text-center">
        <h4 className="font-display text-base font-bold text-foreground">Help Build ResumePilot</h4>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Complete a short survey and receive <span className="font-semibold text-primary-foreground underline underline-offset-2 decoration-blue-400">+2 bonus ATS analyses</span>.
        </p>
        <div className="mt-4">
          <Button
            onClick={handleSurvey}
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>Take Survey</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

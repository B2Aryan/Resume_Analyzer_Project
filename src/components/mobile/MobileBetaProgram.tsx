import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { getSupabaseClient } from "@/lib/supabase";
import {
  ChevronLeft,
  FlaskConical,
  CheckCircle2,
  FileText,
  Briefcase,
  GitCompare,
  Copy,
  MessageSquare,
  Linkedin,
  Loader2,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MobileBetaProgram() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleBack = () => {
    navigate({ to: "/mobile/tools" });
  };

  // Fetch analyses to verify "At least one ATS analysis" requirement
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => (user ? fetchAnalysesFromDB(user) : []),
    enabled: !!user,
  });

  const hasAnalysis = analyses.length > 0;
  const isUserLoggedIn = !!user;

  const handleJoinBeta = async () => {
    if (!isUserLoggedIn) {
      toast.error("Please login to join the beta program waitlist.");
      return;
    }
    if (!hasAnalysis) {
      toast.error("You must run at least one ATS analysis before joining the beta program.");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please accept the beta program terms.");
      return;
    }

    setIsJoining(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        toast.error("Failed to connect to database");
        setIsJoining(false);
        return;
      }

      // Check if user is already on waitlist
      const { data: existing, error: checkError } = await supabase
        .from("premium_interest")
        .select("id")
        .eq("user_id", user.id)
        .eq("source", "mobile_beta_program")
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        toast.error(`Database error: ${checkError.message}`);
        setIsJoining(false);
        return;
      }

      if (existing) {
        toast.info("You're already on the Beta waitlist!");
        setIsJoining(false);
        return;
      }

      // Add to premium_interest table using the waitlist system
      const { error } = await supabase
        .from("premium_interest")
        .insert({
          user_id: user.id,
          source: "mobile_beta_program"
        });

      if (error) {
        toast.error(`Failed to join waitlist: ${error.message}`);
        return;
      }

      toast.success("Successfully joined the ResumePilot Beta Waitlist!");
      
      // Navigate back to tools after a brief delay
      setTimeout(() => {
        navigate({ to: "/mobile/tools" });
      }, 1500);

    } catch (err: any) {
      console.error("Join beta error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const betaFeatures = [
    {
      title: "AI Cover Letter Generator",
      description: "Instantly draft personalized cover letters tailored to your resumes.",
      icon: FileText,
      iconColor: "bg-blue-500/15 text-blue-400",
    },
    {
      title: "Job Match Analyzer",
      description: "Compare your resume against multiple job descriptions in seconds.",
      icon: Briefcase,
      iconColor: "bg-purple-500/15 text-purple-400",
    },
    {
      title: "Resume Comparison",
      description: "Compare multiple versions of your resume and track score variations.",
      icon: GitCompare,
      iconColor: "bg-indigo-500/15 text-indigo-400",
    },
    {
      title: "Resume Templates",
      description: "Choose from optimized, recruiter-approved layout presets.",
      icon: Copy,
      iconColor: "bg-emerald-500/15 text-emerald-400",
    },
    {
      title: "AI Mock Interviews",
      description: "Simulate interviews based on specific jobs and get feedback.",
      icon: MessageSquare,
      iconColor: "bg-pink-500/15 text-pink-400",
    },
    {
      title: "LinkedIn Optimizer",
      description: "Audit and optimize your LinkedIn profile for high visibility.",
      icon: Linkedin,
      iconColor: "bg-sky-500/15 text-sky-400",
    },
  ];

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
          aria-label="Back to Tools"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-xl font-bold">Beta Program</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 pl-1">
        Get early access to upcoming ResumePilot features.
      </p>

      <div className="space-y-6">
        {/* Hero Card */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-indigo-950/20 via-background to-blue-950/20 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <FlaskConical className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-foreground">
                🚀 ResumePilot Beta
              </h2>
              <p className="text-xs text-muted-foreground">Shape the future of resume analysis.</p>
            </div>
          </div>
          
          <ul className="grid grid-cols-2 gap-3.5 pt-2 text-xs">
            <li className="flex items-start gap-2.5">
              <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground leading-relaxed">Early feature access</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground leading-relaxed">Help shape development</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground leading-relaxed">Direct feedback channel</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground leading-relaxed">Exclusive previews</span>
            </li>
          </ul>
        </div>

        {/* Upcoming Beta Features */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Upcoming Beta Features
          </h3>
          <div className="grid gap-3">
            {betaFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-sm font-bold text-foreground truncate">
                        {item.title}
                      </h4>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground shrink-0 border border-border/20">
                        Coming Soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Join Beta Waitlist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Join Beta Waitlist
          </h3>
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
            <h4 className="font-display text-sm font-bold text-foreground">
              Requirements
            </h4>
            
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  Active account
                </span>
                {isUserLoggedIn ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/25 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    ✕ Log in required
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  At least one ATS analysis
                </span>
                {isLoadingAnalyses ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : hasAnalysis ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    ✓ {analyses.length} Analysis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    ⚠ 0 analyses completed
                  </span>
                )}
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3 pt-3 border-t border-border/20">
              <input
                type="checkbox"
                id="beta-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isJoining}
                className="mt-0.5 h-4 w-4 rounded border-border/40 bg-muted/40 text-primary focus:ring-primary/30"
              />
              <label htmlFor="beta-terms" className="text-xs text-muted-foreground leading-normal select-none">
                I understand beta features may contain bugs.
              </label>
            </div>

            {/* Button */}
            <Button
              onClick={handleJoinBeta}
              disabled={isJoining || !agreedToTerms || !isUserLoggedIn || !hasAnalysis}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Joining...</span>
                </>
              ) : (
                <span>Join Beta Waitlist</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

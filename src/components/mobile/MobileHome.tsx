import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysisStore } from "@/store/analysisStore";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActivityCenter } from "./ActivityCenter";
import { MobileScoreRing } from "./MobileScoreRing";
import Lottie from "lottie-react";
import profileAvatarAnimation from "@/assets/lottie/profile-avatar.json";
import {
  FileText,
  ChevronRight,
  Upload,
  Bookmark,
  History,
  MessageSquare,
  Loader2,
  ScanSearch,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MILESTONES = [
  { label: "Poor", range: "0-49", min: 0, max: 49 },
  { label: "Average", range: "50-69", min: 50, max: 69 },
  { label: "Good", range: "70-89", min: 70, max: 89 },
  { label: "Excellent", range: "90-100", min: 90, max: 100 },
];

function getCategoryProps(score: number) {
  if (score >= 90) return { label: "Excellent", colorClass: "text-[#3B82F6]" };
  if (score >= 70) return { label: "Good", colorClass: "text-[#3B82F6]" };
  if (score >= 50) return { label: "Average", colorClass: "text-[#F59E0B]" };
  return { label: "Poor", colorClass: "text-[#EF4444]" };
}

function getRangeText(score: number): string {
  if (score >= 90) return "You're in the 90–100 range";
  if (score >= 70) return "You're in the 70–89 range";
  if (score >= 50) return "You're in the 50–69 range";
  return "You're in the 0–49 range";
}

function getVisualPercentage(score: number): number {
  if (score < 50) {
    return (score / 50) * 25;
  } else if (score < 70) {
    return 25 + ((score - 50) / 20) * 25;
  } else if (score < 90) {
    return 50 + ((score - 70) / 20) * 25;
  } else {
    return 75 + ((score - 90) / 10) * 25;
  }
}

export function MobileHome() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const setResult = useAnalysisStore((s) => s.setResult);

  const firstName =
    profile?.username?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => (user ? fetchAnalysesFromDB(user) : []),
    enabled: !!user,
  });

  const latestScore =
    analyses.length > 0 ? analyses[0].analysis_result.score : null;

  const bestScore = analyses.length > 0
    ? Math.max(...analyses.map((a) => a.analysis_result.score))
    : null;

  const quickActions = [
    {
      label: "Analyze Resume",
      icon: ScanSearch,
      to: "/upload",
      color: "bg-blue-500/15 text-blue-400",
    },
    {
      label: "Saved Reports",
      icon: Bookmark,
      to: "/dashboard/saved",
      color: "bg-amber-500/15 text-amber-400",
    },
    {
      label: "History",
      icon: History,
      to: "/dashboard/history",
      color: "bg-purple-500/15 text-purple-400",
    },
    {
      label: "Mock Interview",
      icon: MessageSquare,
      to: "/dashboard/interviews",
      color: "bg-green-500/15 text-green-400",
    },
  ];

  return (
    <div className="px-4 pt-12 lg:hidden">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* 👋 Emoji Card */}
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-warning/25 bg-card shadow-sm shadow-warning/5 dark:border-warning/35 dark:shadow-[0_0_12px_rgba(245,158,11,0.12)]">
            <Lottie
              animationData={profileAvatarAnimation}
              loop={true}
              autoplay={true}
              rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
              className="h-[46px] w-[46px]"
            />
          </div>
          {/* Text block */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-[20px] font-bold leading-tight text-foreground">
              Hi, {firstName}
            </h1>
            <p className="text-[13px] font-medium text-muted-foreground mt-0.5">
              Welcome back
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ActivityCenter />
        </div>
      </div>

      {/* ATS Score Card */}
      <div className="mb-5 rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
          ATS SCORE
        </p>
        
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : latestScore !== null ? (
          <div className="flex items-center gap-6 mt-1">
            {/* Left: Score display */}
            <div className="flex flex-col items-center justify-center pl-2 shrink-0">
              {(() => {
                const cat = getCategoryProps(latestScore);
                return (
                  <>
                    <span className={`text-[46px] font-bold leading-none tracking-tight ${cat.colorClass}`}>
                      {latestScore}
                    </span>
                    <span className="text-[13px] font-medium text-slate-400 mt-2.5">
                      {cat.label}
                    </span>
                  </>
                );
              })()}
            </div>

            {/* Right: Milestone Tracker */}
            <div className="flex-1 min-w-0">
              {/* Labels grid: matches column spacing of milestones */}
              <div className="grid grid-cols-4 text-center text-xs mb-3">
                <div className="flex flex-col items-center">
                  <span className={latestScore < 50 ? "text-red-500 font-bold" : "text-muted-foreground/60"}>Poor</span>
                  <span className="text-[9px] text-muted-foreground/50 mt-0.5">0-49</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={(latestScore >= 50 && latestScore < 70) ? "text-amber-500 font-bold" : "text-muted-foreground/60"}>Average</span>
                  <span className="text-[9px] text-muted-foreground/50 mt-0.5">50-69</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={(latestScore >= 70 && latestScore < 90) ? "text-blue-500 font-bold" : "text-muted-foreground/60"}>Good</span>
                  <span className="text-[9px] text-muted-foreground/50 mt-0.5">70-89</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={latestScore >= 90 ? "text-blue-500 font-bold" : "text-muted-foreground/60"}>Excellent</span>
                  <span className="text-[9px] text-muted-foreground/50 mt-0.5">90-100</span>
                </div>
              </div>

              {/* Segmented Line track */}
              <div className="relative w-full h-1 my-3.5">
                <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-1 rounded-full bg-slate-800/80 overflow-hidden">
                  {/* Background color gradient mapping the zones */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-500 via-emerald-500 to-slate-700 opacity-60" />
                </div>

                {/* 4 dots at center of each segment */}
                <div className="absolute top-1/2 -translate-y-1/2 left-[12.5%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-red-500 border border-card" />
                <div className="absolute top-1/2 -translate-y-1/2 left-[37.5%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-500 border border-card" />
                <div className="absolute top-1/2 -translate-y-1/2 left-[62.5%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-emerald-500 border border-card" />
                <div className="absolute top-1/2 -translate-y-1/2 left-[87.5%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-slate-600 border border-card" />

                {/* Dynamic Glowing Indicator Dot using Blue Accent */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-500 border border-card shadow-[0_0_12px_rgba(59,130,246,0.9)] transition-all duration-700 ease-out"
                  style={{ left: `${getVisualPercentage(latestScore)}%` }}
                />
              </div>

              {/* Status Message Pill */}
              <div className="flex justify-center mt-5">
                <div className="inline-flex items-center justify-center rounded-full bg-card dark:bg-[#0F172A]/50 px-4 py-1.5 border border-border/60 dark:border-border/10 shadow-sm">
                  <span className="text-[11px] font-medium text-foreground dark:text-slate-300">
                    {getRangeText(latestScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground px-4">
              Analyze your first resume to unlock career insights.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all active:scale-95 shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Analyze Resume
            </Link>
          </div>
        )}
      </div>

      {/* Recent Scans */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Recent Scans</h2>
          <Link
            to="/dashboard/history"
            className="text-xs font-medium text-primary"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-semibold text-muted-foreground">
              No resumes analyzed yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload your resume and get instant ATS feedback.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all active:scale-95"
            >
              <Upload className="h-4 w-4" />
              Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {analyses.slice(0, 3).map((analysis) => {
              const score = analysis.analysis_result.score;
              const scoreColor =
                score >= 80
                  ? "text-green-500 bg-green-500/10"
                  : score >= 60
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-red-500 bg-red-500/10";

              return (
                <button
                  key={analysis.id}
                  onClick={() => {
                    setResult(
                      analysis.analysis_result,
                      analysis.role,
                      analysis.file_name,
                      analysis.resume_text || "",
                      analysis.job_description ?? undefined,
                      {
                        animateEntry: false,
                        analysisId: analysis.id,
                        isSaved: analysis.is_saved,
                        interviewQuestions:
                          analysis.interview_questions || undefined,
                      }
                    );
                    navigate({ to: "/result" });
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {analysis.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(analysis.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor}`}
                  >
                    {score}%
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="mb-3 font-display text-base font-bold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3.5 transition-all active:scale-[0.97]"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${action.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysisStore } from "@/store/analysisStore";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActivityCenter } from "./ActivityCenter";
import { MobileScoreRing } from "./MobileScoreRing";
import {
  FileText,
  ChevronRight,
  Upload,
  Bookmark,
  History,
  MessageSquare,
  Loader2,
  TrendingUp,
  ScanSearch,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

  const chartData = analyses
    .slice(0, 7)
    .reverse()
    .map((a, i) => ({ i, score: a.analysis_result.score }));

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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Hi, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Welcome back</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ActivityCenter />
        </div>
      </div>

      {/* ATS Score Card */}
      <div className="mb-5 rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ATS Score
        </p>
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : latestScore !== null ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <MobileScoreRing score={latestScore} size={96} />
            </div>
            <div className="flex-1">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <defs>
                      <linearGradient id="mobileScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ display: "none" }}
                      cursor={{ stroke: "rgba(148,163,184,0.2)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#mobileScore)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>More scans needed for trend</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <p className="font-display text-lg font-semibold text-muted-foreground">
              No analysis yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload your resume to get your ATS score
            </p>
            <Link
              to="/upload"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all active:scale-95"
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

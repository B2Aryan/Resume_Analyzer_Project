import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysisStore } from "@/store/analysisStore";
import { fetchAnalysesFromDB, fetchSavedReportsFromDB } from "@/lib/supabase/analysis-db";
import { fetchMockInterviewResults } from "@/lib/supabase/mock-interview-db";
import {
  Trophy,
  TrendingUp,
  FileText,
  Bookmark,
  MessageSquare,
  BarChart2,
  Loader2,
  ChevronRight,
  Upload,
  Lock,
  Unlock,
  CheckCircle,
  Briefcase,
  Layers,
  FileSpreadsheet,
  Linkedin,
  Star,
  Zap
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function MobileInsights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const setResult = useAnalysisStore((s) => s.setResult);

  // Queries
  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => (user ? fetchAnalysesFromDB(user) : []),
    enabled: !!user,
  });

  const { data: savedReports = [], isLoading: savedLoading } = useQuery({
    queryKey: ["saved-reports", user?.id],
    queryFn: () => (user ? fetchSavedReportsFromDB(user) : []),
    enabled: !!user,
  });

  const { data: mockInterviews = [], isLoading: mockLoading } = useQuery({
    queryKey: ["mock-interviews", user?.id],
    queryFn: () => (user ? fetchMockInterviewResults(user) : []),
    enabled: !!user,
  });

  const isLoading = analysesLoading || savedLoading || mockLoading;

  // Stats
  const highestATS =
    analyses.length > 0
      ? Math.max(...analyses.map((a) => a.analysis_result.score))
      : null;
  const averageATS =
    analyses.length > 0
      ? Math.round(
          analyses.reduce((s, a) => s + a.analysis_result.score, 0) /
            analyses.length
        )
      : null;

  // Chart data — last 7 scans oldest→newest
  const chartData = analyses
    .slice(0, 7)
    .reverse()
    .map((a, i) => ({
      i,
      score: a.analysis_result.score,
      label: a.file_name.replace(/\.pdf$/i, "").slice(0, 8),
    }));

  // Achievements evaluation
  const achievements = [
    {
      id: "first-analysis",
      title: "First Analysis",
      description: "Perform your very first resume analysis scan.",
      unlocked: analyses.length >= 1,
    },
    {
      id: "ats-80",
      title: "80+ ATS Score",
      description: "Reach an ATS compatibility score of 80% or higher.",
      unlocked: highestATS !== null && highestATS >= 80,
    },
    {
      id: "ten-analyses",
      title: "10 Analyses Completed",
      description: "Analyze 10 or more resumes to fine-tune alignment.",
      unlocked: analyses.length >= 10,
    },
    {
      id: "resume-optimizer",
      title: "Resume Optimizer",
      description: "Save a report to build your versions history.",
      unlocked: savedReports.length >= 1,
    },
  ];

  // Helper to open a result
  const handleOpenResult = (item: any, isSaved: boolean) => {
    setResult(
      item.analysis_result,
      item.role,
      item.file_name,
      item.resume_text || "",
      item.job_description ?? undefined,
      { animateEntry: false, analysisId: item.id, isSaved }
    );
    navigate({ to: "/result" });
  };

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-28 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your resume performance.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : analyses.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border/80 bg-card p-8 text-center shadow-sm">
          <BarChart2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
          <p className="font-display text-base font-bold text-foreground">
            No insights yet
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Analyze your resume to start tracking your progress and metrics.
          </p>
          <Link
            to="/upload"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-glow active:scale-95 transition-all"
          >
            <Upload className="h-4 w-4" />
            Analyze Resume
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Section 1 — Performance Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performance Overview</h3>
            
            {/* Grid Row 1 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border/40 bg-card p-4 text-center shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mx-auto">
                  <Trophy className="h-4 w-4" />
                </div>
                <p className="font-display text-lg font-bold leading-tight">
                  {highestATS !== null ? `${highestATS}%` : "—"}
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                  Highest ATS
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4 text-center shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mx-auto">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="font-display text-lg font-bold leading-tight">
                  {averageATS !== null ? `${averageATS}%` : "—"}
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                  Average ATS
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4 text-center shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mx-auto">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="font-display text-lg font-bold leading-tight">
                  {analyses.length}
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total Scans
                </p>
              </div>
            </div>

            {/* Grid Row 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-500 shrink-0">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-base font-bold leading-none">{savedReports.length}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saved Reports</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-base font-bold leading-none">{mockInterviews.length}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Interviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — ATS Performance Trend */}
          {chartData.length > 1 && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">ATS Score Trend</p>
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 2, right: 2, left: -28, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="insightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#94A3B8", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "11px",
                      }}
                      formatter={(v: number) => [`${v}%`, "ATS"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#insightGrad)"
                      dot={{ fill: "#3B82F6", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Section 3 — Saved Reports */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Saved Reports</h3>
              {savedReports.length > 0 && (
                <Link
                  to="/dashboard/saved"
                  className="text-xs font-bold text-primary active:scale-95 transition-all"
                >
                  View All
                </Link>
              )}
            </div>

            {savedReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-card px-4 py-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-foreground">📄 No saved reports yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Save your favorite analyses to access them later.</p>
                <Link
                  to="/upload"
                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary active:scale-95 transition-all"
                >
                  Analyze Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports.slice(0, 3).map((r) => {
                  const score = r.analysis_result.score;
                  const scoreColor =
                    score >= 80
                      ? "text-green-500 bg-green-500/10 border-green-500/20"
                      : score >= 60
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      : "text-red-500 bg-red-500/10 border-red-500/20";
                  
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleOpenResult(r, true)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm cursor-pointer active:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground leading-none">
                            {r.file_name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground truncate">{r.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`shrink-0 rounded-xl border px-2.5 py-1 text-xs font-bold ${scoreColor}`}>
                          {score}%
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4 — Resume History Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">Resume History</h3>
            <div className="space-y-3 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
              {analyses.slice(0, 5).map((a) => {
                const score = a.analysis_result.score;
                const status = score >= 80 ? "Optimized" : score >= 60 ? "Improvement Needed" : "Formatting Gaps";
                const badgeColor = 
                  score >= 80 
                    ? "bg-green-500/10 text-green-500" 
                    : score >= 60 
                    ? "bg-amber-500/10 text-amber-500" 
                    : "bg-red-500/10 text-red-500";

                return (
                  <div key={a.id} className="relative pl-10">
                    {/* Node Dot */}
                    <div className={cn(
                      "absolute left-3.5 top-5.5 h-3 w-3 rounded-full border-2 bg-background z-10 shadow-sm",
                      score >= 80 ? "border-green-500" : score >= 60 ? "border-amber-500" : "border-red-500"
                    )} />

                    <div 
                      onClick={() => handleOpenResult(a, false)}
                      className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm cursor-pointer active:bg-muted/10 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full", badgeColor)}>
                            {score}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-semibold text-foreground truncate leading-tight">{a.file_name}</h4>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-none">{status}</p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5 — Mock Interview Spotlight */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Practice Center</h3>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-5 shadow-sm relative overflow-hidden">
              {/* Decorative Accent */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-500">
                  Coming Soon
                </span>
              </div>

              <h4 className="mt-3.5 font-display text-base font-bold text-foreground">Mock Interview Practice</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Generate real-time interview simulator questions dynamically tailored to your resume achievements.
              </p>

              <button
                disabled
                className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary/60 cursor-not-allowed"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Section 6 — Career Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Career Analytics Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Cover Letter Generator", icon: FileText, to: "/ai-cover-letter-generator", soon: false },
                { title: "Resume Templates", icon: Layers, to: "/fresher-resume-template", soon: false },
                { title: "Resume Comparison", icon: Briefcase, to: "/coming-soon", query: "?feature=comparison", soon: true },
                { title: "Resume Converter", icon: Zap, to: "/coming-soon", query: "?feature=converter", soon: true },
                { title: "Job Tracker", icon: FileSpreadsheet, to: "/coming-soon", query: "?feature=tracker", soon: true },
                { title: "LinkedIn Optimizer", icon: Linkedin, to: "/coming-soon", query: "?feature=linkedin", soon: true },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.title}
                    to={tool.to as any}
                    search={tool.query ? { feature: tool.query.split("=")[1] } : undefined}
                    className="rounded-2xl border border-border/40 bg-card p-4 flex flex-col justify-between shadow-sm active:scale-[0.98] transition-all min-h-[110px]"
                  >
                    <div className="flex items-start justify-between gap-1.5 w-full">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      {tool.soon && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground leading-tight mt-3">
                      {tool.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 7 — Achievements */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Milestones & Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl border bg-card p-4 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-300 min-h-[120px]",
                    item.unlocked 
                      ? "border-green-500/20 bg-green-500/[0.02]" 
                      : "border-border/30 opacity-60"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full mb-2",
                    item.unlocked ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                  )}>
                    {item.unlocked ? <Unlock className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-tight">{item.title}</h4>
                    <p className="mt-1 text-[9px] text-muted-foreground leading-normal max-w-[120px] mx-auto">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

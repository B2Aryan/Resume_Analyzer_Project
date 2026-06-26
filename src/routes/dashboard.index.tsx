import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { TrendingUp, FileText, Plus, Bookmark, Trophy, Clock, Loader2, ArrowUpRight, ArrowDownRight, Minus, Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { fetchUserProfile, FREE_TIER_LIMITS } from "@/lib/supabase/usage";
import { formatDistanceToNow } from "date-fns";
import { useAnalysisStore } from "@/store/analysisStore";
import { hasPremiumAccess } from "@/lib/access";
import { MobileHome } from "@/components/mobile/MobileHome";
import { MobileShell } from "@/components/mobile/MobileShell";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ResumePilot" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const setResult = useAnalysisStore((state) => state.setResult);

  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => (user ? fetchAnalysesFromDB(user) : []),
    enabled: !!user,
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchUserProfile(user) : null),
    enabled: !!user,
  });

  // Calculate stats
  const totalAnalyses = analyses.length;
  const bestScore =
    analyses.length > 0
      ? Math.max(...analyses.map((a) => a.analysis_result.score))
      : null;
  const averageScore =
    analyses.length > 0
      ? Math.round(
          analyses.reduce((sum, a) => sum + a.analysis_result.score, 0) /
            analyses.length
        )
      : null;
  const savedCount = analyses.filter((a) => a.is_saved).length;
  
  // Last 5 analyses for chart and latest/prev
  const last5Analyses = analyses.slice(0, 5).reverse(); // oldest to newest for chart
  const latestScore = analyses.length > 0 ? analyses[0].analysis_result.score : null;
  const previousScore = analyses.length > 1 ? analyses[1].analysis_result.score : null;
  const scoreChange = previousScore !== null && latestScore !== null ? latestScore - previousScore : null;

  // Prepare chart data
  const chartData = last5Analyses.map((a, index) => ({
    name: `#${last5Analyses.length - index}`, // reverse to show #1 as latest on right
    score: a.analysis_result.score,
  })).reverse();

  // Get user's name for welcome
  const userName =
    profile?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const getScoreChangeIcon = () => {
    if (scoreChange === null) return null;
    if (scoreChange > 0)
      return <ArrowUpRight className="h-4 w-4 text-success" />;
    if (scoreChange < 0)
      return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreChangeColor = () => {
    if (scoreChange === null) return "text-muted-foreground";
    if (scoreChange > 0) return "text-success";
    if (scoreChange < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <>
      <div className="hidden lg:block">
        <AppShell
      title={`Welcome back, ${userName}`}
      subtitle="Here's how your resumes are performing."
      actions={
        <Button asChild variant="hero">
          <Link to="/upload">
            <Plus className="h-4 w-4" /> New Analysis
          </Link>
        </Button>
      }
    >
      {/* Stats grid — 2-col on mobile, 2-col on sm, 5-col on lg */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        {/* Total Analyses */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:h-11 sm:w-11">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total analyses</p>
              <p className="font-display text-xl font-bold sm:text-2xl">
                {analysesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  totalAnalyses
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best ATS Score */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-success sm:h-11 sm:w-11">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Best ATS score</p>
              <p className="font-display text-xl font-bold sm:text-2xl">
                {analysesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : bestScore !== null ? (
                  `${bestScore}%`
                ) : (
                  "—"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average ATS Score */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:h-11 sm:w-11">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Average ATS score</p>
              <p className="font-display text-xl font-bold sm:text-2xl">
                {analysesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : averageScore !== null ? (
                  `${averageScore}%`
                ) : (
                  "—"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saved Reports Count */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-warning sm:h-11 sm:w-11">
              <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Saved reports</p>
              <p className="font-display text-xl font-bold sm:text-2xl">
                {analysesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  savedCount
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Limit — spans 2 cols on mobile so it sits centred in the last row */}
        <Card className="col-span-2 border-border/60 lg:col-span-1">
          <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:h-11 sm:w-11">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {hasPremiumAccess(userProfile) ? "Premium Plan" : "Analyses left"}
              </p>
              <p className="font-display text-xl font-bold sm:text-2xl">
                {profileLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : hasPremiumAccess(userProfile) ? (
                  "∞"
                ) : (
                  `${FREE_TIER_LIMITS.analyses - (userProfile?.analyses_used || 0)}`
                )}
              </p>
              {!hasPremiumAccess(userProfile) && (
                <div className="mt-2 h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all"
                    style={{
                      width: `${Math.min(100, ((userProfile?.analyses_used || 0) / FREE_TIER_LIMITS.analyses) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold sm:text-lg">Recent scans</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/history">View all</Link>
              </Button>
            </div>
            <div className="mt-3 sm:mt-4">
              {analysesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-10 sm:py-16">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary mb-3 sm:h-16 sm:w-16 sm:mb-4">
                    <FileText className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-base font-semibold font-display mb-1 sm:text-lg sm:mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto sm:mb-6">
                    Upload your first resume to get your ATS compatibility score and
                    personalized feedback.
                  </p>
                  <Button asChild variant="hero">
                    <Link to="/upload">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {analyses.slice(0, 5).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/30 rounded-lg px-2 cursor-pointer sm:grid sm:grid-cols-[1fr,auto,auto,auto] sm:gap-4 sm:py-4"
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
                            interviewQuestions: analysis.interview_questions || undefined 
                          }
                        );
                        navigate({ to: "/result" });
                      }}
                    >
                      {/* Icon + text — grows to fill available space */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:h-10 sm:w-10">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {analysis.file_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {analysis.role}
                          </p>
                          {analysis.interview_questions && (
                            <span className="mt-0.5 inline-block text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              🎤 Interview Ready
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Timestamp — hidden on mobile */}
                      <span className="hidden text-xs text-muted-foreground sm:inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(analysis.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {/* Score — always visible, pushed to right on mobile */}
                      <div className="shrink-0 text-right">
                        <p className="font-display text-lg font-bold sm:text-xl">
                          {analysis.analysis_result.score}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          ATS
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-card">
          <CardContent className="p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Score trend</h2>
            <p className="text-xs text-muted-foreground">Last 5 scans</p>
            {analysesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No data yet</p>
              </div>
            ) : (
              <>
                <div className="mt-6 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={chartData} 
                      margin={{ 
                        top: 10, 
                        right: 20, 
                        left: 20, 
                        bottom: 20 
                      }}
                    >
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148, 163, 184, 0.15)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        padding={{ left: 20, right: 20 }}
                        tick={{ fill: "#94A3B8", fontSize: 14 }}
                        axisLine={false}
                        tickLine={false}
                        allowDataOverflow={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748B", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        hide
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        itemStyle={{
                          color: "#60A5FA",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        labelStyle={{
                          color: "#94A3B8",
                          fontSize: "14px",
                        }}
                        formatter={(value: number) => [`${value}%`, "ATS Score"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fill="url(#colorScore)"
                        dot={{ fill: "#60A5FA", r: 5 }}
                        activeDot={{ r: 7, fill: "#93C5FD" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Summary Metrics */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Latest score</p>
                    <p className="font-display text-lg font-bold">
                      {latestScore}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Best score</p>
                    <p className="font-display text-lg font-bold">
                      {bestScore}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Average score</p>
                    <p className="font-display text-lg font-bold">
                      {averageScore}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Score change</p>
                    <p className="flex items-center gap-1 font-display text-lg font-bold">
                      {getScoreChangeIcon()}
                      <span className={getScoreChangeColor()}>
                        {scoreChange === null
                          ? "—"
                          : scoreChange > 0
                          ? `+${scoreChange}`
                          : scoreChange}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
      </div>
      <div className="block lg:hidden">
        <MobileShell>
          <MobileHome />
        </MobileShell>
      </div>
    </>
  );
}

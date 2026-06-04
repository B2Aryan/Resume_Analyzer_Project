import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { TrendingUp, FileText, Plus, Bookmark, Trophy, Clock, Loader2, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { formatDistanceToNow } from "date-fns";
import { useAnalysisStore } from "@/store/analysisStore";
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
  head: () => ({ meta: [{ title: "Dashboard — ResumePilot" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const setResult = useAnalysisStore((state) => state.setResult);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => (user ? fetchAnalysesFromDB(user) : []),
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
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Analyses */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total analyses</p>
              <p className="font-display text-2xl font-bold">
                {isLoading ? (
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
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-success">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best ATS score</p>
              <p className="font-display text-2xl font-bold">
                {isLoading ? (
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
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average ATS score</p>
              <p className="font-display text-2xl font-bold">
                {isLoading ? (
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
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-warning">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saved reports</p>
              <p className="font-display text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  savedCount
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent scans</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/history">View all</Link>
              </Button>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold font-display mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
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
                      className="grid items-center gap-4 py-4 transition-colors hover:bg-muted/30 rounded-lg px-2 sm:grid-cols-[1fr,auto,auto,auto] cursor-pointer"
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
                            isSaved: analysis.is_saved 
                          }
                        );
                        navigate({ to: "/result" });
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {analysis.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {analysis.role}
                          </p>
                        </div>
                      </div>
                      <span className="hidden text-xs text-muted-foreground sm:inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(analysis.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold">
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
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Score trend</h2>
            <p className="text-xs text-muted-foreground">Last 5 scans</p>
            {isLoading ? (
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
  );
}

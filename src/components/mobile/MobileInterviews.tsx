/**
 * MobileInterviews — mobile/tablet (<1024px) redesign of the Mock Interviews page.
 * Presentation-only. All business logic delegated via props from dashboard.interviews.tsx.
 */
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Search,
  History,
  FileText,
  Loader2,
  Trash2,
  Eye,
  Play,
  Award,
  Calendar,
  Clock,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Brain,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MobileShell } from "./MobileShell";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface DBMockInterview {
  id: string;
  user_id: string;
  created_at: string;
  role: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  completeness_score: number;
  responses: Array<{
    questionId: string;
    question: string;
    category: string;
    answer: string;
    feedback?: unknown;
  }>;
}

interface MobileInterviewsProps {
  interviews: DBMockInterview[];
  isLoading: boolean;
  onViewReport: (interviewId: string) => void;
  onDeleteRequest: (interviewId: string) => void;
  onStartNewInterview: (roleName: string) => Promise<void>;
  isGeneratingQuestions: boolean;
  // Unfinished interview state
  unfinishedInterview: {
    role: string;
    date: string;
    questionsCount: number;
    answersCount: number;
  } | null;
  onContinueUnfinished: () => void;
  onDeleteUnfinished: () => void;
}

/* ─── Score Badge ────────────────────────────────────────────────────────── */

function ScoreBadge({ score }: { score: number }) {
  const config =
    score >= 80
      ? { bg: "bg-green-500/15", text: "text-green-500", ring: "ring-green-500/30" }
      : score >= 60
      ? { bg: "bg-amber-500/15", text: "text-amber-500", ring: "ring-amber-500/30" }
      : { bg: "bg-red-500/15", text: "text-red-500", ring: "ring-red-500/30" };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${config.bg} ${config.text} ${config.ring}`}
    >
      {score}%
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function MobileInterviews({
  interviews,
  isLoading,
  onViewReport,
  onDeleteRequest,
  onStartNewInterview,
  isGeneratingQuestions,
  unfinishedInterview,
  onContinueUnfinished,
  onDeleteUnfinished,
}: MobileInterviewsProps) {
  const [targetRole, setTargetRole] = useState("");
  const [search, setSearch] = useState("");
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});

  // Pre-fill target role from input chips
  const roleChips = [
    "Frontend",
    "Backend",
    "Full Stack",
    "React",
    "Java",
    "Python",
    "Data Analyst",
    "DevOps",
  ];

  // Filter interviews by search
  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) =>
      i.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [interviews, search]);

  // Derive Statistics
  const stats = useMemo(() => {
    if (interviews.length === 0) {
      return { averageScore: 0, completedCount: 0, bestScore: 0, totalTime: 0 };
    }
    const scores = interviews.map((i) => i.overall_score);
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / interviews.length
    );
    const bestScore = Math.max(...scores);
    const totalResponses = interviews.reduce(
      (sum, i) => sum + (i.responses?.length || 0),
      0
    );
    const totalTime = Math.round(totalResponses * 2.5); // estimate 2.5 mins per question

    return {
      averageScore,
      completedCount: interviews.length,
      bestScore,
      totalTime,
    };
  }, [interviews]);

  // AI Interview Tips data
  const tips = [
    {
      id: "tip-star",
      title: "Structure answers using STAR",
      detail: "When answering behavioral questions, describe the Situation, Task, Action, and Result to paint a clear picture of your past impact.",
    },
    {
      id: "tip-concise",
      title: "Stay concise & focused",
      detail: "Aim for answers around 2-3 minutes. Explain your core approach and key technical trade-offs without going off on long tangents.",
    },
    {
      id: "tip-aloud",
      title: "Practice explaining aloud",
      detail: "Speak your thoughts while solving system design or technical trade-offs. Interviewers assess your communication and debugging process.",
    },
    {
      id: "tip-company",
      title: "Research company values",
      detail: "Tailor your behavioral stories to align with the core engineering values and product goals of the company you are applying to.",
    },
  ];

  const handleStartClick = () => {
    if (!targetRole.trim()) {
      toast.error("Please enter or select a target role first.");
      return;
    }
    onStartNewInterview(targetRole.trim());
  };

  return (
    <MobileShell>
      <div className="bg-background text-foreground min-h-screen pb-16">
        {/* Header Section */}
        <header className="px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 border-b border-border/40 bg-card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl font-bold text-foreground font-display">Mock Interviews</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Practice real interviews powered by AI.</p>
            </div>
            <Link
              to="/dashboard/history"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            >
              <History className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <div className="px-4 py-4 space-y-6">
          {/* Section 1: Primary CTA Card */}
          <section>
            <div
              className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-5 shadow-sm"
              style={{
                boxShadow: "0 4px 20px rgba(59,130,246,0.06)",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-1.5">
                    Start AI Mock Interview
                    <Sparkles className="h-4 w-4 text-blue-500 fill-blue-500 animate-pulse" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Practice with realistic AI interview questions tailored to your target role.
                  </p>
                </div>
              </div>

              {/* Target Role Input */}
              <div className="mt-5 space-y-3">
                <Input
                  placeholder="e.g. Full Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-card/75 border-border/80 text-sm h-11 rounded-xl"
                  disabled={isGeneratingQuestions}
                />

                <button
                  onClick={handleStartClick}
                  disabled={isGeneratingQuestions}
                  className="w-full inline-flex items-center justify-center gap-2 font-bold bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all h-11 rounded-xl text-xs disabled:opacity-55"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Coach Questions...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Start Interview
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Quick Role Selection */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
              Quick Role Selection
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {roleChips.map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                    targetRole === role
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/50 bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </section>

          {/* Section: In Progress Interview (if exists) */}
          {unfinishedInterview && (
            <section className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-500 px-0.5">
                Active In-Progress Practice
              </h4>
              <div
                className="relative rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm overflow-hidden"
                style={{
                  boxShadow: "0 2px 12px rgba(245,158,11,0.03)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[10px] font-bold uppercase text-amber-500">Practice In Progress</span>
                    </div>
                    <h4 className="mt-1 font-display text-[15px] font-bold text-foreground">
                      {unfinishedInterview.role}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                      Started {unfinishedInterview.date}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Question {unfinishedInterview.answersCount + 1} of {unfinishedInterview.questionsCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={onContinueUnfinished}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    Continue
                  </button>
                  <button
                    onClick={onDeleteUnfinished}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all"
                    aria-label="Delete in-progress interview"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Interview Performance Stats */}
          <section className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
              Performance Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Average Score
                </span>
                <p className="mt-1 font-display text-2xl font-bold text-primary">
                  {stats.averageScore ? `${stats.averageScore}%` : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Best Score
                </span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {stats.bestScore ? `${stats.bestScore}%` : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Total Completed
                </span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {stats.completedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Practice Time
                </span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {stats.totalTime ? `${stats.totalTime}m` : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Recent Interviews */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Recent Practice Runs
              </h4>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/60 text-xs h-10 rounded-xl"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mx-auto mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="font-display text-sm font-bold text-foreground">
                  {search ? "No matching practice sessions" : "No mock interviews yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto leading-relaxed">
                  {search
                    ? "Try a different search term"
                    : "Tailor interview questions to a role and practice anytime."}
                </p>
                {!search && (
                  <button
                    onClick={() => {
                      setTargetRole("Frontend Developer");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="mt-4 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/30 active:scale-95 transition-all"
                  >
                    Start First Interview
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInterviews.map((interview) => {
                  const dateLabel = formatDistanceToNow(new Date(interview.created_at), {
                    addSuffix: true,
                  });
                  const durationVal = interview.responses?.length
                    ? `${interview.responses.length * 2} mins`
                    : "10 mins";

                  // Derive difficulty based on score
                  const diffLevel =
                    interview.overall_score >= 80
                      ? "Hard"
                      : interview.overall_score >= 60
                      ? "Medium"
                      : "Easy";

                  const diffColor =
                    diffLevel === "Hard"
                      ? "text-red-500 bg-red-500/10"
                      : diffLevel === "Medium"
                      ? "text-amber-500 bg-amber-500/10"
                      : "text-green-500 bg-green-500/10";

                  return (
                    <div
                      key={interview.id}
                      className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-display text-sm font-bold text-foreground truncate">
                            {interview.role}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-2.5 text-[10px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="h-3 w-3" />
                              {dateLabel}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3" />
                              {durationVal}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${diffColor}`}>
                              {diffLevel}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground leading-none">
                            Score
                          </span>
                          <ScoreBadge score={interview.overall_score} />
                        </div>
                      </div>

                      {/* Info Row: Resume and Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 rounded-xl p-2 px-3 text-[10px] text-muted-foreground/80">
                        <span className="truncate max-w-[200px]">
                          📄 Tailored Resume
                        </span>
                        <span className="font-semibold text-green-500 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Completed
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => onViewReport(interview.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-bold text-foreground active:scale-95 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Report
                        </button>
                        <button
                          onClick={() => onDeleteRequest(interview.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-red-500 hover:border-red-500/20 active:scale-90 transition-all"
                          aria-label="Delete interview"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 5: AI Interview Tips */}
          <section className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
              AI Interview Coaching Tips
            </h4>

            <div className="space-y-2.5">
              {tips.map((tip) => {
                const isExpanded = !!expandedTips[tip.id];
                return (
                  <div
                    key={tip.id}
                    className="rounded-2xl border border-border/40 bg-card overflow-hidden"
                  >
                    <div
                      onClick={() =>
                        setExpandedTips((prev) => ({ ...prev, [tip.id]: !isExpanded }))
                      }
                      className="p-4 flex items-center justify-between cursor-pointer active:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                          <Info className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {tip.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground p-0.5">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/30 bg-muted/10 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                        {tip.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </MobileShell>
  );
}

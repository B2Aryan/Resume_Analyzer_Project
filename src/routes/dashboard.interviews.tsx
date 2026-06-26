import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { MessageSquare, Search, FileX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMockInterviewResults, deleteMockInterviewFromDB } from "@/lib/supabase/mock-interview-db";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo, useRef } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { useMockInterviewStore } from "@/store/mockInterviewStore";
import { generateInterviewQuestions } from "@/lib/ats/interview-questions";
import { MobileInterviews } from "@/components/mobile/MobileInterviews";
import { toast } from "sonner";
import { canStartMockInterviewAccess } from "@/lib/access";
import { UpgradeModal } from "@/components/UpgradeModal";

export const Route = createFileRoute("/dashboard/interviews")({
  head: () => ({ meta: [{ title: "Mock Interviews — ResumePilot" }] }),
  component: InterviewsPage,
});

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function InterviewsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Restore analysis store from localStorage if needed (for starting new tailors)
  const { hasResult, restoreFromStorage } = useAnalysisStore();
  const restoredRef = useRef(false);

  if (!hasResult && !restoredRef.current) {
    restoredRef.current = true;
    restoreFromStorage();
  }

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["mockInterviews", user?.id],
    queryFn: () => user ? fetchMockInterviewResults(user) : [],
    enabled: !!user,
  });

  // Unfinished interview state from store
  const unfinishedQuestions = useMockInterviewStore((s) => s.questions);
  const unfinishedIsComplete = useMockInterviewStore((s) => s.isComplete);
  const unfinishedResponses = useMockInterviewStore((s) => s.responses);

  const unfinishedInterview = useMemo(() => {
    if (unfinishedQuestions.length > 0 && !unfinishedIsComplete) {
      return {
        role: useAnalysisStore.getState().interviewQuestions?.role || "Tailored Practice",
        date: "Just now",
        questionsCount: unfinishedQuestions.length,
        answersCount: unfinishedResponses.length,
      };
    }
    return null;
  }, [unfinishedQuestions, unfinishedIsComplete, unfinishedResponses]);

  // Handlers
  const handleViewReport = (interviewId: string) => {
    console.log("[dashboard.interviews] Navigating to interview with ID:", interviewId);
    navigate({ to: "/interview-report/$id", params: { id: interviewId } });
  };

  const handleDeleteRequest = async (interviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this mock interview? This action cannot be undone.")) return;
    try {
      const success = await deleteMockInterviewFromDB(interviewId);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["mockInterviews", user?.id] });
        toast.success("Mock interview deleted successfully.");
      } else {
        toast.error("Failed to delete mock interview.");
      }
    } catch {
      toast.error("Failed to delete mock interview.");
    }
  };

  const handleStartNewInterview = async (roleName: string) => {
    if (!canStartMockInterviewAccess(profile)) {
      setUpgradeModalOpen(true);
      return;
    }
    const resumeText = useAnalysisStore.getState().resumeText;
    if (!resumeText?.trim()) {
      toast.error("Please upload a resume first to practice tailored interviews.");
      navigate({ to: "/upload" });
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const result = await generateInterviewQuestions({
        resumeText,
        targetRole: roleName,
      });

      if (result.success && result.data) {
        // Save the generated questions to Zustand store
        useAnalysisStore.getState().setInterviewQuestions(result.data);
        // Reset current interview progress
        useMockInterviewStore.getState().resetInterview();
        // Navigate to mock interview page
        navigate({ to: "/mock-interview" });
        toast.success("AI Coach interview questions generated!");
      } else {
        toast.error(result.error || "Failed to generate interview questions. Please try again.");
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleContinueUnfinished = () => {
    navigate({ to: "/mock-interview" });
  };

  const handleDeleteUnfinished = () => {
    if (window.confirm("Are you sure you want to discard your current in-progress practice?")) {
      useMockInterviewStore.getState().resetInterview();
      toast.success("Active practice reset.");
    }
  };

  // Filter interviews by search for Desktop view
  const filteredInterviews = interviews.filter(
    (i) => i.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ── Mobile & Tablet (<1024px) Redesign ── */}
      <div className="block lg:hidden">
        <MobileInterviews
          interviews={interviews}
          isLoading={isLoading}
          onViewReport={handleViewReport}
          onDeleteRequest={handleDeleteRequest}
          onStartNewInterview={handleStartNewInterview}
          isGeneratingQuestions={isGeneratingQuestions}
          unfinishedInterview={unfinishedInterview}
          onContinueUnfinished={handleContinueUnfinished}
          onDeleteUnfinished={handleDeleteUnfinished}
        />
      </div>

      {/* ── Desktop (>=1024px) - 100% Unchanged ── */}
      <div className="hidden lg:block">
        <AppShell title="Mock interviews" subtitle="Every mock interview you've done, in one place.">
          <div className="mb-5 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search by role" 
                className="pl-9" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredInterviews.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileX className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-semibold">{search ? "No matching interviews" : "No mock interviews yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search ? "Try a different search term" : "Complete your first mock interview to see it here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredInterviews.map((interview) => (
                    <Card key={interview.id} className="border-border/60 transition-shadow hover:shadow-soft">
                      <CardContent className="grid items-center gap-3 p-4 sm:grid-cols-[auto,1fr,auto,auto,auto]">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{interview.role}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true })}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(interview.overall_score)}`}>
                          {interview.overall_score}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            console.log("[dashboard.interviews] Navigating to interview with ID:", interview.id);
                            navigate({ to: "/interview-report/$id", params: { id: interview.id } });
                          }}
                        >
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          )}
        </AppShell>
      </div>
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} feature="mock interviews" />
    </>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, FileText, FileX, Loader2, BookmarkCheck, Trash2, Link2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSavedReportsFromDB, toggleSaveAnalysis, deleteAnalysisFromDB } from "@/lib/supabase/analysis-db";
import { formatDistanceToNow } from "date-fns";
import { useAnalysisStore } from "@/store/analysisStore";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({ meta: [{ title: "Saved Reports — ResumePilot" }] }),
  component: SavedReportsPage,
});

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function SavedReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setResult = useAnalysisStore((state) => state.setResult);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: savedReports = [], isLoading } = useQuery({
    queryKey: ["saved-reports", user?.id],
    queryFn: () => user ? fetchSavedReportsFromDB(user) : [],
    enabled: !!user,
  });

  const handleUnsave = async (analysisId: string) => {
    try {
      await toggleSaveAnalysis(analysisId, false);
      queryClient.invalidateQueries({ queryKey: ["saved-reports", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["analyses", user?.id] });
      toast.success("Removed from saved reports");
    } catch {
      toast.error("Failed to remove report");
    }
  };

  const handleDelete = async () => {
    if (!analysisToDelete || !user) return;
    
    setIsDeleting(true);
    
    // Optimistic update
    queryClient.setQueryData(["saved-reports", user?.id], (oldReports: any[]) => {
      return oldReports.filter(a => a.id !== analysisToDelete);
    });
    
    try {
      await deleteAnalysisFromDB(analysisToDelete);
      // Also invalidate analyses query
      queryClient.invalidateQueries({ queryKey: ["analyses", user?.id] });
      toast.success("Report deleted successfully.");
    } catch {
      // Revert optimistic update if fails
      queryClient.invalidateQueries({ queryKey: ["saved-reports", user?.id] });
      toast.error("Failed to delete report.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setAnalysisToDelete(null);
    }
  };

  const openDeleteConfirm = (analysisId: string) => {
    setAnalysisToDelete(analysisId);
    setDeleteConfirmOpen(true);
  };

  const handleShareReport = (analysis: any) => {
    navigator.clipboard.writeText(window.location.origin + "/result");
    toast.success("Report link copied");
  };

  const handleViewReport = (analysis: any) => {
    setResult(
      analysis.analysis_result,
      analysis.role,
      analysis.file_name,
      analysis.resume_text || "",
      analysis.job_description ?? undefined,
      { 
        animateEntry: false, 
        analysisId: analysis.id, 
        isSaved: true, 
        interviewQuestions: analysis.interview_questions || undefined 
      }
    );
    navigate({ to: "/result" });
  };

  return (
    <AppShell title="Saved reports" subtitle="Pinned analyses you want to revisit.">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : savedReports.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
              <Bookmark className="h-6 w-6" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold">No saved reports yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Bookmark important analyses to access them quickly here.</p>
            <Button asChild className="mt-6" variant="hero">
              <Link to="/upload">Run a new scan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {savedReports.map((analysis) => (
              <Card key={analysis.id} className="border-border/60 transition-all hover:shadow-soft">
                <div className="flex">
                  <div className="flex-1">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center gap-3 min-w-0 cursor-pointer group" onClick={() => handleViewReport(analysis)}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary shrink-0 transition-colors group-hover:bg-primary/10">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold transition-colors group-hover:text-primary">
                              {analysis.file_name}
                            </p>
                            {analysis.interview_questions && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                                🎤 Interview Ready
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{analysis.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(analysis.analysis_result.score)}`}>
                          ATS {analysis.analysis_result.score}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                  <div className="flex items-center border-l border-border/50 px-3">
                    <div className="flex flex-col items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleShareReport(analysis)}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewReport(analysis)}
                      >
                        View
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-muted-foreground"
                        onClick={() => handleUnsave(analysis.id)}
                      >
                        <BookmarkCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteConfirm(analysis.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this report?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

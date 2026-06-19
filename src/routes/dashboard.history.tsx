import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FileText, Search, FileX, Loader2, Trash2, Link2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysesFromDB, deleteAnalysisFromDB, togglePublicAnalysis } from "@/lib/supabase/analysis-db";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "History — ResumePilot" }] }),
  component: HistoryPage,
});

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setResult = useAnalysisStore((state) => state.setResult);
  const [search, setSearch] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => user ? fetchAnalysesFromDB(user) : [],
    enabled: !!user,
  });

  // Filter analyses by search
  const filteredAnalyses = analyses.filter(
    (a) => a.file_name.toLowerCase().includes(search.toLowerCase()) || 
           a.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!analysisToDelete || !user) return;
    
    setIsDeleting(true);
    
    // Optimistic update
    queryClient.setQueryData(["analyses", user?.id], (oldAnalyses: any[]) => {
      return oldAnalyses.filter(a => a.id !== analysisToDelete);
    });
    
    try {
      await deleteAnalysisFromDB(analysisToDelete);
      // Also invalidate saved reports in case this was a saved report
      queryClient.invalidateQueries({ queryKey: ["saved-reports", user?.id] });
      toast.success("Report deleted successfully.");
    } catch {
      // Revert optimistic update if fails
      queryClient.invalidateQueries({ queryKey: ["analyses", user?.id] });
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
        isSaved: analysis.is_saved, 
        isPublic: analysis.is_public,
        interviewQuestions: analysis.interview_questions || undefined 
      }
    );
    navigate({ to: "/result" });
  };

  const [shareLoadingId, setShareLoadingId] = useState<string | null>(null);
  
  const handleShareReport = async (analysis: any) => {
    console.log("handleShareReport (dashboard): Called for analysis:", analysis);
    if (!user) {
      toast.error("You need to be logged in to share this report");
      return;
    }

    setShareLoadingId(analysis.id);
    try {
      let currentAnalysis = analysis;
      // If the report is not public yet, make it public first
      if (!analysis.is_public) {
        console.log("handleShareReport (dashboard): Report is not public, making it public...");
        const updated = await togglePublicAnalysis(analysis.id, true);
        console.log("handleShareReport (dashboard): togglePublicAnalysis returned:", updated);
        if (!updated) {
          toast.error("Failed to make report public");
          return;
        }
        currentAnalysis = updated;
        queryClient.invalidateQueries({ queryKey: ["analyses", user.id] });
        queryClient.invalidateQueries({ queryKey: ["saved-reports", user.id] });
      }

      // Copy the share URL
      const shareUrl = window.location.origin + `/report/${currentAnalysis.id}`;
      console.log("handleShareReport (dashboard): Copying share URL:", shareUrl);
      await navigator.clipboard.writeText(shareUrl);
      
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      console.error("handleShareReport (dashboard): Caught error:", error);
      toast.error("Failed to share report");
    } finally {
      setShareLoadingId(null);
    }
  };

  return (
    <AppShell title="Analysis history" subtitle="Every scan you've run, in one place.">
      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by file or role" 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Button asChild variant="hero"><Link to="/upload">New scan</Link></Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileX className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">{search ? "No matching analyses" : "No scans yet"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Run your first analysis to see it here."}
            </p>
            <Button asChild className="mt-5" variant="hero"><Link to="/upload">Upload Resume</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredAnalyses.map((analysis) => (
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
                      disabled={shareLoadingId === analysis.id}
                    >
                      {shareLoadingId === analysis.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
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

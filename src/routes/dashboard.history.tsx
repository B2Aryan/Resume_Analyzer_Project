import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FileText, Search, FileX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAnalysisStore } from "@/store/analysisStore";

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
  const setResult = useAnalysisStore((state) => state.setResult);
  const [search, setSearch] = useState("");

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
                <Card key={analysis.id} className="border-border/60 transition-shadow hover:shadow-soft">
                  <CardContent className="grid items-center gap-3 p-4 sm:grid-cols-[auto,1fr,auto,auto,auto]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{analysis.file_name}</p>
                        {analysis.interview_questions && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            🎤 Interview Ready
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{analysis.role}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(analysis.analysis_result.score)}`}>
                      {analysis.analysis_result.score}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
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
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      )}
    </AppShell>
  );
}

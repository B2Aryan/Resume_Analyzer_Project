import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, FileText, FileX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSavedReportsFromDB } from "@/lib/supabase/analysis-db";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({ meta: [{ title: "Saved Reports — ResumePilot" }] }),
  component: SavedReportsPage,
});

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function SavedReportsPage() {
  const { user } = useAuth();

  const { data: savedReports = [], isLoading } = useQuery({
    queryKey: ["saved-reports", user?.id],
    queryFn: () => user ? fetchSavedReportsFromDB(user) : [],
    enabled: !!user,
  });

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
            <Button asChild className="mt-6" variant="hero"><Link to="/upload">Run a new scan</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {savedReports.map((analysis) => (
            <Card key={analysis.id} className="border-border/60 transition-shadow hover:shadow-soft">
              <CardContent className="grid items-center gap-3 p-4 sm:grid-cols-[auto,1fr,auto,auto,auto]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{analysis.file_name}</p>
                  <p className="text-xs text-muted-foreground">{analysis.role}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(analysis.analysis_result.score)}`}>
                  {analysis.analysis_result.score}/100
                </span>
                {/* TODO: Link to result page with analysis data */}
                <Button size="sm" variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

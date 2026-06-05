import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { MessageSquare, Search, FileX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMockInterviewResults } from "@/lib/supabase/mock-interview-db";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/interviews")({
  head: () => ({ meta: [{ title: "Mock Interviews — ResumePilot" }] }),
  component: InterviewsPage,
});

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function InterviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["mockInterviews", user?.id],
    queryFn: () => user ? fetchMockInterviewResults(user) : [],
    enabled: !!user,
  });

  // Filter interviews by search
  const filteredInterviews = interviews.filter(
    (i) => i.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
  );
}

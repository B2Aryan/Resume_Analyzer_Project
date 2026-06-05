import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { MessageSquare, FileX, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScoreBar } from "@/components/score-ring";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMockInterviewResultById } from "@/lib/supabase/mock-interview-db";

export const Route = createFileRoute("/interview-report/$id")({
  head: () => ({ meta: [{ title: "Mock Interview Report — ResumePilot" }] }),
  component: InterviewReportPage,
});

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function InterviewReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  
  console.log("[interview-report] Received route params id:", id);

  const { data: interview, isLoading, error } = useQuery({
    queryKey: ["mockInterview", id],
    queryFn: () => fetchMockInterviewResultById(id),
    enabled: !!id,
  });

  // Calculate report data
  const reportData = (() => {
    if (!interview) return null;

    // Separate skipped and answered questions
    const nonSkippedResponses = interview.responses.filter(
      (r) => r.feedback.score !== 0 || r.answer !== "[SKIPPED]"
    );
    const skippedResponses = interview.responses.filter(
      (r) => r.answer === "[SKIPPED]" || (r.feedback.score === 0 && r.feedback.missingPoints.includes("Question skipped"))
    );
    
    const allStrengths = nonSkippedResponses.flatMap(r => r.feedback.strengths);
    const allMissingPoints = interview.responses.flatMap(r => r.feedback.missingPoints);

    // Find strongest/weakest from non-skipped, or use skipped if all were skipped
    let strongestAnswer;
    let weakestAnswer;
    
    if (nonSkippedResponses.length > 0) {
      const sortedByScore = [...nonSkippedResponses].sort((a, b) => 
        b.feedback.score - a.feedback.score
      );
      strongestAnswer = sortedByScore[0];
      weakestAnswer = sortedByScore[sortedByScore.length - 1];
    } else {
      strongestAnswer = skippedResponses[0];
      weakestAnswer = skippedResponses[0];
    }

    const answeredCount = nonSkippedResponses.length;
    const skippedCount = skippedResponses.length;
    const completionRate = interview.responses.length > 0 
      ? Math.round(((answeredCount) / interview.responses.length) * 100)
      : 0;

    return {
      averageScore: interview.overall_score,
      averageTechnicalAccuracy: interview.technical_score,
      averageCommunication: interview.communication_score,
      averageCompleteness: interview.completeness_score,
      uniqueStrengths: [...new Set(allStrengths)],
      uniqueMissingPoints: [...new Set(allMissingPoints)],
      strongestAnswer,
      weakestAnswer,
      answeredCount,
      skippedCount,
      completionRate,
    };
  })();

  if (isLoading) {
    return (
      <AppShell title="Loading report">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !interview || !reportData) {
    return (
      <AppShell title="Report not found">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center space-y-4">
            <FileX className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-display font-bold">Mock interview report not found</h2>
            <p className="text-muted-foreground">The interview you're looking for doesn't exist or you don't have access to it.</p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline"><Link to="/dashboard/interviews">Back to interviews</Link></Button>
              <Button asChild variant="hero"><Link to="/dashboard">Home</Link></Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Mock interview report" subtitle={`${interview.role} • ${new Date(interview.created_at).toLocaleDateString()}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Score Cards */}
        <Card className="border-border/60">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold mb-5">Score overview</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreBar 
                label="Overall Score" 
                value={reportData.averageScore} 
                hint="" 
              />
              <ScoreBar 
                label="Technical Accuracy" 
                value={reportData.averageTechnicalAccuracy} 
                hint="" 
              />
              <ScoreBar 
                label="Communication" 
                value={reportData.averageCommunication} 
                hint="" 
              />
              <ScoreBar 
                label="Completeness" 
                value={reportData.averageCompleteness} 
                hint="" 
              />
            </div>
            {/* Completion Metrics */}
            <div className="mt-6 pt-6 border-t border-border grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{reportData.answeredCount}</p>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{reportData.skippedCount}</p>
                <p className="text-sm text-muted-foreground">Questions Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold">{reportData.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Strengths & Improvements */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Strengths summary</h3>
              <div className="flex flex-wrap gap-2">
                {reportData.uniqueStrengths.length > 0 ? (
                  reportData.uniqueStrengths.map((s, i) => (
                    <Badge key={i} variant="secondary">{s}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No strengths recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Improvement areas</h3>
              <div className="flex flex-wrap gap-2">
                {reportData.uniqueMissingPoints.length > 0 ? (
                  reportData.uniqueMissingPoints.map((p, i) => (
                    <Badge key={i} variant="outline">{p}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No improvement areas recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Strongest & Weakest Answers */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Strongest answer</h3>
              <div className="space-y-3">
                <p className="font-semibold">{reportData.strongestAnswer.question}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{reportData.strongestAnswer.category}</Badge>
                  {reportData.strongestAnswer.answer === "[SKIPPED]" ? (
                    <Badge variant="destructive">Skipped</Badge>
                  ) : (
                    <Badge>{reportData.strongestAnswer.feedback.score}/10</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{reportData.strongestAnswer.feedback.summary}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Needs most improvement</h3>
              <div className="space-y-3">
                <p className="font-semibold">{reportData.weakestAnswer.question}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{reportData.weakestAnswer.category}</Badge>
                  {reportData.weakestAnswer.answer === "[SKIPPED]" ? (
                    <Badge variant="destructive">Skipped</Badge>
                  ) : (
                    <Badge variant="outline">{reportData.weakestAnswer.feedback.score}/10</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{reportData.weakestAnswer.feedback.summary}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Interview Breakdown Table */}
        <Card className="border-border/60">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold mb-5">Interview breakdown</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Technical</TableHead>
                  <TableHead>Communication</TableHead>
                  <TableHead>Completeness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interview.responses.map((response, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-xs truncate">{response.question}</TableCell>
                    <TableCell><Badge variant="secondary">{response.category}</Badge></TableCell>
                    <TableCell>
                      {response.answer === "[SKIPPED]" ? (
                        <Badge variant="destructive">Skipped</Badge>
                      ) : (
                        <Badge variant="success">Answered</Badge>
                      )}
                    </TableCell>
                    <TableCell>{response.feedback.score}/10</TableCell>
                    <TableCell>{response.feedback.technicalAccuracy}/10</TableCell>
                    <TableCell>{response.feedback.communication}/10</TableCell>
                    <TableCell>{response.feedback.completeness}/10</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Back Button */}
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/dashboard/interviews">Back to interviews</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useAnalysisStore } from "@/store/analysisStore";
import { useMockInterviewStore } from "@/store/mockInterviewStore";
import { flattenInterviewQuestions } from "@/lib/ats/interview-session";
import { evaluateInterviewAnswer } from "@/lib/ats/interview-evaluator";
import { generateFollowUpQuestion } from "@/lib/ats/interview-followup";
import { saveMockInterviewResult } from "@/lib/supabase/mock-interview-db";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBar } from "@/components/score-ring";
import { MobileInterviewSession } from "@/components/mobile/MobileInterviewSession";
import { MobileShell } from "@/components/mobile/MobileShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/mock-interview")({
  head: () => ({ meta: [{ title: "Mock Interview — ResumePilot" }] }),
  component: MockInterviewPage,
});

function MockInterviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const interviewQuestions = useAnalysisStore((s) => s.interviewQuestions);
  const {
    questions,
    currentIndex,
    responses,
    isComplete,
    followUpCount,
    startInterview,
    saveAnswer,
    saveFeedback,
    saveSkippedQuestion,
    insertFollowUpQuestion,
    nextQuestion,
    finishInterview,
    resetInterview,
  } = useMockInterviewStore();

  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const hasSavedRef = useRef(false);

  // Calculate report data unconditionally at top-level
  const reportData = useMemo(() => {
    const responsesWithFeedback = responses.filter((r) => r.feedback);
    
    if (responsesWithFeedback.length === 0) {
      return null;
    }
    
    // Separate skipped and answered questions
    const nonSkippedResponses = responsesWithFeedback.filter(
      (r) => r.feedback && r.feedback.score !== 0 || r.answer !== "[SKIPPED]"
    );
    const skippedResponses = responsesWithFeedback.filter(
      (r) => r.answer === "[SKIPPED]" || (r.feedback && r.feedback.score === 0 && r.feedback.missingPoints.includes("Question skipped"))
    );
    
    // Calculate averages only from non-skipped answers if any exist
    let totalScore = 0;
    let totalTechnical = 0;
    let totalCommunication = 0;
    let totalCompleteness = 0;
    
    const allStrengths: string[] = [];
    const allMissingPoints: string[] = [];
    
    nonSkippedResponses.forEach((r) => {
      if (!r.feedback) return;
      totalScore += r.feedback.score;
      totalTechnical += r.feedback.technicalAccuracy;
      totalCommunication += r.feedback.communication;
      totalCompleteness += r.feedback.completeness;
      
      allStrengths.push(...r.feedback.strengths);
      allMissingPoints.push(...r.feedback.missingPoints);
    });
    
    const answeredCount = nonSkippedResponses.length;
    const skippedCount = skippedResponses.length;
    const completionRate = questions.length > 0 
      ? Math.round(((answeredCount) / questions.length) * 100) 
      : 0;
    
    // Find strongest/weakest from non-skipped answers, or use skipped if all were skipped
    let strongestAnswer;
    let weakestAnswer;
    
    if (nonSkippedResponses.length > 0) {
      const sortedByScore = [...nonSkippedResponses].sort((a, b) => 
        b.feedback!.score - a.feedback!.score
      );
      strongestAnswer = sortedByScore[0];
      weakestAnswer = sortedByScore[sortedByScore.length - 1];
    } else {
      strongestAnswer = skippedResponses[0];
      weakestAnswer = skippedResponses[0];
    }
    
    // Calculate averages: if no answered questions, use 0
    const averageScore = answeredCount > 0
      ? Math.round((totalScore / answeredCount) * 10)
      : 0;
    const averageTechnicalAccuracy = answeredCount > 0
      ? Math.round((totalTechnical / answeredCount) * 10)
      : 0;
    const averageCommunication = answeredCount > 0
      ? Math.round((totalCommunication / answeredCount) * 10)
      : 0;
    const averageCompleteness = answeredCount > 0
      ? Math.round((totalCompleteness / answeredCount) * 10)
      : 0;
    
    return {
      averageScore,
      averageTechnicalAccuracy,
      averageCommunication,
      averageCompleteness,
      uniqueStrengths: [...new Set(allStrengths)],
      uniqueMissingPoints: [...new Set(allMissingPoints)],
      strongestAnswer,
      weakestAnswer,
      responsesWithFeedback,
      answeredCount,
      skippedCount,
      completionRate,
    };
  }, [responses, questions]);

  // Save mock interview result when it completes
  useEffect(() => {
    if (isComplete && reportData && user && !hasSavedRef.current) {
      hasSavedRef.current = true;
      const saveResult = async () => {
        setSaving(true);
        try {
          const success = await saveMockInterviewResult({
            user,
            role: interviewQuestions!.role,
            overallScore: reportData.averageScore,
            technicalScore: reportData.averageTechnicalAccuracy,
            communicationScore: reportData.averageCommunication,
            completenessScore: reportData.averageCompleteness,
            responses: reportData.responsesWithFeedback,
          });
          if (success) {
            setSavedInterviewId(success.id);
            toast.success("Mock interview saved successfully!");
          } else {
            toast.error("Failed to save mock interview result");
          }
        } catch {
          toast.error("Failed to save mock interview result");
        } finally {
          setSaving(false);
        }
      };
      saveResult();
    }
  }, [isComplete, reportData, user, interviewQuestions]);

  useEffect(() => {
    if (interviewQuestions) {
      const flattened = flattenInterviewQuestions(interviewQuestions);
      if (questions.length === 0) {
        startInterview(flattened);
      }
    }
  }, [interviewQuestions, questions.length, startInterview]);

  const handleSubmit = async () => {
    // Capture current question at start to avoid stale closure issues
    const currentQuestion = questions[currentIndex];
    if (!answer.trim() || !currentQuestion || !interviewQuestions) return;
    
    setEvaluating(true);
    saveAnswer(currentQuestion, answer);
    
    try {
      const evaluationResult = await evaluateInterviewAnswer({
        question: currentQuestion.question,
        answer,
        role: interviewQuestions.role,
      });
      
      if (evaluationResult.success && evaluationResult.data) {
        saveFeedback(currentQuestion.id, evaluationResult.data);
        
        // Check if we should generate a follow-up question (and not already in follow-up)
        if (
          currentQuestion.category !== "follow_up" && 
          evaluationResult.data.score >= 6 &&
          followUpCount < 5
        ) {
          const followUpResult = await generateFollowUpQuestion({
            originalQuestion: currentQuestion.question,
            candidateAnswer: answer,
            score: evaluationResult.data.score,
            strengths: evaluationResult.data.strengths,
            missingPoints: evaluationResult.data.missingPoints,
            role: interviewQuestions.role,
          });
          
          if (followUpResult.success && followUpResult.data?.shouldAskFollowUp && followUpResult.data.followUpQuestion) {
            // Insert follow-up question
            const followUpQuestionItem = {
              id: `followup-${Date.now()}`,
              category: "follow_up" as const,
              question: followUpResult.data.followUpQuestion,
            };
            insertFollowUpQuestion(followUpQuestionItem, currentQuestion.id);
            setAnswer("");
            nextQuestion();
          } else {
            // No follow-up, just move on
            setAnswer("");
            nextQuestion();
          }
        } else {
          // Not eligible for follow-up, just move on
          setAnswer("");
          nextQuestion();
        }
      } else {
        toast.error(evaluationResult.error || "Failed to evaluate answer. Please try again.");
      }
    } catch {
      toast.error("Failed to evaluate answer. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleSkip = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;
    saveSkippedQuestion(currentQuestion);
    setAnswer("");
    nextQuestion();
  };

  const handleRestart = () => {
    if (interviewQuestions) {
      const flattened = flattenInterviewQuestions(interviewQuestions);
      resetInterview();
      startInterview(flattened);
      setAnswer("");
      hasSavedRef.current = false;
    }
  };

  const handleFinishClick = () => {
    setFinishDialogOpen(true);
  };

  const handleConfirmFinish = () => {
    const responsesWithFeedback = responses.filter(r => r.feedback);
    if (responsesWithFeedback.length === 0) {
      toast.error("Answer or skip at least one question before generating a report.");
      setFinishDialogOpen(false);
      return;
    }
    finishInterview();
    setFinishDialogOpen(false);
  };

  if (!interviewQuestions) {
    return (
      <>
        <div className="hidden lg:block">
          <AppShell title="Mock Interview" subtitle="Prepare for your interview">
            <div className="flex flex-col items-center justify-center py-24">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-display font-bold">Generate interview questions first</h2>
                <p className="text-muted-foreground">
                  Go back to your analysis results and generate interview questions to start your mock interview.
                </p>
                <Button onClick={() => navigate({ to: "/result" })}>Go Back</Button>
              </div>
            </div>
          </AppShell>
        </div>
        <div className="block lg:hidden">
          <MobileShell>
            <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
              <h2 className="text-xl font-display font-bold text-foreground">Generate questions first</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
                Go back to your resume analysis results and generate interview questions to start practicing.
              </p>
              <Button onClick={() => navigate({ to: "/result" })} className="mt-5 bg-primary rounded-xl font-bold">
                Go Back
              </Button>
            </div>
          </MobileShell>
        </div>
      </>
    );
  }

  const responsesWithFeedbackCount = responses.filter(r => r.feedback).length;

  return (
    <>
      {/* Desktop View (>=1024px) - 100% Unchanged */}
      <div className="hidden lg:block">
        {isComplete ? (
          <AppShell title="Mock Interview Complete" subtitle="Great job! Here's your report">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Score Cards */}
              <Card className="border-border/60">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-display text-lg font-semibold mb-5">Score Overview</h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <ScoreBar 
                      label="Overall Score" 
                      value={reportData?.averageScore ?? 0} 
                      hint="" 
                    />
                    <ScoreBar 
                      label="Technical Accuracy" 
                      value={reportData?.averageTechnicalAccuracy ?? 0} 
                      hint="" 
                    />
                    <ScoreBar 
                      label="Communication" 
                      value={reportData?.averageCommunication ?? 0} 
                      hint="" 
                    />
                    <ScoreBar 
                      label="Completeness" 
                      value={reportData?.averageCompleteness ?? 0} 
                      hint="" 
                    />
                  </div>
                  {/* Completion Metrics */}
                  <div className="mt-6 pt-6 border-t border-border grid gap-4 sm:grid-cols-3">
                    <div className="text-center">
                      <p className="text-3xl font-display font-bold">{reportData?.answeredCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Questions Answered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-display font-bold">{reportData?.skippedCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Questions Skipped</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-display font-bold">{reportData?.completionRate ?? 0}%</p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Strengths & Improvements */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Strengths Summary</h3>
                    <div className="flex flex-wrap gap-2">
                      {reportData && reportData.uniqueStrengths.length > 0 ? (
                        reportData.uniqueStrengths.map((s: string, i: number) => (
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
                    <h3 className="font-display text-lg font-semibold mb-4">Improvement Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {reportData && reportData.uniqueMissingPoints.length > 0 ? (
                        reportData.uniqueMissingPoints.map((p: string, i: number) => (
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
                    <h3 className="font-display text-lg font-semibold mb-4">Strongest Answer</h3>
                    {reportData?.strongestAnswer && (
                      <div className="space-y-3">
                        <p className="font-semibold">{reportData.strongestAnswer.question}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{reportData.strongestAnswer.category}</Badge>
                          {reportData.strongestAnswer.answer === "[SKIPPED]" ? (
                            <Badge variant="destructive">Skipped</Badge>
                          ) : (
                            <Badge>{reportData.strongestAnswer.feedback?.score}/10</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">{reportData.strongestAnswer.feedback?.summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Needs Most Improvement</h3>
                    {reportData?.weakestAnswer && (
                      <div className="space-y-3">
                        <p className="font-semibold">{reportData.weakestAnswer.question}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{reportData.weakestAnswer.category}</Badge>
                          {reportData.weakestAnswer.answer === "[SKIPPED]" ? (
                            <Badge variant="destructive">Skipped</Badge>
                          ) : (
                            <Badge variant="outline">{reportData.weakestAnswer.feedback?.score}/10</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">{reportData.weakestAnswer.feedback?.summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Interview Breakdown Table */}
              <Card className="border-border/60">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-display text-lg font-semibold mb-5">Interview Breakdown</h3>
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
                      {responses.filter(r => r.feedback).map((response, index) => (
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
                          <TableCell>{response.feedback?.score}/10</TableCell>
                          <TableCell>{response.feedback?.technicalAccuracy}/10</TableCell>
                          <TableCell>{response.feedback?.communication}/10</TableCell>
                          <TableCell>{response.feedback?.completeness}/10</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Restart Button */}
              <div className="flex justify-center">
                <Button onClick={handleRestart} size="lg">
                  Restart Interview
                </Button>
              </div>
            </div>
          </AppShell>
        ) : (
          (() => {
            const currentQuestion = questions[currentIndex];
            if (!currentQuestion) return null;
            return (
              <AppShell
                title="Mock Interview"
                subtitle={`Question ${currentIndex + 1} of ${questions.length}`}
              >
                <div className="max-w-3xl mx-auto">
                  <Card className="border-border/60 mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-sm">
                          {currentQuestion.category}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {currentIndex + 1} / {questions.length}
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardContent className="p-6">
                      <Textarea
                        placeholder="Type your answer here..."
                        className="min-h-[200px] mb-4"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={evaluating}
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {answer.length} characters
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={handleFinishClick} 
                            disabled={evaluating}
                          >
                            Finish Interview
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={handleSkip} 
                            disabled={evaluating}
                          >
                            Skip Question
                          </Button>
                          <Button onClick={handleSubmit} disabled={!answer.trim() || evaluating}>
                            {evaluating ? "Evaluating..." : "Submit Answer"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AppShell>
            );
          })()
        )}
      </div>

      {/* Mobile/Tablet View (<1024px) */}
      <div className="block lg:hidden">
        <MobileInterviewSession
          questions={questions}
          currentIndex={currentIndex}
          responses={responses}
          isComplete={isComplete}
          answer={answer}
          setAnswer={setAnswer}
          evaluating={evaluating}
          saving={saving}
          savedInterviewId={savedInterviewId}
          reportData={reportData}
          handleSubmit={handleSubmit}
          handleSkip={handleSkip}
          handleRestart={handleRestart}
          handleFinishClick={handleFinishClick}
          roleName={interviewQuestions?.role || "Tailored Practice"}
        />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Interview?</DialogTitle>
            <DialogDescription>
              You have completed {responsesWithFeedbackCount} of {questions.length} questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishDialogOpen(false)}>
              Continue Interview
            </Button>
            <Button variant="hero" onClick={handleConfirmFinish}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

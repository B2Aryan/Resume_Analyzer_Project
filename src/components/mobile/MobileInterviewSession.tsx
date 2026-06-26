import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  Award, 
  AlertTriangle, 
  ShieldCheck, 
  Bookmark, 
  ArrowRight,
  RefreshCw,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScoreRing } from "@/components/score-ring";
import { MobileShell } from "./MobileShell";
import type { InterviewQuestionItem } from "@/lib/ats/interview-session";

interface MobileInterviewSessionProps {
  questions: InterviewQuestionItem[];
  currentIndex: number;
  responses: any[];
  isComplete: boolean;
  answer: string;
  setAnswer: (val: string) => void;
  evaluating: boolean;
  saving: boolean;
  savedInterviewId: string | null;
  reportData: any;
  handleSubmit: () => Promise<void>;
  handleSkip: () => void;
  handleRestart: () => void;
  handleFinishClick: () => void;
  roleName: string;
}

export function MobileInterviewSession({
  questions,
  currentIndex,
  responses,
  isComplete,
  answer,
  setAnswer,
  evaluating,
  saving,
  savedInterviewId,
  reportData,
  handleSubmit,
  handleSkip,
  handleRestart,
  handleFinishClick,
  roleName,
}: MobileInterviewSessionProps) {
  const navigate = useNavigate();
  const currentQuestion = questions[currentIndex];
  
  // Auto-growing textarea logic
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Cap minimum height at 120px, auto-grow beyond
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [answer]);

  if (!currentQuestion && !isComplete) {
    return (
      <MobileShell hideBottomNav={true}>
        <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading interview questions...</p>
        </div>
      </MobileShell>
    );
  }

  // --- Completion Screen ---
  if (isComplete) {
    return (
      <MobileShell hideBottomNav={true}>
        <div className="px-4 pt-6 pb-32 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Interview Completed</h1>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {roleName}
            </p>
          </div>

          <div className="space-y-5">
            {/* Score Overview */}
            <Card className="border-border/40 bg-card overflow-hidden shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Overall Performance</p>
                <ScoreRing score={reportData?.averageScore ?? 0} size={150} label="Average Score" />
                
                <div className="w-full mt-6 grid grid-cols-3 gap-2 pt-6 border-t border-border/40">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{reportData?.answeredCount ?? 0}</p>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Answered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{reportData?.skippedCount ?? 0}</p>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Skipped</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{reportData?.completionRate ?? 0}%</p>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths Card */}
            <Card className="border-border/40 bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4.5 w-4.5 text-green-500" />
                  <h3 className="font-display text-sm font-bold text-foreground">Key Strengths</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {reportData?.uniqueStrengths && reportData.uniqueStrengths.length > 0 ? (
                    reportData.uniqueStrengths.map((strength: string, i: number) => (
                      <span key={i} className="rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[10px] font-bold text-green-500 uppercase tracking-wide">
                        {strength}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No specific strengths highlighted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses Card */}
            <Card className="border-border/40 bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  <h3 className="font-display text-sm font-bold text-foreground">Areas to Improve</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {reportData?.uniqueMissingPoints && reportData.uniqueMissingPoints.length > 0 ? (
                    reportData.uniqueMissingPoints.map((weakness: string, i: number) => (
                      <span key={i} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                        {weakness}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No immediate development areas detected.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Feedback Summary */}
            <Card className="border-border/40 bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3.5">
                  <MessageSquare className="h-4.5 w-4.5 text-purple-500" />
                  <h3 className="font-display text-sm font-bold text-foreground">AI Evaluation Summary</h3>
                </div>
                <div className="space-y-4">
                  {reportData?.strongestAnswer && (
                    <div className="p-3.5 rounded-xl bg-green-500/[0.02] border border-green-500/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-1">Strongest Answer</p>
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-1.5">
                        "{reportData.strongestAnswer.question}"
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {reportData.strongestAnswer.feedback?.summary}
                      </p>
                    </div>
                  )}
                  {reportData?.weakestAnswer && (
                    <div className="p-3.5 rounded-xl bg-amber-500/[0.02] border border-amber-500/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Needs Improvement</p>
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-1.5">
                        "{reportData.weakestAnswer.question}"
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {reportData.weakestAnswer.feedback?.summary}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-background/80 backdrop-blur-md z-30 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
              <Button
                disabled={saving || !savedInterviewId}
                onClick={() => {
                  if (savedInterviewId) {
                    navigate({ to: "/interview-report/$id", params: { id: savedInterviewId } });
                  }
                }}
                className="w-full text-xs font-bold h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-glow active:scale-95 transition-all rounded-xl flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Report...
                  </>
                ) : (
                  <>
                    View Report
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="flex-1 text-xs font-bold h-10 border-border/60 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </Button>
                <Link
                  to="/dashboard/interviews"
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-border/60 bg-background px-4 py-2 text-xs font-bold text-foreground active:bg-muted/50 transition-colors h-10"
                >
                  Back to Interviews
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MobileShell>
    );
  }

  // --- Active Interview Screen ---
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <MobileShell hideBottomNav={true}>
      <div className="px-4 pt-4 pb-28">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/dashboard/interviews"
            className="flex items-center gap-1 text-xs font-bold text-muted-foreground active:text-foreground transition-colors py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 px-2.5 py-1 rounded-full border border-border/30">
            <Clock className="h-3.5 w-3.5" />
            Untimed
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-lg font-bold text-foreground">Mock Interview</h1>
            <span className="text-xs font-semibold text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card & Answer Section Container */}
        <div key={currentQuestion.id} className="space-y-4 animate-scale-in">
          {/* Question Card */}
          <Card className="border-border/40 bg-card shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3.5">
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-500 border border-purple-500/20">
                  {currentQuestion.category}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  Q{currentIndex + 1}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground leading-snug">
                {currentQuestion.question}
              </h2>
            </CardContent>
          </Card>

          {/* Answer Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Answer</label>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {answer.length} Characters
              </span>
            </div>
            <Textarea
              ref={textareaRef}
              disabled={evaluating}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full rounded-2xl border border-border/40 p-4 text-sm bg-card shadow-inner focus:ring-2 focus:ring-primary/20 focus:border-primary/60 outline-none leading-relaxed transition-all resize-none min-h-[120px]"
            />
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-background/80 backdrop-blur-md z-30 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex gap-2 w-full max-w-md mx-auto">
            <Button
              variant="outline"
              disabled={evaluating}
              onClick={handleFinishClick}
              className="flex-1 text-xs font-bold h-11 border-border/60 rounded-xl"
            >
              Finish
            </Button>
            <Button
              variant="outline"
              disabled={evaluating}
              onClick={handleSkip}
              className="flex-1 text-xs font-bold h-11 border-border/60 rounded-xl"
            >
              Skip
            </Button>
            <Button
              disabled={!answer.trim() || evaluating}
              onClick={handleSubmit}
              className="flex-1.5 text-xs font-bold h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-glow active:scale-[0.98] transition-all rounded-xl"
            >
              {evaluating ? (
                <div className="flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </div>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </div>
        </div>

      </div>
    </MobileShell>
  );
}

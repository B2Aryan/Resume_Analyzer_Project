import { memo, useCallback, useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  RefreshCw,
  Loader2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScoreRing } from "@/components/score-ring";
import { getVerdict } from "@/components/result/result-verdict";
import { toast } from "sonner";
import { generateCoverLetter } from "@/lib/ats/cover-letter";
import { downloadCoverLetterPdf } from "@/lib/pdf/cover-letter-pdf";
import { generateInterviewQuestions, type InterviewQuestionsResponse } from "@/lib/ats/interview-questions";
import { downloadInterviewQuestionsPdf } from "@/lib/pdf/interview-questions-pdf";
import { toggleSaveAnalysis, updateInterviewQuestionsToDB } from "@/lib/supabase/analysis-db";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysisStore } from "@/store/analysisStore";
import { CoverLetterProgressOverlay } from "@/components/cover-letter-progress-overlay";

export interface ResultHeroProps {
  part: "header" | "score";
  fileName: string;
  role: string;
  hasJobDescription: boolean;
  hasJdMatch: boolean;
  score: number;
  atsCompatibility: number;
  sidebarMissingKeywords: string[];
  quickWinCount: number;
  onDownloadPdf: () => void;
  // Next Actions props
  resumeText: string;
  jobDescription: string;
}

export const ResultHero = memo(function ResultHero({
  part,
  fileName,
  role,
  hasJobDescription,
  hasJdMatch,
  score,
  atsCompatibility,
  sidebarMissingKeywords,
  quickWinCount,
  onDownloadPdf,
  resumeText,
  jobDescription,
}: ResultHeroProps) {
  const verdict = useMemo(() => getVerdict(score), [score]);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const analysisId = useAnalysisStore(s => s.analysisId);
  const isSaved = useAnalysisStore(s => s.isSaved);
  const setSaved = useAnalysisStore(s => s.setSaved);
  const interviewQuestionsFromStore = useAnalysisStore(s => s.interviewQuestions);
  const setInterviewQuestions = useAnalysisStore(s => s.setInterviewQuestions);
  const [saveLoading, setSaveLoading] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [coverLetterJd, setCoverLetterJd] = useState("");
  const [coverLetterGenerating, setCoverLetterGenerating] = useState(false);
  const [generatedCoverLetterOpen, setGeneratedCoverLetterOpen] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [interviewQuestionsOpen, setInterviewQuestionsOpen] = useState(false);
  const [interviewQuestionsJd, setInterviewQuestionsJd] = useState("");
  const [interviewQuestionsGenerating, setInterviewQuestionsGenerating] = useState(false);

  const handleCancelGeneration = useCallback(() => {
    console.log("handleCancelGeneration called!");
    if (abortController) {
      abortController.abort();
    }
    setShowProgressOverlay(false);
    setCoverLetterGenerating(false);
    setAbortController(null);
  }, [abortController]);

  const handleCloseGeneratedCoverLetter = useCallback(() => {
    console.log("handleCloseGeneratedCoverLetter called!");
    setGeneratedCoverLetterOpen(false);
  }, []);

  const handleSaveToggle = useCallback(async () => {
    console.log("handleSaveToggle: user:", user, "analysisId:", analysisId, "isSaved:", isSaved);
    if (!user || !analysisId) {
      console.error("handleSaveToggle: Missing user or analysisId");
      return;
    }
    setSaveLoading(true);
    try {
      await toggleSaveAnalysis(analysisId, !isSaved);
      setSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["analyses", user.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-reports", user.id] });
      toast.success(isSaved ? "Removed from saved reports" : "Saved to dashboard!");
    } catch (error) {
      console.error("handleSaveToggle error:", error);
      toast.error("Failed to update saved status");
    } finally {
      setSaveLoading(false);
    }
  }, [user, analysisId, isSaved, setSaved, queryClient]);

  if (part === "header") {
    return (
      <section className="border-b border-border hero-ambient overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Analysis Report
              </p>
              <h1 className="mt-1 truncate font-display text-2xl font-bold sm:text-4xl">{fileName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Target: {role} · Analyzed just now
                {hasJobDescription && hasJdMatch ? " · JD match report" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Card className="border-border/60 shadow-soft transition-all duration-300 ease-out hover:border-primary/40 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
        <CardContent className="grid grid-cols-1 md:grid-cols-[55%_1px_45%] gap-0 p-5 sm:p-6">
        {/* Left Section (55%) */}
        <div className="flex flex-col justify-center items-center py-4 md:py-0">
          <ScoreRing score={score} size={210} />
          <div className="text-center mt-3">
            <h2 className="font-display text-2xl font-bold">{verdict.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{verdict.description}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {atsCompatibility >= 70 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3 w-3" aria-hidden /> ATS-safe
                </span>
              )}
              {sidebarMissingKeywords.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                  <AlertCircle className="h-3 w-3" aria-hidden /> Keyword gaps
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <Sparkles className="h-3 w-3" aria-hidden /> {quickWinCount} quick wins
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block border-l border-border/50" />

        {/* Right Section (45%) - Next Actions */}
        <div className="flex flex-col justify-center items-center py-4 md:py-0 md:pl-6">
          <div className="w-full max-w-[320px] space-y-2">
            <Button asChild variant="hero" className="w-full">
              <Link to="/upload">
                Re-scan after edits <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={onDownloadPdf}>
              <Download className="h-4 w-4" aria-hidden /> Download PDF Report
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setCoverLetterOpen(true)}>
              <FileText className="h-4 w-4" aria-hidden /> Generate Cover Letter
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setInterviewQuestionsJd(jobDescription || "");
                setInterviewQuestionsOpen(true);
              }}
            >
              <MessageSquare className="h-4 w-4" aria-hidden /> 
              {interviewQuestionsFromStore ? "View Interview Questions" : "Generate Interview Questions"}
            </Button>
            {interviewQuestionsFromStore && (
              <>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/mock-interview">
                    <MessageSquare className="h-4 w-4 mr-2" aria-hidden /> Start Mock Interview
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={async () => {
                    setInterviewQuestionsGenerating(true);
                    try {
                      const result = await generateInterviewQuestions({
                        resumeText,
                        targetRole: role,
                        jobDescription: jobDescription || undefined,
                      });
                      if (result.success) {
                        setInterviewQuestions(result.data);
                        if (analysisId) {
                          await updateInterviewQuestionsToDB({ analysisId, interviewQuestions: result.data });
                        }
                        toast.success("Interview questions regenerated!");
                      } else {
                        toast.error(result.error);
                      }
                    } catch {
                      toast.error("Could not regenerate interview questions.");
                    } finally {
                      setInterviewQuestionsGenerating(false);
                    }
                  }}
                  disabled={interviewQuestionsGenerating || !analysisId}
                >
                  {interviewQuestionsGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" /> Regenerate Questions
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSaveToggle}
              disabled={saveLoading || !user || !analysisId}
            >
              {saveLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSaved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {isSaved ? "Saved to Dashboard" : "Save to Dashboard"}
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

      <Dialog open={coverLetterOpen} onOpenChange={setCoverLetterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Cover Letter</DialogTitle>
            <DialogDescription>
              Paste a job description to generate a more tailored cover letter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="cover-letter-jd">Job Description</Label>
            <Textarea
              id="cover-letter-jd"
              placeholder="Paste the job description here (optional)..."
              value={coverLetterJd}
              onChange={(e) => setCoverLetterJd(e.target.value)}
              className="min-h-[120px] resize-y"
              disabled={coverLetterGenerating}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={coverLetterGenerating}>Cancel</Button>
            </DialogClose>
            <Button
              variant="hero"
              disabled={coverLetterGenerating}
              onClick={async () => {
                console.log("Generate button clicked!");
                const controller = new AbortController();
                setAbortController(controller);
                setCoverLetterGenerating(true);
                setCoverLetterOpen(false);
                setShowProgressOverlay(true);
                try {
                  const candidateName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0];
                  const result = await generateCoverLetter({
                    resumeText,
                    targetRole: role,
                    jobDescription: coverLetterJd || undefined,
                    candidateName,
                  });

                  if (result.success) {
                    setGeneratedCoverLetter(result.data.coverLetter);
                    setShowProgressOverlay(false);
                    setGeneratedCoverLetterOpen(true);
                  } else {
                    toast.error(result.error);
                    setShowProgressOverlay(false);
                  }
                } catch (error) {
                  if (error instanceof Error && error.name === "AbortError") {
                    console.log("Generation canceled by user");
                  } else {
                    console.error("Cover letter generation error:", error);
                    toast.error("Could not generate cover letter. Please try again.");
                    setShowProgressOverlay(false);
                  }
                } finally {
                  setCoverLetterGenerating(false);
                  setAbortController(null);
                }
              }}
            >
              {coverLetterGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : ("Generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CoverLetterProgressOverlay
        open={showProgressOverlay}
        onCancel={handleCancelGeneration}
      />

      <Dialog open={generatedCoverLetterOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseGeneratedCoverLetter();
        } else {
          setGeneratedCoverLetterOpen(true);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Cover Letter</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 whitespace-pre-wrap">
              {generatedCoverLetter}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(generatedCoverLetter);
                  toast.success("Cover letter copied to clipboard!");
                } catch {
                  toast.error("Failed to copy cover letter.");
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy Cover Letter
            </Button>
            <Button
              variant="outline"
              disabled={!generatedCoverLetter}
              onClick={() => {
                try {
                  downloadCoverLetterPdf(generatedCoverLetter, role);
                  toast.success("Cover letter downloaded!");
                } catch {
                  toast.error("Failed to generate PDF.");
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <DialogClose asChild>
              <Button variant="hero">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InterviewQuestionsDialog
        open={interviewQuestionsOpen}
        onOpenChange={setInterviewQuestionsOpen}
        existingQuestions={interviewQuestionsFromStore}
        onQuestionsGenerated={(questions) => {
          setInterviewQuestions(questions);
        }}
        role={role}
        resumeText={resumeText}
        jobDescriptionFromStore={jobDescription}
        analysisId={analysisId}
      />
    </>
  );
});

interface InterviewQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingQuestions: InterviewQuestionsResponse | null;
  onQuestionsGenerated: (questions: InterviewQuestionsResponse) => void;
  role: string;
  resumeText: string;
  jobDescriptionFromStore: string;
  analysisId: string | null;
}

function InterviewQuestionsDialog({
  open,
  onOpenChange,
  existingQuestions,
  onQuestionsGenerated,
  role,
  resumeText,
  jobDescriptionFromStore,
  analysisId,
}: InterviewQuestionsDialogProps) {
  const [jobDescription, setJobDescription] = useState(jobDescriptionFromStore);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestionsResponse | null>(existingQuestions);

  useEffect(() => {
    if (open) {
      setQuestions(existingQuestions);
      setJobDescription(jobDescriptionFromStore);
    }
  }, [open, existingQuestions, jobDescriptionFromStore]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateInterviewQuestions({
        resumeText,
        targetRole: role,
        jobDescription: jobDescription || undefined,
      });
      if (result.success) {
        setQuestions(result.data);
        onQuestionsGenerated(result.data);
        if (analysisId) {
          await updateInterviewQuestionsToDB({ analysisId, interviewQuestions: result.data });
        }
        toast.success("Interview questions saved!");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Interview questions generation error:", error);
      toast.error("Could not generate interview questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!questions) return;
    
    const textParts: string[] = [];
    
    if (questions.project_questions.length > 0) {
      textParts.push("Project Questions");
      questions.project_questions.forEach((q, i) => textParts.push(`${i + 1}. ${q}`));
      textParts.push("");
    }
    
    if (questions.technical_questions.length > 0) {
      textParts.push("Technical Questions");
      questions.technical_questions.forEach((q, i) => {
        textParts.push(`${i + 1}. ${q.question} [${q.difficulty}]`);
        if (q.expectedAnswerPoints.length > 0) {
          textParts.push("   Expected Points:");
          q.expectedAnswerPoints.forEach(p => textParts.push(`   - ${p}`));
        }
      });
      textParts.push("");
    }
    
    if (questions.behavioral_questions.length > 0) {
      textParts.push("Behavioral Questions");
      questions.behavioral_questions.forEach((q, i) => textParts.push(`${i + 1}. ${q}`));
      textParts.push("");
    }
    
    if (questions.system_design_questions.length > 0) {
      textParts.push("System Design Questions");
      questions.system_design_questions.forEach((q, i) => textParts.push(`${i + 1}. ${q}`));
      textParts.push("");
    }
    
    if (questions.follow_up_questions.length > 0) {
      textParts.push("Follow-Up Questions");
      questions.follow_up_questions.forEach((q, i) => textParts.push(`${i + 1}. ${q}`));
    }

    try {
      await navigator.clipboard.writeText(textParts.join("\n"));
      toast.success("Interview questions copied to clipboard!");
    } catch {
      toast.error("Failed to copy questions.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!questions) return;
    setDownloading(true);
    try {
      downloadInterviewQuestionsPdf(questions as any, role);
      toast.success("Interview questions downloaded!");
    } catch {
      toast.error("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "Medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "Hard": return "bg-red-500/10 text-red-400 border-red-500/30";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {questions ? "Interview Questions" : "Generate Interview Questions"}
          </DialogTitle>
          {!questions && (
            <DialogDescription>
              Paste a job description to generate more tailored interview questions.
            </DialogDescription>
          )}
        </DialogHeader>

        {!questions ? (
          <>
            <div className="space-y-4 py-4">
              <Label htmlFor="interview-questions-jd">Job Description</Label>
              <Textarea
                id="interview-questions-jd"
                placeholder="Paste the job description here (optional)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[120px] resize-y"
                disabled={generating}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={generating}>Cancel</Button>
              </DialogClose>
              <Button
                variant="hero"
                disabled={generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...
                  </>
                ) : "Generate"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mt-2 space-y-8 max-h-[70vh] overflow-y-auto">
              
              {questions.project_questions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold text-foreground">Project Questions</h4>
                  <ul className="space-y-2">
                    {questions.project_questions.map((question, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground"
                      >
                        {i + 1}. {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {questions.technical_questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-display text-lg font-semibold text-foreground">Technical Questions</h4>
                  <div className="space-y-3">
                    {questions.technical_questions.map((q, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-foreground">
                            {i + 1}. {q.question}
                          </p>
                          <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        {q.expectedAnswerPoints.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Expected Points:
                            </p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {q.expectedAnswerPoints.map((point, j) => (
                                <li key={j}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {questions.behavioral_questions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold text-foreground">Behavioral Questions</h4>
                  <ul className="space-y-2">
                    {questions.behavioral_questions.map((question, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground"
                      >
                        {i + 1}. {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {questions.system_design_questions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold text-foreground">System Design Questions</h4>
                  <ul className="space-y-2">
                    {questions.system_design_questions.map((question, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground"
                      >
                        {i + 1}. {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {questions.follow_up_questions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold text-foreground">Follow-Up Questions</h4>
                  <ul className="space-y-2">
                    {questions.follow_up_questions.map((question, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground"
                      >
                        {i + 1}. {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" /> Copy Questions
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} disabled={downloading}>
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Preparing Interview Kit...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setGenerating(true);
                  try {
                    const result = await generateInterviewQuestions({
                      resumeText,
                      targetRole: role,
                      jobDescription: jobDescription || undefined,
                    });
                    if (result.success) {
                      setQuestions(result.data);
                      onQuestionsGenerated(result.data);
                      if (analysisId) {
                        await updateInterviewQuestionsToDB({ analysisId, interviewQuestions: result.data });
                      }
                      toast.success("Interview questions regenerated!");
                    } else {
                      toast.error(result.error);
                    }
                  } catch {
                    toast.error("Could not regenerate interview questions.");
                  } finally {
                    setGenerating(false);
                  }
                }}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Regenerating...
                  </>
                ) : (
                  "Regenerate Questions"
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="hero">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

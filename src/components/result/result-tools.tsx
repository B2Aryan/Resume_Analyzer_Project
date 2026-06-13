import { memo, useCallback, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Download, ArrowRight, Copy, Wand2, Loader2, FileText, Bookmark, BookmarkCheck, MessageSquare, RefreshCw } from "lucide-react";
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
import { toast } from "sonner";
import {
  rewriteResumeBullet,
  type BulletRewriteResult,
} from "@/lib/ats/bullet-rewriter";
import { generateCoverLetter } from "@/lib/ats/cover-letter";
import { downloadCoverLetterPdf } from "@/lib/pdf/cover-letter-pdf";
import { generateInterviewQuestions, type InterviewQuestionsResponse } from "@/lib/ats/interview-questions";
import { downloadInterviewQuestionsPdf } from "@/lib/pdf/interview-questions-pdf";
import { toggleSaveAnalysis, updateInterviewQuestionsToDB } from "@/lib/supabase/analysis-db";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysisStore } from "@/store/analysisStore";
import { CoverLetterProgressOverlay } from "@/components/cover-letter-progress-overlay";

export interface ResultToolsProps {
  part: "rewriter" | "actions";
  role: string;
  resumeText: string;
  jobDescription: string;
  onDownloadPdf: () => void;
}

export const ResultTools = memo(function ResultTools({
  part,
  role,
  resumeText,
  jobDescription,
  onDownloadPdf,
}: ResultToolsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const analysisId = useAnalysisStore(s => s.analysisId);
  const isSaved = useAnalysisStore(s => s.isSaved);
  const setSaved = useAnalysisStore(s => s.setSaved);
  const [bulletInput, setBulletInput] = useState("");
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletRewrite, setBulletRewrite] = useState<BulletRewriteResult | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [coverLetterJd, setCoverLetterJd] = useState("");
  const [coverLetterGenerating, setCoverLetterGenerating] = useState(false);
  const [generatedCoverLetterOpen, setGeneratedCoverLetterOpen] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const interviewQuestionsFromStore = useAnalysisStore(s => s.interviewQuestions);
  const setInterviewQuestions = useAnalysisStore(s => s.setInterviewQuestions);

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

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, []);

  const handleRewriteBullet = useCallback(async () => {
    if (!bulletInput.trim()) {
      toast.error("Enter a bullet point to rewrite.");
      return;
    }
    setBulletLoading(true);
    setBulletRewrite(null);
    try {
      const result = await rewriteResumeBullet({
        originalBullet: bulletInput,
        resumeText,
        targetRole: role,
        jobDescription: jobDescription || undefined,
      });
      if (result.success) {
        setBulletRewrite(result.data);
      } else if (result.isQuotaError) {
        toast.error("Daily AI limit reached. Please try again later.");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Could not rewrite bullet. Please try again.");
    } finally {
      setBulletLoading(false);
    }
  }, [bulletInput, resumeText, role, jobDescription]);

  if (part === "actions") {
    return (
      <>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-display text-base font-semibold">Next actions</h3>
            <div className="mt-4 space-y-2">
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
  }

  return (
    <Card className="border-border/60 border-primary/20">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Wand2 className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">Bullet rewriter</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">Improve Resume Bullet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a weak bullet from your resume. We'll suggest stronger, ATS-friendly, and
          impact-focused versions using your analysis context — without inventing metrics or fake
          experience.
        </p>

        <div className="mt-5 space-y-2">
          <Label htmlFor="bullet-input">Existing bullet point</Label>
          <Textarea
            id="bullet-input"
            placeholder='e.g. "Built an e-commerce website."'
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            className="min-h-[88px] resize-y"
            disabled={bulletLoading}
          />
        </div>

        <Button
          type="button"
          variant="hero"
          className="mt-4 w-full sm:w-auto"
          disabled={bulletLoading || !bulletInput.trim()}
          onClick={handleRewriteBullet}
          aria-busy={bulletLoading}
        >
          {bulletLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Rewriting…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" aria-hidden /> Rewrite bullet
            </>
          )}
        </Button>

        {bulletRewrite && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Original
              </p>
              <p className="mt-2 text-sm text-foreground">{bulletInput.trim()}</p>
            </div>

            {(
              [
                { key: "stronger" as const, label: "Stronger version", text: bulletRewrite.stronger },
                {
                  key: "atsOptimized" as const,
                  label: "ATS-optimized version",
                  text: bulletRewrite.atsOptimized,
                },
                {
                  key: "impactFocused" as const,
                  label: "Impact-focused version",
                  text: bulletRewrite.impactFocused,
                },
              ] as const
            ).map((variant) => (
              <div
                key={variant.key}
                className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold text-foreground">{variant.label}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => copyToClipboard(variant.text, variant.label)}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{variant.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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

  // Reset questions when dialog opens with new existing questions
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
      // We can keep the existing download for now, we'll update the PDF function later if needed
      downloadInterviewQuestionsPdf(questions as any, role);
      toast.success("Interview questions downloaded!");
    } catch {
      toast.error("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  // Helper for difficulty badges
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "Medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "Hard": return "bg-red-500/10 text-red-400 border-red-500/30";
      default: return "";
    }
  };

  return (
    <>
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
                
                {/* Project Questions */}
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
                
                {/* Technical Questions */}
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
                
                {/* Behavioral Questions */}
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
                
                {/* System Design Questions */}
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
                
                {/* Follow-Up Questions */}
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
    </>
  );
}

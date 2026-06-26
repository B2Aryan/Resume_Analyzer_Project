import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileScoreRing } from "@/components/mobile/MobileScoreRing";
import { toast } from "sonner";
import { extractTextFromPDF } from "@/lib/ats/pdf-parser";
import { analyzeResumeWithGemini } from "@/lib/ats/analyzer";
import type { ATSAnalysisResult } from "@/lib/ats/types";
import {
  ChevronLeft,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";

export const Route = createFileRoute("/job-match")({
  head: () => ({
    meta: [{ title: "Job Match Analyzer — ResumePilot" }],
  }),
  component: JobMatchPage,
});

function JobMatchPage() {
  const navigate = useNavigate();

  // Desktop redirection
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkResponsive = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        navigate({ to: "/dashboard" });
      }
    };
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, [navigate]);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  // Workflow states
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [step, setStep] = useState<"input" | "result">("input");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please select a PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please upload your resume.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please enter the Job Description.");
      return;
    }

    startTransition(async () => {
      try {
        // Extract text
        const resumeText = await extractTextFromPDF(selectedFile);

        // Infer target role from the first line of the Job Description
        const inferRole = (jd: string): string => {
          const lines = jd.split("\n").map(l => l.trim()).filter(Boolean);
          if (lines.length > 0 && lines[0].length < 60) {
            return lines[0];
          }
          return "Target Role";
        };
        const targetRole = inferRole(jobDescription);

        // Call Gemini ATS analysis pipeline
        const result = await analyzeResumeWithGemini(resumeText, targetRole, jobDescription.trim());

        if (result.success) {
          setAnalysisResult(result.data);
          setStep("result");
          toast.success("Job match analysis completed!");
        } else {
          toast.error(result.error || "Analysis failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Job Match analysis error:", error);
        toast.error(error.message || "Failed to parse PDF or analyze match.");
      }
    });
  };

  // Helper for ATS Prediction values
  const getAtsPrediction = (score: number) => {
    if (score >= 80) {
      return {
        label: "High Pass Probability",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        desc: "Your resume has high keyword alignment and ATS compatibility, meaning it is highly likely to pass automated screening filters.",
      };
    }
    if (score >= 60) {
      return {
        label: "Moderate Pass Probability",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        desc: "Your resume meets basic ATS standards but lacks key role-specific keywords. It stands a moderate chance but would benefit from further optimization.",
      };
    }
    return {
      label: "Low Pass Probability",
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      desc: "Your resume has significant gaps in compatibility or role-specific keywords, representing a high risk of being filtered out by ATS systems.",
    };
  };

  if (isDesktop) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const prediction = analysisResult ? getAtsPrediction(analysisResult.score) : null;

  return (
    <MobileShell>
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => {
              if (step === "result") {
                setStep("input");
              } else {
                navigate({ to: "/mobile/tools" });
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold">
            {step === "input" ? "Job Match Analyzer" : "Match Analysis"}
          </h1>
        </div>

        {step === "input" ? (
          <div className="space-y-5">
            {/* Header info */}
            <div>
              <p className="text-sm text-muted-foreground">
                Compare your resume directly with a job description to analyze your alignment score and parsing risks.
              </p>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Upload Resume (PDF)</Label>
              {!selectedFile ? (
                <label
                  className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 px-6 py-8 text-center hover:border-primary/50 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Upload your resume</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">PDF files up to 10MB</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg active:bg-red-500/10 transition-all"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Job Description Input Section */}
            <div className="space-y-2">
              <Label htmlFor="job-desc" className="text-sm font-semibold text-foreground">
                Job Description
              </Label>
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card p-5">
                <Textarea
                  id="job-desc"
                  placeholder="Paste the job description here to extract keywords and analyze compatibility..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[160px] bg-transparent border-0 resize-y text-sm leading-relaxed p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    <span>Analyze Match</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          analysisResult && (
            <div className="space-y-6">
              {/* Score and Prediction Summary */}
              <div className="grid grid-cols-3 gap-4 items-center rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                <div className="col-span-1 flex justify-center">
                  <MobileScoreRing score={analysisResult.score} size={84} />
                </div>
                <div className="col-span-2 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overall Match %</span>
                  <h3 className="font-display text-lg font-bold text-foreground mt-0.5 leading-tight">Match Rating</h3>
                  <p className="text-xs text-muted-foreground mt-1">Based on keyword matching and compatibility.</p>
                </div>
              </div>

              {/* ATS Prediction */}
              {prediction && (
                <div className={`rounded-2xl border p-5 ${prediction.color}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    <span className="font-display text-sm font-bold uppercase tracking-wider">{prediction.label}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed opacity-90">{prediction.desc}</p>
                </div>
              )}

              {/* Matching Skills */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Matching Skills</h3>
                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  {analysisResult.presentKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.presentKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-500"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No matching keywords found in JD.</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Missing Skills</h3>
                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  {analysisResult.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-500"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No missing scorable keywords identified.</p>
                  )}
                </div>
              </div>

              {/* Suggested Keywords */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Suggested Keywords to Add</h3>
                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  {analysisResult.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-400"
                        >
                          +{keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-500 font-medium">Your resume is fully keyword optimized!</p>
                  )}
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Strengths</h3>
                <div className="rounded-2xl border border-border/40 bg-card p-5">
                  {analysisResult.strengths.length > 0 ? (
                    <ul className="space-y-3">
                      {analysisResult.strengths.map((strength, i) => (
                        <li key={i} className="flex gap-3 text-xs leading-relaxed text-foreground">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No specific strengths parsed.</p>
                  )}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Weaknesses & Gaps</h3>
                <div className="rounded-2xl border border-border/40 bg-card p-5">
                  {analysisResult.suggestions.length > 0 ? (
                    <ul className="space-y-3">
                      {analysisResult.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex gap-3 text-xs leading-relaxed text-foreground">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-500 font-semibold">No critical alignment gaps identified!</p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {analysisResult.improvementSuggestions && analysisResult.improvementSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">AI Recommendations</h3>
                  <div className="rounded-2xl border border-border/40 bg-card p-5">
                    <ul className="space-y-4">
                      {analysisResult.improvementSuggestions.slice(0, 5).map((rec, i) => (
                        <li key={i} className="flex gap-3">
                          <Lightbulb className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-foreground">Add "{rec.keyword}"</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.suggestion}</p>
                            <p className="text-[10px] text-muted-foreground/75 italic">{rec.whyItMatters}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* New Scan Action */}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    setStep("input");
                    setAnalysisResult(null);
                  }}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Start New Analysis</span>
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </MobileShell>
  );
}

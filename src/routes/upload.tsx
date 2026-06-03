import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Upload, Loader2, Sparkles, ShieldCheck, FileText, Zap } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing-layout";
import { useAnalysisStore } from "@/store/analysisStore";
import { AnalysisProgressOverlay } from "@/components/analysis-progress-overlay";
import {
  type AnalysisProgressStepId,
  createProgressTracker,
} from "@/lib/ats/analysis-progress";
import { runResumeAnalysis } from "@/lib/ats/run-resume-analysis";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Resume — ResumePilot" },
      {
        name: "description",
        content: "Upload your resume PDF or paste text and run an instant ATS analysis.",
      },
    ],
  }),
  component: UploadPage,
});

const checks = [
  { id: "ats", label: "ATS Compatibility", icon: ShieldCheck },
  { id: "keywords", label: "Keyword Detection", icon: FileText },
  { id: "improvements", label: "Smart Suggestions", icon: Sparkles },
  { id: "fast", label: "Lightning Fast", icon: Zap },
];

function UploadPage() {
  const navigate = useNavigate();
  const setResult = useAnalysisStore((state) => state.setResult);
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [pastedRole, setPastedRole] = useState("");
  const [isPending, startTransition] = useTransition();
  const [activeStepId, setActiveStepId] = useState<AnalysisProgressStepId | null>(null);
  const [completedStepIds, setCompletedStepIds] = useState<Set<AnalysisProgressStepId>>(new Set());

  const handleAnalyze = useCallback(() => {
    const role = pastedRole.trim() || "Software Engineer";

    if (uploadMethod === "file") {
      if (!selectedFile) {
        toast.error("Please select a PDF file to analyze.");
        return;
      }
      startAnalysis(selectedFile, "", role);
    } else {
      const trimmed = pastedText.trim();
      if (trimmed.length < 100) {
        toast.error("Please paste at least 100 characters of your resume.");
        return;
      }
      startAnalysis(null, trimmed, role);
    }

    async function startAnalysis(file: File | null, text: string, targetRole: string) {
      startTransition(async () => {
        try {
          setActiveStepId(null);
          setCompletedStepIds(new Set());

          const progressReporter = createProgressTracker((activeId, completed) => {
            setActiveStepId(activeId);
            setCompletedStepIds(completed);
          });

          const result = await runResumeAnalysis({
            file,
            pastedText: text,
            role: targetRole,
            onProgress: progressReporter,
          });

          if (!result.success) {
            toast.error(result.error || "Analysis failed. Please try again.");
            return;
          }

          setResult(result.data, targetRole, result.fileName, result.resumeText, undefined, {
            animateEntry: true,
            usedBackupProvider: result.usedBackupProvider,
          });
          navigate({ to: "/result" });
        } catch (error) {
          console.error(error);
          toast.error("Analysis failed. Please try again.");
        }
      });
    }
  }, [
    uploadMethod,
    selectedFile,
    pastedText,
    pastedRole,
    setResult,
    navigate,
  ]);

  return (
    <>
      <AnalysisProgressOverlay
        open={isPending}
        phase={isPending ? "progress" : "success"}
        hasPdf={uploadMethod === "file"}
        hasJobDescription={false}
        activeStepId={activeStepId}
        completedStepIds={completedStepIds}
      />
      <MarketingLayout>
        <section className="relative overflow-hidden hero-ambient">
          <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                No signup needed
              </span>
              <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">
                Upload your resume
                <span className="block text-gradient">for ATS analysis</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                Get instant feedback on how compatible your resume is with automated tracking systems, plus targeted suggestions to improve.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <div className="flex gap-3 rounded-2xl border border-border bg-background/60 p-2 backdrop-blur">
                <button
                  onClick={() => setUploadMethod("file")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    uploadMethod === "file"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </button>
                <button
                  onClick={() => setUploadMethod("paste")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    uploadMethod === "paste"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {uploadMethod === "file" ? (
                <div className="mt-4">
                  <label className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-background/20 px-8 py-12 text-center hover:border-primary/60 transition-colors cursor-pointer">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload, or drag and drop</p>
                      <p className="mt-1 text-xs text-muted-foreground">PDF only (max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!file.name.toLowerCase().endsWith(".pdf")) {
                            toast.error("Please select a PDF file.");
                            return;
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("File is too large (max 10MB).");
                            return;
                          }
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-sm font-medium text-muted-foreground hover:text-accent-foreground transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Target role</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Developer Intern"
                      value={pastedRole}
                      onChange={(e) => setPastedRole(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring backdrop-blur"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Resume text</label>
                    <textarea
                      placeholder="Paste your resume text here..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="min-h-[200px] w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring backdrop-blur"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Target role</label>
                    <input
                      type="text"
                      placeholder="e.g. Product Manager"
                      value={pastedRole}
                      onChange={(e) => setPastedRole(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring backdrop-blur"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isPending}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant hover:-translate-y-0.5 transition-all h-12 rounded-xl px-6 text-base group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run ATS Analysis
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {checks.map((check) => {
                  const Icon = check.icon;
                  return (
                    <div key={check.id} className="rounded-xl border border-border bg-background/40 p-4 text-center backdrop-blur">
                      <Icon className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-2 text-xs font-medium">{check.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </MarketingLayout>
    </>
  );
}

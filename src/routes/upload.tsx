import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  Sparkles,
  KeyRound,
  FolderKanban,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { AnalysisProgressOverlay } from "@/components/analysis-progress-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { runResumeAnalysis } from "@/lib/ats/run-resume-analysis";
import {
  createProgressTracker,
  type AnalysisProgressStepId,
} from "@/lib/ats/analysis-progress";
import { useAnalysisStore } from "@/store/analysisStore";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Resume — ResumeCheck AI" },
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
  { id: "keywords", label: "Keyword Match", icon: KeyRound },
  { id: "projects", label: "Project Review", icon: FolderKanban },
  { id: "summary", label: "Summary & Skills", icon: Sparkles },
] as const;

const SUCCESS_TRANSITION_MS = 1400;

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selected, setSelected] = useState<string[]>(["ats", "keywords", "projects", "summary"]);
  const [loading, setLoading] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState<"progress" | "success">("progress");
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeStepId, setActiveStepId] = useState<AnalysisProgressStepId | null>(null);
  const [completedStepIds, setCompletedStepIds] = useState<Set<AnalysisProgressStepId>>(
    () => new Set(),
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const { setResult } = useAnalysisStore();

  const onPick = (f?: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    setFile(f);
  };

  const resetProgress = useCallback(() => {
    setActiveStepId(null);
    setCompletedStepIds(new Set());
    setOverlayPhase("progress");
  }, []);

  const analyze = async () => {
    if (!file && !text.trim()) {
      toast.error("Upload a resume or paste your resume text.");
      return;
    }
    if (!role.trim()) {
      toast.error("Enter a target role or paste a job description.");
      return;
    }

    setAnalysisError(null);
    setIsQuotaError(false);
    setLoading(true);
    setShowOverlay(true);
    resetProgress();

    const reportProgress = createProgressTracker((active, completed) => {
      setActiveStepId(active);
      setCompletedStepIds(completed);
    });

    try {
      const jd = jobDescription.trim();
      const result = await runResumeAnalysis({
        file,
        pastedText: text,
        role: role.trim(),
        jobDescription: jd || undefined,
        onProgress: reportProgress,
      });

      if (!result.success) {
        setShowOverlay(false);
        setLoading(false);
        setIsQuotaError(result.isQuotaError);
        const message = result.isQuotaError
          ? "Daily AI analysis limit reached. Please try again later or use another API key."
          : "Analysis failed. Please check your connection and try again.";
        setAnalysisError(message);
        toast.error(message);
        return;
      }

      setOverlayPhase("success");

      await new Promise((resolve) => setTimeout(resolve, SUCCESS_TRANSITION_MS));

      setResult(result.data, role.trim(), result.fileName, result.resumeText, jd || undefined, {
        animateEntry: true,
        usedBackupProvider: result.usedBackupProvider,
      });

      setShowOverlay(false);
      setLoading(false);
      navigate({ to: "/result" });
    } catch (error) {
      setShowOverlay(false);
      setLoading(false);
      const message =
        error instanceof Error ? error.message : "Analysis failed. Please try again.";
      setAnalysisError(message);
      toast.error(message);
    }
  };

  const hasPdf = Boolean(file);
  const hasJd = jobDescription.trim().length > 0;

  return (
    <MarketingLayout>
      <AnalysisProgressOverlay
        open={showOverlay}
        phase={overlayPhase}
        hasPdf={hasPdf}
        hasJobDescription={hasJd}
        activeStepId={activeStepId}
        completedStepIds={completedStepIds}
      />

      <section className="hero-ambient overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              Step 1 of 2
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Upload your resume</h1>
            <p className="mt-2 text-muted-foreground">
              We&apos;ll analyze it against your target role and return results in seconds.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/60 shadow-soft lg:col-span-2">
              <CardContent className="p-6 sm:p-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!loading) analyze();
                  }}
                >
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2" aria-label="Resume input method">
                      <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                      <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-5">
                      {!file ? (
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDrag(true);
                          }}
                          onDragLeave={() => setDrag(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDrag(false);
                            onPick(e.dataTransfer.files?.[0]);
                          }}
                          className={cn(
                            "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-6 py-14 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            drag
                              ? "border-primary bg-accent"
                              : "border-border hover:border-primary/60 hover:bg-accent/40",
                          )}
                          aria-label="Upload resume PDF by clicking or dragging a file"
                        >
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                            <UploadCloud className="h-7 w-7" aria-hidden />
                          </div>
                          <p className="font-display text-lg font-semibold">Drop your resume here</p>
                          <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
                          <p className="mt-4 text-xs text-muted-foreground">PDF only · Max 5MB</p>
                          <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf"
                            className="sr-only"
                            onChange={(e) => onPick(e.target.files?.[0])}
                            aria-label="Choose resume PDF file"
                          />
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"
                              aria-hidden
                            >
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Remove file ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="paste" className="mt-5">
                      <Label htmlFor="resume-text" className="sr-only">
                        Resume text
                      </Label>
                      <Textarea
                        id="resume-text"
                        placeholder="Paste your full resume text here…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[220px] resize-y"
                      />
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="role">Target role or job description</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Frontend Developer Intern at Razorpay"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      autoComplete="organization-title"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                          e.preventDefault();
                          analyze();
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Short title for your report header (e.g. Frontend Developer Intern).
                    </p>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="job-description">Paste Job Description</Label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste the full job description here for a tailored match score against this specific role…"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[200px] resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. When provided, we compare your resume directly to this job
                      description.
                    </p>
                  </div>

                  <fieldset className="mt-6">
                    <legend className="text-sm font-medium leading-none">Analysis options</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {checks.map((c) => {
                        const Icon = c.icon;
                        const checked = selected.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                              checked
                                ? "border-primary/60 bg-accent/40"
                                : "border-border hover:bg-muted/40",
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                setSelected(
                                  v ? [...selected, c.id] : selected.filter((x) => x !== c.id),
                                )
                              }
                              aria-label={c.label}
                            />
                            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="font-medium">{c.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {analysisError && (
                    <Alert variant="destructive" className="mt-6" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Analysis could not be completed</AlertTitle>
                      <AlertDescription className="space-y-3">
                        <p>{analysisError}</p>
                        {!isQuotaError && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 bg-background"
                            onClick={() => {
                              setAnalysisError(null);
                              analyze();
                            }}
                          >
                            Retry analysis
                          </Button>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="hero"
                    size="xl"
                    className="mt-7 w-full"
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Analyzing…
                      </>
                    ) : (
                      <>
                        Analyze Resume <ArrowRight className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    What we check
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">A recruiter-grade review</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    "ATS parser compatibility & layout safety",
                    "Keyword match against the target role",
                    "Project bullets — impact, metrics & stack",
                    "Summary, skills and experience clarity",
                    "Formatting, fonts & section structure",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span className="text-muted-foreground">{x}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-lg bg-accent/40 p-4 text-xs text-muted-foreground">
                  Upload a resume to generate your personalized ATS report in seconds.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

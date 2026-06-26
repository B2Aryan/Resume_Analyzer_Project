import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileShell } from "@/components/mobile/MobileShell";
import { toast } from "sonner";
import { extractTextFromPDF } from "@/lib/ats/pdf-parser";
import { generateCoverLetter } from "@/lib/ats/cover-letter";
import { downloadCoverLetterPdf } from "@/lib/pdf/cover-letter-pdf";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { canGenerateCoverLetter, incrementCoverLetterUsage } from "@/lib/supabase/usage";
import { hasPremiumAccess } from "@/lib/access";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PremiumLockOverlay } from "@/components/PremiumLockOverlay";
import {
  ChevronLeft,
  FileText,
  Upload,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/cover-letter")({
  head: () => ({
    meta: [{ title: "Cover Letter Generator — ResumePilot" }],
  }),
  component: CoverLetterPage,
});

function CoverLetterPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const queryClient = useQueryClient();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Fetch cover letter usage status
  const { data: usage } = useQuery({
    queryKey: ["coverLetterUsage", user?.id],
    queryFn: () => (user ? canGenerateCoverLetter(user) : null),
    enabled: !!user,
  });

  const isPremium = hasPremiumAccess(profile || usage?.profile);

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
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Workflow states
  const [isPending, startTransition] = useTransition();
  const [coverLetter, setCoverLetter] = useState("");
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

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error("Please upload your resume.");
      return;
    }
    if (!jobTitle.trim()) {
      toast.error("Please enter the target Job Title.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please enter the Job Description.");
      return;
    }

    if (user) {
      const { canRun } = await canGenerateCoverLetter(user);
      if (!canRun) {
        setUpgradeModalOpen(true);
        return;
      }
    }

    startTransition(async () => {
      try {
        // Extract text
        const resumeText = await extractTextFromPDF(selectedFile);
        const candidateName =
          profile?.username ??
          user?.user_metadata?.full_name ??
          user?.email?.split("@")[0] ??
          "Candidate";

        // Call AI generator
        const result = await generateCoverLetter({
          resumeText,
          targetRole: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          candidateName,
        });

        if (result.success) {
          if (user) {
            await incrementCoverLetterUsage(user);
            queryClient.invalidateQueries({ queryKey: ["coverLetterUsage", user.id] });
            queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          }
          setCoverLetter(result.data.coverLetter);
          setStep("result");
          toast.success("Cover letter generated successfully!");
        } else {
          toast.error(result.error || "Failed to generate cover letter.");
        }
      } catch (error: any) {
        console.error("Cover letter error:", error);
        toast.error(error.message || "Failed to parse PDF or generate cover letter.");
      }
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success("Cover letter copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownload = () => {
    try {
      downloadCoverLetterPdf(coverLetter, jobTitle.trim() || "Cover Letter");
      toast.success("PDF download started.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF.");
    }
  };

  if (isDesktop) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const usedCount = usage?.profile?.cover_letters_used ?? 0;

  return (
    <MobileShell>
      <PremiumLockOverlay isLocked={!user} type="full">
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
              {step === "input" ? "Cover Letter Generator" : "Generated Letter"}
            </h1>
          </div>

          {step === "input" ? (
            <div className="space-y-5">
              {/* Header info */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Generate professional, job-tailored cover letters in seconds.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 font-semibold">
                    Usage: <span className="font-bold text-foreground">{isPremium ? "Unlimited" : `${usedCount}/3 Used`}</span>
                  </span>
                  {!isPremium && <span>3 free cover letters every month</span>}
                </div>
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

              {/* Inputs Section */}
              <div className="space-y-4 rounded-2xl border border-border/40 bg-card p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="job-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Job Title *
                  </Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="bg-background/50 border-border/60"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Company Name (Optional)
                  </Label>
                  <Input
                    id="company-name"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-background/50 border-border/60"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Job Description *
                  </Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px] bg-background/50 border-border/60 resize-y text-sm leading-relaxed"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Letter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Cover Letter</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Output edit area */}
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="min-h-[350px] w-full bg-transparent border-0 resize-none font-sans text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-foreground"
                  placeholder="Your generated cover letter will show here..."
                />
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="h-12 border-border/60 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="h-12 border-border/60 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="pt-1 space-y-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>{isPending ? "Regenerating..." : "Regenerate"}</span>
                </Button>
                <Button
                  onClick={() => setStep("input")}
                  variant="ghost"
                  className="w-full h-11 text-muted-foreground rounded-xl active:bg-muted/50 font-medium"
                >
                  Create New Letter
                </Button>
              </div>
            </div>
          )}
        </div>
      </PremiumLockOverlay>
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} feature="cover letter generations" />
    </MobileShell>
  );
}

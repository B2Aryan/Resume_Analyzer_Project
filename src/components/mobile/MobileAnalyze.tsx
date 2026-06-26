import { ShieldCheck, FileText, Sparkles, Zap, Upload, Loader2, ArrowRight } from "lucide-react";
import { MobileShell } from "./MobileShell";
import { RoleAutocomplete } from "@/components/role-autocomplete";
import { toast } from "sonner";

interface MobileAnalyzeProps {
  uploadMethod: "file" | "paste";
  setUploadMethod: (method: "file" | "paste") => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  pastedRole: string;
  setPastedRole: (role: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  isPending: boolean;
  handleAnalyze: () => void;
}

const checks = [
  { id: "ats", label: "ATS Compatibility", icon: ShieldCheck },
  { id: "keywords", label: "Keyword Detection", icon: FileText },
  { id: "improvements", label: "Smart Suggestions", icon: Sparkles },
  { id: "fast", label: "Lightning Fast", icon: Zap },
];

export function MobileAnalyze({
  uploadMethod,
  setUploadMethod,
  selectedFile,
  setSelectedFile,
  pastedText,
  setPastedText,
  pastedRole,
  setPastedRole,
  jobDescription,
  setJobDescription,
  isPending,
  handleAnalyze,
}: MobileAnalyzeProps) {
  return (
    <MobileShell>
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-10 bg-background text-foreground">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Analyze Resume
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your resume for ATS analysis and target role matching.
          </p>
        </div>

        {/* Selector */}
        <div className="relative flex rounded-2xl bg-muted p-1 mb-5">
          <div
            className="absolute bottom-1 top-1 rounded-xl bg-card shadow-sm transition-all duration-300 ease-out"
            style={{
              left: uploadMethod === "file" ? "4px" : "calc(50% + 2px)",
              width: "calc(50% - 6px)",
            }}
          />
          <button
            onClick={() => setUploadMethod("file")}
            className={`relative z-10 flex-1 py-2.5 text-xs font-semibold transition-colors duration-200 ${
              uploadMethod === "file" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Upload PDF
          </button>
          <button
            onClick={() => setUploadMethod("paste")}
            className={`relative z-10 flex-1 py-2.5 text-xs font-semibold transition-colors duration-200 ${
              uploadMethod === "paste" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* Main Content Areas */}
        {uploadMethod === "file" ? (
          <div className="space-y-4">
            <label
              className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 px-6 py-9 text-center hover:border-primary/50 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary/60");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("border-primary/60");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary/60");
                const file = e.dataTransfer.files?.[0];
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
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  PDF format only • Max size 10MB
                </p>
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
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-500/10 active:scale-95"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Resume Text
            </label>
            <textarea
              placeholder="Paste your resume text here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[160px] w-full rounded-2xl border border-border/50 bg-card/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all resize-y shadow-sm"
            />
          </div>
        )}

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Target Role
            </label>
            <RoleAutocomplete
              value={pastedRole}
              onChange={setPastedRole}
              placeholder="e.g. Frontend Developer Intern"
              className="bg-card/60 border-border/50 focus:ring-primary/40 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Job Description (Recommended)
            </label>
            <textarea
              placeholder="Paste job posting details here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[140px] w-full rounded-2xl border border-border/50 bg-card/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all resize-y shadow-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Adding the job description helps target recommendations for compatibility analysis.
            </p>
          </div>
        </div>

        {/* Run analysis CTA */}
        <div className="mt-6 relative">
          {/* Glow layer */}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 -bottom-2 h-8 rounded-full bg-blue-500/40 blur-xl transition-opacity duration-300 pointer-events-none"
            style={{ opacity: isPending ? 0.3 : 0.7 }}
          />
          <button
            onClick={handleAnalyze}
            disabled={isPending}
            style={{
              background: isPending
                ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                : "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              boxShadow: isPending
                ? "none"
                : "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(59,130,246,0.45)",
            }}
            className="relative w-full h-[58px] rounded-full flex items-center justify-center gap-2.5 font-bold text-[15px] text-white tracking-wide transition-all duration-200 active:scale-[0.97] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden select-none"
          >
            {isPending ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin shrink-0" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <span>Run ATS Analysis</span>
                <ArrowRight className="h-[18px] w-[18px] shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <div
                key={check.id}
                className="rounded-2xl border border-border/40 bg-card/50 p-4 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-foreground leading-tight">
                  {check.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}

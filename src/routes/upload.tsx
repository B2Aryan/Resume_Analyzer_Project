import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { UploadCloud, FileText, X, ShieldCheck, Sparkles, KeyRound, FolderKanban, ArrowRight, Loader2 } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Resume — ResumeCheck AI" },
      { name: "description", content: "Upload your resume PDF or paste text and run an instant ATS analysis." },
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

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [selected, setSelected] = useState<string[]>(["ats", "keywords", "projects", "summary"]);
  const [loading, setLoading] = useState(false);

  const onPick = (f?: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5MB."); return; }
    if (!f.name.toLowerCase().endsWith(".pdf")) { toast.error("Please upload a PDF file."); return; }
    setFile(f);
  };

  const analyze = () => {
    if (!file && !text.trim()) { toast.error("Upload a resume or paste your resume text."); return; }
    if (!role.trim()) { toast.error("Enter a target role or paste a job description."); return; }
    setLoading(true);
    setTimeout(() => navigate({ to: "/result" }), 1400);
  };

  return (
    <MarketingLayout>
      <section className="hero-ambient">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              Step 1 of 2
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Upload your resume</h1>
            <p className="mt-2 text-muted-foreground">We'll analyze it against your target role and return results in seconds.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/60 shadow-soft lg:col-span-2">
              <CardContent className="p-6 sm:p-8">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-5">
                    {!file ? (
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={(e) => { e.preventDefault(); setDrag(false); onPick(e.dataTransfer.files?.[0]); }}
                        className={cn(
                          "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-6 py-14 text-center transition-all",
                          drag ? "border-primary bg-accent" : "border-border hover:border-primary/60 hover:bg-accent/40"
                        )}
                      >
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                          <UploadCloud className="h-7 w-7" />
                        </div>
                        <p className="font-display text-lg font-semibold">Drop your resume here</p>
                        <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
                        <p className="mt-4 text-xs text-muted-foreground">PDF only · Max 5MB</p>
                        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => onPick(e.target.files?.[0])} />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size/1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button onClick={() => setFile(null)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paste" className="mt-5">
                    <Textarea
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
                  />
                  <p className="text-xs text-muted-foreground">Tip: pasting the full JD gives the best keyword match.</p>
                </div>

                <div className="mt-6">
                  <Label>Analysis options</Label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {checks.map((c) => {
                      const Icon = c.icon;
                      const checked = selected.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                            checked ? "border-primary/60 bg-accent/40" : "border-border hover:bg-muted/40"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => setSelected(v ? [...selected, c.id] : selected.filter(x => x !== c.id))}
                          />
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={analyze} disabled={loading} variant="hero" size="xl" className="mt-7 w-full">
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>) : (<>Analyze Resume <ArrowRight className="h-4 w-4" /></>)}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">What we check</span>
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
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{x}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-lg bg-accent/40 p-4 text-xs text-muted-foreground">
                  Want a sample first? <Link to="/result" className="font-medium text-primary hover:underline">View example report →</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

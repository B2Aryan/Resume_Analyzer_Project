import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  FileText, 
  Play, 
  CheckCircle,
  HelpCircle,
  Clock,
  Bookmark,
  Loader2
} from "lucide-react";
import { MobileShell } from "./MobileShell";
import { MobileScoreRing } from "./MobileScoreRing";
import { toast } from "sonner";
import type { ActionPlan, ActionPlanItem } from "@/lib/ats/action-plan";
import type { ImprovementSuggestion, JDMatchResult } from "@/lib/ats/types";

interface MobileResultsProps {
  role: string;
  fileName: string;
  score: number;
  atsCompatibility: number;
  keywordMatch: number;
  skillsScore: number;
  projectScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  strengths: string[];
  suggestions: string[];
  summary: string;
  hasJobDescription: boolean;
  jdMatch: JDMatchResult | null;
  improvementSuggestions: ImprovementSuggestion[];
  resumeText: string;
  jobDescription: string;
  handleDownloadPdf: () => void;
  actionPlan: ActionPlan;
  breakdown: Array<{ label: string; value: number; hint: string }>;
  sidebarMissingKeywords: string[];
  /* Save / bookmark */
  isSaved: boolean;
  analysisId: string | null;
  onSaveToggle: () => void;
  isSaveLoading: boolean;
  isLoggedIn: boolean;
}

export function MobileResults({
  role,
  fileName,
  score,
  atsCompatibility,
  keywordMatch,
  skillsScore,
  projectScore,
  missingKeywords,
  presentKeywords,
  strengths,
  suggestions,
  summary,
  hasJobDescription,
  jdMatch,
  improvementSuggestions,
  resumeText,
  jobDescription,
  handleDownloadPdf,
  actionPlan,
  breakdown,
  sidebarMissingKeywords,
  isSaved,
  analysisId,
  onSaveToggle,
  isSaveLoading,
  isLoggedIn,
}: MobileResultsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSuggestions, setExpandedSuggestions] = useState<Record<string, boolean>>({});
  const [expandedTimeline, setExpandedTimeline] = useState<Record<string, boolean>>({});
  const [resumeExpanded, setResumeExpanded] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Web Share API handler
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My ResumePilot ATS Report",
          text: `My resume got an ATS score of ${score}/100 on ResumePilot!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Report link copied to clipboard!");
      } catch {
        toast.error("Could not copy link.");
      }
    }
  };

  // Helper to map timeline item to a category tag
  const getCategory = (item: ActionPlanItem): string => {
    const id = item.id.toLowerCase();
    const title = item.title.toLowerCase();
    if (id.includes("kw") || id.includes("keyword") || title.includes("keyword")) return "Keywords";
    if (id.includes("project") || title.includes("project")) return "Projects";
    if (id.includes("skills") || title.includes("skills")) return "Skills";
    if (id.includes("format") || title.includes("format") || title.includes("heading")) return "Formatting";
    if (id.includes("summary") || title.includes("summary")) return "Summary";
    if (id.includes("proofread") || title.includes("proofread") || title.includes("tense")) return "Readability";
    return "General";
  };

  // Organize issues into Critical, Important, and Minor dynamically
  const issueGroups = useMemo(() => {
    const critical = [];
    const important = [];
    const minor = [];

    if (atsCompatibility < 65) {
      critical.push({
        id: "crit-ats",
        title: "Section Heading Parse Failure",
        description: "Standard ATS systems may fail to parse your resume content because of non-standard section headers or a multi-column template format.",
        fix: "Change headings to standard labels like 'Experience', 'Education', 'Projects' and use a clean single-column layout.",
      });
    }

    const missingKeywordsCount = sidebarMissingKeywords.length;
    if (missingKeywordsCount > 6) {
      critical.push({
        id: "crit-kw",
        title: "Major Keyword Deficit",
        description: `Your resume is missing ${missingKeywordsCount} core technical keywords required for a typical ${role} role.`,
        fix: `Review the list of missing keywords below and weave them naturally into your job descriptions.`,
      });
    } else if (missingKeywordsCount > 0) {
      important.push({
        id: "imp-kw",
        title: "Missing Skills Alignment",
        description: `Key tools and frameworks mentioned in the target role profile are missing from your text.`,
        fix: `Add missing terms to your technical skills summary.`,
      });
    }

    if (projectScore < 70) {
      important.push({
        id: "imp-projects",
        title: "Lack of Quantifiable Metrics",
        description: "Your experience bullets describe duties instead of accomplishments. Recruiter screening rates double when metrics (%, $, numbers) are present.",
        fix: "Rewrite experience bullets showing action, context, and a clear quantitative result.",
      });
    }

    if (skillsScore < 70) {
      important.push({
        id: "imp-skills",
        title: "Poorly Organized Technical Skills",
        description: "Your tech stack is displayed in a single wall of text rather than parsed groups.",
        fix: "Categorize skills under subheaders like Languages, Frameworks, Developer Tools.",
      });
    }

    // Process raw recommendations
    suggestions.forEach((sug, index) => {
      const text = sug.trim();
      if (!text) return;
      
      const lower = text.toLowerCase();
      const isCrit = lower.includes("critical") || lower.includes("must") || lower.includes("error") || lower.includes("fail");
      const item = {
        id: `sug-issue-${index}`,
        title: text,
        description: "Identified during ATS parsing scan review.",
        fix: "Apply the suggested adjustment and scan again to verify.",
      };

      if (isCrit) {
        critical.push(item);
      } else if (index % 2 === 0) {
        important.push(item);
      } else {
        minor.push(item);
      }
    });

    // Fallback item if clean
    if (critical.length === 0 && important.length === 0 && minor.length === 0) {
      minor.push({
        id: "minor-clean",
        title: "Overall clean scan",
        description: "No major format or keyword issues detected on initial scan.",
        fix: "Review missing keywords list to polish alignment.",
      });
    }

    return { critical, important, minor };
  }, [atsCompatibility, sidebarMissingKeywords, role, projectScore, skillsScore, suggestions]);

  // Expandable suggestion list items
  const normalizedSuggestions = useMemo(() => {
    const list = improvementSuggestions.map((item, index) => ({
      id: `ai-rec-${item.keyword}-${index}`,
      title: `Keyword coaching: ${item.keyword}`,
      badge: item.keyword,
      whyItMatters: item.whyItMatters,
      suggestion: item.suggestion,
    }));

    suggestions.forEach((text, index) => {
      if (list.some(item => item.whyItMatters.toLowerCase().includes(text.toLowerCase().slice(0, 30)))) return;
      list.push({
        id: `tip-rec-${index}`,
        title: `Quick suggestion #${index + 1}`,
        badge: "Quick Win",
        whyItMatters: text,
        suggestion: "Refine this section of your resume to make it stand out.",
      });
    });

    return list;
  }, [improvementSuggestions, suggestions]);

  return (
    <MobileShell>
      <div className="bg-background text-foreground min-h-screen pb-16">
        
        {/* Header Section */}
        <header className="px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 border-b border-border/40 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/upload" className="p-1 rounded-full hover:bg-muted active:scale-90 transition-all">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ATS Score Report</h2>
              <h1 className="text-base font-bold text-foreground font-display truncate max-w-[250px]">{role}</h1>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-xl p-2 px-3">
            <span className="truncate">📄 {fileName}</span>
            <span>{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
        </header>

        {/* Hero Score Card */}
        <section className="px-4 py-5" id="section-overview">
          <div className="relative rounded-2xl border border-border/40 bg-card p-5 shadow-sm text-center">
            {/* Bookmark — top-right corner, absolute so it doesn't shift any element */}
            {isLoggedIn && (
              <button
                onClick={onSaveToggle}
                disabled={isSaveLoading || !analysisId}
                aria-label={isSaved ? "Remove from saved" : "Save report"}
                className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 hover:bg-muted active:scale-90 disabled:opacity-50"
              >
                {isSaveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : isSaved ? (
                  <Bookmark className="h-4.5 w-4.5 fill-primary text-primary" style={{ width: 18, height: 18 }} />
                ) : (
                  <Bookmark className="h-4.5 w-4.5 text-muted-foreground" style={{ width: 18, height: 18 }} />
                )}
              </button>
            )}

            <div className="flex justify-center mb-3">
              <MobileScoreRing score={score} size={110} />
            </div>
            
            <h3 className="font-display text-lg font-bold text-foreground">
              {score >= 80 ? "Recruiter Ready!" : score >= 60 ? "Solid Foundation" : "Needs Layout Work"}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {summary || `Your resume fits around ${score}% of automated screening criteria for ${role}.`}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2.5 text-xs font-bold text-foreground transition-all active:scale-[0.97]"
              >
                <Download className="h-3.5 w-3.5" />
                Download Report
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2.5 text-xs font-bold text-foreground transition-all active:scale-[0.97]"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share Report
              </button>
            </div>
          </div>
        </section>

        {/* Quick Summary scroll bar */}
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-none">
          <div className="min-w-[130px] rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ATS Score</span>
            <p className="mt-1.5 font-display text-2xl font-bold text-primary">{score}%</p>
          </div>
          <div className="min-w-[130px] rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Compatibility</span>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{atsCompatibility}%</p>
          </div>
          <div className="min-w-[130px] rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Keywords Match</span>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{keywordMatch}%</p>
          </div>
          <div className="min-w-[130px] rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Projects Bullets</span>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{projectScore}%</p>
          </div>
          <div className="min-w-[130px] rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Skills Section</span>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{skillsScore}%</p>
          </div>
        </div>

        {/* Sticky Segmented Navigation */}
        <nav className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/40 py-2.5 flex items-center justify-around px-2 shadow-sm">
          {[
            { id: "overview", label: "Overview" },
            { id: "issues", label: "Issues" },
            { id: "suggestions", label: "Suggestions" },
            { id: "keywords", label: "Keywords" },
            { id: "resume", label: "Resume" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 1. Overview Section: Breakdown & Timeline */}
        <div className="px-4 py-4 space-y-6">
          
          {/* Score Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Score Breakdown</h3>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-semibold mb-1">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-primary font-display">{item.value}/100</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.value}%` }} 
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan Improvement Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority Action Plan</h3>
            <div className="space-y-3 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
              {actionPlan.items.slice(0, 6).map((item, index) => {
                const category = getCategory(item);
                const isExpanded = !!expandedTimeline[item.id];
                
                return (
                  <div key={item.id} className="relative pl-12">
                    {/* Circle Node */}
                    <div className={`absolute left-3 top-3 h-6 w-6 rounded-full flex items-center justify-center border font-display text-[10px] font-bold z-10 shadow-sm ${
                      item.priority === "high" 
                        ? "bg-red-500/10 text-red-500 border-red-500/20" 
                        : item.priority === "medium"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }`}>
                      {index + 1}
                    </div>

                    <div 
                      onClick={() => setExpandedTimeline(prev => ({ ...prev, [item.id]: !isExpanded }))}
                      className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm cursor-pointer active:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          item.priority === "high" 
                            ? "bg-red-500/10 text-red-500" 
                            : item.priority === "medium"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">{category}</span>
                      </div>

                      <h4 className="mt-2 text-sm font-semibold text-foreground leading-snug">{item.title}</h4>
                      
                      <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.effort}</span>
                        <span>Impact: <strong className="text-foreground">{item.expectedAtsImpact}</strong></span>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                          <p className="font-semibold text-foreground mb-1">Why this matters:</p>
                          {item.whyItMatters}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Issues Section */}
        <section className="px-4 py-6 border-t border-border/40 scroll-mt-14" id="section-issues">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Layout & Format Issues</h2>
            <p className="text-xs text-muted-foreground">Critical problems blocking automated scanning.</p>
          </div>

          <div className="space-y-4">
            {/* Critical Issues */}
            {issueGroups.critical.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-red-500 font-semibold text-xs uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4" />
                  <span>Critical ({issueGroups.critical.length})</span>
                </div>
                {issueGroups.critical.map((issue) => (
                  <div key={issue.id} className="rounded-2xl border-l-4 border-l-red-500 border border-border/40 bg-card p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                    <div className="mt-3 bg-red-500/5 rounded-xl p-3 border border-red-500/10 text-xs">
                      <strong className="text-red-500 font-semibold">How to fix:</strong>
                      <p className="mt-0.5 text-muted-foreground leading-relaxed">{issue.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Important Issues */}
            {issueGroups.important.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Important ({issueGroups.important.length})</span>
                </div>
                {issueGroups.important.map((issue) => (
                  <div key={issue.id} className="rounded-2xl border-l-4 border-l-amber-500 border border-border/40 bg-card p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                    <div className="mt-3 bg-amber-500/5 rounded-xl p-3 border border-amber-500/10 text-xs">
                      <strong className="text-amber-500 font-semibold">How to fix:</strong>
                      <p className="mt-0.5 text-muted-foreground leading-relaxed">{issue.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Minor Issues */}
            {issueGroups.minor.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-blue-500 font-semibold text-xs uppercase tracking-wider">
                  <Info className="h-4 w-4" />
                  <span>Minor ({issueGroups.minor.length})</span>
                </div>
                {issueGroups.minor.map((issue) => (
                  <div key={issue.id} className="rounded-2xl border-l-4 border-l-blue-500 border border-border/40 bg-card p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                    <div className="mt-3 bg-blue-500/5 rounded-xl p-3 border border-blue-500/10 text-xs">
                      <strong className="text-blue-500 font-semibold">How to fix:</strong>
                      <p className="mt-0.5 text-muted-foreground leading-relaxed">{issue.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. Suggestions Coaching Section */}
        <section className="px-4 py-6 border-t border-border/40 scroll-mt-14" id="section-suggestions">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Bullet Improvement Hub</h2>
            <p className="text-xs text-muted-foreground">Actionable coaching suggestions to rewrite resume lines.</p>
          </div>

          <div className="space-y-3">
            {normalizedSuggestions.map((rec) => {
              const isExpanded = !!expandedSuggestions[rec.id];
              return (
                <div key={rec.id} className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setExpandedSuggestions(prev => ({ ...prev, [rec.id]: !isExpanded }))}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer active:bg-muted/10 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                        {rec.badge}
                      </span>
                      <h4 className="mt-1.5 text-sm font-semibold text-foreground truncate">{rec.title}</h4>
                    </div>
                    <div className="p-1 text-muted-foreground shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/30 bg-muted/10 space-y-3 text-xs animate-fade-in">
                      <div>
                        <p className="font-bold text-foreground mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Why this matters</p>
                        <p className="text-muted-foreground leading-relaxed">{rec.whyItMatters}</p>
                      </div>
                      
                      {rec.suggestion && (
                        <div className="bg-card rounded-xl p-3 border border-border/40 relative">
                          <p className="font-bold text-foreground mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Suggested Bullet Phrasing</p>
                          <p className="text-foreground leading-relaxed pr-8">{rec.suggestion}</p>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await navigator.clipboard.writeText(rec.suggestion);
                                toast.success("Coaching suggestion copied!");
                              } catch {
                                toast.error("Could not copy suggestion.");
                              }
                            }}
                            className="absolute right-3 top-3 p-1.5 rounded-lg border border-border bg-card hover:bg-muted active:scale-90 transition-all text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Keyword Analysis Section */}
        <section className="px-4 py-6 border-t border-border/40 scroll-mt-14" id="section-keywords">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Keyword Analysis</h2>
            <p className="text-xs text-muted-foreground">Compare matched vs missing technical terms.</p>
          </div>

          <div className="space-y-5">
            {/* Missing Keywords */}
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-red-500 font-semibold text-xs uppercase tracking-wider">
                <AlertCircle className="h-4 w-4" />
                <span>Missing Keywords ({sidebarMissingKeywords.length})</span>
              </div>
              {sidebarMissingKeywords.length === 0 ? (
                <p className="text-xs text-muted-foreground">No missing keywords! Your technical alignment is perfect.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sidebarMissingKeywords.map((kw) => (
                    <span 
                      key={kw} 
                      className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Matched Keywords */}
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-green-500 font-semibold text-xs uppercase tracking-wider">
                <CheckCircle className="h-4 w-4" />
                <span>Matched Keywords ({presentKeywords.length})</span>
              </div>
              {presentKeywords.length === 0 ? (
                <p className="text-xs text-muted-foreground">No matched keywords found yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {presentKeywords.map((kw) => (
                    <span 
                      key={kw} 
                      className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-xs font-semibold text-green-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Resume Preview Section */}
        <section className="px-4 py-6 border-t border-border/40 scroll-mt-14" id="section-resume">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Parsed Resume Preview</h2>
            <p className="text-xs text-muted-foreground">View the exact text parsed and reviewed by our system.</p>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            <div 
              onClick={() => setResumeExpanded(!resumeExpanded)}
              className="p-4 flex items-center justify-between cursor-pointer active:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Resume Plain Text</span>
              </div>
              <div className="text-muted-foreground p-1">
                {resumeExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>

            {resumeExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-border/30 bg-muted/10 animate-fade-in">
                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-border bg-card p-3 font-mono text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap select-text">
                  {resumeText || "No plain text representation found."}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* bottom actions CTA */}
        <section className="px-4 py-5 border-t border-border/40 space-y-3">
          <button
            onClick={handleDownloadPdf}
            className="w-full inline-flex items-center justify-center gap-2 font-bold bg-gradient-primary text-primary-foreground shadow-glow active:scale-[0.98] transition-all h-12 rounded-2xl text-sm"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
          
          <Link
            to="/upload"
            className="w-full inline-flex items-center justify-center gap-2 font-bold border border-border bg-card text-foreground active:scale-[0.98] transition-all h-12 rounded-2xl text-sm"
          >
            Analyze Again
          </Link>

          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 font-bold border border-border bg-muted text-muted-foreground h-12 rounded-2xl text-sm opacity-60"
          >
            Mock Interview (Coming Soon)
          </button>
        </section>
      </div>
    </MobileShell>
  );
}

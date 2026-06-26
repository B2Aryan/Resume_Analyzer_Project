/**
 * MobileHistory — mobile/tablet (<1024px) redesign of the Analysis History page.
 * All business logic (queries, delete, share, navigation) is delegated via props
 * from dashboard.history.tsx. This file is presentation-only.
 */
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Search,
  FileText,
  Trash2,
  Eye,
  RefreshCw,
  Link2,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MobileShell } from "./MobileShell";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface HistoryAnalysis {
  id: string;
  file_name: string;
  role: string;
  created_at: string;
  analysis_result: { score: number };
  resume_text?: string;
  job_description?: string;
  is_saved?: boolean;
  is_public?: boolean;
  interview_questions?: unknown;
}

interface MobileHistoryProps {
  analyses: HistoryAnalysis[];
  isLoading: boolean;
  onViewReport: (analysis: HistoryAnalysis) => void;
  onDeleteRequest: (analysisId: string) => void;
  onShareReport: (analysis: HistoryAnalysis) => void;
  shareLoadingId: string | null;
  onRefresh: () => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (open: boolean) => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
}

/* ─── Score badge ────────────────────────────────────────────────────────── */

function ScoreBadge({ score }: { score: number }) {
  const config =
    score >= 80
      ? { bg: "bg-green-500/15", text: "text-green-500", ring: "ring-green-500/30" }
      : score >= 60
      ? { bg: "bg-amber-500/15", text: "text-amber-500", ring: "ring-amber-500/30" }
      : { bg: "bg-red-500/15", text: "text-red-500", ring: "ring-red-500/30" };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${config.bg} ${config.text} ${config.ring}`}
    >
      {score}
    </span>
  );
}

/* ─── History Card ───────────────────────────────────────────────────────── */

interface HistoryCardProps {
  analysis: HistoryAnalysis;
  onView: () => void;
  onReanalyze: () => void;
  onDelete: () => void;
  onShare: () => void;
  shareLoading: boolean;
}

function HistoryCard({ analysis, onView, onReanalyze, onDelete, onShare, shareLoading }: HistoryCardProps) {
  const score = analysis.analysis_result.score;
  const timeAgo = formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true });

  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      {/* Clickable top area */}
      <button onClick={onView} className="w-full flex items-start gap-3 p-4 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate text-[14px] font-semibold leading-snug">{analysis.file_name}</p>
            {analysis.interview_questions && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                🎤 Interview Ready
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{analysis.role}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo}</p>
        </div>
        <ScoreBadge score={score} />
      </button>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/40" />

      {/* Action row */}
      <div className="flex items-center justify-end gap-1 px-3 py-2">
        <button
          onClick={onShare}
          disabled={shareLoading}
          aria-label="Copy share link"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90 disabled:opacity-40"
        >
          {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
        </button>

        <button
          onClick={onView}
          aria-label="Open report"
          className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-95"
        >
          <Eye className="h-3.5 w-3.5" />
          Open
        </button>

        <button
          onClick={onReanalyze}
          aria-label="Reanalyze"
          className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Redo
        </button>

        <button
          onClick={onDelete}
          aria-label="Delete"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 active:scale-90"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Delete Confirmation Sheet ──────────────────────────────────────────── */

function DeleteSheet({ open, isDeleting, onCancel, onConfirm }: { open: boolean; isDeleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={!isDeleting ? onCancel : undefined} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t border-border/50 shadow-2xl px-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-6">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Trash2 className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-center text-lg font-bold">Delete this report?</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          This action cannot be undone. The report will be permanently removed.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="h-12 rounded-2xl border border-border bg-muted font-semibold text-sm transition-all hover:bg-muted/80 active:scale-95 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-12 rounded-2xl bg-red-500 font-semibold text-sm text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</> : "Delete Report"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function MobileHistory({
  analyses,
  isLoading,
  onViewReport,
  onDeleteRequest,
  onShareReport,
  shareLoadingId,
  onRefresh,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  isDeleting,
  onConfirmDelete,
}: MobileHistoryProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = analyses.filter(
    (a) =>
      a.file_name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MobileShell>
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-10">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Analysis History</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Browse all your previous resume analyses.
            </p>
          </div>
          <button
            onClick={onRefresh}
            aria-label="Refresh history"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-card text-muted-foreground transition-all hover:text-foreground active:scale-90"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by resume or target role"
            className="h-11 w-full rounded-full border border-border/40 bg-card pl-10 pr-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Primary CTA */}
        <div className="relative mb-6">
          <div aria-hidden="true" className="absolute inset-x-6 -bottom-2 h-6 rounded-full bg-blue-500/35 blur-xl pointer-events-none" />
          <Link
            to="/upload"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 18px rgba(59,130,246,0.4)",
            }}
            className="relative flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full font-bold text-[15px] text-white tracking-wide transition-all active:scale-[0.97] hover:brightness-110 select-none"
          >
            New Analysis
            <ArrowRight className="h-[17px] w-[17px] shrink-0" />
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-base font-semibold">
              {search ? "No matching analyses" : "No analyses yet"}
            </p>
            <p className="mt-2 max-w-[220px] text-sm text-muted-foreground leading-relaxed">
              {search ? "Try a different search term." : "Analyze your first resume to start building your history."}
            </p>
            {!search && (
              <Link
                to="/upload"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }}
                className="mt-6 flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-sm text-white transition-all active:scale-95"
              >
                Analyze Resume
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="px-1 text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "analysis" : "analyses"}
              {search ? ` matching "${search}"` : ""}
            </p>
            {filtered.map((analysis) => (
              <HistoryCard
                key={analysis.id}
                analysis={analysis}
                onView={() => onViewReport(analysis)}
                onReanalyze={() => navigate({ to: "/upload" })}
                onDelete={() => onDeleteRequest(analysis.id)}
                onShare={() => onShareReport(analysis)}
                shareLoading={shareLoadingId === analysis.id}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteSheet
        open={deleteConfirmOpen}
        isDeleting={isDeleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={onConfirmDelete}
      />
    </MobileShell>
  );
}

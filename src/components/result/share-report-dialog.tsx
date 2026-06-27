import { useState, useCallback } from "react";
import { Copy, Check, Loader2, Share2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string | null;
  isPublic: boolean;
  onTogglePublic: () => Promise<void>;
  isToggleLoading: boolean;
  score: number;
}

export function ShareReportDialog({
  open,
  onOpenChange,
  analysisId,
  isPublic,
  onTogglePublic,
  isToggleLoading,
  score,
}: ShareReportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/report/${analysisId}`
    : `https://resumepilot.site/report/${analysisId}`;

  const handleCopy = useCallback(async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    } finally {
      setCopying(false);
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      setSharing(true);
      try {
        await navigator.share({
          title: "My ResumePilot ATS Report",
          text: `My resume got an ATS score of ${score}/100 on ResumePilot!`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Navigator share failed:", err);
          toast.error("Failed to share.");
        }
      } finally {
        setSharing(false);
      }
    } else {
      await handleCopy();
    }
  }, [shareUrl, score, handleCopy]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300 gap-0"
        style={{
          maxWidth: "min(520px, calc(100vw - 32px))",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "hidden",
          boxSizing: "border-box",
          padding: "24px",
        }}
      >
        <div className="w-full max-w-full min-w-0 overflow-hidden flex flex-col gap-0" style={{ boxSizing: "border-box" }}>
          
          {/* Header Section */}
          <div className="w-full max-w-full min-w-0 overflow-hidden text-left pb-5" style={{ boxSizing: "border-box" }}>
            <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2" id="share-dialog-title">
              <Share2 className="h-6 w-6 text-primary flex-shrink-0" />
              Share Report
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1" id="share-dialog-description">
              Securely share your ATS resume analysis report.
            </DialogDescription>
          </div>

          <hr className="border-border/40 w-full max-w-full flex-shrink-0" />

          {/* Body Section */}
          <div className="py-6 w-full max-w-full min-w-0 overflow-hidden" style={{ boxSizing: "border-box" }}>
            {isPublic ? (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 w-full max-w-full min-w-0 overflow-hidden" style={{ boxSizing: "border-box" }}>
                <div 
                  className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 w-fit flex-shrink-0"
                  role="status"
                  aria-label="Report status is Public"
                >
                  <Globe className="h-3.5 w-3.5 animate-pulse flex-shrink-0" />
                  Public
                </div>

                <p className="text-sm text-muted-foreground w-full max-w-full">
                  Anyone with this link can view this report.
                </p>

                <div className="w-full max-w-full min-w-0 overflow-hidden space-y-4" style={{ boxSizing: "border-box" }}>
                  {/* URL Display */}
                  <div 
                    className="w-full max-w-full min-w-0 truncate font-mono text-sm text-foreground/90 bg-muted/40 border border-border rounded-xl px-4 py-3 shadow-inner select-all block"
                    style={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                    title={shareUrl}
                    aria-label="Shareable report URL"
                  >
                    {shareUrl}
                  </div>
                  
                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-[4fr_1fr] gap-3 w-full max-w-full min-w-0" style={{ boxSizing: "border-box" }}>
                    {/* Copy Link Button */}
                    <Button
                      variant="hero"
                      onClick={handleCopy}
                      disabled={isToggleLoading || copying || sharing}
                      className="h-11 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 w-full min-w-0"
                      aria-label="Copy report link"
                      style={{ boxSizing: "border-box" }}
                    >
                      {copying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                          <span className="truncate">Copying...</span>
                        </>
                      ) : copied ? (
                        <>
                          <Check className="h-4 w-4 text-white flex-shrink-0" />
                          <span className="truncate">✓ Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Copy Link</span>
                        </>
                      )}
                    </Button>

                    {/* Share Button */}
                    <Button
                      variant="hero"
                      onClick={handleShare}
                      disabled={isToggleLoading || copying || sharing}
                      className="h-11 flex items-center justify-center rounded-xl transition-all duration-200 p-0 w-full min-w-0"
                      aria-label="Share report"
                      style={{ boxSizing: "border-box" }}
                    >
                      {sharing ? (
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      ) : (
                        <Share2 className="h-4 w-4 flex-shrink-0" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 w-full max-w-full min-w-0 overflow-hidden" style={{ boxSizing: "border-box" }}>
                <div 
                  className="flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 w-fit flex-shrink-0"
                  role="status"
                  aria-label="Report status is Private"
                >
                  <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                  Private
                </div>

                <div className="space-y-1 w-full max-w-full">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This report is only visible to you.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Make it public to generate a shareable link.
                  </p>
                </div>

                {/* Make Public Button */}
                <Button
                  variant="hero"
                  className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
                  onClick={onTogglePublic}
                  disabled={isToggleLoading}
                  aria-label="Make report public"
                  style={{ boxSizing: "border-box" }}
                >
                  {isToggleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 mr-2" />
                      Making Public...
                    </>
                  ) : (
                    "Make Public"
                  )}
                </Button>
              </div>
            )}
          </div>

          <hr className="border-border/40 w-full max-w-full flex-shrink-0" />

          {/* Footer Section */}
          <div className="pt-5 w-full max-w-full min-w-0 overflow-hidden" style={{ boxSizing: "border-box" }}>
            {isPublic ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full min-w-0">
                <Button
                  variant="outline"
                  onClick={onTogglePublic}
                  disabled={isToggleLoading || copying || sharing}
                  className="h-11 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full flex items-center justify-center gap-2"
                  aria-label="Make report private"
                  style={{ boxSizing: "border-box" }}
                >
                  {isToggleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 mr-2" />
                      Making Private...
                    </>
                  ) : (
                    "Make Private"
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    disabled={isToggleLoading || copying || sharing}
                    className="h-11 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full flex items-center justify-center gap-2"
                    aria-label="Close share dialog"
                    style={{ boxSizing: "border-box" }}
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
            ) : (
              <div className="w-full max-w-full min-w-0">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    disabled={isToggleLoading}
                    className="h-11 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full flex items-center justify-center gap-2"
                    aria-label="Close share dialog"
                    style={{ boxSizing: "border-box" }}
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

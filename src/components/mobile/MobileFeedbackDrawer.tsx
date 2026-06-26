import { useState } from "react";
import { Star, ChevronDown, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface MobileFeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFeedbackDrawer({ isOpen, onClose }: MobileFeedbackDrawerProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState("Bug Report");
  const [showDropdown, setShowDropdown] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  
  // Attachment states
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Check file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    // Check size (< 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setAttachment(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSend = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before sending.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter your message.");
      return;
    }

    let screenshotUrl = "";
    
    // Upload image if selected
    if (attachment) {
      setIsUploading(true);
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          toast.error("Attachments require backend support which is currently unavailable.");
          setIsUploading(false);
          return;
        }

        const fileExt = attachment.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const bucket = "feedback-screenshots";

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, attachment);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        screenshotUrl = urlData.publicUrl;

        // Save feedback in Supabase database
        await supabase.from("feedback").insert({
          user_id: user?.id || null,
          type: category,
          message: `Rating: ${rating}/5 Stars\n\nMessage: ${message.trim()}`,
          page_url: window.location.pathname,
          screenshot_url: screenshotUrl,
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error("Upload/Save error:", err);
        toast.error("Failed to upload screenshot. Please try again.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const subject = encodeURIComponent("ResumePilot Feedback");
    let bodyText = `Category: ${category}\nRating: ${rating}/5 Stars\n\nMessage:\n${message.trim()}`;
    if (screenshotUrl) {
      bodyText += `\n\nScreenshot URL:\n${screenshotUrl}`;
    }
    const body = encodeURIComponent(bodyText);
    
    window.location.href = `mailto:support@resumepilot.site?subject=${subject}&body=${body}`;
    onClose();
    
    // Reset state after brief delay
    setTimeout(() => {
      setCategory("Bug Report");
      setRating(0);
      setMessage("");
      setAttachment(null);
      setPreviewUrl(null);
    }, 300);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DrawerContent className="rounded-t-[24px] border-t border-border/40 bg-background pb-8">
        <div className="mx-auto px-4 max-w-md w-full">
          <DrawerHeader className="px-0 pt-4 pb-2 text-left">
            <DrawerTitle className="font-display text-xl font-bold text-foreground">
              Send Feedback
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Help us improve ResumePilot.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 mt-3">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => !isUploading && setShowDropdown(!showDropdown)}
                  disabled={isUploading}
                  className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-muted/40 px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/70 disabled:opacity-50"
                >
                  <span>{category}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      showDropdown && "rotate-180"
                    )}
                  />
                </button>
                {showDropdown && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                    {["Bug Report", "Feature Request", "Improvement", "General Feedback"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setCategory(option);
                          setShowDropdown(false);
                        }}
                        className={cn(
                          "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 active:bg-muted/80",
                          category === option ? "text-primary bg-primary/5" : "text-foreground"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 block">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => !isUploading && setRating(star)}
                    onMouseEnter={() => !isUploading && setHoveredRating(star)}
                    onMouseLeave={() => !isUploading && setHoveredRating(0)}
                    disabled={isUploading}
                    className="p-1 transition-transform active:scale-90 disabled:opacity-50"
                    aria-label={`Rate ${star} Stars`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-all duration-150",
                        star <= (hoveredRating || rating)
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm scale-110"
                          : "text-muted-foreground/30 fill-transparent"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isUploading}
                placeholder="Tell us what you think..."
                rows={4}
                className="w-full rounded-xl border border-border/40 bg-muted/20 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Attachments
              </label>
              
              {!attachment ? (
                <div
                  onClick={() => !isUploading && document.getElementById("mobile-feedback-attachment")?.click()}
                  className="border border-dashed border-border/60 rounded-xl p-5 bg-muted/10 hover:bg-muted/20 active:scale-[0.99] transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <input
                    type="file"
                    id="mobile-feedback-attachment"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(file);
                    }}
                  />
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    📷 Add Screenshot
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    PNG, JPG, JPEG or WEBP up to 5 MB
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-border/40 bg-muted/20 p-3 flex items-center justify-between gap-3 relative overflow-hidden">
                  <div className="flex items-center gap-3 min-w-0">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-12 w-12 rounded-lg object-cover bg-card border border-border/40 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {attachment.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    disabled={isUploading}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground transition-colors active:scale-90 disabled:opacity-50"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 rounded-full h-11 border-border/40 font-semibold active:scale-95 transition-transform"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSend}
                disabled={isUploading}
                className="flex-1 rounded-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  "Send Feedback"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

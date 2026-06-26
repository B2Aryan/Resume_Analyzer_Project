import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { ChevronLeft, ChevronDown, X, Loader2, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MobileRequestFeature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState("Resume Analysis");
  const [showDropdown, setShowDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Nice to Have" | "Important" | "Critical">("Important");
  
  // Image Attachment States
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate({ to: "/mobile/tools" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    // Validate size (10 MB maximum)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 10 MB.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a feature title.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your idea.");
      return;
    }

    setIsSubmitting(true);
    let screenshotUrl = "";

    try {
      const supabase = getSupabaseClient();
      
      // Upload attachment if present and Supabase is configured
      if (attachment && supabase) {
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
      }

      // Save request to feedback table in database
      if (supabase) {
        await supabase.from("feedback").insert({
          user_id: user?.id || null,
          type: "Feature Request",
          message: `Category: ${category}\nPriority: ${priority}\nTitle: ${title.trim()}\n\nDescription: ${description.trim()}`,
          page_url: window.location.pathname,
          screenshot_url: screenshotUrl,
          created_at: new Date().toISOString(),
        });
      }

      // Trigger mail client as fallback / secondary channel
      const mailSubject = encodeURIComponent(`ResumePilot Feature Request: ${title.trim()}`);
      let mailBody = `Feature Request Submitted:\n\n`;
      mailBody += `Category: ${category}\n`;
      mailBody += `Priority: ${priority}\n`;
      mailBody += `Title: ${title.trim()}\n\n`;
      mailBody += `Description:\n${description.trim()}\n`;
      
      if (screenshotUrl) {
        mailBody += `\nScreenshot/Mockup URL:\n${screenshotUrl}\n`;
      }
      
      const body = encodeURIComponent(mailBody);
      window.location.href = `mailto:support@resumepilot.site?subject=${mailSubject}&body=${body}`;

      toast.success("Feature request submitted successfully!");
      
      // Clear form states
      setTitle("");
      setDescription("");
      setCategory("Resume Analysis");
      setPriority("Important");
      setAttachment(null);
      setPreviewUrl(null);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate({ to: "/mobile/tools" });
      }, 1500);

    } catch (err: any) {
      console.error("Feature request submission error:", err);
      toast.error(err.message || "Failed to submit feature request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Resume Analysis",
    "Cover Letters",
    "Mock Interviews",
    "Career Tools",
    "Mobile App",
    "Dashboard",
    "Other",
  ];

  const priorities: Array<"Nice to Have" | "Important" | "Critical"> = [
    "Nice to Have",
    "Important",
    "Critical",
  ];

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
          aria-label="Back to Tools"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-xl font-bold">Request a Feature</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 pl-1">
        Tell us what would make ResumePilot even better.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => !isSubmitting && setShowDropdown(!showDropdown)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/40 disabled:opacity-50"
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
                {categories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setCategory(option);
                      setShowDropdown(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50 active:bg-muted/85",
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

        {/* Feature Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Feature Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g., Export reports as PDF"
            className="w-full rounded-xl border border-border/40 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Describe your idea in as much detail as possible."
            rows={5}
            className="w-full rounded-xl border border-border/40 bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Priority Selection (Radio cards) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1 block">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-3">
            {priorities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => !isSubmitting && setPriority(item)}
                disabled={isSubmitting}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all text-center relative overflow-hidden active:scale-95 disabled:opacity-50",
                  priority === item
                    ? "border-primary/80 bg-primary/5 text-primary shadow-[0_0_12px_rgba(37,99,235,0.15)]"
                    : "border-border/40 bg-card text-foreground"
                )}
              >
                {priority === item && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary" />
                )}
                <span className="text-xs font-bold leading-none">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot Attachment */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1 block">
            Image Attachment
          </label>
          
          {!attachment ? (
            <div
              onClick={() => !isSubmitting && document.getElementById("mobile-feature-attachment")?.click()}
              className="border border-dashed border-border/60 rounded-xl p-6 bg-card hover:bg-muted/10 active:scale-[0.99] transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <input
                type="file"
                id="mobile-feature-attachment"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                disabled={isSubmitting}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange(file);
                }}
              />
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                📷 Add Screenshot
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                PNG, JPG, JPEG or WEBP up to 10 MB
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 bg-card p-3 flex items-center justify-between gap-3 relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg object-cover bg-muted border border-border/30 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleRemoveAttachment}
                disabled={isSubmitting}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-all active:scale-90 disabled:opacity-50"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Lightbulb className="h-4.5 w-4.5" />
                <span>Submit Feature Request</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

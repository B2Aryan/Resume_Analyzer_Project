import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronDown, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

const FEEDBACK_TYPES = [
  "Bug Report",
  "Feature Request",
  "Improvement Suggestion",
  "General Feedback"
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [contactMe, setContactMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const { user, session } = useAuth();

  // Debug logs
  console.log("AuthContext user:", user);
  console.log("AuthContext session:", session);
  console.log("useAuth() returning user:", user, ", session:", session);
  
  // Also check direct supabase session
  useEffect(() => {
    const checkDirectSession = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { session: directSession } } = await supabase.auth.getSession();
        console.log("Direct supabase.auth.getSession() result:", directSession);
      }
    };
    checkDirectSession();
  }, []);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setFeedbackType("");
      setMessage("");
      setScreenshot(null);
      setScreenshotPreview(null);
      setContactMe(false);
      setIsSubmitting(false);
      setShowTypeDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showTypeDropdown && !target.closest('.feedback-type-dropdown-wrapper')) {
        setShowTypeDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showTypeDropdown]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (showTypeDropdown && highlightedIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [showTypeDropdown, highlightedIndex]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async () => {
    console.log("STEP 1: Submit clicked");
    if (!feedbackType || !message.trim()) {
      toast.error("Please select a feedback type and enter a message");
      return;
    }

    console.log("STEP 2: Validation passed");
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSubmitting(true);
    try {
      let screenshotUrl: string | null = null;
      if (screenshot) {
        try {
          console.log("STEP 3: Screenshot upload starting");
          const fileExt = screenshot.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const bucket = 'feedback-screenshots';
          
          // Log all relevant info
          console.log('=== Screenshot Upload Debug Info ===');
          console.log({
            bucket,
            fileName,
            filePath: fileName,
            userId: user?.id || null,
            session: session || null,
          });
          console.log('=====================================');
          
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, screenshot);
          
          if (uploadError) {
            console.error('FAILED AT STEP 3', uploadError);
            console.error('Failed to upload screenshot:', uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from('feedback-screenshots')
              .getPublicUrl(fileName);
            
            screenshotUrl = urlData.publicUrl;
          }
          console.log("STEP 4: Screenshot upload finished");
        } catch (uploadErr) {
          console.error('FAILED AT STEP 3', uploadErr);
          console.error('Error during screenshot upload:', uploadErr);
        }
      }

      const feedbackRecord = {
        user_id: user?.id || null,
        type: feedbackType,
        message: message.trim(),
        page_url: window.location.pathname,
        screenshot_url: screenshotUrl,
        contact_me: contactMe,
        created_at: new Date().toISOString(),
      };

      // First, insert into database
      console.log("STEP 5: Database insert starting");
      const { error: insertError } = await supabase
        .from('feedback')
        .insert(feedbackRecord);

      if (insertError) {
        console.error('FAILED AT STEP 5', insertError);
        throw insertError;
      }
      console.log("STEP 6: Database insert finished");

      // Now, try to send email via our API route (don't fail feedback submission if email fails)
      try {
        console.log("STEP 7: Email API call starting");
        await fetch("/api/send-feedback-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
              feedback_type: feedbackType,
              message: message.trim(),
              user_email: user?.email || "Not logged in",
              user_id: user?.id || "Not logged in",
              page_url: window.location.pathname,
              contact_me: contactMe ? "Yes" : "No",
              screenshot_url: screenshotUrl || null,
              submission_timestamp: new Date().toLocaleString(),
            }),
        });
        console.log("STEP 8: Email API call finished");
      } catch (emailError) {
        console.error('FAILED AT STEP 7', emailError);
        console.error('Failed to send feedback email via API:', emailError);
        // Don't show error to user, just log it
      }

      console.log("STEP 9: Success toast");
      toast.success("Thanks for your feedback! We'll review it soon.");
      onClose();
    } catch (error) {
      console.error('FAILED AT STEP 5 OR EARLIER', error);
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      console.log("STEP 10: setSubmitting(false)");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Help Improve ResumePilot 🚀</DialogTitle>
          <DialogDescription>
            Found a bug, missing feature, or have an idea? We’d love to hear from you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5 feedback-type-dropdown-wrapper" ref={dropdownWrapperRef}>
            <Label>Feedback Type</Label>
            <div className="relative">
              <Button
                variant="secondary"
                className="w-full justify-between overflow-hidden"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowTypeDropdown(false);
                    setHighlightedIndex(-1);
                    return;
                  }

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!showTypeDropdown) {
                      setShowTypeDropdown(true);
                    } else {
                      setHighlightedIndex(prev => Math.min(prev + 1, FEEDBACK_TYPES.length - 1));
                    }
                    return;
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.max(prev - 1, 0));
                    return;
                  }

                  if (e.key === "Enter" && showTypeDropdown && highlightedIndex >= 0) {
                    e.preventDefault();
                    setFeedbackType(FEEDBACK_TYPES[highlightedIndex]);
                    setShowTypeDropdown(false);
                    setHighlightedIndex(-1);
                    return;
                  }

                  if (e.key === "Tab" && showTypeDropdown && highlightedIndex >= 0) {
                    setFeedbackType(FEEDBACK_TYPES[highlightedIndex]);
                    setShowTypeDropdown(false);
                  }
                }}
              >
                <span className="truncate">{feedbackType || "Select feedback type"}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
              {showTypeDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-background shadow-xl"
                >
                  <div className="py-1">
                    {FEEDBACK_TYPES.map((type, index) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setFeedbackType(type);
                          setShowTypeDropdown(false);
                          setHighlightedIndex(-1);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          highlightedIndex === index || feedbackType === type
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              placeholder="Describe the issue, suggestion, or feature you'd like to see..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Screenshot (Optional)</Label>
            {!screenshotPreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  id="screenshot-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="screenshot-upload"
                  className="flex flex-col items-center justify-center text-sm text-muted-foreground cursor-pointer"
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <p>Click to upload or drag and drop</p>
                </label>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden">
                <img src={screenshotPreview} alt="Screenshot preview" className="max-h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="contact-me"
              checked={contactMe}
              onCheckedChange={(checked) => setContactMe(checked as boolean)}
            />
            <label
              htmlFor="contact-me"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Contact me regarding this feedback
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
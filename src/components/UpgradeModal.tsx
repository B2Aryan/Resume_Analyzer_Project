
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Bell, FileText, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { SurveyModal } from "./SurveyModal";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string; // e.g., "resume analyses", "cover letters", "mock interviews"
}

export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if user already joined waitlist or completed survey
  useEffect(() => {
    async function checkStatus() {
      if (!user || !open) {
        setIsCheckingStatus(false);
        return;
      }

      setIsCheckingStatus(true);

      try {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        // Check waitlist status
        const { data: waitlistData } = await supabase
          .from("premium_interest")
          .select("id")
          .eq("user_id", user.id)
          .single();

        setHasJoinedWaitlist(!!waitlistData);

        // Check survey status
        const { data: surveyData } = await supabase
          .from("survey_rewards")
          .select("id")
          .eq("user_id", user.id)
          .single();

        setHasCompletedSurvey(!!surveyData);
      } catch (error) {
        console.error("Status check error:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkStatus();
  }, [user, open]);

  const handleNotifyMe = async () => {
    if (!user) {
      toast.error("Please login to join the waitlist");
      return;
    }

    if (hasJoinedWaitlist) {
      toast.info("You're already on the Premium waitlist!");
      return;
    }

    setIsProcessing(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        toast.error("Failed to connect to database");
        return;
      }

      // Add to waitlist with source tracking
      const { error, data: insertedData } = await supabase
        .from("premium_interest")
        .insert({ 
          user_id: user.id,
          source: "upgrade_modal"
        })
        .select()
        .single();

      if (error) {
        console.error("Waitlist error:", error);
        toast.error("Failed to join waitlist. Please try again.");
        return;
      }

      setHasJoinedWaitlist(true);

      // Get total waitlist count and position
      const { count } = await supabase
        .from("premium_interest")
        .select("*", { count: "exact", head: true });

      // Get position by counting entries created before this one
      const { count: position } = await supabase
        .from("premium_interest")
        .select("*", { count: "exact", head: true })
        .lte("created_at", insertedData.created_at);

      // Send email notification (non-blocking)
      try {
        console.log("Calling /api/notify-waitlist");
        const response = await fetch("/api/notify-waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
            userEmail: user.email,
            userId: user.id,
            joinTimestamp: insertedData.created_at,
            totalCount: count || 0,
            position: position || 0,
            sourcePage: "upgrade_modal"
          }),
        });
        const responseText = await response.text();
        console.log("Notification response:", responseText);
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the waitlist signup if email fails
      }

      toast.success("You're on the Premium waitlist. We'll notify you when Premium launches!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSurvey = () => {
    if (!user) {
      toast.error("Please login to take the survey");
      return;
    }

    if (hasCompletedSurvey) {
      toast.info("You've already completed the survey!");
      return;
    }

    setSurveyOpen(true);
  };

  const handleSurveyComplete = () => {
    setHasCompletedSurvey(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92vw] sm:max-w-[420px] lg:max-w-[480px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold uppercase tracking-wider w-fit">
              Free Plan Limit Reached
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Monthly Limit Reached
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              You've used all free {feature} for this month.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm leading-tight">Unlimited ATS Analyses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm leading-tight">Unlimited Cover Letter Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm leading-tight">Unlimited AI Mock Interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm leading-tight">Advanced Resume Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm leading-tight">Resume Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm leading-tight">AI Career Coach</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 mb-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">Premium Coming Soon 🚀</div>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              We're building Premium with amazing features. Be the first to know when it launches!
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleNotifyMe}
              disabled={isProcessing || isCheckingStatus || hasJoinedWaitlist}
            >
              {hasJoinedWaitlist ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Joined Waitlist
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  {isProcessing ? "Adding to waitlist..." : "Notify Me at Launch"}
                </>
              )}
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
              onClick={handleSurvey}
              disabled={isCheckingStatus || hasCompletedSurvey}
            >
              {hasCompletedSurvey ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Survey Completed
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Take Survey (+2 Bonus Analyses)
                </>
              )}
            </Button>
          </DialogFooter>

          <div className="text-xs text-muted-foreground text-center mt-2">
            Your free plan resets monthly. Premium launching soon!
          </div>
        </DialogContent>
      </Dialog>

      <SurveyModal 
        open={surveyOpen} 
        onOpenChange={setSurveyOpen} 
        user={user!}
        onComplete={handleSurveyComplete}
      />
    </>
  );
}




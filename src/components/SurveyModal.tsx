import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onComplete: () => void;
}

interface SurveyAnswers {
  biggestChallenge: string[];
  valuableFeatures: string[];
  disappointmentLevel: string;
  pricePoint: string;
  buyToday: string;
}

export function SurveyModal({ open, onOpenChange, user, onComplete }: SurveyModalProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    biggestChallenge: [],
    valuableFeatures: [],
    disappointmentLevel: "",
    pricePoint: "",
    buyToday: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (field: 'biggestChallenge' | 'valuableFeatures', value: string) => {
    setAnswers(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = async () => {
    // Validation - ALL QUESTIONS REQUIRED
    if (
      answers.biggestChallenge.length === 0 || 
      answers.valuableFeatures.length === 0 || 
      !answers.disappointmentLevel || 
      !answers.pricePoint || 
      !answers.buyToday
    ) {
      toast.error("Please answer all questions");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        toast.error("Failed to connect to database");
        return;
      }

      // Check if user already completed survey
      const { data: existing } = await supabase
        .from("survey_rewards")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        toast.error("You've already completed this survey");
        onOpenChange(false);
        return;
      }

      // Submit survey with reward_claimed = true
      const { error: surveyError } = await supabase
        .from("survey_rewards")
        .insert({
          user_id: user.id,
          answers: answers,
          reward_claimed: true,
        });

      if (surveyError) {
        console.error("Survey submission error:", surveyError);
        toast.error("Failed to submit survey. Please try again.");
        return;
      }

      // Award +2 bonus analyses
      const { data: profile } = await supabase
        .from("profiles")
        .select("bonus_analyses")
        .eq("id", user.id)
        .single();

      if (!profile) {
        toast.error("Failed to fetch profile");
        return;
      }

      // Add 2 bonus analyses
      const newBonusAnalyses = (profile.bonus_analyses || 0) + 2;

      const { error: rewardError } = await supabase
        .from("profiles")
        .update({ bonus_analyses: newBonusAnalyses })
        .eq("id", user.id);

      if (rewardError) {
        console.error("Reward error:", rewardError);
        toast.error("Survey saved but failed to add bonus analyses. Contact support.");
        return;
      }

      toast.success("🎉 Thank you for your feedback!\n2 bonus ATS analyses have been added to your account.");
      
      // Send email notification (non-blocking)
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        console.log("Calling /api/notify-survey");
        const response = await fetch("/api/notify-survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: profileData?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
            userEmail: user.email,
            userId: user.id,
            submissionTimestamp: new Date().toISOString(),
            answers: answers
          }),
        });
        const responseText = await response.text();
        console.log("Notification response:", responseText);
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the survey submission if email fails
      }

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Survey error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = 
    answers.biggestChallenge.length > 0 && 
    answers.valuableFeatures.length > 0 && 
    answers.disappointmentLevel && 
    answers.pricePoint && 
    answers.buyToday;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Help Shape ResumePilot</DialogTitle>
          <DialogDescription>
            Your feedback helps us decide which Premium features to build next.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question 1 - Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              1. What is your biggest challenge with job applications? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">Select all that apply</p>
            <div className="space-y-2">
              {[
                "Not getting interview calls",
                "Low ATS scores",
                "Resume not matching job descriptions",
                "Lack of relevant experience",
                "Unsure how to improve my resume",
                "Finding suitable jobs",
                "Other"
              ].map((option) => (
                <label key={option} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={answers.biggestChallenge.includes(option)}
                    onChange={() => handleCheckboxChange('biggestChallenge', option)}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2 - Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              2. Which Premium features would be most valuable to you? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">Select all that apply</p>
            <div className="space-y-2">
              {[
                "Unlimited ATS analyses",
                "Advanced ATS insights",
                "AI Resume Rewriter",
                "AI Cover Letter Generator",
                "Mock Interview Practice",
                "Resume Templates",
                "Priority Processing"
              ].map((option) => (
                <label key={option} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={answers.valuableFeatures.includes(option)}
                    onChange={() => handleCheckboxChange('valuableFeatures', option)}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div>
            <label className="block text-sm font-medium mb-3">
              3. How disappointed would you be if ResumePilot stopped working tomorrow? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                "Not disappointed",
                "Slightly disappointed",
                "Moderately disappointed",
                "Very disappointed"
              ].map((option) => (
                <label key={option} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted/50">
                  <input
                    type="radio"
                    name="disappointmentLevel"
                    value={option}
                    checked={answers.disappointmentLevel === option}
                    onChange={(e) => setAnswers({ ...answers, disappointmentLevel: e.target.value })}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 4 */}
          <div>
            <label className="block text-sm font-medium mb-3">
              4. How much would you realistically pay for Premium? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                "₹99/month",
                "₹199/month",
                "₹299/month",
                "₹499/month",
                "I would not pay"
              ].map((option) => (
                <label key={option} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted/50">
                  <input
                    type="radio"
                    name="pricePoint"
                    value={option}
                    checked={answers.pricePoint === option}
                    onChange={(e) => setAnswers({ ...answers, pricePoint: e.target.value })}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 5 */}
          <div>
            <label className="block text-sm font-medium mb-3">
              5. Would you buy Premium today if it solved your job application problems? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                "Yes",
                "Maybe",
                "No"
              ].map((option) => (
                <label key={option} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted/50">
                  <input
                    type="radio"
                    name="buyToday"
                    value={option}
                    checked={answers.buyToday === option}
                    onChange={(e) => setAnswers({ ...answers, buyToday: e.target.value })}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isComplete} className="flex-1">
            {isSubmitting ? "Submitting..." : "Submit & Get +2 Analyses"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

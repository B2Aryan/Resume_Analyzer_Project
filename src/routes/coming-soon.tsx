import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Bell, FileText, CheckCircle2, Rocket } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA } from "@/lib/seo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { SurveyModal } from "@/components/SurveyModal";

export const Route = createFileRoute("/coming-soon")({
  head: () => createSeoHead({
    title: "Coming Soon",
    description: "ResumePilot Premium is under development. Join the waitlist to be notified when we launch with unlimited ATS analysis and advanced features.",
    path: "/coming-soon",
    schema: {
      "@context": "https://schema.org",
      "@graph": [ORGANIZATION_SCHEMA],
    },
  }),
  component: ComingSoonPage,
});

function ComingSoonPage() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);

  const handleNotifyMe = async () => {
    if (!user) {
      toast.error("Please login to join the waitlist");
      return;
    }

    setIsProcessing(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        toast.error("Failed to connect to database");
        return;
      }

      // Check if already on waitlist
      const { data: existing } = await supabase
        .from("premium_interest")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        toast.info("You're already on the Premium waitlist!");
        return;
      }

      // Add to waitlist with source tracking
      const { error, data: insertedData } = await supabase
        .from("premium_interest")
        .insert({ 
          user_id: user.id,
          source: "coming_soon_page"
        })
        .select()
        .single();

      if (error) {
        console.error("Waitlist error:", error);
        toast.error("Failed to join waitlist. Please try again.");
        return;
      }

      // Get total waitlist count and position
      const { count } = await supabase
        .from("premium_interest")
        .select("*", { count: "exact", head: true });

      // Get position by counting entries created before this one
      const { count: position } = await supabase
        .from("premium_interest")
        .select("*", { count: "exact", head: true })
        .lte("created_at", insertedData.created_at);

      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

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
            sourcePage: "coming_soon_page"
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
    setSurveyOpen(true);
  };

  const handleSurveyComplete = () => {
    // Survey completed - modal will close automatically
  };

  return (
    <>
      <MarketingLayout>
        {/* Hero Section */}
        <section className="hero-ambient py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl">
              Premium Coming Soon
              <span className="block mt-2 text-gradient">Something Amazing</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building ResumePilot Premium with powerful features to supercharge your job search. 
              Be the first to know when we launch!
            </p>

            <div className="mt-10 flex justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-base px-8 py-6 h-auto"
                onClick={handleNotifyMe}
                disabled={isProcessing}
              >
                <Bell className="h-5 w-5 mr-2" />
                {isProcessing ? "Joining..." : "Join Waitlist"}
              </Button>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold">What's Coming in Premium</h2>
            <p className="mt-3 text-muted-foreground">Features we're building for you</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Unlimited ATS Analyses",
                description: "Analyze as many resumes as you need without monthly limits"
              },
              {
                icon: FileText,
                title: "AI Cover Letters",
                description: "Generate personalized cover letters tailored to job descriptions"
              },
              {
                icon: CheckCircle2,
                title: "Mock Interviews",
                description: "Practice with AI-powered mock interviews and get feedback"
              },
              {
                icon: Rocket,
                title: "Advanced Insights",
                description: "Deep ATS compatibility analysis with detailed recommendations"
              },
              {
                icon: Bell,
                title: "Priority Support",
                description: "Get help when you need it with priority email support"
              },
              {
                icon: CheckCircle2,
                title: "Export & History",
                description: "Save and export all your analysis reports and history"
              }
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-background/50 p-6 backdrop-blur transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
          <div className="rounded-2xl border border-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-10">
            <h2 className="font-display text-3xl font-bold">Help Us Build Premium</h2>
            <p className="mt-4 text-muted-foreground">
              Your feedback matters! Take our quick survey and get +2 bonus analyses as a thank you.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleSurvey}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <FileText className="h-5 w-5 mr-2" />
                Take Survey & Get +2 Analyses
              </Button>
            </div>
          </div>
        </section>
      </MarketingLayout>

      <SurveyModal 
        open={surveyOpen} 
        onOpenChange={setSurveyOpen} 
        user={user!}
        onComplete={handleSurveyComplete}
      />
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Bell, FileText, CheckCircle2, Rocket, LayoutTemplate, Brain } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA } from "@/lib/seo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { SurveyModal } from "@/components/SurveyModal";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobilePremium } from "@/components/mobile/MobilePremium";

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
    console.log("=================================================");
    console.log("🚀 HANDLENOTIFYME CALLED");
    console.log("User:", user?.id);
    console.log("=================================================");

    if (!user) {
      console.log("❌ EXIT: No user logged in");
      toast.error("Please login to join the waitlist");
      return;
    }

    setIsProcessing(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("❌ EXIT: No Supabase client");
        toast.error("Failed to connect to database");
        return;
      }

      // Check if already on waitlist
      console.log("🔍 Checking if user is already on waitlist...");
      const { data: existing, error: checkError } = await supabase
        .from("premium_interest")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned (expected for new users)
        console.error("❌ Waitlist check error:", checkError);
        console.log("❌ EXIT: Waitlist check error");
        toast.error(`Database error: ${checkError.message}`);
        return;
      }

      if (existing) {
        console.log("ℹ️ User already on waitlist");
        console.log("❌ EXIT: User already on waitlist");
        toast.info("You're already on the Premium waitlist!");
        return;
      }

      console.log("✅ User not on waitlist, proceeding with insert");

      // Add to waitlist with source tracking
      const insertPayload = { 
        user_id: user.id,
        source: "coming_soon_page"
      };
      console.log("📝 Starting waitlist insert...");
      console.log("Insert payload:", insertPayload);

      const { error, data: insertedData } = await supabase
        .from("premium_interest")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error("❌ Waitlist insert failed:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        console.log("❌ EXIT: Waitlist insert failed");
        toast.error(`Failed to join waitlist: ${error.message}`);
        return;
      }

      console.log("✅ Waitlist insert success:", insertedData);

      // Get total waitlist count and position
      console.log("📊 Fetching waitlist count...");
      const { count, error: countError } = await supabase
        .from("premium_interest")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("❌ Failed to get waitlist count:", countError);
      } else {
        console.log("✅ Total waitlist count:", count);
      }

      // Get position by counting entries created before this one
      console.log("📊 Calculating position...");
      const { count: position, error: positionError } = await supabase
        .from("premium_interest")
        .select("*", { count: "exact", head: true })
        .lte("created_at", insertedData.created_at);

      if (positionError) {
        console.error("❌ Failed to get position:", positionError);
      } else {
        console.log("✅ User position:", position);
      }

      // Get user profile for name
      console.log("👤 Fetching user profile...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Failed to get profile:", profileError);
      } else {
        console.log("✅ Profile fetched:", profile);
      }

      console.log("================================");
      console.log("COUNT QUERY RESULT:", count);
      console.log("COUNT ERROR:", countError);
      console.log("POSITION QUERY RESULT:", position);
      console.log("POSITION ERROR:", positionError);
      console.log("VALUE SENT TO EMAIL:");
      console.log({
        totalCount: count || 0,
        position: position || 0,
      });
      console.log("================================");

      // Send email notification (non-blocking)
      try {
        console.log("=================================================");
        console.log("🔥 BEFORE NOTIFY WAITLIST FETCH");
        console.log("About to call /api/notify-waitlist");
        console.log("insertedData:", insertedData);
        console.log("=================================================");
        
        console.log("📧 Calling /api/notify-waitlist");
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
        
        console.log("=================================================");
        console.log("🔥 AFTER NOTIFY WAITLIST FETCH");
        console.log("Response received");
        console.log("=================================================");
        
        console.log("📧 Email API response status:", response.status);
        const responseText = await response.text();
        console.log("📧 Email API response body:", responseText);
        
        if (!response.ok) {
          console.error("❌ Email API returned error:", response.status, responseText);
        } else {
          console.log("✅ Email notification sent successfully");
        }
      } catch (emailError) {
        console.error("❌ Email notification error:", emailError);
        // Don't fail the waitlist signup if email fails
      }

      console.log("🎉 Waitlist signup complete");
      toast.success("You're on the Premium waitlist. We'll notify you when Premium launches!");
    } catch (error) {
      console.error("=================================================");
      console.error("❌ OUTER CATCH BLOCK");
      console.error("Error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      console.error("=================================================");
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      console.log("=================================================");
      console.log("✅ FINALLY BLOCK - Setting isProcessing to false");
      console.log("=================================================");
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
      <div className="hidden lg:block">
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
                  title: "Unlimited Cover Letter Generation",
                  description: "Generate personalized cover letters tailored to job descriptions"
                },
                {
                  icon: CheckCircle2,
                  title: "Unlimited AI Mock Interviews",
                  description: "Practice with AI-powered mock interviews and get feedback"
                },
                {
                  icon: Rocket,
                  title: "Advanced Resume Analysis",
                  description: "Deep ATS compatibility analysis with detailed recommendations"
                },
                {
                  icon: LayoutTemplate,
                  title: "Resume Templates",
                  description: "Create modern, ATS-friendly resume templates for different job roles"
                },
                {
                  icon: Brain,
                  title: "AI Career Coach",
                  description: "Receive personalized career guidance, skill recommendations, and learning roadmaps powered by AI"
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
      </div>

      <div className="block lg:hidden">
        <MobileShell>
          <MobilePremium
            user={user}
            isProcessing={isProcessing}
            handleNotifyMe={handleNotifyMe}
            handleSurvey={handleSurvey}
          />
        </MobileShell>
      </div>

      {user && (
        <SurveyModal 
          open={surveyOpen} 
          onOpenChange={setSurveyOpen} 
          user={user}
          onComplete={handleSurveyComplete}
        />
      )}
    </>
  );
}

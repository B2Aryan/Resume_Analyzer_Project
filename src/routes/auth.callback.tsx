import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAnalysisStore } from "@/store/analysisStore";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Auth Callback — ResumePilot" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const loadPendingAnalysis = useAnalysisStore((state) => state.loadPendingAnalysis);
  const clearPendingAnalysis = useAnalysisStore((state) => state.clearPendingAnalysis);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Navigating to home");
        navigate({ to: "/" });
        return;
      }

      // Temporary debugging logs
      console.log("1. window.location.href:", window.location.href);
      console.log("2. window.location.search:", window.location.search);
      const searchParams = new URLSearchParams(window.location.search);
      console.log("3. All URL search params:");
      searchParams.forEach((value, key) => {
        console.log(`   - ${key}: ${value}`);
      });
      console.log("4. window.location.hash:", window.location.hash);

      // Detect which flow we're in
      const hasCode = window.location.search.includes('code=');
      const hasAccessToken = window.location.hash.includes('access_token=');
      console.log("5. Detected flow:", hasCode ? "PKCE" : hasAccessToken ? "Implicit" : "Unknown");

      let error;
      if (hasAccessToken) {
        // Implicit flow (Facebook)
        console.log("Handling implicit flow, calling getSession()");
        const { data, error: sessionError } = await supabase.auth.getSession();
        error = sessionError;
        console.log("6. getSession() result:", data);
      } else if (hasCode) {
        // PKCE flow (Google, GitHub)
        console.log("Handling PKCE flow, calling exchangeCodeForSession()");
        const result = await supabase.auth.exchangeCodeForSession(window.location.href);
        error = result.error;
      }
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        console.log("Navigating to login");
        navigate({ to: "/login" });
        return;
      }

      // Check for pending analysis
      const hasPending = loadPendingAnalysis();
      if (hasPending) {
        clearPendingAnalysis();
        console.log("Navigating to result page with restored analysis");
        navigate({ to: "/result" });
      } else {
        console.log("Navigating to dashboard");
        navigate({ to: "/dashboard" });
      }
    };

    handleAuthCallback();
  }, [navigate, loadPendingAnalysis, clearPendingAnalysis]);

  return (
    <MarketingLayout>
      <section className="hero-ambient py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Completing authentication...</p>
        </div>
      </section>
    </MarketingLayout>
  );
}
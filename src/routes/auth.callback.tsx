import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Auth Callback — ResumePilot" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
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

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        navigate({ to: "/login" });
        return;
      }

      navigate({ to: "/dashboard" });
    };

    handleAuthCallback();
  }, [navigate]);

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
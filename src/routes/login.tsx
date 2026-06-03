import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in — ResumePilot" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      navigate({ to: "/dashboard" });
    }
  }, [user, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    console.log("Button clicked");
    console.log("handleGoogleLogin called");
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with Google");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <MarketingLayout>
        <section className="hero-ambient py-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </section>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="hero-ambient py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Free forever to start
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight">Land more interviews, starting today.</h1>
            <p className="mt-4 max-w-md text-muted-foreground">Sign in to save your analyses, track score trends, and run unlimited tailored scans.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>✓ ATS score on every scan</li>
              <li>✓ Keyword match against the JD</li>
              <li>✓ Section-level rewrites</li>
            </ul>
          </div>

          <Card className="border-border/60 shadow-elegant">
            <CardContent className="p-7">
              <h2 className="text-2xl font-bold mb-6">Welcome back</h2>
              <Button
                variant="hero"
                className="w-full"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}

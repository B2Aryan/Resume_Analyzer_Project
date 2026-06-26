import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import {
  FileCheck2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Github,
  Facebook,
} from "lucide-react";

type Mode = "signin" | "signup" | "reset";

export function MobileLogin() {
  const {
    user,
    isLoading,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signInWithGithub,
    signInWithFacebook,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  // If already authenticated, go to dashboard
  if (!isLoading && user) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const handleSubmit = async () => {
    if (!email || (mode !== "reset" && !password)) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
        toast.success("Signed in!");
      } else if (mode === "signup") {
        await signUpWithPassword(email, password);
        toast.success("Account created! Check your email to verify.");
      } else {
        await resetPassword(email);
        toast.success("Reset email sent! Check your inbox.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      toast.error("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGithub = async () => {
    setGithubLoading(true);
    try {
      await signInWithGithub();
    } catch {
      toast.error("Failed to sign in with GitHub");
    } finally {
      setGithubLoading(false);
    }
  };

  const handleFacebook = async () => {
    setFacebookLoading(true);
    try {
      await signInWithFacebook();
    } catch {
      toast.error("Failed to sign in with Facebook");
    } finally {
      setFacebookLoading(false);
    }
  };

  const title = mode === "signin"
    ? "Welcome back"
    : mode === "signup"
    ? "Create account"
    : "Reset password";

  const subtitle = mode === "signin"
    ? "Sign in to continue"
    : mode === "signup"
    ? "Free forever. No card needed."
    : "We'll send a reset link to your email.";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground active:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
            <FileCheck2 className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-display text-sm font-bold">ResumePilot</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-5 pb-12 pt-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Social Login — not shown on reset */}
        {mode !== "reset" && (
          <>
            <div className="flex gap-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading || githubLoading || facebookLoading}
                className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-card py-3.5 transition-all active:scale-[0.97] disabled:opacity-60"
                aria-label="Sign in with Google"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
              </button>

              {/* GitHub */}
              <button
                onClick={handleGithub}
                disabled={googleLoading || githubLoading || facebookLoading}
                className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-card py-3.5 transition-all active:scale-[0.97] disabled:opacity-60"
                aria-label="Sign in with GitHub"
              >
                {githubLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebook}
                disabled={googleLoading || githubLoading || facebookLoading}
                className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-card py-3.5 transition-all active:scale-[0.97] disabled:opacity-60"
                aria-label="Sign in with Facebook"
              >
                {facebookLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Facebook className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="mx-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                or
              </span>
              <div className="flex-1 border-t border-border" />
            </div>
          </>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4.5 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-border bg-muted/30 py-4 pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Password — hidden on reset */}
          {mode !== "reset" && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-border bg-muted/30 py-4 pl-11 pr-12 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          )}

          {/* Forgot password link */}
          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign In"
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </div>

        {/* Mode switchers */}
        <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
          {mode === "signin" && (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-semibold text-primary"
              >
                Create account
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-semibold text-primary"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === "reset" && (
            <p>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-semibold text-primary"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>

        {/* Guest CTA */}
        <div className="mt-8 rounded-2xl border border-border/40 bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No account needed to analyze
          </p>
          <Link
            to="/upload"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            Try as guest
          </Link>
        </div>
      </main>
    </div>
  );
}

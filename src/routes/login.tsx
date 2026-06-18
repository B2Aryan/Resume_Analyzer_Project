import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Loader2,
  FileText,
  Lock,
  Mail,
  Github,
  Facebook,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck2,
  TrendingUp,
  BarChart3,
  Clock,
  Search,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScoreRing } from "@/components/score-ring";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Log in — ResumePilot" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isLoading, signInWithGoogle, signInWithGithub, signInWithFacebook, signInWithPassword, signUpWithPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInGithub, setIsSigningInGithub] = useState(false);
  const [isSigningInFacebook, setIsSigningInFacebook] = useState(false);
  const [isSigningInPassword, setIsSigningInPassword] = useState(false);
  const [isSigningUpPassword, setIsSigningUpPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigate({ to: "/dashboard" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen h-screen w-full bg-background flex items-center justify-center overflow-hidden">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentAnalyses = [
    { id: 1, role: "Frontend Developer", score: 87, time: "2 days ago", color: "text-green-500 bg-green-500/10 border-green-500/20" },
    { id: 2, role: "Full Stack Developer", score: 72, time: "5 days ago", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
    { id: 3, role: "UI/UX Designer", score: 91, time: "1 week ago", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  ] as const;

  const skillChips = ["React", "TypeScript", "Tailwind CSS", "Node.js", "MongoDB"] as const;

  const scoreTrend = [65, 70, 74, 78, 82, 79, 87] as const;

  const handleGoogleLogin = async () => {
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

  const handleGithubLogin = async () => {
    try {
      setIsSigningInGithub(true);
      await signInWithGithub();
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with GitHub");
    } finally {
      setIsSigningInGithub(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsSigningInFacebook(true);
      await signInWithFacebook();
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with Facebook");
    } finally {
      setIsSigningInFacebook(false);
    }
  };

  const handleSignInWithPassword = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      setIsSigningInPassword(true);
      await signInWithPassword(email, password);
      toast.success("Successfully signed in!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsSigningInPassword(false);
    }
  };

  const handleSignUpWithPassword = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      setIsSigningUpPassword(true);
      await signUpWithPassword(email, password);
      toast.success("Account created! Please check your email to verify.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsSigningUpPassword(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setIsResettingPassword(true);
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen h-screen w-full bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(0.985 0.005 250 / 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(0.985 0.005 250 / 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-1/3 w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_oklch(0.7_0.17_250/0.18)_0%,_transparent_60%)] opacity-100 pointer-events-none" />
      </div>

      {/* Floating ResumePilot Logo (top-left) */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-[9999] flex shrink-0 items-center gap-2 font-display text-[15px] font-semibold tracking-tight"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
          <FileCheck2 className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline text-foreground">
          ResumePilot
        </span>
      </Link>

      {/* Floating Theme Toggle (top-right) */}
      <div className="fixed top-6 right-6 z-[9999]">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="h-full w-full flex items-center justify-center px-8 sm:px-10 lg:px-20 xl:px-28 relative z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[66%_34%] gap-x-16 items-start">
          {/* Left: Hero Section (Redesigned) */}
          <div className="hidden lg:block">
            <div className="space-y-7">
              {/* Headline */}
              <div className="space-y-3 mb-7">
                <h1 className="text-foreground font-display text-4xl md:text-5xl lg:text-[3.2rem] font-bold leading-tight tracking-tight">
                  Analyze. <span className="text-gradient">Improve. Land.</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
                  Get ATS score, keyword insights, and expert suggestions to land more interviews.
                </p>
              </div>

              {/* Dashboard Preview Card */}
              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-primary opacity-[0.12] blur-3xl dark:opacity-20" />
                <div className="bg-slate-950/60 dark:bg-slate-900/70 border border-slate-700/60 dark:border-border/50 rounded-3xl px-6 py-5 backdrop-blur-2xl shadow-xl shadow-blue-900/20">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Dashboard</p>
                        <p className="text-xs text-muted-foreground">Welcome back, Arya!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Left Column */}
                    <div className="col-span-5 space-y-4">
                      {/* ATS Score */}
                      <div className="bg-slate-900/60 dark:bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
                        <ScoreRing score={87} size={100} label="" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-display font-bold text-foreground">87</span>
                            <span className="text-sm text-muted-foreground">/100</span>
                          </div>
                          <p className="text-sm font-medium text-green-500 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Excellent
                          </p>
                        </div>
                      </div>

                      {/* Recent Analyses */}
                      <div className="bg-slate-900/60 dark:bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Analyses</p>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="space-y-2.5">
                          {recentAnalyses.map((analysis) => (
                            <div key={analysis.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${analysis.color}`}>
                                  <FileText className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground line-clamp-1">{analysis.role}</p>
                                  <p className="text-[11px] text-muted-foreground">{analysis.time}</p>
                                </div>
                              </div>
                              <span className="text-sm font-bold" style={{ color: analysis.score >= 80 ? "#22c55e" : analysis.score >=70 ? "#eab308" : "#ef4444" }}>
                                {analysis.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-7 space-y-4">
                      {/* Score Trend */}
                      <div className="bg-slate-900/60 dark:bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score Trend</p>
                          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="h-20 flex items-end gap-2 px-1">
                          {scoreTrend.map((score, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t-lg transition-all hover:opacity-90"
                              style={{
                                height: `${score}%`,
                                background: "linear-gradient(to top, #2563eb, #38bdf8)"
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Skills Matched */}
                      <div className="bg-slate-900/60 dark:bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Skills Matched</p>
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skillChips.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 dark:text-cyan-300 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Login Section (EXACTLY THE SAME, NO CHANGES!) */}
          <div className="w-full flex justify-center lg:justify-end lg:pl-4">
            <div className="w-full max-w-[380px]">
              <div className="mb-6 mt-7">
                <h1 className="text-foreground font-display text-3xl font-semibold mb-1.5">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-base">
                  Sign in to continue improving your resume
                </p>
              </div>

              <Card className="border-gray-200 dark:border-border/50 bg-white dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-2xl dark:shadow-black/30 rounded-3xl">
                <CardContent className="p-7">
                  {/* Social Login Buttons */}
                  <div className="flex items-center gap-3">
                      {/* Google */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={handleGoogleLogin}
                              disabled={isSigningIn}
                              className="flex-1 h-14 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl"
                            >
                              {isSigningIn ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Sign in with Google</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* GitHub */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={handleGithubLogin}
                              disabled={isSigningInGithub}
                              className="flex-1 h-14 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl"
                            >
                              {isSigningInGithub ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Github className="h-5 w-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Sign in with GitHub</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Facebook */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={handleFacebookLogin}
                              disabled={isSigningInFacebook}
                              className="flex-1 h-14 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl"
                            >
                              {isSigningInFacebook ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Facebook className="h-5 w-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Sign in with Facebook</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  </div>

                  {/* Separator */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase text-gray-500 dark:text-slate-400 tracking-[0.15em] font-medium">
                      <span className="bg-white dark:bg-slate-900/70 px-3">
                        OR CONTINUE WITH EMAIL
                      </span>
                    </div>
                  </div>

                  {/* Email + Password Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-base text-foreground font-semibold">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-12 h-14 text-base bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl placeholder:text-gray-400 dark:placeholder:text-slate-500"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSigningInPassword || isSigningUpPassword || isResettingPassword}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-base text-foreground font-semibold">
                          Password
                        </label>
                        <button
                          type="button"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={handleResetPassword}
                          disabled={isSigningInPassword || isSigningUpPassword || isResettingPassword}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-12 h-14 text-base bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl placeholder:text-gray-400 dark:placeholder:text-slate-500"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isSigningInPassword || isSigningUpPassword || isResettingPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      <Button
                        variant="hero"
                        className="w-full h-14 text-base shadow-[0_8px_30px_rgb(59,130,246,0.3)] rounded-2xl"
                        onClick={handleSignInWithPassword}
                        disabled={isSigningInPassword || isSigningUpPassword || isResettingPassword}
                      >
                        {isSigningInPassword ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : null}
                        Sign in
                      </Button>
                      <div className="text-center space-y-3">
                        <p className="text-base text-muted-foreground">
                          Don't have an account?{" "}
                          <button
                            type="button"
                            onClick={handleSignUpWithPassword}
                            disabled={isSigningInPassword || isSigningUpPassword || isResettingPassword}
                            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Create account
                          </button>
                        </p>
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Secure
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Lock className="h-4 w-4 text-blue-500" />
                            Private
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

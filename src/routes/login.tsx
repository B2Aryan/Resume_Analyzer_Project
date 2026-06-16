import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Zap, 
  Shield, 
  Lock, 
  Users, 
  Clock,
  ArrowRight,
  BarChart3,
  Calendar,
  Star,
  ChevronRight,
  Target,
  LayoutDashboard,
  History,
  Save,
  Settings,
  Home,
  Bell,
  Mail,
  Github,
  Facebook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import Lottie from "lottie-react";
import profileAvatar from "@/assets/lottie/profile-avatar.json";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in — ResumePilot" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isLoading, signInWithGoogle, signInWithGithub, signInWithFacebook, signInWithEmailOtp, verifyEmailOtp } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInGithub, setIsSigningInGithub] = useState(false);
  const [isSigningInFacebook, setIsSigningInFacebook] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

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

  const handleGithubLogin = async () => {
    console.log("Button clicked");
    console.log("handleGithubLogin called");
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
    console.log("Button clicked");
    console.log("handleFacebookLogin called");
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setIsSendingOtp(true);
      await signInWithEmailOtp(email);
      toast.success("OTP sent to your email");
      setOtpSent(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      setIsVerifyingOtp(true);
      await verifyEmailOtp(email, otp);
      toast.success("Successfully logged in");
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
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

  const recentAnalyses = [
    { id: 1, name: "Frontend Developer Intern", score: 87, date: "2 days ago", keywords: ["React", "TypeScript", "Tailwind"] },
    { id: 2, name: "Full Stack Engineer", score: 72, date: "5 days ago", keywords: ["Node.js", "GraphQL", "PostgreSQL"] },
    { id: 3, name: "UI/UX Designer", score: 91, date: "1 week ago", keywords: ["Figma", "Design Systems", "Accessibility"] }
  ];

  const scoreData = [78, 82, 75, 87, 91, 88, 89];
  const missingKeywords = ["Next.js", "Docker", "AWS", "CI/CD"];

  return (
    <MarketingLayout>
      <section className="hero-ambient min-h-[100vh] pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 items-start">
            {/* Left: Dashboard Preview */}
            <div className="relative hidden lg:block">
              {/* Main Dashboard Preview Card */}
              <Card className="bg-background/80 backdrop-blur-2xl border-border/40 shadow-elegant overflow-hidden w-full h-full">
                {/* Dashboard Header */}
                <div className="flex border-b border-border/50">
                  {/* Sidebar */}
                  <div className="w-16 lg:w-64 border-r border-border/50 bg-background/50 flex flex-col py-4 items-center lg:items-start gap-2 px-3">
                    <div className="flex items-center gap-3 px-3 py-2 w-full rounded-xl bg-muted/30">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                        <span className="font-bold text-white text-xs">AP</span>
                      </div>
                      <span className="font-semibold hidden lg:block">ResumePilot</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full mt-4">
                      <Button variant="ghost" size="sm" className="justify-start gap-2 w-full">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden lg:block">Dashboard</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start gap-2 w-full">
                        <History className="h-4 w-4" />
                        <span className="hidden lg:block">History</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start gap-2 w-full">
                        <Save className="h-4 w-4" />
                        <span className="hidden lg:block">Saved</span>
                      </Button>
                    </div>
                    <div className="mt-auto w-full">
                      <Button variant="ghost" size="sm" className="justify-start gap-2 w-full">
                        <Settings className="h-4 w-4" />
                        <span className="hidden lg:block">Settings</span>
                      </Button>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                      <div>
                        <h2 className="font-semibold text-lg">Dashboard</h2>
                        <p className="text-xs text-muted-foreground">Welcome back, Jane</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-16 w-16">
                          <Lottie
                            autoplay
                            loop
                            animationData={profileAvatar}
                            className="h-full w-full"
                            style={{ width: "100%", height: "100%" }}
                          />
                        </Avatar>
                      </div>
                    </div>

                    {/* Dashboard Body */}
                    <div className="p-6 space-y-6 flex-1">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Average Score</p>
                                <p className="text-2xl font-bold text-gradient">86%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Analyses Saved</p>
                                <p className="text-2xl font-bold">24</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Main ATS Score Card */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-6">
                            <div className="relative h-28 w-28">
                              <svg className="transform -rotate-90 h-full w-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="283" strokeDashoffset="40" className="text-primary" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold">87</span>
                                <span className="text-xs text-muted-foreground">ATS Score</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">Frontend Developer Intern</h3>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Keyword Match</p>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 bg-muted flex-1 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-4/5" />
                                    </div>
                                    <span className="text-xs font-medium">80%</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Skills Score</p>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 bg-muted flex-1 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-9/10" />
                                    </div>
                                    <span className="text-xs font-medium">90%</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">Analyzed 2 days ago</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Score Trend Chart */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Score Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="h-32 flex items-end gap-2 px-6 pb-4">
                            {scoreData.map((score, index) => (
                              <div key={index} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all hover:from-blue-400 hover:to-cyan-400" style={{ height: `${score}%` }} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Analyses & Missing Keywords */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Recent Analyses */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Recent Analyses</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                              {recentAnalyses.map((analysis) => (
                                <div key={analysis.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${analysis.score >= 80 ? "bg-green-500/10" : analysis.score >= 70 ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                                      <FileText className={`h-5 w-5 ${analysis.score >= 80 ? "text-green-500" : analysis.score >= 70 ? "text-yellow-500" : "text-red-500"}`} />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-sm font-medium line-clamp-1">{analysis.name}</p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {analysis.date}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`text-lg font-bold ${analysis.score >= 80 ? "text-green-500" : analysis.score >= 70 ? "text-yellow-500" : "text-red-500"}`}>
                                    {analysis.score}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Missing Keywords */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Missing Keywords</CardTitle>
                            <CardDescription className="text-xs">Add these to improve your score</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {missingKeywords.map((keyword, index) => (
                                <div key={index} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1.5">
                                  <Target className="h-3 w-3" /> {keyword}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Login Card */}
            <div>
              <div className="text-center mb-8 animate-fade-in">
                <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3">Welcome Back</h1>
                <p className="text-muted-foreground text-base">
                  Continue where you left off. Access your ATS reports, score history, and saved analyses.
                </p>
              </div>

              <Card className="border-border/40 bg-background/80 backdrop-blur-2xl shadow-glow animate-fade-in mb-6">
                <CardContent className="p-8">
                  {/* Benefits List */}
                  <div className="space-y-3 mb-8">
                    {[
                      { icon: CheckCircle2, text: "Unlimited resume analyses" },
                      { icon: TrendingUp, text: "ATS score tracking over time" },
                      { icon: FileText, text: "Cloud-saved reports" },
                      { icon: Shield, text: "Secure, privacy-first storage" },
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <benefit.icon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Google Sign-In Button */}
                  <Button
                    variant="hero"
                    className="w-full mb-2 group"
                    size="lg"
                    onClick={handleGoogleLogin}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <svg className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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

                  {/* GitHub Sign-In Button */}
                  <Button
                    variant="hero"
                    className="w-full mb-2 group"
                    size="lg"
                    onClick={handleGithubLogin}
                    disabled={isSigningInGithub}
                  >
                    {isSigningInGithub ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Github className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    )}
                    Continue with GitHub
                  </Button>

                  {/* Facebook Sign-In Button */}
                  <Button
                    variant="hero"
                    className="w-full mb-4 group"
                    size="lg"
                    onClick={handleFacebookLogin}
                    disabled={isSigningInFacebook}
                  >
                    {isSigningInFacebook ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Facebook className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    )}
                    Continue with Facebook
                  </Button>

                  {/* Separator */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  {/* Email OTP Form */}
                  <div className="space-y-4 mb-6">
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <div className="space-y-1.5">
                          <label htmlFor="email" className="text-sm text-muted-foreground">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isSendingOtp}
                            />
                          </div>
                        </div>
                        <Button
                          variant="hero"
                          className="w-full group"
                          size="lg"
                          type="submit"
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          )}
                          {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <div className="space-y-1.5">
                          <label htmlFor="otp" className="text-sm text-muted-foreground">Verification Code</label>
                          <p className="text-xs text-muted-foreground">We've sent a 6-digit code to {email}</p>
                          <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={(value) => setOtp(value)}
                            disabled={isVerifyingOtp}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <Button
                          variant="hero"
                          className="w-full group"
                          size="lg"
                          type="submit"
                          disabled={isVerifyingOtp || otp.length !== 6}
                        >
                          {isVerifyingOtp ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {isVerifyingOtp ? "Verifying..." : "Verify & Login"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Change email address
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Trust Indicators */}
                  <div className="space-y-2">
                    {[
                      { icon: Shield, text: "Secure Google Authentication" },
                      { icon: Lock, text: "No password required" },
                      { icon: Users, text: "Privacy-first design" },
                    ].map((trust, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                        <trust.icon className="h-3 w-3 text-primary" />
                        <span>{trust.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Proof */}
              <div className="text-center animate-fade-in">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Loved by students across campuses worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

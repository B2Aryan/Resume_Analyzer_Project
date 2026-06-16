import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password — ResumePilot" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      console.log("[ResetPasswordPage] Checking for recovery session");
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("[ResetPasswordPage] Supabase client null, navigating to home");
        navigate({ to: "/" });
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("[ResetPasswordPage] getSession result:", { session, error });

      if (!session) {
        console.log("[ResetPasswordPage] No session found, navigating to login");
        toast.error("Reset link expired or invalid");
        navigate({ to: "/login" });
        return;
      }

      console.log("[ResetPasswordPage] Recovery session detected successfully");
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      setIsUpdating(true);
      console.log("[ResetPasswordPage] Calling supabase.auth.updateUser");
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("[ResetPasswordPage] updateUser error:", error);
        throw error;
      }

      console.log("[ResetPasswordPage] updateUser success:", data);
      toast.success("Password updated successfully");
      navigate({ to: "/login" });
    } catch (error: any) {
      console.error("[ResetPasswordPage] Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <MarketingLayout>
        <section className="hero-ambient py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Checking reset link...</p>
          </div>
        </section>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="hero-ambient py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
            <p className="text-muted-foreground">Enter your new password below</p>
          </div>

          <div className="border border-border/60 rounded-xl p-8 bg-background/80 backdrop-blur">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm text-muted-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full mt-4"
                size="lg"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isUpdating ? "Updating Password..." : "Reset Password"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

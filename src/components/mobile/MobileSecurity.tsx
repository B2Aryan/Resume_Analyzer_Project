import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Lock, Shield, Mail, Key, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MobileSecurity() {
  const { user, resetPassword, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const handleBack = () => {
    navigate({ to: "/dashboard/profile" });
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await resetPassword(user.email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (err) {
      toast.error("Failed to send password reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  // Determine Sign-in Method
  const provider = user?.app_metadata?.provider || "email";
  const signInMethod = provider === "email" ? "Email" : provider.charAt(0).toUpperCase() + provider.slice(1);

  // Format Last Login
  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
          aria-label="Back to Profile"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-xl font-bold">Security</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 pl-1">
        Manage your account security.
      </p>

      <div className="space-y-6">
        {/* Card 1: Password */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Lock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-foreground">Password</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Change your account password.</p>
            </div>
          </div>
          <Button
            onClick={handlePasswordReset}
            disabled={isResetting}
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold shadow-md active:scale-95 transition-all"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Email...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>

        {/* Card 2: Active Session */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-foreground">Active Session</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Current session status details.</p>
            </div>
          </div>
          
          <div className="space-y-2.5 pt-3 border-t border-border/20 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sign-in Method</span>
              <span className="font-semibold text-foreground">{signInMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Login</span>
              <span className="font-semibold text-foreground">{lastLogin}</span>
            </div>
            <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-xl border border-border/10">
              <span className="font-semibold text-foreground">Current Device</span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Account Email */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/15 text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-foreground">Account Email</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your registered email address.</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full rounded-xl border border-border/25 bg-muted/30 px-4 py-3 text-xs text-muted-foreground cursor-not-allowed outline-none font-medium"
            />
          </div>
        </div>

        {/* Card 4: Two-factor Authentication */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm opacity-60 cursor-not-allowed">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <Key className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-bold text-foreground">Two-factor Authentication</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security.</p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
              Soon
            </span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
            Danger Zone
          </p>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card p-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-11 rounded-full border-red-500/30 text-red-500 hover:bg-red-500/5 hover:text-red-500 active:scale-95 font-semibold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

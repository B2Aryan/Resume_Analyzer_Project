import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import {
  ChevronLeft,
  Sparkles,
  Save,
  MessageSquare,
  Megaphone,
  TrendingUp,
  Mail,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function MobileNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  const [prefs, setPrefs] = useState({
    analysisCompleted: user?.user_metadata?.notifications_analysis_completed ?? true,
    savedReports: user?.user_metadata?.notifications_saved_reports ?? true,
    mockInterviewUpdates: user?.user_metadata?.notifications_mock_interview_updates ?? true,
    productAnnouncements: user?.user_metadata?.notifications_product_announcements ?? true,
    weeklyProgressSummary: user?.user_metadata?.notifications_weekly_progress_summary ?? true,
    emailNotifications: user?.user_metadata?.notifications_email_notifications ?? true,
  });

  const handleBack = () => {
    navigate({ to: "/dashboard/profile" });
  };

  const handleToggle = async (key: keyof typeof prefs) => {
    const newValue = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newValue }));

    if (supabase) {
      try {
        const metaKey = `notifications_${key.replace(/([A-Z])/g, "_$1").toLowerCase()}`;
        const { error } = await supabase.auth.updateUser({
          data: {
            [metaKey]: newValue,
          },
        });
        if (error) throw error;
        toast.success("Preferences updated successfully.");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update preferences.");
        // Rollback state on error
        setPrefs((prev) => ({ ...prev, [key]: !newValue }));
      }
    }
  };

  const items = [
    {
      key: "analysisCompleted" as const,
      title: "Analysis Completed",
      desc: "Notify when an ATS analysis finishes.",
      icon: Sparkles,
      iconColor: "bg-blue-500/15 text-blue-400",
    },
    {
      key: "savedReports" as const,
      title: "Saved Reports",
      desc: "Notify when reports are successfully saved.",
      icon: Save,
      iconColor: "bg-purple-500/15 text-purple-400",
    },
    {
      key: "mockInterviewUpdates" as const,
      title: "Mock Interview Updates",
      desc: "Receive updates about interview features.",
      icon: MessageSquare,
      iconColor: "bg-emerald-500/15 text-emerald-400",
    },
    {
      key: "productAnnouncements" as const,
      title: "Product Announcements",
      desc: "New ResumePilot features and improvements.",
      icon: Megaphone,
      iconColor: "bg-pink-500/15 text-pink-400",
    },
    {
      key: "weeklyProgressSummary" as const,
      title: "Weekly Progress Summary",
      desc: "Receive weekly career insights.",
      icon: TrendingUp,
      iconColor: "bg-amber-500/15 text-amber-400",
    },
  ];

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
        <h1 className="font-display text-xl font-bold">Notifications</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 pl-1">
        Manage your notification preferences.
      </p>

      <div className="space-y-6">
        {/* Section 1: Notification Preferences */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Notification Preferences
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-5 shadow-sm">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-none">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs[item.key]}
                    onCheckedChange={() => handleToggle(item.key)}
                    aria-label={`Toggle ${item.title}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Email Notifications */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Email Notifications
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-500/15 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-none">
                    Email Status
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-none truncate max-w-[200px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Switch
                checked={prefs.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
                aria-label="Toggle Email Notifications"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notification History */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Notification History
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-8 text-center shadow-sm flex flex-col items-center justify-center min-h-[220px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground">
              No notifications yet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
              You'll see important ResumePilot updates here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

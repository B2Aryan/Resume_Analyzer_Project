import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { PRESET_AVATARS } from "@/lib/avatars";
import { hasPremiumAccess } from "@/lib/access";
import { MobileFeedbackDrawer } from "@/components/mobile/MobileFeedbackDrawer";
import { Button } from "@/components/ui/button";
import {
  User,
  Star,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
  Loader2,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";

export function MobileProfile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const queryClient = useQueryClient();
  const showHelpSupport = search.section === "help";
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => (user ? fetchAnalysesFromDB(user) : []),
    enabled: !!user,
  });

  const displayName =
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = profile?.avatar_id
    ? PRESET_AVATARS.find((a) => a.id === profile.avatar_id)?.url
    : user?.user_metadata?.avatar_url;

  const isPremium = hasPremiumAccess(profile);

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  interface ProfileItem {
    label: string;
    icon: any;
    iconColor: string;
    to?: string;
    isTheme?: boolean;
    search?: Record<string, string>;
  }

  const sections: Array<{ title: string; items: ProfileItem[] }> = [
    {
      title: "Account",
      items: [
        {
          label: "Edit Profile",
          icon: User,
          iconColor: "bg-blue-500/15 text-blue-400",
          to: "/dashboard/profile",
          search: { edit: "true" },
        },
        {
          label: "Premium",
          icon: Star,
          iconColor: "bg-amber-500/15 text-amber-400",
          to: "/coming-soon",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "Notifications",
          icon: Bell,
          iconColor: "bg-purple-500/15 text-purple-400",
          to: "/dashboard/notifications",
        },
        {
          label: "Appearance",
          icon: Palette,
          iconColor: "bg-pink-500/15 text-pink-400",
          isTheme: true,
        },
        {
          label: "Security",
          icon: Shield,
          iconColor: "bg-green-500/15 text-green-400",
          to: "/dashboard/security",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          label: "Help & Support",
          icon: HelpCircle,
          iconColor: "bg-cyan-500/15 text-cyan-400",
          to: "/coming-soon",
        },
        {
          label: "About",
          icon: Info,
          iconColor: "bg-slate-500/15 text-slate-400",
          to: "/about",
        },
      ],
    },
  ];

  if (showHelpSupport) {
    return (
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-4 lg:hidden">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/dashboard/profile" })}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
            aria-label="Back to Profile"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-display text-2xl font-bold">Help & Support</h1>
        </div>

        {/* Help items list */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            {[
              {
                label: "FAQ",
                icon: HelpCircle,
                iconColor: "bg-cyan-500/15 text-cyan-400",
                onClick: () => navigate({ to: "/faq" as any, search: { from: "help" } }),
              },
              {
                label: "Privacy Policy",
                icon: Shield,
                iconColor: "bg-green-500/15 text-green-400",
                onClick: () => navigate({ to: "/privacy" as any, search: { from: "help" } }),
              },
              {
                label: "Terms",
                icon: Info,
                iconColor: "bg-slate-500/15 text-slate-400",
                onClick: () => navigate({ to: "/terms" as any, search: { from: "help" } }),
              },
              {
                label: "Data Deletion",
                icon: Trash2,
                iconColor: "bg-red-500/15 text-red-400",
                onClick: () => navigate({ to: "/data-deletion" as any, search: { from: "help" } }),
              },
              {
                label: "Contact Support",
                icon: HelpCircle,
                iconColor: "bg-blue-500/15 text-blue-400",
                onClick: () => {
                  window.location.href = "mailto:support@resumepilot.site?subject=ResumePilot Support Request";
                },
              },
            ].map((item, i, arr) => {
              const Icon = item.icon;
              const isLast = i === arr.length - 1;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/50 ${
                    !isLast ? "border-b border-border/40" : ""
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          {/* Feedback Card */}
          <div
            onClick={() => setIsFeedbackOpen(true)}
            className="rounded-2xl border border-border/40 bg-card p-5 cursor-pointer hover:bg-card/85 active:bg-muted/30 transition-colors"
          >
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-sm font-bold text-foreground">Feedback</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Help us improve ResumePilot by sharing bugs, ideas and feature requests.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFeedbackOpen(true);
                    }}
                    className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold shadow-md active:scale-95 transition-all"
                  >
                    Send Feedback
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MobileFeedbackDrawer isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-4 lg:hidden">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
      </div>

      {/* User Card */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5">
        <Avatar className="h-16 w-16 rounded-2xl">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="rounded-2xl text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{displayName}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isPremium
                ? "bg-amber-500/15 text-amber-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isPremium ? "⭐ Premium" : "Free Plan"}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {isLoading ? (
          <div className="col-span-3 flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border/40 bg-card p-4 text-center">
              <p className="font-display text-xl font-bold">{analyses.length}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Analyses</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card p-4 text-center">
              <p className="font-display text-xl font-bold">
                {analyses.length > 0
                  ? `${Math.max(...analyses.map((a) => a.analysis_result.score))}%`
                  : "—"}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Best ATS</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card p-4 text-center">
              <p className="font-display text-xl font-bold">
                {analyses.filter((a) => a.is_saved).length}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Saved</p>
            </div>
          </>
        )}
      </div>

      {/* Settings Sections */}
      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                const isLast = i === section.items.length - 1;
                const classes = `flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/50 ${
                  !isLast ? "border-b border-border/40" : ""
                }`;

                if (item.isTheme) {
                  return (
                    <div key={item.label} className={classes}>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                      <ThemeToggle />
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === "Help & Support") {
                        navigate({ to: "/dashboard/profile", search: { section: "help" } });
                      } else if (item.to) {
                        navigate({ to: item.to as any, search: (item as any).search });
                      }
                    }}
                    className={`w-full text-left ${classes}`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account Actions
          </p>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="flex-1 text-sm font-medium text-red-500">
                Log Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

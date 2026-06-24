import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Upload, History, Bookmark, MessageSquare, CreditCard, User, FileCheck2, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PRESET_AVATARS } from "@/lib/avatars";
import { useQueryClient } from "@tanstack/react-query";

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/interviews", label: "Mock Interviews", icon: MessageSquare },
  { to: "/dashboard/saved", label: "Saved Reports", icon: Bookmark },
  { to: "/coming-soon", label: "Coming Soon", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profile", icon: User },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const getCurrentAvatarUrl = () => {
    if (profile?.avatar_id) {
      const avatar = PRESET_AVATARS.find(a => a.id === profile.avatar_id);
      return avatar?.url;
    }
    return user?.user_metadata?.avatar_url;
  };

  const getDisplayName = () => {
    return profile?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex sticky top-0 overflow-y-auto">
      <Link to="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 font-display font-bold">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
          <FileCheck2 className="h-5 w-5" />
        </span>
        ResumePilot
      </Link>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getCurrentAvatarUrl()} />
            <AvatarFallback>{getInitials(getDisplayName())}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Link to="/" className="truncate text-sm font-medium text-sidebar-foreground hover:text-primary transition-colors block">
              {getDisplayName()}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </aside>
  );
}

export function AppShell({ children, title, subtitle, actions }: { children: React.ReactNode; title?: string; subtitle?: string; actions?: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header — mobile: auto height so long titles wrap; desktop: fixed h-16 */}
        <header className="flex min-h-[4rem] items-center justify-between gap-3 border-b border-border bg-background/70 px-4 py-2 backdrop-blur sm:h-16 sm:px-8 sm:py-0 shrink-0">
          <div className="min-w-0 flex-1">
            {title && (
              <>
                {/* Mobile: wrap in Link so tapping the name navigates home */}
                <Link
                  to="/"
                  className="font-display text-base font-semibold leading-snug sm:hidden"
                >
                  {title}
                </Link>
                {/* Desktop/tablet: plain heading, no link */}
                <h1 className="hidden font-display text-base font-semibold leading-snug sm:block sm:text-lg">
                  {title}
                </h1>
              </>
            )}
            {/* Subtitle hidden on mobile, visible on sm+ */}
            {subtitle && (
              <p className="hidden text-xs text-muted-foreground sm:block">{subtitle}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2"><ThemeToggle />{actions}</div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

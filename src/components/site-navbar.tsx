import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { memo, useState } from "react";
import { FileCheck2, Menu, X, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { PRESET_AVATARS } from "@/lib/avatars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";

function SiteNavbarImpl() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const getCurrentAvatarUrl = () => {
    if (profile?.avatar_id) {
      const avatar = PRESET_AVATARS.find(a => a.id === profile.avatar_id);
      return avatar?.url;
    }
    return user?.user_metadata?.avatar_url;
  };
  
  const getDisplayName = () => {
    return profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  };

  const currentPath = (pathname.replace(/\/+$/, "") || "/").toLowerCase();

  const links = [
    { to: "/features", label: "Features" },
    { to: "/how-it-works", label: "How it works" },
    { to: "/coming-soon", label: "Coming Soon" },
    { to: "/faq", label: "FAQ" },
  ] as const;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <style>{`
        .nav-bar {
          background: color-mix(in oklab, var(--background) 70%, transparent);
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          border-bottom: 1px solid color-mix(in oklab, var(--foreground) 7%, transparent);
        }
        .dark .nav-bar {
          background: rgba(2, 6, 23, 0.15);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .dark .nav-bar::before {
          content: "";
          position: absolute;
          left: -25%;
          top: -120px;
          width: 900px;
          height: 360px;
          background:
            radial-gradient(circle at 30% 40%, rgba(37, 99, 235, 0.14), transparent 75%);
          filter: blur(70px);
          z-index: 0;
          pointer-events: none;
        }
        .dark .nav-bar::after {
          content: "";
          position: absolute;
          right: -35%;
          top: -160px;
          width: 1100px;
          height: 420px;
          background:
            radial-gradient(circle at 60% 45%, rgba(14, 165, 233, 0.32), transparent 68%),
            radial-gradient(circle at 80% 55%, rgba(56, 189, 248, 0.22), transparent 75%);
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }
        .dark .nav-bar > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <header
        className="nav-bar fixed top-0 left-0 right-0 z-[9999] w-full"
      >
      <nav className="mx-auto flex h-[60px] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <FileCheck2 className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline text-foreground">
            ResumePilot
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => {
            const active = currentPath === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`text-[13px] font-medium transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <div className="mx-1 h-4 w-px bg-border" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 text-[13px] font-medium transition-colors hover:bg-foreground/5 rounded-full py-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getCurrentAvatarUrl() || ""} alt={getDisplayName()} />
                    <AvatarFallback>
                      {getInitials(getDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-foreground">
                    {getDisplayName()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl border-border/60 bg-background/80 backdrop-blur-xl shadow-soft z-[10000]" sideOffset={8}>
                {/* Header Section */}
                <div className="flex items-center gap-3 px-3 py-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getCurrentAvatarUrl() || ""} alt={getDisplayName()} />
                    <AvatarFallback className="text-lg">
                      {getInitials(getDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
                {/* Menu Items */}
                <div className="space-y-1 py-1">
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })} className="rounded-xl px-3 py-2 cursor-pointer gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/profile" })} className="rounded-xl px-3 py-2 cursor-pointer gap-3">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                {/* Sign Out */}
                <DropdownMenuItem onClick={async () => { await signOut(); queryClient.clear(); navigate({ to: "/" }); }} className="rounded-xl px-3 py-2 cursor-pointer gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            </>
          )}
          <Button asChild variant="hero" size="sm" className="rounded-full px-4 text-[13px] font-semibold">
            <Link to="/upload">Analyze Resume</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-3 space-y-1">
            {links.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getCurrentAvatarUrl() || ""} alt={getDisplayName()} />
                      <AvatarFallback>
                        {getInitials(getDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{getDisplayName()}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="border-t border-border my-1" />
                  <Button asChild variant="outline" size="sm" className="rounded-full" onClick={() => setOpen(false)}><Link to="/dashboard">Dashboard</Link></Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full" onClick={() => setOpen(false)}><Link to="/dashboard/profile">Profile</Link></Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={async () => { await signOut(); queryClient.clear(); navigate({ to: "/" }); setOpen(false); }}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="rounded-full"><Link to="/login">Log in</Link></Button>
                </>
              )}
              <Button asChild variant="hero" size="sm" className="rounded-full" onClick={() => setOpen(false)}><Link to="/upload">Analyze Resume</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}

export const SiteNavbar = memo(SiteNavbarImpl);

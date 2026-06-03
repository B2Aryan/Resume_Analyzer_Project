import { Link, useLocation } from "@tanstack/react-router";
import { memo, useState } from "react";
import { FileCheck2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

function SiteNavbarImpl() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const currentPath = (pathname.replace(/\/+$/, "") || "/").toLowerCase();

  const links = [
    { to: "/features", label: "Features" },
    { to: "/how-it-works", label: "How it works" },
    { to: "/pricing", label: "Pricing" },
    { to: "/faq", label: "FAQ" },
  ] as const;

  return (
    <>
      <style>{`
        .nav-bar {
          overflow: hidden;
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
          <Link
            to="/login"
            className="px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
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
              <Button asChild variant="outline" size="sm" className="rounded-full"><Link to="/login">Log in</Link></Button>
              <Button asChild variant="hero" size="sm" className="rounded-full"><Link to="/upload">Analyze Resume</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}

export const SiteNavbar = memo(SiteNavbarImpl);

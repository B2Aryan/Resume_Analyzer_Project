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
    <header
      className="nav-bar fixed top-0 left-0 right-0 z-[9999] w-full"
    >
      <nav className="mx-auto flex h-[60px] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <FileCheck2 className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline text-foreground">
            ResumeCheck<span className="text-primary"> AI</span>
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
  );
}

export const SiteNavbar = memo(SiteNavbarImpl);

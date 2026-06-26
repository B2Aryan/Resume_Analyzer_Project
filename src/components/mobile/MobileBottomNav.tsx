import { useRouterState } from "@tanstack/react-router";
import { Home, Grid2X2, ScanSearch, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tab = {
  to: string;
  label: string;
  icon: LucideIcon;
  center?: boolean;
};

const tabs: Tab[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/mobile/tools", label: "Tools", icon: Grid2X2 },
  { to: "/upload", label: "Analyze", icon: ScanSearch, center: true },
  { to: "/mobile/insights", label: "Insights", icon: BarChart2 },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      aria-label="Mobile navigation"
    >
      {/* Frosted glass background */}
      <div className="mx-3 mb-3 rounded-2xl border border-border/40 bg-background/90 shadow-[0_-4px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:bg-background/80">
        <div className="flex items-center justify-around px-2 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.to === "/dashboard"
                ? path === "/dashboard"
                : path.startsWith(tab.to);

            if (tab.center) {
              return (
                <a
                  key={tab.to}
                  href={tab.to}
                  className="flex flex-col items-center justify-center"
                  aria-label={tab.label}
                >
                  <div className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-200 active:scale-95">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </a>
              );
            }

            return (
              <a
                key={tab.to}
                href={tab.to}
                className="relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200"
                aria-label={tab.label}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

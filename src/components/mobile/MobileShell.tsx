/**
 * MobileShell — wraps content for mobile/tablet screens (< 1024px).
 * Provides safe-area padding above the bottom nav.
 * Desktop AppShell renders its own layout and is never touched.
 */
import { ReactNode } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

interface MobileShellProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export function MobileShell({ children, hideBottomNav }: MobileShellProps) {
  return (
    <div className={`relative flex min-h-screen flex-col bg-background ${hideBottomNav ? "" : "pb-[5.5rem]"}`}>
      <main className="flex-1 overflow-x-hidden">{children}</main>
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
}

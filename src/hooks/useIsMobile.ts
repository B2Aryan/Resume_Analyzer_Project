import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * Returns true when the viewport is below the desktop breakpoint (< 1024px).
 * SSR-safe: defaults to false on the server so the desktop HTML is rendered
 * first, preventing hydration mismatches.
 * Reacts to viewport changes (window resize / orientation change).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Server or environments without matchMedia → assume desktop
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(MOBILE_QUERY);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    // Legacy fallback (Safari < 14)
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  return isMobile;
}

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightClassName?: string;
}

/**
 * Generic cursor-tracking ambient spotlight wrapper.
 * Renders an absolutely-positioned glow layer that smoothly follows the pointer.
 */
export function SpotlightCard({ children, className, spotlightClassName }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 50, ty = 50, cx = 50, cy = 50, active = false, raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      tx = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      ty = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      active = true;
    };
    const onLeave = () => { active = false; };

    const tick = () => {
      const k = 0.12;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      card.style.setProperty("--mx", cx + "%");
      card.style.setProperty("--my", cy + "%");
      card.style.setProperty("--spot-opacity", active ? "0.9" : "0");
      raf = requestAnimationFrame(tick);
    };

    if (!reduce) {
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(tick);
    }
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={cardRef} className={cn("relative isolate overflow-hidden", className)}>
      <div className={cn("report-spotlight", spotlightClassName)} aria-hidden="true" />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

import { useEffect, useRef, type ReactNode } from "react";

interface CTAPanelProps {
  children: ReactNode;
}

/**
 * Premium CTA panel: cursor-following ambient spotlight (smoothly interpolated).
 */
export function CTAPanel({ children }: CTAPanelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tx = 50, ty = 50;
    let cx = 50, cy = 50;
    let active = false;
    let raf = 0;

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
      card.style.setProperty("--spot-opacity", active ? "1" : "0");
      raf = requestAnimationFrame(tick);
    };

    if (!reduce) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="cta-wrap">
      <div ref={cardRef} className="cta-panel">
        <div className="cta-spotlight" aria-hidden="true" />
        <div className="cta-inner">{children}</div>
      </div>
    </div>
  );
}

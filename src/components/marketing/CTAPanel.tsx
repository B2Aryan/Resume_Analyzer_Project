import { useEffect, useRef, type ReactNode } from "react";

interface CTAPanelProps {
  children: ReactNode;
}

/**
 * Premium CTA panel:
 *  - cursor-following ambient spotlight (smoothly interpolated)
 *  - slow diagonal reflection sweep
 *  - subtle parallax tilt
 *  - quiet border + soft outer ambient glow
 */
export function CTAPanel({ children }: CTAPanelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // target + current values (percent for spotlight, deg for tilt)
    let tx = 50, ty = 50;            // target mouse % within card
    let cx = 50, cy = 50;            // current (lerped)
    let trx = 0, try_ = 0;           // target tilt
    let crx = 0, cry = 0;            // current tilt
    let active = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      tx = Math.max(0, Math.min(100, x));
      ty = Math.max(0, Math.min(100, y));
      // small tilt: map -50..50 -> -2..2 deg, invert for natural feel
      trx = ((50 - ty) / 50) * 2;
      try_ = ((tx - 50) / 50) * 2;
      active = true;
    };
    const onLeave = () => {
      tx = 50; ty = 50; trx = 0; try_ = 0;
    };

    const tick = () => {
      // smooth interpolation
      const k = 0.08;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      crx += (trx - crx) * 0.1;
      cry += (try_ - cry) * 0.1;
      card.style.setProperty("--mx", cx + "%");
      card.style.setProperty("--my", cy + "%");
      card.style.setProperty("--rx", crx.toFixed(3) + "deg");
      card.style.setProperty("--ry", cry.toFixed(3) + "deg");
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
        <span className="cta-sweep" aria-hidden="true" />
        <div className="cta-inner">{children}</div>
      </div>
    </div>
  );
}

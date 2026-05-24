import { useEffect, useRef, useState } from "react";

interface TypingTextProps {
  phrases: string[];
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  holdMs?: number;
  className?: string;
}

export function TypingText({
  phrases,
  typingSpeedMs = 65,
  deletingSpeedMs = 40,
  holdMs = 1400,
  className,
}: TypingTextProps) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!deleting && text === current) {
      timeoutRef.current = setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && text === "") {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
    } else {
      const delay = deleting ? deletingSpeedMs : typingSpeedMs;
      timeoutRef.current = setTimeout(() => {
        setText((t) =>
          deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
        );
      }, delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, deleting, phraseIndex, phrases, typingSpeedMs, deletingSpeedMs, holdMs]);

  const longest = phrases.reduce((a, b) => (a.length >= b.length ? a : b), "");

  return (
    <span
      className="relative inline-grid align-baseline"
      style={{
        verticalAlign: "baseline",
        lineHeight: 1.2,
        paddingTop: "0.1em",
        paddingBottom: "0.2em",
        overflow: "visible",
      }}
    >
      {/* width reserver — keeps layout perfectly stable */}
      <span
        aria-hidden="true"
        className={`invisible col-start-1 row-start-1 whitespace-pre ${className ?? ""}`}
        style={{ overflow: "visible" }}
      >
        {longest}
      </span>
      <span
        className={`col-start-1 row-start-1 whitespace-pre ${className ?? ""}`}
        style={{ overflow: "visible", display: "inline-block", minHeight: "1.3em" }}
      >
        {text}
        <span aria-hidden="true" className="typing-cursor">|</span>
      </span>
    </span>
  );
}

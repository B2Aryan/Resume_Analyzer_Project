import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 180,
  label = "ATS Score",
  fixedColors,
}: {
  score: number;
  size?: number;
  label?: string;
  fixedColors?: {
    muted?: string;
    scoreColor?: string;
    textColor?: string;
    labelColor?: string;
  };
}) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    fixedColors?.scoreColor ??
    (score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--destructive)");

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fixedColors?.muted ?? "var(--muted)"}
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none"
          style={{
            fontSize: size * 0.32,
            color: fixedColors?.textColor ?? undefined,
          }}
        >
          {score}
        </span>
        <span
          className="mt-1 font-medium uppercase tracking-wider"
          style={{
            fontSize: Math.max(9, size * 0.085),
            color: fixedColors?.labelColor ?? undefined,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export function ScoreBar({
  label,
  value,
  hint,
  fixedColors,
}: {
  label: string;
  value: number;
  hint?: string;
  fixedColors?: {
    bg?: string;
    labelText?: string;
    valueText?: string;
    barBg?: string;
    barFill?: string;
    hintText?: string;
  };
}) {
  const tone = value >= 80 ? "bg-success" : value >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span
          className="font-medium"
          style={{ color: fixedColors?.labelText ?? undefined }}
        >
          {label}
        </span>
        <span
          className="font-semibold"
          style={{ color: fixedColors?.valueText ?? undefined }}
        >
          {value}
          <span style={{ color: fixedColors?.hintText ?? undefined }}>/100</span>
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted"
        style={{ background: fixedColors?.barBg ?? "var(--muted)" }}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-1000", !fixedColors?.barFill ? tone : "")}
          style={{
            width: `${Math.max(value, 0.5)}%`,
            background: fixedColors?.barFill ?? undefined,
          }}
        />
      </div>
      {hint && (
        <p
          className="mt-1 text-xs"
          style={{ color: fixedColors?.hintText ?? undefined }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

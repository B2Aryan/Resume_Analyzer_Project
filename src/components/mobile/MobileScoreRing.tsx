/**
 * Minimal score ring for the mobile ATS card.
 * Standalone — does not depend on the existing ScoreRing component
 * so desktop rendering is unaffected.
 */
interface MobileScoreRingProps {
  score: number;
  size?: number;
}

function getColor(score: number) {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#f59e0b"; // amber
  return "#ef4444";                  // red
}

function getLabel(score: number) {
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Work";
}

export function MobileScoreRing({ score, size = 96 }: MobileScoreRingProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);
  const label = getLabel(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth={8}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

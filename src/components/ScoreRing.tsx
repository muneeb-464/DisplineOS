import { cn } from "@/lib/utils";

interface Props {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function ScoreRing({ value, max = 2000, size = 180, stroke = 14, label, sublabel, className }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = c * (1 - pct);

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--surface-3))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="hsl(var(--primary))" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease", filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-4xl font-bold tracking-tight">{value.toLocaleString()}</div>
          {sublabel && <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{sublabel}</div>}
          {label && <div className="text-sm text-foreground mt-0.5">{label}</div>}
        </div>
      </div>
    </div>
  );
}

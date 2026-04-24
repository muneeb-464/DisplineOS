import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "danger";
  progress?: number; // 0..1
}

export default function StatCard({ label, value, sub, icon, variant = "default", progress }: Props) {
  const accent =
    variant === "primary" ? "text-primary" :
    variant === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className={cn("mt-4 font-display text-4xl font-bold", accent)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-4 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full", variant === "danger" ? "bg-destructive" : "bg-primary")}
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

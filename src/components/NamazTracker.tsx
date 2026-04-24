import { getPrayerStatus, PRAYER_WINDOWS } from "@/lib/namaz";
import { PRAYERS, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";

interface NamazTrackerProps {
  date: string;
  isStarted?: boolean;
}

export default function NamazTracker({ date, isStarted = true }: NamazTrackerProps) {
  const namaz = useStore((s) => s.namaz);
  const toggle = useStore((s) => s.toggleNamaz);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PRAYERS.map((p) => {
          const log = namaz.find((n) => n.date === date && n.prayer === p);
          const done = !!log?.completed;
          // Only show "missed" state (red) if the day was started — penalties only apply then
          const rawStatus = getPrayerStatus(date, p, namaz);
          const status = !isStarted && rawStatus === "missed" ? "pending" : rawStatus;
          const window = PRAYER_WINDOWS[p];
          const label = `${String(Math.floor(window.start / 60)).padStart(2, "0")}:${String(window.start % 60).padStart(2, "0")} – ${String(Math.floor(window.end / 60)).padStart(2, "0")}:${String(window.end % 60).padStart(2, "0")}`;
          return (
            <button
              key={p}
              onClick={() => toggle(date, p)}
              title={p}
              className={cn(
                "min-h-14 rounded-md border p-2 text-left transition",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : status === "missed"
                    ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
                    : "border-border bg-surface-2 text-foreground hover:bg-surface-3"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{p}</span>
                <span className="text-xs opacity-80">{done ? "✓" : status === "missed" ? "✕" : "·"}</span>
              </div>
              <div className={cn("mt-1 text-[11px]", done ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</div>
            </button>
          );
        })}
      </div>
      {isStarted
        ? <p className="text-xs text-muted-foreground">Penalty only applies after a prayer window fully ends. You can still mark any prayer at any time.</p>
        : <p className="text-xs text-amber-500/80">Day not started — Namaz logged here won't count toward penalties until you start the day.</p>
      }
    </div>
  );
}

export function NamazIcon() { return <Moon className="h-4 w-4 text-primary" />; }

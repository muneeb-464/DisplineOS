import { useEffect, useMemo, useRef, useState } from "react";
import { TimeBlock } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, minutesToLabel, nowMinutes } from "@/lib/utils";
import { Zap } from "lucide-react";

const START_HOUR = 0;
const END_HOUR = 23;
const HOUR_PX = 72;

interface Props {
  date: string;
  blocks: TimeBlock[];
  onSlotClick: (startMin: number) => void;
  onBlockClick: (block: TimeBlock) => void;
  ghostBlocks?: TimeBlock[]; // shown faded (planned overlay on log screen)
  isToday?: boolean;
}

export default function Timeline({ date, blocks, onSlotClick, onBlockClick, ghostBlocks = [], isToday }: Props) {
  const categories = useStore((s) => s.categories);
  const [now, setNow] = useState(nowMinutes());
  useEffect(() => {
    const t = setInterval(() => setNow(nowMinutes()), 30000);
    return () => clearInterval(t);
  }, []);

  const totalMinutes = (END_HOUR - START_HOUR + 1) * 60;
  const containerHeight = (END_HOUR - START_HOUR + 1) * HOUR_PX;
  const minToPx = (m: number) => ((m - START_HOUR * 60) / 60) * HOUR_PX;

  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  const renderBlock = (b: TimeBlock, ghost = false) => {
    const cat = categories.find((c) => c.id === b.subCategoryId);
    if (!cat) return null;
    const top = minToPx(b.startMin);
    const height = Math.max(((b.endMin - b.startMin) / 60) * HOUR_PX - 6, 36);
    const accent =
      cat.type === "productive" ? "border-l-cat-productive bg-cat-productive/5"
      : cat.type === "routine" ? "border-l-cat-routine bg-cat-routine/5"
      : "border-l-cat-wasted bg-cat-wasted/5";
    return (
      <button
        key={b.id}
        onClick={(e) => { e.stopPropagation(); onBlockClick(b); }}
        style={{ top, height }}
        className={cn(
          "absolute left-20 right-4 rounded-xl border border-border border-l-4 px-4 py-3 text-left transition",
          accent,
          ghost ? "opacity-30 hover:opacity-50" : "hover:border-primary/40 bg-surface-1"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {cat.isDeepWork && <Zap className="h-3.5 w-3.5 text-primary" />}
              <h4 className="font-display font-semibold truncate">{cat.name}</h4>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {minutesToLabel(b.startMin)} – {minutesToLabel(b.endMin)} · {((b.endMin - b.startMin) / 60).toFixed(1)}h
            </p>
          </div>
          <span className={cn(
            "chip text-[10px] uppercase tracking-wider",
            cat.type === "productive" && "chip-primary",
            cat.type === "wasted" && "bg-cat-wasted/20 text-cat-wasted",
          )}>{cat.type}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {/* hour rows */}
      {hours.map((h) => (
        <div
          key={h}
          onClick={() => onSlotClick(h * 60)}
          className="absolute left-0 right-0 border-t border-border/60 cursor-pointer hover:bg-surface-2/40 transition"
          style={{ top: minToPx(h * 60), height: HOUR_PX }}
        >
          <span className="absolute left-0 -top-2 text-xs text-muted-foreground font-mono">
            {String(h).padStart(2, "0")}:00
          </span>
        </div>
      ))}

      {/* ghost (planned) blocks */}
      {ghostBlocks.map((b) => renderBlock(b, true))}

      {/* real blocks */}
      {blocks.map((b) => renderBlock(b))}

      {/* NOW line */}
      {isToday && now >= START_HOUR * 60 && now <= END_HOUR * 60 && (
        <div className="absolute left-16 right-2 z-20 pointer-events-none" style={{ top: minToPx(now) }}>
          <div className="flex items-center gap-2">
            <span className="chip chip-primary text-[10px] tracking-widest animate-pulse-glow">NOW</span>
            <div className="flex-1 h-px bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
          </div>
        </div>
      )}
    </div>
  );
}

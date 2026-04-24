import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { computeDayScore, useStore } from "@/lib/store";
import { formatDateLong, isoFromDate, parseISODateLocal, todayISO } from "@/lib/utils";
import { ChevronDown, ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Reflect() {
  const [date, setDate] = useState(todayISO());
  const [calOpen, setCalOpen] = useState(false);
  const score = computeDayScore(date);
  const reflections = useStore((s) => s.reflections);
  const addReflection = useStore((s) => s.addReflection);

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const save = () => {
    addReflection({
      date, wentWell: a, wasted: b, tomorrow: c,
      score: score.total, productiveHours: score.productiveHours, namazCompleted: score.namazCompleted,
    });
    setA(""); setB(""); setC("");
    toast.success("Reflection saved.");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-8 sm:py-12">

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{formatDateLong(date)}</p>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 border-border bg-surface-2 hover:bg-surface-3 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(parseISODateLocal(date), "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto border-border bg-surface-1 p-0" align="start">
              <Calendar
                mode="single"
                selected={parseISODateLocal(date)}
                onSelect={(d) => { if (d) { setDate(isoFromDate(d)); setCalOpen(false); } }}
                disabled={(d) => d > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">End of day reflection</h1>
          <span className="chip chip-primary text-sm">{score.isStarted ? score.total : "—"} pts</span>
        </div>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-8">
        <Summary label="Final Score" value={score.isStarted ? score.total.toString() : "—"} />
        <Summary label="Productive hrs" value={score.isStarted ? `${score.productiveHours.toFixed(1)}h` : "—"} />
        <Summary label="Namaz" value={score.isStarted ? `${score.namazCompleted}/5` : "—"} className="col-span-2 sm:col-span-1" />
      </div>

      {/* Form */}
      <Field label="What went well today?" value={a} onChange={setA} placeholder="Identify your wins, however small…" />
      <Field label="What did I waste time on and why?" value={b} onChange={setB} placeholder="Audit the friction points…" />
      <Field label="What will I do differently tomorrow?" value={c} onChange={setC} placeholder="Define the structural change…" />

      <Button onClick={save} className="w-full h-12 sm:h-14 bg-primary text-primary-foreground hover:bg-primary-glow text-base font-semibold">
        Save Reflection <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      {/* Past reflections */}
      <div className="mt-12">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Past reflections</h2>
        {reflections.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reflections yet.</p>
        ) : (
          <div className="space-y-2">
            {reflections.map((r) => (
              <div key={r.id} className="surface-card overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-2 transition"
                >
                  <div className="text-left min-w-0 mr-3">
                    <p className="font-display font-semibold truncate">{formatDateLong(r.date)}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.wentWell || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="chip chip-primary">{r.score} pts</span>
                    <ChevronDown className={cn("h-4 w-4 transition", openId === r.id && "rotate-180")} />
                  </div>
                </button>
                {openId === r.id && (
                  <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 space-y-3 border-t border-border">
                    <Detail label="What went well" text={r.wentWell} />
                    <Detail label="What I wasted time on" text={r.wasted} />
                    <Detail label="What I'll change" text={r.tomorrow} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mb-5">
      <label className="font-display text-base font-semibold sm:text-lg">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 bg-surface-2 border-border resize-none text-sm sm:text-base"
      />
      <div className="text-right text-xs text-muted-foreground mt-1">{value.trim().split(/\s+/).filter(Boolean).length} words</div>
    </div>
  );
}

function Summary({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("surface-card p-4 sm:p-5", className)}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold mt-2 text-primary sm:text-3xl">{value}</p>
    </div>
  );
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm mt-1 whitespace-pre-wrap">{text || "—"}</p>
    </div>
  );
}

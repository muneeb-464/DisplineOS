import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDayScore, useStore } from "@/lib/store";
import { formatDateLong, todayISO } from "@/lib/utils";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Reflect() {
  const date = todayISO();
  const score = useDayScore(date);
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
      <div className="max-w-3xl mx-auto px-8 py-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{formatDateLong(date)}</p>
        <div className="flex items-end justify-between mt-2 mb-10">
          <h1 className="font-display text-5xl font-bold">End of day reflection</h1>
          <span className="chip chip-primary">{score.total} pts</span>
        </div>

        <Field label="What went well today?" value={a} onChange={setA} placeholder="Identify your wins, however small…" />
        <Field label="What did I waste time on and why?" value={b} onChange={setB} placeholder="Audit the friction points…" />
        <Field label="What will I do differently tomorrow?" value={c} onChange={setC} placeholder="Define the structural change…" />

        <div className="grid grid-cols-3 gap-4 my-8">
          <Summary label="Final Score" value={score.total.toString()} />
          <Summary label="Productive Hours" value={`${score.productiveHours.toFixed(1)}h`} />
          <Summary label="Namaz" value={`${score.namazCompleted}/5`} />
        </div>

        <Button onClick={save} className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary-glow text-base font-semibold">
          Save Reflection <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <div className="mt-16">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Past reflections</h2>
          {reflections.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reflections yet.</p>
          ) : (
            <div className="space-y-2">
              {reflections.map((r) => (
                <div key={r.id} className="surface-card overflow-hidden">
                  <button
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-surface-2 transition"
                  >
                    <div className="text-left">
                      <p className="font-display font-semibold">{formatDateLong(r.date)}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.wentWell || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="chip chip-primary">{r.score} pts</span>
                      <ChevronDown className={cn("h-4 w-4 transition", openId === r.id && "rotate-180")} />
                    </div>
                  </button>
                  {openId === r.id && (
                    <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border">
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
    <div className="mb-6">
      <label className="font-display text-lg font-semibold">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 bg-surface-2 border-border resize-none text-base"
      />
      <div className="text-right text-xs text-muted-foreground mt-1">{value.trim().split(/\s+/).filter(Boolean).length} words</div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-bold mt-2 text-primary">{value}</p>
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, PRAYERS } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn, todayISO, uid } from "@/lib/utils";
import { CategoryType } from "@/lib/types";
import { Trash2, Plus, FolderPlus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "goals", label: "Daily Goals" },
  { id: "categories", label: "Categories" },
  { id: "points", label: "Points System" },
  { id: "templates", label: "Templates" },
  { id: "streak", label: "Streak Settings" },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId>("profile");

  return (
      <div className="flex flex-col md:grid md:grid-cols-[220px_1fr] min-h-screen">
        {/* Inner navigation */}
        <aside className="border-b md:border-b-0 md:border-r border-border p-4 md:p-6 shrink-0">
          <p className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground mb-4">Configuration</p>
          <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-x-visible md:pb-0 md:space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap text-left px-3 py-2 text-sm transition",
                  section === s.id
                    ? "text-primary border-b-2 border-primary md:border-b-0 md:border-l-2 md:rounded-none md:bg-primary/10 rounded-none"
                    : "text-muted-foreground hover:text-foreground rounded-md"
                )}
              >{s.label}</button>
            ))}
          </nav>
        </aside>

        <div className="p-4 sm:p-6 lg:p-10 max-w-3xl min-w-0">
          {section === "profile" && <ProfileSection />}
          {section === "goals" && <GoalsSection />}
          {section === "categories" && <CategoriesSection />}
          {section === "points" && <PointsSection />}
          {section === "templates" && <TemplatesSection />}
          {section === "streak" && <StreakSection />}
        </div>
      </div>
  );
}

function ProfileSection() {
  const { settings, updateSettings } = useStore();
  const { user, isLoggedIn, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-6">Profile</h2>

      {/* Google account card */}
      {isLoggedIn && user && (
        <div className="surface-card p-5 mb-8 flex items-center gap-4">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-secondary grid place-items-center font-display text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <p className="text-xs text-primary mt-0.5">Google Account</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}

      {!isLoggedIn && (
        <div className="surface-card p-5 mb-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Sign in to sync your data across devices.</p>
          <Button onClick={signInWithGoogle} className="shrink-0 gap-2">Sign in with Google</Button>
        </div>
      )}

      <div className="flex items-center gap-5 mb-8">
        <div className="h-24 w-24 rounded-full bg-secondary text-secondary-foreground grid place-items-center font-display text-3xl font-bold">
          {settings.userName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">{settings.userName}</h3>
          <span className="chip chip-primary mt-1 inline-flex">RANK: {settings.rank.toUpperCase()}</span>
        </div>
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display name</Label>
          <Input value={settings.userName} onChange={(e) => updateSettings({ userName: e.target.value })} className="mt-2 bg-surface-2 border-border" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Rank</Label>
          <Input value={settings.rank} onChange={(e) => updateSettings({ rank: e.target.value })} className="mt-2 bg-surface-2 border-border" />
        </div>
      </div>
    </div>
  );
}

function GoalsSection() {
  const { settings, updateSettings } = useStore();
  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-6">Daily Goals</h2>
      <div className="surface-card p-6 mb-6">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Target productive hours</Label>
        <div className="flex items-end gap-3 mt-3">
          <span className="font-display text-6xl font-bold text-primary">{settings.targetProductiveHours.toFixed(1)}</span>
          <span className="text-muted-foreground text-2xl pb-2">HOURS</span>
        </div>
        <Slider
          value={[settings.targetProductiveHours]}
          min={1} max={14} step={0.5}
          onValueChange={(v) => updateSettings({ targetProductiveHours: v[0] })}
          className="mt-6"
        />
      </div>
      <div className="surface-card p-6">
        <h3 className="font-display text-xl font-bold mb-4">Namaz reminders</h3>
        <div className="space-y-3">
          {PRAYERS.map((p) => (
            <div key={p} className="flex items-center justify-between">
              <span>{p}</span>
              <Switch
                checked={settings.prayerReminders[p]}
                onCheckedChange={(v) => updateSettings({ prayerReminders: { ...settings.prayerReminders, [p]: v } })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("productive");
  const [pts, setPts] = useState(2);

  const add = () => {
    if (!name.trim()) return;
    addCategory({ name: name.trim(), type, pointsPerHour: pts });
    setName(""); setPts(2);
    toast.success("Category added.");
  };

  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-6">Categories Manager</h2>
      <div className="space-y-2 mb-6">
        {categories.map((c) => (
          <div key={c.id} className="surface-card p-4 flex items-center gap-4 border-l-4" style={{ borderLeftColor: c.type === "productive" ? "hsl(var(--primary))" : c.type === "routine" ? "hsl(var(--secondary))" : "hsl(var(--destructive))" }}>
            <div className="flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{c.type} · {c.pointsPerHour} pts/hr {c.isDeepWork && "· deep work"}</p>
            </div>
            <Input
              type="number" value={c.pointsPerHour}
              onChange={(e) => updateCategory(c.id, { pointsPerHour: +e.target.value })}
              className="w-20 bg-surface-2 border-border"
            />
            <button onClick={() => deleteCategory(c.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-md">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="surface-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Add category</p>
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_140px_100px_auto] gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-2 sm:col-span-1 bg-surface-2 border-border" />
          <select value={type} onChange={(e) => setType(e.target.value as CategoryType)} className="bg-surface-2 border border-border rounded-md px-3 text-sm">
            <option value="productive">Productive</option>
            <option value="routine">Routine</option>
            <option value="wasted">Wasted</option>
          </select>
          <Input type="number" value={pts} onChange={(e) => setPts(+e.target.value)} className="bg-surface-2 border-border" />
          <Button onClick={add} className="bg-primary text-primary-foreground col-span-2 sm:col-span-1"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

function PointsSection() {
  const { settings, updateSettings } = useStore();
  const fields: { k: keyof typeof settings; label: string }[] = [
    { k: "productiveRate", label: "Productive rate (pts/hr)" },
    { k: "wastedRate", label: "Wasted rate (pts/hr)" },
    { k: "namazBonus", label: "Namaz bonus (pts)" },
    { k: "namazPenalty", label: "Namaz penalty (pts)" },
    { k: "dailyTargetPenalty", label: "Daily target penalty (pts)" },
    { k: "deepWorkMultiplier", label: "Deep work multiplier" },
  ];
  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-6">Points System</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.k} className="surface-card p-5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</Label>
            <Input
              type="number"
              value={settings[f.k] as number}
              onChange={(e) => updateSettings({ [f.k]: +e.target.value } as any)}
              className="mt-2 bg-surface-2 border-border font-display text-2xl h-14"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplatesSection() {
  const { templates, addTemplate, deleteTemplate, loadTemplate, blocks } = useStore();
  const [name, setName] = useState("");

  const saveFromToday = () => {
    if (!name.trim()) return;
    const todayBlocks = blocks.filter((b) => b.date === todayISO() && b.kind === "planned")
      .map((b) => ({ subCategoryId: b.subCategoryId, startMin: b.startMin, endMin: b.endMin }));
    if (todayBlocks.length === 0) {
      toast.error("Plan some blocks today first, then save them as a template.");
      return;
    }
    addTemplate({ name: name.trim(), blocks: todayBlocks });
    setName("");
    toast.success("Template saved.");
  };

  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-6">Templates</h2>
      <div className="surface-card p-5 mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Save today's plan as a template</p>
        <div className="flex gap-2">
          <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-2 border-border" />
          <Button onClick={saveFromToday} className="bg-primary text-primary-foreground"><FolderPlus className="h-4 w-4 mr-2" /> Save</Button>
        </div>
      </div>
      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className="text-muted-foreground text-sm">No templates yet.</p>
        ) : templates.map((t) => (
          <div key={t.id} className="surface-card p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.blocks.length} blocks</p>
            </div>
            <Button variant="outline" onClick={() => { loadTemplate(t.id, todayISO(), "planned"); toast.success("Template loaded onto today's plan."); }} className="border-border">Load</Button>
            <button onClick={() => deleteTemplate(t.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-md">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakSection() {
  const { settings, updateSettings, startedDays } = useStore();
  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-6">Streak Settings</h2>
      <div className="surface-card p-6 max-w-md">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Minimum productive hours per day to count as streak</Label>
        <Input
          type="number" min={1} max={14} step={0.5}
          value={settings.streakMinHours}
          onChange={(e) => updateSettings({ streakMinHours: +e.target.value })}
          className="mt-2 bg-surface-2 border-border font-display text-2xl h-14"
        />
        <p className="text-sm text-muted-foreground mt-4">Current streak: <span className="text-primary font-semibold">{startedDays.length} days</span></p>
      </div>
    </div>
  );
}

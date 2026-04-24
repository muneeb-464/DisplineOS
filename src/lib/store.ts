import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import {
  CategoryType, NamazLog, PRAYERS, PrayerName, Reflection, Settings,
  SubCategory, Template, TimeBlock,
} from "./types";
import { getMissedPrayers } from "./namaz";
import { todayISO, uid } from "./utils";

const SERVER = import.meta.env.VITE_API_URL as string;

interface AppState {
  categories: SubCategory[];
  blocks: TimeBlock[];
  namaz: NamazLog[];
  reflections: Reflection[];
  templates: Template[];
  settings: Settings;
  startedDays: string[]; // dates the user pressed Start Day
  recentSubCategoryIds: string[];

  addCategory: (c: Omit<SubCategory, "id">) => void;
  updateCategory: (id: string, patch: Partial<SubCategory>) => void;
  deleteCategory: (id: string) => void;

  addBlock: (b: Omit<TimeBlock, "id">) => void;
  updateBlock: (id: string, patch: Partial<TimeBlock>) => void;
  deleteBlock: (id: string) => void;

  toggleNamaz: (date: string, prayer: PrayerName) => void;
  isNamazDone: (date: string, prayer: PrayerName) => boolean;

  addReflection: (r: Omit<Reflection, "id" | "createdAt">) => void;

  addTemplate: (t: Omit<Template, "id">) => void;
  deleteTemplate: (id: string) => void;
  loadTemplate: (templateId: string, date: string, kind?: "planned" | "logged") => void;

  startDay: (date: string) => void;
  hasStarted: (date: string) => boolean;

  updateSettings: (patch: Partial<Settings>) => void;

  pushRecentSub: (id: string) => void;

  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;

  syncFromServer: () => Promise<void>;
  clearAllState: () => void;
}

const defaultSettings: Settings = {
  productiveRate: 2,
  wastedRate: 2,
  namazBonus: 20,
  namazPenalty: 20,
  dailyTargetPenalty: 12,
  deepWorkMultiplier: 2,
  targetProductiveHours: 8,
  streakMinHours: 4,
  prayerReminders: { Fajr: true, Zuhr: true, Asr: true, Maghrib: true, Isha: true },
  userName: "Operator",
  rank: "Disciplined",
};

const seedCategories: SubCategory[] = [
  { id: "c-deepwork", name: "Deep Work", type: "productive", pointsPerHour: 2, isDeepWork: true },
  { id: "c-learning", name: "Learning", type: "productive", pointsPerHour: 2 },
  { id: "c-admin", name: "Admin", type: "productive", pointsPerHour: 2 },
  { id: "c-workout", name: "Workout", type: "routine", pointsPerHour: 0 },
  { id: "c-meal", name: "Meal", type: "routine", pointsPerHour: 0 },
  { id: "c-social", name: "Social Media", type: "wasted", pointsPerHour: 2 },
  { id: "c-doom", name: "Doom Scrolling", type: "wasted", pointsPerHour: 2 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      blocks: [],
      namaz: [],
      reflections: [],
      templates: [],
      settings: defaultSettings,
      startedDays: [],
      recentSubCategoryIds: [],
      isAuthenticated: false,
      setAuthenticated: (v) => set({ isAuthenticated: v }),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: "c-" + uid() }] })),
      updateCategory: (id, patch) => set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addBlock: (b) => set((s) => ({ blocks: [...s.blocks, { ...b, id: "b-" + uid() }] })),
      updateBlock: (id, patch) => set((s) => ({
        blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      })),
      deleteBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),

      toggleNamaz: (date, prayer) => set((s) => {
        const existing = s.namaz.find((n) => n.date === date && n.prayer === prayer);
        if (existing) {
          return { namaz: s.namaz.map((n) => (n === existing ? { ...n, completed: !n.completed } : n)) };
        }
        return { namaz: [...s.namaz, { date, prayer, completed: true }] };
      }),
      isNamazDone: (date, prayer) => !!get().namaz.find((n) => n.date === date && n.prayer === prayer && n.completed),

      addReflection: (r) => set((s) => ({
        reflections: [{ ...r, id: "r-" + uid(), createdAt: new Date().toISOString() }, ...s.reflections],
      })),

      addTemplate: (t) => set((s) => ({ templates: [...s.templates, { ...t, id: "t-" + uid() }] })),
      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
      loadTemplate: (templateId, date, kind = "planned") => {
        const t = get().templates.find((x) => x.id === templateId);
        if (!t) return;
        const newBlocks: TimeBlock[] = t.blocks.map((b) => ({
          ...b, id: "b-" + uid(), date, kind,
        }));
        set((s) => ({ blocks: [...s.blocks.filter((b) => !(b.date === date && b.kind === kind)), ...newBlocks] }));
      },

      startDay: (date) => set((s) => ({
        startedDays: s.startedDays.includes(date) ? s.startedDays : [...s.startedDays, date],
      })),
      hasStarted: (date) => get().startedDays.includes(date),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      pushRecentSub: (id) => set((s) => {
        const next = [id, ...s.recentSubCategoryIds.filter((x) => x !== id)].slice(0, 5);
        return { recentSubCategoryIds: next };
      }),

      syncFromServer: async () => {
        try {
          const [dataRes, settingsRes] = await Promise.all([
            axios.get(`${SERVER}/api/data`, { withCredentials: true }),
            axios.get(`${SERVER}/api/settings`, { withCredentials: true }),
          ]);
          const d = dataRes.data;
          const s = settingsRes.data;
          set({
            blocks: d.blocks?.length ? d.blocks : [],
            namaz: d.namaz?.length ? d.namaz : [],
            reflections: d.reflections?.length ? d.reflections : [],
            startedDays: d.startedDays?.length ? d.startedDays : [],
            categories: s.categories?.length ? s.categories : seedCategories,
            templates: s.templates ?? [],
            settings: s.scoringSettings ? { ...defaultSettings, ...s.scoringSettings } : defaultSettings,
          });
        } catch {
          // offline — localStorage fallback already loaded by persist middleware
        }
      },

      clearAllState: () => set({
        blocks: [],
        namaz: [],
        reflections: [],
        startedDays: [],
        categories: seedCategories,
        templates: [],
        settings: defaultSettings,
        recentSubCategoryIds: [],
      }),
    }),
    {
      name: "disciplineos-v2",
      // Issue #7: only persist non-sensitive UI state to localStorage.
      // blocks, namaz, reflections, startedDays are synced from the server on login
      // and must NOT be persisted in plaintext localStorage where any JS can read them.
      partialize: (state) => ({
        categories: state.categories,
        templates: state.templates,
        settings: state.settings,
        recentSubCategoryIds: state.recentSubCategoryIds,
      }),
    }
  )
);

// Debounced server sync — runs 2s after any store change, only when logged in
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
useStore.subscribe((state) => {
  if (!state.isAuthenticated) return;
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      await Promise.all([
        axios.post(`${SERVER}/api/data`, {
          blocks: state.blocks,
          namaz: state.namaz,
          reflections: state.reflections,
          startedDays: state.startedDays,
        }, { withCredentials: true }),
        axios.post(`${SERVER}/api/settings`, {
          scoringSettings: state.settings,
          categories: state.categories,
          templates: state.templates,
        }, { withCredentials: true }),
      ]);
    } catch {
      // fail silently — localStorage is the offline fallback
    }
  }, 2000);
});

// ---- Derived helpers ----

export const blocksForDay = (date: string, kind?: "planned" | "logged") => {
  const all = useStore.getState().blocks.filter((b) => b.date === date);
  return kind ? all.filter((b) => b.kind === kind) : all;
};

export const getCategory = (id: string) =>
  useStore.getState().categories.find((c) => c.id === id);

export interface DayScore {
  total: number;
  productive: number;
  routine: number;
  wasted: number;
  productiveHours: number;
  routineHours: number;
  wastedHours: number;
  namazCompleted: number;
  namazPoints: number;
  penalties: { label: string; pts: number }[];
  isStarted: boolean;
}

const NEUTRAL_SCORE: DayScore = {
  total: 0, productive: 0, routine: 0, wasted: 0,
  productiveHours: 0, routineHours: 0, wastedHours: 0,
  namazCompleted: 0, namazPoints: 0, penalties: [], isStarted: false,
};

export const computeDayScore = (date: string): DayScore => {
  const { blocks, categories, namaz, settings, startedDays } = useStore.getState();
  if (!startedDays.includes(date)) return NEUTRAL_SCORE;
  const loggedBlocks = blocks.filter((b) => b.date === date && b.kind === "logged");
  const plannedBlocks = blocks.filter((b) => b.date === date && b.kind === "planned");
  // Use logged if any exist for that day; otherwise fall back to planned so planner-only days still show progress.
  const dayBlocks = loggedBlocks.length > 0 ? loggedBlocks : plannedBlocks;
  let productive = 0, routine = 0, wasted = 0;
  let productiveHours = 0, routineHours = 0, wastedHours = 0;

  for (const b of dayBlocks) {
    const cat = categories.find((c) => c.id === b.subCategoryId);
    if (!cat) continue;
    const hours = (b.endMin - b.startMin) / 60;
    if (cat.type === "productive") {
      productiveHours += hours;
      let pts = hours * (cat.pointsPerHour || settings.productiveRate);
      if (cat.isDeepWork) pts *= settings.deepWorkMultiplier;
      productive += pts;
    } else if (cat.type === "routine") {
      routineHours += hours;
      routine += hours * (cat.pointsPerHour || 0);
    } else {
      wastedHours += hours;
      wasted -= hours * (cat.pointsPerHour || settings.wastedRate);
    }
  }

  const dayNamaz = namaz.filter((n) => n.date === date);
  const namazDone = dayNamaz.filter((n) => n.completed).length;
  const namazPoints = namazDone * settings.namazBonus;
  const missedPrayers = getMissedPrayers(date, dayNamaz);

  const penalties: { label: string; pts: number }[] = [];
  if (missedPrayers.length > 0) {
    penalties.push({ label: `Missed ${missedPrayers.length} prayer${missedPrayers.length > 1 ? "s" : ""}`, pts: -missedPrayers.length * settings.namazPenalty });
  }
  if (productiveHours < settings.targetProductiveHours && date < todayISO()) {
    penalties.push({ label: "Daily target not reached", pts: -settings.dailyTargetPenalty });
  }
  const penaltyTotal = penalties.reduce((s, p) => s + p.pts, 0);

  const total = Math.round(productive + routine + wasted + namazPoints + penaltyTotal);
  return {
    total,
    productive: Math.round(productive),
    routine: Math.round(routine),
    wasted: Math.round(wasted),
    productiveHours,
    routineHours,
    wastedHours,
    namazCompleted: namazDone,
    namazPoints,
    penalties,
    isStarted: true,
  };
};

// Reactive hook variant that recomputes when relevant slices change
export const useDayScore = (date: string): DayScore => {
  useStore((s) => s.blocks);
  useStore((s) => s.namaz);
  useStore((s) => s.settings);
  useStore((s) => s.categories);
  useStore((s) => s.startedDays);
  return computeDayScore(date);
};

export { PRAYERS };
export type { CategoryType };

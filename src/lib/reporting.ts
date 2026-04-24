import { eachDayOfInterval, subDays } from "date-fns";
import { getDuePrayers } from "./namaz";
import { computeDayScore, useStore } from "./store";
import { isoFromDate, parseISODateLocal, todayISO } from "./utils";

export const RANGE_PRESETS = [2, 4, 7, 15, 30] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export interface AggregateBreakdownItem {
  id: string;
  name: string;
  hours: number;
  points: number;
  type: "productive" | "routine" | "wasted";
}

export interface AggregateReport {
  dayScores: Array<ReturnType<typeof computeDayScore> & { date: string }>;
  totalScore: number;
  productiveHours: number;
  routineHours: number;
  wastedHours: number;
  activeDays: number;
  bestDay: { date: string; total: number } | null;
  totalHours: number;
  completedPrayers: number;
  duePrayers: number;
  namazCompletionRate: number;
  breakdown: AggregateBreakdownItem[];
}

export function buildPresetDateRange(days: number, endDate = todayISO()): string[] {
  const end = parseISODateLocal(endDate);
  const start = subDays(end, Math.max(days - 1, 0));
  return eachDayOfInterval({ start, end }).map(isoFromDate);
}

export function normalizeDateRange(startDate: string, endDate: string): string[] {
  const [start, end] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
  return eachDayOfInterval({ start: parseISODateLocal(start), end: parseISODateLocal(end) }).map(isoFromDate);
}

export function buildAggregateReport(dates: string[]): AggregateReport {
  const { blocks, categories, namaz, startedDays } = useStore.getState();
  const dayScores = dates.map((date) => ({ date, ...computeDayScore(date) }));
  const startedScores = dayScores.filter((day) => day.isStarted);

  const productiveHours = startedScores.reduce((sum, day) => sum + day.productiveHours, 0);
  const routineHours = startedScores.reduce((sum, day) => sum + day.routineHours, 0);
  const wastedHours = startedScores.reduce((sum, day) => sum + day.wastedHours, 0);
  const totalScore = startedScores.reduce((sum, day) => sum + day.total, 0);
  const totalHours = productiveHours + routineHours + wastedHours;

  const activeDays = startedScores.filter((day) => {
    const hasBlocks = blocks.some((block) => block.date === day.date);
    const hasNamaz = namaz.some((entry) => entry.date === day.date && entry.completed);
    return hasBlocks || hasNamaz;
  }).length;

  const bestDayEntry = startedScores.reduce<{ date: string; total: number } | null>((best, day) => {
    if (day.total <= 0) return best;
    if (!best || day.total > best.total) return { date: day.date, total: day.total };
    return best;
  }, null);

  const catTotals = new Map<string, number>();
  for (const date of dates) {
    if (!startedDays.includes(date)) continue;
    const dayLogged = blocks.filter((block) => block.date === date && block.kind === "logged");
    const dayPlanned = blocks.filter((block) => block.date === date && block.kind === "planned");
    const source = dayLogged.length > 0 ? dayLogged : dayPlanned;

    source.forEach((block) => {
      const hours = (block.endMin - block.startMin) / 60;
      catTotals.set(block.subCategoryId, (catTotals.get(block.subCategoryId) || 0) + hours);
    });
  }

  const breakdown = Array.from(catTotals.entries())
    .map(([id, hours]) => {
      const category = categories.find((item) => item.id === id);
      if (!category) return null;
      return {
        id,
        name: category.name,
        hours,
        type: category.type,
        points: Math.round(hours * (category.pointsPerHour || 0) * (category.isDeepWork ? 2 : 1)),
      } satisfies AggregateBreakdownItem;
    })
    .filter(Boolean)
    .sort((a, b) => b!.hours - a!.hours) as AggregateBreakdownItem[];

  const prayerTotals = dates.reduce(
    (totals, date) => {
      if (!startedDays.includes(date)) return totals;
      const due = getDuePrayers(date);
      const completed = due.filter((prayer) => namaz.some((log) => log.date === date && log.prayer === prayer && log.completed)).length;
      return {
        due: totals.due + due.length,
        completed: totals.completed + completed,
      };
    },
    { due: 0, completed: 0 }
  );

  return {
    dayScores,
    totalScore,
    productiveHours,
    routineHours,
    wastedHours,
    activeDays,
    bestDay: bestDayEntry,
    totalHours,
    completedPrayers: prayerTotals.completed,
    duePrayers: prayerTotals.due,
    namazCompletionRate: prayerTotals.due ? (prayerTotals.completed / prayerTotals.due) * 100 : 0,
    breakdown,
  };
}
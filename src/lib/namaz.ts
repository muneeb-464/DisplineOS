import { NamazLog, PRAYERS, PrayerName } from "./types";
import { nowMinutes, todayISO } from "./utils";

export const PRAYER_WINDOWS: Record<PrayerName, { start: number; end: number }> = {
  Fajr: { start: 4 * 60, end: 6 * 60 },
  Zuhr: { start: 13 * 60, end: 15 * 60 },
  Asr: { start: 16 * 60, end: 18 * 60 },
  Maghrib: { start: 18 * 60, end: 21 * 60 },
  Isha: { start: 21 * 60, end: 24 * 60 },
};

export function getDuePrayers(date: string, currentDate = new Date()): PrayerName[] {
  const today = todayISO();
  if (date > today) return [];
  if (date < today) return [...PRAYERS];

  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  return PRAYERS.filter((prayer) => currentMinutes >= PRAYER_WINDOWS[prayer].end);
}

export function getPrayerStatus(
  date: string,
  prayer: PrayerName,
  logs: NamazLog[],
  currentDate = new Date()
): "done" | "missed" | "pending" {
  const completed = logs.some((log) => log.date === date && log.prayer === prayer && log.completed);
  if (completed) return "done";

  const due = getDuePrayers(date, currentDate).includes(prayer);
  return due ? "missed" : "pending";
}

export function getMissedPrayers(date: string, logs: NamazLog[], currentDate = new Date()): PrayerName[] {
  return getDuePrayers(date, currentDate).filter((prayer) =>
    !logs.some((log) => log.date === date && log.prayer === prayer && log.completed)
  );
}

export const getCurrentPrayerMinute = () => nowMinutes();
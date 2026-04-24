import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

export const minutesToLabel = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export const labelToMinutes = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const formatDateLong = (iso: string) => {
  const d = parseISODateLocal(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

/** Parse a "yyyy-MM-dd" string as a LOCAL date (avoids UTC midnight shift). */
export const parseISODateLocal = (iso: string): Date => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return new Date(iso);
  return new Date(+m[1], +m[2] - 1, +m[3]);
};

export const isoFromDate = (d: Date): string => {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

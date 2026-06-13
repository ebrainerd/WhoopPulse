import { addDays, format, parseISO, subDays } from 'date-fns';

/** Canonical date key used everywhere: YYYY-MM-DD in local time. */
export function toDateKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd');
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function tomorrowKey(): string {
  return toDateKey(addDays(new Date(), 1));
}

export function yesterdayKey(): string {
  return toDateKey(subDays(new Date(), 1));
}

export function addDaysKey(key: string, days: number): string {
  return toDateKey(addDays(parseISO(key), days));
}

export function prettyDate(key: string): string {
  return format(parseISO(key), 'EEE, MMM d');
}

export function shortDate(key: string): string {
  return format(parseISO(key), 'MMM d');
}

/** Minutes since midnight for an HH:mm string, or null. */
export function timeToMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Returns the last `n` date keys ending today (oldest first). */
export function recentDateKeys(n: number, end: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(toDateKey(subDays(end, i)));
  }
  return keys;
}

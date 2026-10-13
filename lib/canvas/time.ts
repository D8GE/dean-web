import { formatClock } from "../schedule";

export type ZonedStamp = {
  iso: string;
  minutes: number;
  /** Monday = 0 … Sunday = 6 */
  dow: number;
  weekday: string;
  monthLabel: string;
  day: number;
  clock: string;
  todayLabel: string;
};

const DOW_FROM_SHORT: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function zonedStamp(date: Date, timeZone: string): ZonedStamp {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  const minute = Number(bag.minute);
  const year = Number(bag.year);
  const month = Number(bag.month);
  const day = Number(bag.day);
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const weekday = bag.weekday ?? "Mon";
  const minutes = hour * 60 + minute;
  const monthLabel = new Intl.DateTimeFormat("en-US", { timeZone, month: "short" }).format(date);
  const weekdayLong = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
  const monthLong = new Intl.DateTimeFormat("en-US", { timeZone, month: "long" }).format(date);
  return {
    iso,
    minutes,
    dow: DOW_FROM_SHORT[weekday] ?? 0,
    weekday,
    monthLabel,
    day,
    clock: formatClock(minutes),
    todayLabel: `${weekdayLong}, ${monthLong} ${day}`,
  };
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(startIso: string, endIso: string): number {
  const [ys, ms, ds] = startIso.split("-").map(Number);
  const [ye, me, de] = endIso.split("-").map(Number);
  return Math.round((Date.UTC(ye, me - 1, de) - Date.UTC(ys, ms - 1, ds)) / 86_400_000);
}

/** Monday = 0 … Sunday = 6 for a calendar date. */
export function dowOf(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (js + 6) % 7;
}

export function mondayOf(iso: string): string {
  return addDays(iso, -dowOf(iso));
}

export function monthLabelOf(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

export function termWeekNumber(termStartIso: string | null, todayIso: string): number {
  if (!termStartIso) return 1;
  const startMonday = mondayOf(termStartIso.slice(0, 10));
  const todayMonday = mondayOf(todayIso);
  return Math.max(1, Math.floor(daysBetween(startMonday, todayMonday) / 7) + 1);
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildSchoolWeeks(todayIso: string, termWeek: number, radius = 2) {
  const thisMonday = mondayOf(todayIso);
  const startOffset = Math.max(-radius, 1 - termWeek);
  const weeks = [];
  for (let offset = startOffset; offset <= startOffset + radius * 2; offset += 1) {
    const monday = addDays(thisMonday, offset * 7);
    const days = DAY_NAMES.map((name, dow) => {
      const iso = addDays(monday, dow);
      const dayNum = Number(iso.slice(8, 10));
      return { name, num: String(dayNum), month: monthLabelOf(iso), iso, dow };
    });
    const sunday = days[6];
    const range =
      days[0].month === sunday.month
        ? `${days[0].month} ${days[0].num} – ${sunday.num}`
        : `${days[0].month} ${days[0].num} – ${sunday.month} ${sunday.num}`;
    weeks.push({ week: termWeek + offset, range, days });
  }
  return weeks;
}

export function orderStamp(iso: string): number {
  return Number(iso.replace(/-/g, ""));
}

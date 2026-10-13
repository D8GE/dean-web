import {
  courseByCode,
  deansPlan,
  meetings,
  schoolWeeks,
  semester,
  type Course,
  type Meeting,
  type SchoolDay,
} from "./demo-data";

export const DAY_START = 8 * 60;
export const DAY_END = 21 * 60;
export const HOUR_PX = 80;

export type CalEvent = {
  id: string;
  kind: "class" | "study";
  course: string;
  day: number;
  startMin: number;
  endMin: number;
  where: string;
  label: string;
  minutes: number;
};

export function parseClock(label: string): number {
  const match = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();
  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatClock(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function formatRange(start: number, end: number): string {
  const startSuffix = start >= 12 * 60 ? "PM" : "AM";
  const endSuffix = end >= 12 * 60 ? "PM" : "AM";
  if (startSuffix === endSuffix) {
    const h24 = Math.floor(start / 60);
    const m = start % 60;
    const h = h24 % 12 || 12;
    return `${h}:${m.toString().padStart(2, "0")}–${formatClock(end)}`;
  }
  return `${formatClock(start)}–${formatClock(end)}`;
}

export function formatShortStart(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const h = h24 % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function weekByNumber(week: number) {
  return schoolWeeks.find((w) => w.week === week) ?? schoolWeeks[2];
}

export function classEvents(): CalEvent[] {
  return meetings.map((m) => ({
    id: `class-${m.id}`,
    kind: "class" as const,
    course: m.course,
    day: m.day,
    startMin: m.startMin,
    endMin: m.endMin,
    where: m.where,
    label: courseByCode[m.course].name,
    minutes: m.endMin - m.startMin,
  }));
}

export function studyEvents(): CalEvent[] {
  return deansPlan.map((block, index) => {
    const startMin = parseClock(block.time);
    return {
      id: `study-${index}`,
      kind: "study" as const,
      course: block.course,
      day: 0,
      startMin,
      endMin: startMin + block.minutes,
      where: block.course ? "Dean's plan" : "Recharge",
      label: block.label,
      minutes: block.minutes,
    };
  });
}

export function allEvents(includeStudy: boolean): CalEvent[] {
  return includeStudy ? [...classEvents(), ...studyEvents()] : classEvents();
}

export type SlotStatus = "done" | "now" | "next" | "later";

export function statusFor(event: CalEvent, week: number, nextClassId: string | null): SlotStatus {
  if (week !== semester.week || event.day !== 0) return "later";
  if (event.endMin <= semester.todayMinutes) return "done";
  if (event.startMin <= semester.todayMinutes && event.endMin > semester.todayMinutes) return "now";
  if (event.id === nextClassId) return "next";
  return "later";
}

export function nextClassId(events: CalEvent[], week: number): string | null {
  if (week !== semester.week) return null;
  const upcoming = events
    .filter((event) => event.kind === "class" && event.day === 0 && event.startMin > semester.todayMinutes)
    .sort((a, b) => a.startMin - b.startMin);
  return upcoming[0]?.id ?? null;
}

export function eventMatches(event: CalEvent, course: string, query: string): boolean {
  if (course !== "all" && event.course !== course) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const courseName = event.course ? courseByCode[event.course]?.name ?? "" : "";
  return [event.label, event.course, event.where, courseName].join(" ").toLowerCase().includes(q);
}

export function meetingsFor(code: string): Meeting[] {
  return meetings.filter((m) => m.course === code).sort((a, b) => a.day - b.day || a.startMin - b.startMin);
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_SHORT = ["M", "T", "W", "Th", "F", "Sa", "Su"];

export function patternLines(code: string): string[] {
  const groups = new Map<string, { days: number[]; start: number; end: number; where: string }>();
  for (const meeting of meetingsFor(code)) {
    const key = `${meeting.startMin}-${meeting.endMin}-${meeting.where}`;
    const group = groups.get(key) ?? { days: [], start: meeting.startMin, end: meeting.endMin, where: meeting.where };
    group.days.push(meeting.day);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const dayLabel =
      group.days.length === 1 ? DAY_NAMES[group.days[0]] : group.days.map((day) => DAY_SHORT[day]).join("");
    return `${dayLabel} · ${formatRange(group.start, group.end)} · ${group.where}`;
  });
}

export type NextLabel = {
  meeting: Meeting;
  when: string;
  live: boolean;
};

export function nextMeeting(code: string): NextLabel | null {
  const list = meetingsFor(code);
  if (!list.length) return null;
  const now = semester.todayMinutes;
  const today = 0;
  const laterToday = list.find((m) => m.day === today && m.endMin > now);
  const meeting = laterToday ?? list.find((m) => m.day > today) ?? list[0];
  const live = meeting.day === today && meeting.startMin <= now && meeting.endMin > now;
  let when = DAY_NAMES[meeting.day];
  if (live) when = "Now";
  else if (meeting.day === today) when = "Today";
  else if (meeting.day === today + 1) when = "Tomorrow";
  else if (!laterToday && !list.some((m) => m.day > today)) when = `Next ${DAY_NAMES[meeting.day]}`;
  return { meeting, when, live };
}

export function dayCaption(day: SchoolDay): string {
  return `${day.name}, ${day.month} ${day.num}`;
}

export function courseOf(event: CalEvent): Course | null {
  return event.course ? courseByCode[event.course] ?? null : null;
}

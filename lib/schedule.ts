import type { Course, Meeting, SchoolDay, SchoolWeek, Semester, StudyBlock } from "./demo-data";

export type ScheduleData = {
  courseByCode: Record<string, Course>;
  meetings: Meeting[];
  schoolWeeks: SchoolWeek[];
  semester: Semester;
  deansPlan: StudyBlock[];
};

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
  /** Dated Canvas events set this. Demo classes omit it and repeat each week. */
  week?: number;
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

export function weekByNumber(week: number, data: ScheduleData) {
  return (
    data.schoolWeeks.find((w) => w.week === week) ??
    data.schoolWeeks.find((w) => w.week === data.semester.week) ??
    data.schoolWeeks[0]
  );
}

export function classEvents(data: ScheduleData, week?: number): CalEvent[] {
  return data.meetings
    .filter((meeting) => week == null || meeting.week == null || meeting.week === week)
    .map((meeting) => ({
      id: `class-${meeting.id}`,
      kind: "class" as const,
      course: meeting.course,
      day: meeting.day,
      week: meeting.week,
      startMin: meeting.startMin,
      endMin: meeting.endMin,
      where: meeting.where,
      label: data.courseByCode[meeting.course]?.name ?? meeting.title ?? meeting.where,
      minutes: meeting.endMin - meeting.startMin,
    }));
}

export function studyEvents(data: ScheduleData): CalEvent[] {
  return data.deansPlan.map((block, index) => {
    const startMin = parseClock(block.time);
    return {
      id: `study-${index}`,
      kind: "study" as const,
      course: block.course,
      day: data.semester.todayDow,
      startMin,
      endMin: startMin + block.minutes,
      where: block.course ? "Dean's plan" : "Recharge",
      label: block.label,
      minutes: block.minutes,
    };
  });
}

export function allEvents(includeStudy: boolean, data: ScheduleData, week?: number): CalEvent[] {
  const classes = classEvents(data, week);
  return includeStudy ? [...classes, ...studyEvents(data)] : classes;
}

export type SlotStatus = "done" | "now" | "next" | "later";

export function statusFor(event: CalEvent, week: number, nextId: string | null, data: ScheduleData): SlotStatus {
  const today = data.semester.todayDow;
  if (week !== data.semester.week || event.day !== today) return "later";
  if (event.endMin <= data.semester.todayMinutes) return "done";
  if (event.startMin <= data.semester.todayMinutes && event.endMin > data.semester.todayMinutes) return "now";
  if (event.id === nextId) return "next";
  return "later";
}

export function nextClassId(events: CalEvent[], week: number, data: ScheduleData): string | null {
  if (week !== data.semester.week) return null;
  const today = data.semester.todayDow;
  const upcoming = events
    .filter((event) => event.kind === "class" && event.day === today && event.startMin > data.semester.todayMinutes)
    .sort((a, b) => a.startMin - b.startMin);
  return upcoming[0]?.id ?? null;
}

export function eventMatches(event: CalEvent, course: string, query: string, data: ScheduleData): boolean {
  if (course !== "all" && event.course !== course) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const courseName = event.course ? data.courseByCode[event.course]?.name ?? "" : "";
  return [event.label, event.course, event.where, courseName].join(" ").toLowerCase().includes(q);
}

export function meetingsFor(code: string, data: ScheduleData): Meeting[] {
  return data.meetings.filter((m) => m.course === code).sort((a, b) => a.day - b.day || a.startMin - b.startMin);
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_SHORT = ["M", "T", "W", "Th", "F", "Sa", "Su"];

export function patternLines(code: string, data: ScheduleData): string[] {
  const groups = new Map<string, { days: number[]; start: number; end: number; where: string }>();
  for (const meeting of patternMeetings(code, data)) {
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

function patternMeetings(code: string, data: ScheduleData): Meeting[] {
  const all = meetingsFor(code, data);
  const week = data.semester.week;
  const current = all.filter((meeting) => meeting.week == null || meeting.week === week);
  if (current.length) return current;
  const future = all
    .filter((meeting) => (meeting.week ?? week) > week)
    .sort((a, b) => (a.week ?? 0) - (b.week ?? 0));
  const nextWeek = future[0]?.week;
  if (nextWeek == null) return [];
  return all.filter((meeting) => meeting.week === nextWeek);
}

export function nextMeeting(code: string, data: ScheduleData): NextLabel | null {
  const list = meetingsFor(code, data);
  if (!list.length) return null;
  const week = data.semester.week;
  const today = data.semester.todayDow;
  const now = data.semester.todayMinutes;
  const upcoming = list
    .filter((meeting) => {
      const meetingWeek = meeting.week ?? week;
      if (meetingWeek > week) return true;
      if (meetingWeek < week) return false;
      return meeting.day > today || (meeting.day === today && meeting.endMin > now);
    })
    .sort((a, b) => (a.week ?? week) - (b.week ?? week) || a.day - b.day || a.startMin - b.startMin);
  if (!upcoming.length) {
    const repeating = list.filter((meeting) => meeting.week == null);
    if (!repeating.length) return null;
    return { meeting: repeating[0], when: `Next ${DAY_NAMES[repeating[0].day]}`, live: false };
  }
  const meeting = upcoming[0];
  const meetingWeek = meeting.week ?? week;
  const live = meetingWeek === week && meeting.day === today && meeting.startMin <= now && meeting.endMin > now;
  let when = DAY_NAMES[meeting.day];
  if (live) when = "Now";
  else if (meetingWeek === week && meeting.day === today) when = "Today";
  else if (meetingWeek === week && meeting.day === today + 1) when = "Tomorrow";
  else if (meeting.week != null && meetingWeek !== week) {
    const day = data.schoolWeeks.find((entry) => entry.week === meetingWeek)?.days[meeting.day];
    when = day ? `${day.month} ${day.num}` : DAY_NAMES[meeting.day];
  }
  return { meeting, when, live };
}

export function dayCaption(day: SchoolDay): string {
  return `${day.name}, ${day.month} ${day.num}`;
}

export function courseOf(event: CalEvent, data: ScheduleData): Course | null {
  return event.course ? data.courseByCode[event.course] ?? null : null;
}

import type { ScheduleData } from "./schedule";
import { classEvents, weekByNumber } from "./schedule";

function stamp(iso: string, minutes: number): string {
  const [year, month, day] = iso.split("-");
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${year}${month}${day}T${hh}${mm}00`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(week: number, data: ScheduleData): string {
  const days = weekByNumber(week, data).days;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dean//School Hub//EN", "CALSCALE:GREGORIAN"];
  for (const event of classEvents(data, week)) {
    const day = days.find((entry) => entry.dow === event.day);
    if (!day) continue;
    const course = data.courseByCode[event.course];
    const summary = course ? `${event.course} · ${course.name}` : event.label;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}-w${week}@dean-school-hub`,
      `DTSTART:${stamp(day.iso, event.startMin)}`,
      `DTEND:${stamp(day.iso, event.endMin)}`,
      `SUMMARY:${escapeText(summary)}`,
      `LOCATION:${escapeText(event.where)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(week: number, data: ScheduleData) {
  const blob = new Blob([buildIcs(week, data)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dean-week-${week}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

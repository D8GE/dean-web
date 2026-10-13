import type { ClassSession } from "./demo-data";
import {
  announcements,
  badges,
  courses,
  courseByCode,
  courseBySlug,
  deansPlan,
  focusLengths,
  gradeCategories,
  gradeItems,
  meetings,
  modules,
  notifications,
  quests,
  schoolWeeks,
  semester,
  settingToggles,
  student,
  todaysClasses,
  upcoming,
  weekActivity,
  type Announcement,
  type Assignment,
  type Course,
  type CourseModule,
  type GradeCategory,
  type GradeItem,
  type Meeting,
  type Notification,
  type Quest,
  type SchoolWeek,
  type Semester,
  type Student,
  type StudyBlock,
} from "./demo-data";
import { zonedStamp } from "./canvas/time";

export type DataSource = "live" | "demo";

export type HubSnapshot = {
  source: DataSource;
  sourceNote: string;
  timeZone: string;
  student: Student;
  semester: Semester;
  courses: Course[];
  courseByCode: Record<string, Course>;
  courseBySlug: Record<string, Course>;
  todaysClasses: ClassSession[];
  upcoming: Assignment[];
  deansPlan: StudyBlock[];
  quests: Quest[];
  badges: typeof badges;
  weekActivity: typeof weekActivity;
  meetings: Meeting[];
  schoolWeeks: SchoolWeek[];
  gradeCategories: GradeCategory[];
  gradeItems: GradeItem[];
  announcements: Announcement[];
  modules: CourseModule[];
  notifications: Notification[];
  settingToggles: typeof settingToggles;
  focusLengths: typeof focusLengths;
};

export function demoSnapshot(sourceNote: string): HubSnapshot {
  return {
    source: "demo",
    sourceNote,
    timeZone: "America/New_York",
    student,
    semester,
    courses,
    courseByCode,
    courseBySlug,
    todaysClasses,
    upcoming,
    deansPlan,
    quests,
    badges,
    weekActivity,
    meetings,
    schoolWeeks,
    gradeCategories,
    gradeItems,
    announcements,
    modules,
    notifications,
    settingToggles,
    focusLengths,
  };
}

function sessionStatus(start: number, end: number, now: number, sessions: ClassSession[]): ClassSession["status"] {
  if (end <= now) return "done";
  if (start <= now && end > now) return "now";
  const nextStart = sessions
    .map((session) => session.startMin)
    .filter((value): value is number => value != null && value > now)
    .sort((a, b) => a - b)[0];
  if (nextStart != null && start === nextStart) return "next";
  return "later";
}

/** Refresh the clock on a cached live snapshot without calling Canvas again. */
export function refreshClock(hub: HubSnapshot, now: Date): HubSnapshot {
  if (hub.source !== "live") return hub;
  const stamp = zonedStamp(now, hub.timeZone);
  const todaysClasses = hub.todaysClasses.map((session) => {
    if (session.startMin == null || session.endMin == null) return session;
    return {
      ...session,
      status: sessionStatus(session.startMin, session.endMin, stamp.minutes, hub.todaysClasses),
    };
  });
  return {
    ...hub,
    semester: {
      ...hub.semester,
      today: stamp.todayLabel,
      todayMinutes: stamp.minutes,
      todayDow: stamp.dow,
    },
    todaysClasses,
  };
}

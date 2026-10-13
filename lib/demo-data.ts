// Demo data only. Nothing here is real or connected to Canvas yet.

export type CourseColor = "violet" | "mint" | "sun" | "coral" | "sky" | "pink";

export type Course = {
  code: string;
  name: string;
  color: CourseColor;
  grade: number; // percent
  letter: string;
  professor: string;
};

export const student = {
  firstName: "Jacob",
  level: 7,
  xp: 1840,
  xpForNextLevel: 2200,
  streakDays: 12,
  gpa: 3.72,
  weekDone: 9,
  weekTotal: 13,
};

export const courses: Course[] = [
  { code: "BIBL 104", name: "Survey of the Old Testament", color: "violet", grade: 94, letter: "A", professor: "Dr. Hammond" },
  { code: "ENGL 101", name: "Composition & Rhetoric", color: "coral", grade: 88, letter: "B+", professor: "Prof. Alvarez" },
  { code: "MATH 121", name: "Calculus I", color: "sky", grade: 81, letter: "B-", professor: "Dr. Okafor" },
  { code: "CSIS 110", name: "Intro to Programming", color: "mint", grade: 97, letter: "A", professor: "Prof. Lindqvist" },
  { code: "PSYC 101", name: "General Psychology", color: "sun", grade: 90, letter: "A-", professor: "Dr. Patel" },
];

export const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c])) as Record<string, Course>;

export type ClassSession = {
  course: string;
  start: string;
  end: string;
  where: string;
  status: "done" | "now" | "next" | "later";
};

export const todaysClasses: ClassSession[] = [
  { course: "BIBL 104", start: "9:00", end: "9:50 AM", where: "DeMoss 1113", status: "done" },
  { course: "MATH 121", start: "11:00", end: "12:15 PM", where: "Science Hall 204", status: "now" },
  { course: "CSIS 110", start: "2:00", end: "3:15 PM", where: "Green Hall 1840", status: "next" },
  { course: "PSYC 101", start: "7:00", end: "8:00 PM", where: "Online · Live", status: "later" },
];

export type Assignment = {
  id: string;
  title: string;
  course: string;
  due: string;
  urgency: "today" | "soon" | "later";
  xp: number;
  kind: "Essay" | "Quiz" | "Problem set" | "Reading" | "Project" | "Discussion";
};

export const upcoming: Assignment[] = [
  { id: "a1", title: "Rhetorical analysis — first draft", course: "ENGL 101", due: "Today · 11:59 PM", urgency: "today", xp: 120, kind: "Essay" },
  { id: "a2", title: "Derivatives problem set 4", course: "MATH 121", due: "Tomorrow · 9:00 AM", urgency: "soon", xp: 80, kind: "Problem set" },
  { id: "a3", title: "Genesis 12–25 reading quiz", course: "BIBL 104", due: "Wed · 11:59 PM", urgency: "soon", xp: 60, kind: "Quiz" },
  { id: "a4", title: "Lab 5: loops & lists", course: "CSIS 110", due: "Thu · 5:00 PM", urgency: "later", xp: 100, kind: "Project" },
  { id: "a5", title: "Memory & learning discussion post", course: "PSYC 101", due: "Fri · 11:59 PM", urgency: "later", xp: 40, kind: "Discussion" },
];

export type StudyBlock = {
  time: string;
  label: string;
  course: string;
  minutes: number;
};

export const deansPlan: StudyBlock[] = [
  { time: "3:30 PM", label: "Outline + draft body paragraphs", course: "ENGL 101", minutes: 50 },
  { time: "4:30 PM", label: "Break · walk & snack", course: "", minutes: 15 },
  { time: "4:45 PM", label: "Problem set 4, questions 1–8", course: "MATH 121", minutes: 45 },
  { time: "8:15 PM", label: "Polish & submit essay draft", course: "ENGL 101", minutes: 35 },
];

export type Quest = {
  title: string;
  progress: number;
  goal: number;
  xp: number;
  color: CourseColor;
};

export const quests: Quest[] = [
  { title: "Finish 3 study blocks", progress: 1, goal: 3, xp: 50, color: "violet" },
  { title: "Submit before the deadline", progress: 4, goal: 5, xp: 75, color: "mint" },
  { title: "Read 30 pages", progress: 22, goal: 30, xp: 40, color: "sun" },
];

export const badges = [
  { emoji: "🔥", label: "12-day streak", unlocked: true },
  { emoji: "🌅", label: "Early bird", unlocked: true },
  { emoji: "🎯", label: "Perfect week", unlocked: false },
  { emoji: "📚", label: "Bookworm", unlocked: true },
  { emoji: "🧠", label: "Quiz master", unlocked: false },
];

export const weekActivity = [
  { day: "M", minutes: 95 },
  { day: "T", minutes: 140 },
  { day: "W", minutes: 60 },
  { day: "T", minutes: 120 },
  { day: "F", minutes: 45 },
  { day: "S", minutes: 30 },
  { day: "S", minutes: 80 },
];

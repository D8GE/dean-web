// Demo data only. Nothing here is real or connected to Canvas yet.
// "Today" in this prototype is Monday, October 12, 2026 — week 8 of Fall.
// That matches the dashboard greeting. Don't drift the courses, grades, or due dates.

export type CourseColor = "violet" | "mint" | "sun" | "coral" | "sky" | "pink";

export type Course = {
  code: string;
  slug: string;
  name: string;
  color: CourseColor;
  grade: number; // percent
  letter: string;
  professor: string;
  credits: number;
  blurb: string;
  office: string;
};

export const student = {
  firstName: "Jacob",
  lastName: "Serrano",
  initials: "JS",
  email: "jacob.serrano@students.edu",
  studentId: "00058241",
  major: "Computer Science",
  year: "Freshman",
  advisor: "Dr. Nguyen",
  level: 7,
  xp: 1840,
  xpForNextLevel: 2200,
  streakDays: 12,
  gpa: 3.72,
  weekDone: 9,
  weekTotal: 13,
};

export const semester = {
  season: "Fall 2026",
  week: 8,
  today: "Monday, October 12",
  /** Minutes from midnight. Sits inside MATH 121, matching the dashboard's "now". */
  todayMinutes: 11 * 60 + 24,
};

export const courses: Course[] = [
  {
    code: "BIBL 104",
    slug: "bibl-104",
    name: "Survey of the Old Testament",
    color: "violet",
    grade: 94,
    letter: "A",
    professor: "Dr. Hammond",
    credits: 3,
    blurb: "The big story from Genesis to Malachi — history, genre, and how the books fit together.",
    office: "Tue · 2:00–3:30 PM · DeMoss 1120",
  },
  {
    code: "ENGL 101",
    slug: "engl-101",
    name: "Composition & Rhetoric",
    color: "coral",
    grade: 88,
    letter: "B+",
    professor: "Prof. Alvarez",
    credits: 3,
    blurb: "Rhetorical analysis, argument, and revision. This week's job is the first draft.",
    office: "Wed · 1:00–2:30 PM · DeMoss 2022",
  },
  {
    code: "MATH 121",
    slug: "math-121",
    name: "Calculus I",
    color: "sky",
    grade: 81,
    letter: "B-",
    professor: "Dr. Okafor",
    credits: 3,
    blurb: "Limits, derivatives, and the first applications. Problem set 4 is the derivatives chapter.",
    office: "Thu · 11:00 AM–12:30 PM · Science Hall 210",
  },
  {
    code: "CSIS 110",
    slug: "csis-110",
    name: "Intro to Programming",
    color: "mint",
    grade: 97,
    letter: "A",
    professor: "Prof. Lindqvist",
    credits: 3,
    blurb: "Python from variables through loops, lists, and small programs. Lab 5 is due Thursday.",
    office: "Fri · 10:00 AM–12:00 PM · Green Hall 1855",
  },
  {
    code: "PSYC 101",
    slug: "psyc-101",
    name: "General Psychology",
    color: "sun",
    grade: 90,
    letter: "A-",
    professor: "Dr. Patel",
    credits: 3,
    blurb: "Methods, memory, and learning. Monday night is live; the discussion post lands Friday.",
    office: "Mon · 5:00–6:00 PM · Online",
  },
];

export const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c])) as Record<string, Course>;

export const courseBySlug = Object.fromEntries(courses.map((c) => [c.slug, c])) as Record<string, Course>;

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
  /** 0 = Monday … 4 = Friday of the current demo week. */
  dueDay: number;
  urgency: "today" | "soon" | "later";
  xp: number;
  kind: "Essay" | "Quiz" | "Problem set" | "Reading" | "Project" | "Discussion";
};

export const upcoming: Assignment[] = [
  { id: "a1", title: "Rhetorical analysis — first draft", course: "ENGL 101", due: "Today · 11:59 PM", dueDay: 0, urgency: "today", xp: 120, kind: "Essay" },
  { id: "a2", title: "Derivatives problem set 4", course: "MATH 121", due: "Tomorrow · 9:00 AM", dueDay: 1, urgency: "soon", xp: 80, kind: "Problem set" },
  { id: "a3", title: "Genesis 12–25 reading quiz", course: "BIBL 104", due: "Wed · 11:59 PM", dueDay: 2, urgency: "soon", xp: 60, kind: "Quiz" },
  { id: "a4", title: "Lab 5: loops & lists", course: "CSIS 110", due: "Thu · 5:00 PM", dueDay: 3, urgency: "later", xp: 100, kind: "Project" },
  { id: "a5", title: "Memory & learning discussion post", course: "PSYC 101", due: "Fri · 11:59 PM", dueDay: 4, urgency: "later", xp: 40, kind: "Discussion" },
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

/** Monday = 0. Times are minutes from midnight so the week grid can place them. */
export type Meeting = {
  id: string;
  course: string;
  day: number;
  startMin: number;
  endMin: number;
  where: string;
};

// Monday's four meetings are the same sessions as `todaysClasses`.
export const meetings: Meeting[] = [
  { id: "m1", course: "BIBL 104", day: 0, startMin: 9 * 60, endMin: 9 * 60 + 50, where: "DeMoss 1113" },
  { id: "m2", course: "MATH 121", day: 0, startMin: 11 * 60, endMin: 12 * 60 + 15, where: "Science Hall 204" },
  { id: "m3", course: "CSIS 110", day: 0, startMin: 14 * 60, endMin: 15 * 60 + 15, where: "Green Hall 1840" },
  { id: "m4", course: "PSYC 101", day: 0, startMin: 19 * 60, endMin: 20 * 60, where: "Online · Live" },
  { id: "m5", course: "ENGL 101", day: 1, startMin: 9 * 60 + 30, endMin: 10 * 60 + 45, where: "DeMoss 2014" },
  { id: "m6", course: "BIBL 104", day: 2, startMin: 9 * 60, endMin: 9 * 60 + 50, where: "DeMoss 1113" },
  { id: "m7", course: "MATH 121", day: 2, startMin: 11 * 60, endMin: 12 * 60 + 15, where: "Science Hall 204" },
  { id: "m8", course: "CSIS 110", day: 2, startMin: 14 * 60, endMin: 15 * 60 + 15, where: "Green Hall 1840" },
  { id: "m9", course: "ENGL 101", day: 3, startMin: 9 * 60 + 30, endMin: 10 * 60 + 45, where: "DeMoss 2014" },
  { id: "m10", course: "CSIS 110", day: 3, startMin: 15 * 60 + 30, endMin: 17 * 60, where: "Green Hall Lab 1720" },
  { id: "m11", course: "BIBL 104", day: 4, startMin: 9 * 60, endMin: 9 * 60 + 50, where: "DeMoss 1113" },
];

export type SchoolDay = {
  name: string;
  num: string;
  month: string;
  iso: string;
  dow: number;
};

export const schoolWeeks: { week: number; range: string; days: SchoolDay[] }[] = [
  {
    week: 6,
    range: "Sep 28 – Oct 4",
    days: [
      { name: "Mon", num: "28", month: "Sep", iso: "2026-09-28", dow: 0 },
      { name: "Tue", num: "29", month: "Sep", iso: "2026-09-29", dow: 1 },
      { name: "Wed", num: "30", month: "Sep", iso: "2026-09-30", dow: 2 },
      { name: "Thu", num: "1", month: "Oct", iso: "2026-10-01", dow: 3 },
      { name: "Fri", num: "2", month: "Oct", iso: "2026-10-02", dow: 4 },
      { name: "Sat", num: "3", month: "Oct", iso: "2026-10-03", dow: 5 },
      { name: "Sun", num: "4", month: "Oct", iso: "2026-10-04", dow: 6 },
    ],
  },
  {
    week: 7,
    range: "Oct 5 – 11",
    days: [
      { name: "Mon", num: "5", month: "Oct", iso: "2026-10-05", dow: 0 },
      { name: "Tue", num: "6", month: "Oct", iso: "2026-10-06", dow: 1 },
      { name: "Wed", num: "7", month: "Oct", iso: "2026-10-07", dow: 2 },
      { name: "Thu", num: "8", month: "Oct", iso: "2026-10-08", dow: 3 },
      { name: "Fri", num: "9", month: "Oct", iso: "2026-10-09", dow: 4 },
      { name: "Sat", num: "10", month: "Oct", iso: "2026-10-10", dow: 5 },
      { name: "Sun", num: "11", month: "Oct", iso: "2026-10-11", dow: 6 },
    ],
  },
  {
    week: 8,
    range: "Oct 12 – 18",
    days: [
      { name: "Mon", num: "12", month: "Oct", iso: "2026-10-12", dow: 0 },
      { name: "Tue", num: "13", month: "Oct", iso: "2026-10-13", dow: 1 },
      { name: "Wed", num: "14", month: "Oct", iso: "2026-10-14", dow: 2 },
      { name: "Thu", num: "15", month: "Oct", iso: "2026-10-15", dow: 3 },
      { name: "Fri", num: "16", month: "Oct", iso: "2026-10-16", dow: 4 },
      { name: "Sat", num: "17", month: "Oct", iso: "2026-10-17", dow: 5 },
      { name: "Sun", num: "18", month: "Oct", iso: "2026-10-18", dow: 6 },
    ],
  },
  {
    week: 9,
    range: "Oct 19 – 25",
    days: [
      { name: "Mon", num: "19", month: "Oct", iso: "2026-10-19", dow: 0 },
      { name: "Tue", num: "20", month: "Oct", iso: "2026-10-20", dow: 1 },
      { name: "Wed", num: "21", month: "Oct", iso: "2026-10-21", dow: 2 },
      { name: "Thu", num: "22", month: "Oct", iso: "2026-10-22", dow: 3 },
      { name: "Fri", num: "23", month: "Oct", iso: "2026-10-23", dow: 4 },
      { name: "Sat", num: "24", month: "Oct", iso: "2026-10-24", dow: 5 },
      { name: "Sun", num: "25", month: "Oct", iso: "2026-10-25", dow: 6 },
    ],
  },
  {
    week: 10,
    range: "Oct 26 – Nov 1",
    days: [
      { name: "Mon", num: "26", month: "Oct", iso: "2026-10-26", dow: 0 },
      { name: "Tue", num: "27", month: "Oct", iso: "2026-10-27", dow: 1 },
      { name: "Wed", num: "28", month: "Oct", iso: "2026-10-28", dow: 2 },
      { name: "Thu", num: "29", month: "Oct", iso: "2026-10-29", dow: 3 },
      { name: "Fri", num: "30", month: "Oct", iso: "2026-10-30", dow: 4 },
      { name: "Sat", num: "31", month: "Oct", iso: "2026-10-31", dow: 5 },
      { name: "Sun", num: "1", month: "Nov", iso: "2026-11-01", dow: 6 },
    ],
  },
];

/** Category weights sum to 100. Graded items are built so the running grade rounds to `course.grade`. */
export type GradeCategory = {
  course: string;
  name: string;
  weight: number;
};

export const gradeCategories: GradeCategory[] = [
  { course: "BIBL 104", name: "Exams", weight: 40 },
  { course: "BIBL 104", name: "Quizzes", weight: 30 },
  { course: "BIBL 104", name: "Writing", weight: 20 },
  { course: "BIBL 104", name: "Participation", weight: 10 },
  { course: "ENGL 101", name: "Essays", weight: 50 },
  { course: "ENGL 101", name: "Journal", weight: 20 },
  { course: "ENGL 101", name: "Peer review", weight: 15 },
  { course: "ENGL 101", name: "Participation", weight: 15 },
  { course: "MATH 121", name: "Exams", weight: 40 },
  { course: "MATH 121", name: "Homework", weight: 50 },
  { course: "MATH 121", name: "Quizzes", weight: 10 },
  { course: "CSIS 110", name: "Labs", weight: 60 },
  { course: "CSIS 110", name: "Quizzes", weight: 30 },
  { course: "CSIS 110", name: "Participation", weight: 10 },
  { course: "PSYC 101", name: "Exams", weight: 40 },
  { course: "PSYC 101", name: "Quizzes", weight: 25 },
  { course: "PSYC 101", name: "Writing", weight: 25 },
  { course: "PSYC 101", name: "Participation", weight: 10 },
];

export type GradeItem = {
  id: string;
  course: string;
  title: string;
  category: string;
  earned: number | null;
  possible: number;
  date: string;
  /** Higher sorts later among graded rows. */
  order: number;
  feedback?: string;
  upcomingId?: string;
};

export const gradeItems: GradeItem[] = [
  { id: "g-b1", course: "BIBL 104", title: "Exam 1 · Pentateuch", category: "Exams", earned: 95, possible: 100, date: "Oct 2", order: 20261002, feedback: "Clear on covenant structure. Watch the chronology in Exodus." },
  { id: "g-b2", course: "BIBL 104", title: "Reading quiz · Genesis 1–11", category: "Quizzes", earned: 90, possible: 100, date: "Sep 10", order: 20260910 },
  { id: "g-b3", course: "BIBL 104", title: "Reading quiz · Exodus 1–20", category: "Quizzes", earned: 94, possible: 100, date: "Sep 24", order: 20260924 },
  { id: "g-b4", course: "BIBL 104", title: "Reading quiz · Covenant code", category: "Quizzes", earned: 92, possible: 100, date: "Oct 8", order: 20261008 },
  { id: "g-b5", course: "BIBL 104", title: "Essay · Covenant in Genesis", category: "Writing", earned: 92, possible: 100, date: "Oct 6", order: 20261006, feedback: "Thesis holds. Pull one more text into the conclusion." },
  { id: "g-b6", course: "BIBL 104", title: "Participation", category: "Participation", earned: 100, possible: 100, date: "Ongoing", order: 20261011 },
  { id: "g-a3", course: "BIBL 104", title: "Genesis 12–25 reading quiz", category: "Quizzes", earned: null, possible: 100, date: "Wed · 11:59 PM", order: 20261014, upcomingId: "a3" },

  { id: "g-e1", course: "ENGL 101", title: "Diagnostic essay", category: "Essays", earned: 84, possible: 100, date: "Sep 8", order: 20260908, feedback: "Voice is there. The claim needs a narrower stake." },
  { id: "g-e2", course: "ENGL 101", title: "Summary essay", category: "Essays", earned: 88, possible: 100, date: "Sep 29", order: 20260929, feedback: "Fair paraphrase. Keep your own argument out of the summary." },
  { id: "g-e3", course: "ENGL 101", title: "Annotation journal", category: "Journal", earned: 90, possible: 100, date: "Oct 6", order: 20261006 },
  { id: "g-e4", course: "ENGL 101", title: "Peer review workshop", category: "Peer review", earned: 92, possible: 100, date: "Oct 8", order: 20261008, feedback: "Specific comments. Your partner can actually use these." },
  { id: "g-e5", course: "ENGL 101", title: "Participation", category: "Participation", earned: 88, possible: 100, date: "Ongoing", order: 20261011 },
  { id: "g-a1", course: "ENGL 101", title: "Rhetorical analysis — first draft", category: "Essays", earned: null, possible: 100, date: "Today · 11:59 PM", order: 20261012, upcomingId: "a1" },

  { id: "g-m1", course: "MATH 121", title: "Exam 1 · Limits", category: "Exams", earned: 78, possible: 100, date: "Oct 1", order: 20261001, feedback: "Algebra slips on the last two. The limit setup itself was right." },
  { id: "g-m2", course: "MATH 121", title: "Problem set 1", category: "Homework", earned: 88, possible: 100, date: "Sep 11", order: 20260911 },
  { id: "g-m3", course: "MATH 121", title: "Problem set 2", category: "Homework", earned: 84, possible: 100, date: "Sep 18", order: 20260918 },
  { id: "g-m4", course: "MATH 121", title: "Problem set 3", category: "Homework", earned: 80, possible: 100, date: "Oct 2", order: 20261002 },
  { id: "g-m5", course: "MATH 121", title: "Quiz · Limits", category: "Quizzes", earned: 80, possible: 100, date: "Sep 16", order: 20260916 },
  { id: "g-m6", course: "MATH 121", title: "Quiz · Definition of the derivative", category: "Quizzes", earned: 76, possible: 100, date: "Oct 7", order: 20261007 },
  { id: "g-a2", course: "MATH 121", title: "Derivatives problem set 4", category: "Homework", earned: null, possible: 100, date: "Tomorrow · 9:00 AM", order: 20261013, upcomingId: "a2" },

  { id: "g-c1", course: "CSIS 110", title: "Lab 1 · Hello, variables", category: "Labs", earned: 100, possible: 100, date: "Sep 10", order: 20260910 },
  { id: "g-c2", course: "CSIS 110", title: "Lab 2 · Conditionals", category: "Labs", earned: 98, possible: 100, date: "Sep 17", order: 20260917 },
  { id: "g-c3", course: "CSIS 110", title: "Lab 3 · Functions", category: "Labs", earned: 98, possible: 100, date: "Sep 24", order: 20260924, feedback: "Clean functions. Name the edge-case test you skipped." },
  { id: "g-c4", course: "CSIS 110", title: "Lab 4 · Strings", category: "Labs", earned: 96, possible: 100, date: "Oct 1", order: 20261001 },
  { id: "g-c5", course: "CSIS 110", title: "Quiz 1 · Syntax & types", category: "Quizzes", earned: 96, possible: 100, date: "Sep 22", order: 20260922 },
  { id: "g-c6", course: "CSIS 110", title: "Quiz 2 · Functions", category: "Quizzes", earned: 92, possible: 100, date: "Oct 6", order: 20261006 },
  { id: "g-c7", course: "CSIS 110", title: "Participation", category: "Participation", earned: 100, possible: 100, date: "Ongoing", order: 20261011 },
  { id: "g-a4", course: "CSIS 110", title: "Lab 5: loops & lists", category: "Labs", earned: null, possible: 100, date: "Thu · 5:00 PM", order: 20261015, upcomingId: "a4" },

  { id: "g-p1", course: "PSYC 101", title: "Exam 1 · Methods & biology", category: "Exams", earned: 90, possible: 100, date: "Sep 30", order: 20260930, feedback: "Solid on methods. The neuron diagram lost a few points." },
  { id: "g-p2", course: "PSYC 101", title: "Chapter quiz · Research methods", category: "Quizzes", earned: 86, possible: 100, date: "Sep 15", order: 20260915 },
  { id: "g-p3", course: "PSYC 101", title: "Chapter quiz · Biology & behavior", category: "Quizzes", earned: 90, possible: 100, date: "Oct 6", order: 20261006 },
  { id: "g-p4", course: "PSYC 101", title: "Article response · sleep study", category: "Writing", earned: 88, possible: 100, date: "Oct 8", order: 20261008, feedback: "You named the confound. Say what the lab should do next." },
  { id: "g-p5", course: "PSYC 101", title: "Participation", category: "Participation", earned: 100, possible: 100, date: "Ongoing", order: 20261011 },
  { id: "g-a5", course: "PSYC 101", title: "Memory & learning discussion post", category: "Writing", earned: null, possible: 100, date: "Fri · 11:59 PM", order: 20261016, upcomingId: "a5" },
];

export type Announcement = {
  id: string;
  course: string;
  title: string;
  body: string;
  date: string;
  author: string;
};

export const announcements: Announcement[] = [
  { id: "n-b1", course: "BIBL 104", title: "Wednesday's quiz is Genesis 12–25", date: "Oct 10", author: "Dr. Hammond", body: "Ten questions, open note, due 11:59 PM. Focus on the covenant scenes, not the genealogy lists. The reading guide on the module page is enough." },
  { id: "n-b2", course: "BIBL 104", title: "Exam 1 scores are up", date: "Oct 3", author: "Dr. Hammond", body: "The curve was small. If you missed the chronology short answer, the key is posted under Week 6. Office hours Tuesday if you want to walk it." },
  { id: "n-e1", course: "ENGL 101", title: "Draft due tonight — bring a real thesis", date: "Oct 12", author: "Prof. Alvarez", body: "Two pages is enough if the claim is specific. Don't summarize the whole article. I'll comment by Wednesday so Friday's revision has somewhere to go." },
  { id: "n-e2", course: "ENGL 101", title: "What I saw in peer review", date: "Oct 9", author: "Prof. Alvarez", body: "The useful comments named a sentence. \"Good job\" doesn't count. If your notes were thin, add two more before the draft." },
  { id: "n-m1", course: "MATH 121", title: "Problem set 4 is due Tuesday at 9:00", date: "Oct 12", author: "Dr. Okafor", body: "Questions 1–8 are product, quotient, and chain rule. Show the algebra. A naked derivative with no steps gets half credit." },
  { id: "n-m2", course: "MATH 121", title: "Exam 1 follow-up", date: "Oct 6", author: "Dr. Okafor", body: "The limit problems were fine. The algebra at the end is where points left. Thursday office hours are the best place to redo one of those." },
  { id: "n-c1", course: "CSIS 110", title: "Lab 5 spec is posted", date: "Oct 9", author: "Prof. Lindqvist", body: "Loops and lists, due Thursday at 5:00 PM — that's the end of lab. Starter code is in the module. Autograder opens Wednesday night." },
  { id: "n-c2", course: "CSIS 110", title: "Lab 4 autograder note", date: "Oct 2", author: "Prof. Lindqvist", body: "A few of you failed the empty-string case. That's a one-line fix if you resubmit before Friday. I left the window open." },
  { id: "n-p1", course: "PSYC 101", title: "Tonight's live session: memory & learning", date: "Oct 12", author: "Dr. Patel", body: "7:00 PM, same link as always. We'll run a short recall demo. The Friday discussion post asks you to connect that demo to the chapter." },
  { id: "n-p2", course: "PSYC 101", title: "Discussion prompt for Friday", date: "Oct 5", author: "Dr. Patel", body: "200 words is enough. Use one term from the chapter correctly and one example that isn't the textbook's. Replies to classmates are optional this week." },
];

export type ModuleItem = {
  id: string;
  title: string;
  kind: "Reading" | "Lecture" | "Video" | "Quiz" | "Page";
  done: boolean;
};

export type CourseModule = {
  id: string;
  course: string;
  weekLabel: string;
  title: string;
  items: ModuleItem[];
};

export const modules: CourseModule[] = [
  {
    id: "mod-b7",
    course: "BIBL 104",
    weekLabel: "Week 7",
    title: "Exodus & the covenant code",
    items: [
      { id: "mb7a", title: "Read Exodus 1–24", kind: "Reading", done: true },
      { id: "mb7b", title: "Lecture · Law and narrative", kind: "Lecture", done: true },
      { id: "mb7c", title: "Reading quiz · Covenant code", kind: "Quiz", done: true },
    ],
  },
  {
    id: "mod-b8",
    course: "BIBL 104",
    weekLabel: "Week 8",
    title: "Abraham to Joseph",
    items: [
      { id: "mb8a", title: "Read Genesis 12–25", kind: "Reading", done: true },
      { id: "mb8b", title: "Lecture · Call and covenant", kind: "Lecture", done: true },
      { id: "mb8c", title: "Reading guide · what to mark", kind: "Page", done: false },
      { id: "mb8d", title: "Genesis 12–25 reading quiz", kind: "Quiz", done: false },
    ],
  },
  {
    id: "mod-e7",
    course: "ENGL 101",
    weekLabel: "Week 7",
    title: "Peer review",
    items: [
      { id: "me7a", title: "Bring a printed draft", kind: "Page", done: true },
      { id: "me7b", title: "Workshop notes", kind: "Page", done: true },
      { id: "me7c", title: "Lecture · Specific comments", kind: "Lecture", done: true },
    ],
  },
  {
    id: "mod-e8",
    course: "ENGL 101",
    weekLabel: "Week 8",
    title: "Rhetorical analysis",
    items: [
      { id: "me8a", title: "Read the sample analysis", kind: "Reading", done: true },
      { id: "me8b", title: "Lecture · Claims that can be wrong", kind: "Lecture", done: true },
      { id: "me8c", title: "Outline worksheet", kind: "Page", done: false },
      { id: "me8d", title: "Rhetorical analysis — first draft", kind: "Page", done: false },
    ],
  },
  {
    id: "mod-m7",
    course: "MATH 121",
    weekLabel: "Week 7",
    title: "Definition of the derivative",
    items: [
      { id: "mm7a", title: "Read §2.1–2.2", kind: "Reading", done: true },
      { id: "mm7b", title: "Lecture · Difference quotients", kind: "Lecture", done: true },
      { id: "mm7c", title: "Quiz · Definition of the derivative", kind: "Quiz", done: true },
    ],
  },
  {
    id: "mod-m8",
    course: "MATH 121",
    weekLabel: "Week 8",
    title: "Derivative rules",
    items: [
      { id: "mm8a", title: "Read §2.3–2.4", kind: "Reading", done: true },
      { id: "mm8b", title: "Video · Chain rule, three examples", kind: "Video", done: false },
      { id: "mm8c", title: "Problem set 4", kind: "Page", done: false },
    ],
  },
  {
    id: "mod-c7",
    course: "CSIS 110",
    weekLabel: "Week 7",
    title: "Functions & strings",
    items: [
      { id: "mc7a", title: "Lecture · Functions that return", kind: "Lecture", done: true },
      { id: "mc7b", title: "Lab 4 · Strings", kind: "Page", done: true },
      { id: "mc7c", title: "Quiz 2 · Functions", kind: "Quiz", done: true },
    ],
  },
  {
    id: "mod-c8",
    course: "CSIS 110",
    weekLabel: "Week 8",
    title: "Loops & lists",
    items: [
      { id: "mc8a", title: "Lecture · for, while, and lists", kind: "Lecture", done: true },
      { id: "mc8b", title: "Video · Index errors", kind: "Video", done: false },
      { id: "mc8c", title: "Lab 5 starter code", kind: "Page", done: false },
      { id: "mc8d", title: "Lab 5: loops & lists", kind: "Page", done: false },
    ],
  },
  {
    id: "mod-p7",
    course: "PSYC 101",
    weekLabel: "Week 7",
    title: "Biology & behavior",
    items: [
      { id: "mp7a", title: "Read chapter 3", kind: "Reading", done: true },
      { id: "mp7b", title: "Lecture · Neurons, briefly", kind: "Lecture", done: true },
      { id: "mp7c", title: "Article response · sleep study", kind: "Page", done: true },
    ],
  },
  {
    id: "mod-p8",
    course: "PSYC 101",
    weekLabel: "Week 8",
    title: "Memory & learning",
    items: [
      { id: "mp8a", title: "Read chapter 7", kind: "Reading", done: true },
      { id: "mp8b", title: "Live session · Monday 7:00 PM", kind: "Lecture", done: false },
      { id: "mp8c", title: "Discussion prompt", kind: "Page", done: true },
      { id: "mp8d", title: "Memory & learning discussion post", kind: "Page", done: false },
    ],
  },
];

export const notifications = [
  { id: "n1", title: "Calc is happening now", detail: "MATH 121 · Science Hall 204", when: "Now", color: "sky" as CourseColor, href: "/schedule" },
  { id: "n2", title: "English draft is due tonight", detail: "ENGL 101 · 11:59 PM · 120 XP", when: "Today", color: "coral" as CourseColor, href: "/courses/engl-101" },
  { id: "n3", title: "Keep the 12-day streak", detail: "One study block after class does it.", when: "Tonight", color: "sun" as CourseColor, href: "/schedule" },
];

export const settingToggles = [
  { id: "due", label: "Due-date reminders", detail: "The evening before, then again at noon.", on: true },
  { id: "starting", label: "Class starting soon", detail: "Ten minutes before you need to leave.", on: true },
  { id: "grades", label: "Grade posted", detail: "When a score lands in the gradebook.", on: true },
  { id: "streak", label: "Streak nudge", detail: "If you haven't studied by 8:00 PM.", on: true },
  { id: "plan", label: "Morning plan note", detail: "A short note with today's blocks. The scheduler itself still lives with Dean.", on: false },
];

export const focusLengths = [25, 50, 90] as const;

import type { ClassSession, CourseColor, GradeItem } from "./demo-data";
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
  type Meeting,
  type Notification,
  type Quest,
  type SchoolWeek,
  type Semester,
  type Student,
  type StudyBlock,
} from "./demo-data";
import { DEFAULT_CANVAS_URL } from "./canvas/link";
import { zonedStamp } from "./canvas/time";
import { formatRange } from "./schedule";
import {
  announcementMore,
  announcementWork,
  moduleCopy,
  moduleWorkLinks,
  questCopy,
  workCopy,
  type ModuleCopy,
} from "./surface-copy";

export type DataSource = "live" | "demo";

export type HubSnapshot = {
  source: DataSource;
  sourceNote: string;
  /** School Canvas host, or the public Canvas home when no school URL is configured. */
  canvasUrl: string;
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

export function demoSnapshot(sourceNote: string, canvasUrl = DEFAULT_CANVAS_URL): HubSnapshot {
  return {
    source: "demo",
    sourceNote,
    canvasUrl,
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

export type HubKind = "Course" | "Class" | "Plan" | "Assignment" | "Announcement" | "Module" | "Quest" | "You";

export const hubKindOrder: HubKind[] = [
  "Course",
  "Class",
  "Plan",
  "Assignment",
  "Announcement",
  "Module",
  "Quest",
  "You",
];

export type HubHit = {
  id: string;
  kind: HubKind;
  title: string;
  detail: string;
  href: string;
  color: CourseColor | "neutral";
  haystack: string;
};

export type WorkUrgency = "today" | "soon" | "later" | "posted";

export type WorkRecord = {
  id: string;
  gradeId: string;
  title: string;
  courseCode: string;
  dueLabel: string;
  urgency: WorkUrgency;
  xp: number | null;
  kind: string;
  category: string;
  earned: number | null;
  possible: number;
  feedback?: string;
  prompt: string;
  steps: string[];
  rubric: { name: string; note: string }[];
  announcementId?: string;
  moduleItemId?: string;
  order: number;
  dueDay: number;
  htmlUrl?: string;
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function fallbackPrompt(item: GradeItem) {
  if (item.earned === null) {
    return `${item.title} is still open. It's on this week's list for ${item.course}.`;
  }
  return `Posted ${item.date} under ${item.category}. Worth ${item.possible} points.`;
}

function titleKey(course: string, title: string) {
  return `${course}\0${title.trim().toLowerCase()}`;
}

function recordFromGrade(item: GradeItem, up: Assignment | undefined): WorkRecord {
  const id = up?.id ?? item.id;
  const copy = workCopy[id] ?? workCopy[item.id];
  return {
    id,
    gradeId: item.id,
    title: item.title,
    courseCode: item.course,
    dueLabel: up?.due ?? item.date,
    urgency: up?.urgency ?? "posted",
    xp: up?.xp ?? null,
    kind: up?.kind ?? item.category,
    category: item.category,
    earned: item.earned,
    possible: item.possible,
    feedback: item.feedback,
    prompt: copy?.prompt ?? fallbackPrompt(item),
    steps: copy?.steps ?? [],
    rubric: copy?.rubric ?? [],
    announcementId: copy?.announcementId,
    moduleItemId: copy?.moduleItemId,
    order: item.order,
    dueDay: up?.dueDay ?? 99,
    htmlUrl: item.htmlUrl ?? up?.htmlUrl,
  };
}

function recordFromUpcoming(up: Assignment): WorkRecord {
  const copy = workCopy[up.id];
  const possible = up.points && up.points > 0 ? up.points : 0;
  return {
    id: up.id,
    gradeId: up.id,
    title: up.title,
    courseCode: up.course,
    dueLabel: up.due,
    urgency: up.urgency,
    xp: up.xp,
    kind: up.kind,
    category: up.kind,
    earned: null,
    possible,
    prompt: copy?.prompt ?? `${up.title} is still open. It's on this week's list for ${up.course}.`,
    steps: copy?.steps ?? [],
    rubric: copy?.rubric ?? [],
    announcementId: copy?.announcementId,
    moduleItemId: copy?.moduleItemId,
    order: up.dueDay,
    dueDay: up.dueDay,
    htmlUrl: up.htmlUrl,
  };
}

const workCache = new WeakMap<HubSnapshot, WorkRecord[]>();

export function allWork(hub: HubSnapshot): WorkRecord[] {
  const cached = workCache.get(hub);
  if (cached) return cached;

  const upcomingById = new Map(hub.upcoming.map((item) => [item.id, item]));
  const upcomingByTitle = new Map(hub.upcoming.map((item) => [titleKey(item.course, item.title), item]));
  const records = hub.gradeItems.map((item) => {
    const linked = item.upcomingId ? upcomingById.get(item.upcomingId) : undefined;
    const named = upcomingByTitle.get(titleKey(item.course, item.title));
    return recordFromGrade(item, linked ?? named);
  });
  const covered = new Set(records.flatMap((work) => [work.id, work.gradeId]));
  for (const item of hub.upcoming) {
    if (covered.has(item.id)) continue;
    records.push(recordFromUpcoming(item));
  }
  workCache.set(hub, records);
  return records;
}

export function workById(hub: HubSnapshot, id: string) {
  return allWork(hub).find((work) => work.id === id || work.gradeId === id) ?? null;
}

export function openWork(hub: HubSnapshot) {
  return allWork(hub)
    .filter((work) => work.earned === null)
    .sort((a, b) => a.dueDay - b.dueDay || a.order - b.order);
}

export function postedWork(hub: HubSnapshot) {
  return allWork(hub)
    .filter((work) => work.earned !== null)
    .sort((a, b) => b.order - a.order);
}

export function questAnchor(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function questDetail(title: string) {
  return questCopy[title] ?? null;
}

const noteHref: Record<string, string> = {
  n1: "/schedule?event=class-m2",
  n2: "/assignments/a1",
  n3: "/focus",
};

export type InboxNote = {
  id: string;
  title: string;
  detail: string;
  when: string;
  color: CourseColor;
  href: string;
};

const demoInbox: InboxNote[] = [
  ...notifications.map((note) => ({
    id: note.id,
    title: note.title,
    detail: note.detail,
    when: note.when,
    color: note.color,
    href: noteHref[note.id] ?? note.href,
  })),
  {
    id: "n4",
    title: "Lab 5 spec is posted",
    detail: "CSIS 110 · due Thursday at 5:00 PM",
    when: "Oct 9",
    color: "mint",
    href: "/announcements/n-c1",
  },
  {
    id: "n5",
    title: "Calc exam feedback is in",
    detail: "MATH 121 · Exam 1 · Limits · 78%",
    when: "Oct 6",
    color: "sky",
    href: "/assignments/g-m1",
  },
  {
    id: "n6",
    title: "Problem set 4 is tomorrow morning",
    detail: "MATH 121 · 9:00 AM · show the algebra",
    when: "Tomorrow",
    color: "sky",
    href: "/assignments/a2",
  },
];

export function inboxFor(hub: HubSnapshot): InboxNote[] {
  if (hub.source !== "live") return demoInbox;
  return hub.notifications.map((note) => {
    const assignmentId = note.id.startsWith("live-") ? note.id.slice("live-".length) : "";
    const work = assignmentId ? hub.upcoming.find((item) => item.id === assignmentId) : undefined;
    return {
      id: note.id,
      title: note.title,
      detail: note.detail,
      when: note.when,
      color: note.color,
      href: work ? `/assignments/${work.id}` : note.href,
    };
  });
}

export type ModulePage = {
  courseCode: string;
  slug: string;
  moduleId: string;
  weekLabel: string;
  moduleTitle: string;
  itemId: string;
  itemTitle: string;
  kind: string;
  done: boolean;
  copy: ModuleCopy;
  workId: string | null;
};

function linkedWorkId(hub: HubSnapshot, courseCode: string, itemId: string, itemTitle: string): string | null {
  const explicit = moduleWorkLinks[itemId];
  if (explicit) return explicit;
  const titled = itemTitle.trim().toLowerCase();
  const match = allWork(hub).find(
    (work) => work.courseCode === courseCode && (work.moduleItemId === itemId || work.title.trim().toLowerCase() === titled),
  );
  return match?.id ?? null;
}

export function modulePage(hub: HubSnapshot, slug: string, itemId: string): ModulePage | null {
  const course = hub.courseBySlug[slug];
  if (!course) return null;
  const mod = hub.modules.find((entry) => entry.course === course.code && entry.items.some((item) => item.id === itemId));
  if (!mod) return null;
  const item = mod.items.find((entry) => entry.id === itemId);
  if (!item) return null;
  const copy = moduleCopy[itemId] ?? {
    body: `${item.title} sits in ${mod.weekLabel}, ${mod.title}.`,
    takeaway: "Check it off on the Modules tab when you're through it.",
  };
  return {
    courseCode: course.code,
    slug: course.slug,
    moduleId: mod.id,
    weekLabel: mod.weekLabel,
    moduleTitle: mod.title,
    itemId: item.id,
    itemTitle: item.title,
    kind: item.kind,
    done: item.done,
    copy,
    workId: linkedWorkId(hub, course.code, item.id, item.title),
  };
}

export function moduleItemParams(hub: HubSnapshot) {
  const params: { slug: string; itemId: string }[] = [];
  for (const mod of hub.modules) {
    const course = hub.courseByCode[mod.course];
    if (!course) continue;
    for (const item of mod.items) params.push({ slug: course.slug, itemId: item.id });
  }
  return params;
}

export function announcementExtra(id: string) {
  return announcementMore[id] ?? null;
}

export function announcementWorkId(hub: HubSnapshot, id: string): string | null {
  const explicit = announcementWork[id];
  if (explicit) return explicit;
  const post = hub.announcements.find((item) => item.id === id);
  if (!post) return null;
  const hay = `${post.title} ${post.body}`.toLowerCase();
  const hit = allWork(hub)
    .filter((work) => work.courseCode === post.course && work.title.length > 3 && hay.includes(work.title.toLowerCase()))
    .sort((a, b) => b.title.length - a.title.length)[0];
  return hit?.id ?? null;
}

export function announcementForWork(hub: HubSnapshot, work: WorkRecord): Announcement | null {
  if (work.announcementId) {
    const linked = hub.announcements.find((item) => item.id === work.announcementId);
    if (linked) return linked;
  }
  const title = work.title.trim().toLowerCase();
  if (title.length < 4) return null;
  return (
    hub.announcements.find(
      (post) => post.course === work.courseCode && `${post.title} ${post.body}`.toLowerCase().includes(title),
    ) ?? null
  );
}

export function moduleLinkForWork(hub: HubSnapshot, work: WorkRecord): { slug: string; itemId: string } | null {
  const course = hub.courseByCode[work.courseCode];
  if (!course) return null;
  if (work.moduleItemId) return { slug: course.slug, itemId: work.moduleItemId };
  const title = work.title.trim().toLowerCase();
  for (const mod of hub.modules) {
    if (mod.course !== work.courseCode) continue;
    const item = mod.items.find((entry) => entry.title.trim().toLowerCase() === title);
    if (item) return { slug: course.slug, itemId: item.id };
  }
  return null;
}

const searchCache = new WeakMap<HubSnapshot, HubHit[]>();

function buildIndex(hub: HubSnapshot): HubHit[] {
  const hits: HubHit[] = [];

  for (const course of hub.courses) {
    hits.push({
      id: course.slug,
      kind: "Course",
      title: course.name,
      detail: `${course.code} · ${course.professor}`,
      href: `/courses/${course.slug}`,
      color: course.color,
      haystack: [course.code, course.name, course.professor, course.blurb, course.office, course.letter].join(" "),
    });
  }

  for (const meeting of hub.meetings) {
    const course = hub.courseByCode[meeting.course];
    hits.push({
      id: `class-${meeting.id}`,
      kind: "Class",
      title: course?.name ?? meeting.title ?? meeting.course,
      detail: `${DAY_NAMES[meeting.day]} · ${formatRange(meeting.startMin, meeting.endMin)} · ${meeting.where}`,
      href: `/schedule?event=class-${meeting.id}`,
      color: course?.color ?? "neutral",
      haystack: [meeting.course, course?.name ?? "", course?.professor ?? "", meeting.where, meeting.title ?? "", DAY_NAMES[meeting.day], "class"].join(" "),
    });
  }

  hub.deansPlan.forEach((block, index) => {
    const course = block.course ? hub.courseByCode[block.course] : null;
    hits.push({
      id: `study-${index}`,
      kind: "Plan",
      title: block.label,
      detail: `${block.time} · ${block.minutes} min · ${course ? course.code : "Recharge"}`,
      href: `/focus?block=${index}`,
      color: course?.color ?? "neutral",
      haystack: [block.label, block.time, block.course, course?.name ?? "", "plan", "study", "focus", "dean"].join(" "),
    });
  });

  for (const work of allWork(hub)) {
    const course = hub.courseByCode[work.courseCode];
    hits.push({
      id: work.gradeId,
      kind: "Assignment",
      title: work.title,
      detail: `${work.courseCode} · ${work.kind} · ${work.dueLabel}`,
      href: `/assignments/${work.id}`,
      color: course?.color ?? "neutral",
      haystack: [work.title, work.courseCode, course?.name ?? "", work.kind, work.category, work.prompt, work.feedback ?? "", work.dueLabel].join(" "),
    });
  }

  for (const post of hub.announcements) {
    const course = hub.courseByCode[post.course];
    hits.push({
      id: post.id,
      kind: "Announcement",
      title: post.title,
      detail: `${post.course} · ${post.author} · ${post.date}`,
      href: `/announcements/${post.id}`,
      color: course?.color ?? "neutral",
      haystack: [post.title, post.body, post.author, post.course, course?.name ?? "", announcementMore[post.id] ?? ""].join(" "),
    });
  }

  for (const mod of hub.modules) {
    const course = hub.courseByCode[mod.course];
    for (const item of mod.items) {
      const copy = moduleCopy[item.id];
      hits.push({
        id: item.id,
        kind: "Module",
        title: item.title,
        detail: `${mod.course} · ${mod.weekLabel} · ${item.kind}`,
        href: `/courses/${course?.slug ?? ""}/items/${item.id}`,
        color: course?.color ?? "neutral",
        haystack: [item.title, item.kind, mod.title, mod.weekLabel, mod.course, course?.name ?? "", copy?.body ?? "", copy?.takeaway ?? ""].join(" "),
      });
    }
  }

  for (const quest of hub.quests) {
    const extra = questCopy[quest.title];
    hits.push({
      id: questAnchor(quest.title),
      kind: "Quest",
      title: quest.title,
      detail: `${quest.progress} / ${quest.goal} · +${quest.xp} XP`,
      href: `/quests#${questAnchor(quest.title)}`,
      color: quest.color,
      haystack: [quest.title, extra?.detail ?? "", "quest", "chest"].join(" "),
    });
  }

  hits.push({
    id: "profile",
    kind: "You",
    title: `${hub.student.firstName} ${hub.student.lastName}`,
    detail: `${hub.student.year} · ${hub.student.major}`,
    href: "/profile",
    color: "violet",
    haystack: [hub.student.firstName, hub.student.lastName, hub.student.email, hub.student.major, hub.student.year, hub.student.advisor, hub.student.studentId, "profile"].join(" "),
  });
  hits.push({
    id: "settings",
    kind: "You",
    title: "Settings",
    detail: "Notifications, focus length, calendar export",
    href: "/settings",
    color: "neutral",
    haystack: "settings notifications focus canvas calendar export pomodoro xp",
  });
  const notes = inboxFor(hub);
  hits.push({
    id: "inbox",
    kind: "You",
    title: "Notifications",
    detail: `${notes.length} notes in the inbox`,
    href: "/notifications",
    color: "coral",
    haystack: "notifications inbox alerts bell",
  });

  return hits;
}

export function searchHub(hub: HubSnapshot, query: string): HubHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  let index = searchCache.get(hub);
  if (!index) {
    index = buildIndex(hub);
    searchCache.set(hub, index);
  }
  return index.filter((hit) => `${hit.title} ${hit.detail} ${hit.kind} ${hit.haystack}`.toLowerCase().includes(q));
}

export function groupHits(hits: HubHit[]) {
  return hubKindOrder
    .map((kind) => ({ kind, hits: hits.filter((hit) => hit.kind === kind) }))
    .filter((group) => group.hits.length > 0);
}

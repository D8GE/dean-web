import {
  announcements,
  courseByCode,
  courseBySlug,
  courses,
  deansPlan,
  gradeItems,
  meetings,
  modules,
  notifications,
  quests,
  student,
  upcoming,
  type CourseColor,
  type GradeItem,
} from "./demo-data";
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
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function fallbackPrompt(item: GradeItem) {
  if (item.earned === null) {
    return `${item.title} is still open. It's on this week's list for ${item.course}.`;
  }
  return `Posted ${item.date} under ${item.category}. Worth ${item.possible} points.`;
}

export function allWork(): WorkRecord[] {
  return gradeItems.map((item) => {
    const up = item.upcomingId ? upcoming.find((entry) => entry.id === item.upcomingId) : undefined;
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
    };
  });
}

export function workById(id: string) {
  return allWork().find((work) => work.id === id || work.gradeId === id) ?? null;
}

export function openWork() {
  return allWork()
    .filter((work) => work.earned === null)
    .sort((a, b) => a.dueDay - b.dueDay || a.order - b.order);
}

export function postedWork() {
  return allWork()
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

export const inbox: InboxNote[] = [
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

export function modulePage(slug: string, itemId: string): ModulePage | null {
  const course = courseBySlug[slug];
  if (!course) return null;
  const mod = modules.find((entry) => entry.course === course.code && entry.items.some((item) => item.id === itemId));
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
    workId: moduleWorkLinks[itemId] ?? null,
  };
}

export function moduleItemParams() {
  const params: { slug: string; itemId: string }[] = [];
  for (const mod of modules) {
    const course = courseByCode[mod.course];
    if (!course) continue;
    for (const item of mod.items) params.push({ slug: course.slug, itemId: item.id });
  }
  return params;
}

export function announcementExtra(id: string) {
  return announcementMore[id] ?? null;
}

export function announcementAssignment(id: string) {
  return announcementWork[id] ?? null;
}

function buildIndex(): HubHit[] {
  const hits: HubHit[] = [];

  for (const course of courses) {
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

  for (const meeting of meetings) {
    const course = courseByCode[meeting.course];
    hits.push({
      id: `class-${meeting.id}`,
      kind: "Class",
      title: course?.name ?? meeting.course,
      detail: `${DAY_NAMES[meeting.day]} · ${formatRange(meeting.startMin, meeting.endMin)} · ${meeting.where}`,
      href: `/schedule?event=class-${meeting.id}`,
      color: course?.color ?? "neutral",
      haystack: [meeting.course, course?.name ?? "", course?.professor ?? "", meeting.where, DAY_NAMES[meeting.day], "class"].join(" "),
    });
  }

  deansPlan.forEach((block, index) => {
    const course = block.course ? courseByCode[block.course] : null;
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

  for (const work of allWork()) {
    const course = courseByCode[work.courseCode];
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

  for (const post of announcements) {
    const course = courseByCode[post.course];
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

  for (const mod of modules) {
    const course = courseByCode[mod.course];
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

  for (const quest of quests) {
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
    title: `${student.firstName} ${student.lastName}`,
    detail: `${student.year} · ${student.major}`,
    href: "/profile",
    color: "violet",
    haystack: [student.firstName, student.lastName, student.email, student.major, student.year, student.advisor, student.studentId, "profile"].join(" "),
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
  hits.push({
    id: "inbox",
    kind: "You",
    title: "Notifications",
    detail: `${inbox.length} notes in the inbox`,
    href: "/notifications",
    color: "coral",
    haystack: "notifications inbox alerts bell",
  });

  return hits;
}

const hubIndex = buildIndex();

export function searchHub(query: string): HubHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return hubIndex.filter((hit) => `${hit.title} ${hit.detail} ${hit.kind} ${hit.haystack}`.toLowerCase().includes(q));
}

export function groupHits(hits: HubHit[]) {
  return hubKindOrder
    .map((kind) => ({ kind, hits: hits.filter((hit) => hit.kind === kind) }))
    .filter((group) => group.hits.length > 0);
}

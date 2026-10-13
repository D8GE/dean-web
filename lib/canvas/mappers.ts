import type { HubSnapshot } from "../hub";
import {
  badges,
  focusLengths,
  quests,
  settingToggles,
  student,
  weekActivity,
  type Assignment,
  type ClassSession,
  type Course,
  type CourseColor,
  type CourseModule,
  type GradeCategory,
  type GradeItem,
  type Meeting,
  type ModuleItem,
  type Notification,
  type StudyBlock,
  type SubmissionStatus,
} from "../demo-data";
import { letterFor } from "../grades";
import { formatClock, formatRange, formatShortStart } from "../schedule";
import type {
  CanvasAnnouncement,
  CanvasAssignment,
  CanvasAssignmentGroup,
  CanvasBundle,
  CanvasCalendarEvent,
  CanvasCourse,
  CanvasModule,
  CanvasPlannerItem,
  CanvasSubmission,
} from "./types";
import {
  addDays,
  buildSchoolWeeks,
  daysBetween,
  orderStamp,
  termWeekNumber,
  zonedStamp,
  type ZonedStamp,
} from "./time";

const COLORS: CourseColor[] = ["violet", "mint", "sun", "coral", "sky", "pink"];
const LETTERS = new Set(["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]);
const GRADE_POINTS: Record<string, number> = {
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  D: 1,
  F: 0,
};
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WORK_TYPES = new Set(["assignment", "quiz", "discussion_topic", "planner_note"]);

export function plainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const boundary = sliced.replace(/\s+\S*$/, "");
  return `${boundary.length > 40 ? boundary : sliced}…`;
}

function safeZone(zone: string | null | undefined): string {
  const name = zone?.trim() || "UTC";
  try {
    Intl.DateTimeFormat("en-US", { timeZone: name });
    return name;
  } catch {
    return "UTC";
  }
}

function slugify(code: string, id: number, used: Set<string>): string {
  let base = code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!base) base = `course-${id}`;
  if (used.has(base)) base = `${base}-${id}`;
  used.add(base);
  return base;
}

function uniqueCode(code: string, id: number, used: Set<string>): string {
  const base = code.trim() || `Course ${id}`;
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const next = `${base} · ${id}`;
  used.add(next);
  return next;
}

function isActiveCourse(course: CanvasCourse): boolean {
  if (course.workflow_state && course.workflow_state !== "available") return false;
  if (course.access_restricted_by_date) return false;
  return true;
}

function kindFor(name: string, submissionTypes: string[] | null | undefined, plannableType?: string | null): Assignment["kind"] {
  const types = submissionTypes ?? [];
  const label = name.toLowerCase();
  if (types.includes("online_quiz") || plannableType === "quiz" || label.includes("quiz")) return "Quiz";
  if (types.includes("discussion_topic") || plannableType === "discussion_topic" || label.includes("discussion")) {
    return "Discussion";
  }
  if (label.includes("essay") || label.includes("paper") || label.includes("draft")) return "Essay";
  if (label.includes("read")) return "Reading";
  if (label.includes("lab") || label.includes("project")) return "Project";
  if (label.includes("problem") || label.includes("homework") || label.includes("set")) return "Problem set";
  return "Project";
}

function xpFor(points: number | null | undefined): number {
  if (!points || points <= 0) return 40;
  return Math.max(20, Math.min(150, Math.round(points)));
}

function normalizeLetter(grade: string | null | undefined, percent: number | null): string {
  const cleaned = grade?.trim();
  if (cleaned && LETTERS.has(cleaned)) return cleaned;
  if (percent == null) return "—";
  return letterFor(percent);
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function submissionStatus(submission: CanvasSubmission | null | undefined): SubmissionStatus {
  if (!submission) return "unsubmitted";
  if (submission.missing) return "missing";
  if (submission.late) return "late";
  if (submission.excused || submission.submitted_at || submission.workflow_state === "graded" || submission.workflow_state === "submitted") {
    return "submitted";
  }
  return "unsubmitted";
}

function earnedPoints(submission: CanvasSubmission | null | undefined, possible: number): number | null {
  if (!submission) return null;
  if (submission.excused) return possible;
  const graded =
    typeof submission.score === "number" &&
    (submission.workflow_state === "graded" || Boolean(submission.posted_at));
  if (graded) return submission.score as number;
  if (submission.missing) return 0;
  return null;
}

function latestComment(submission: CanvasSubmission | null | undefined): string | undefined {
  const comments = submission?.submission_comments ?? [];
  const text = [...comments]
    .reverse()
    .map((comment) => plainText(comment.comment ?? ""))
    .find((comment) => comment.length > 0);
  return text ? clip(text, 280) : undefined;
}

function gpaFor(list: Course[]): number {
  let points = 0;
  let credits = 0;
  for (const course of list) {
    const value = GRADE_POINTS[course.letter];
    if (value == null || !course.credits) continue;
    points += value * course.credits;
    credits += course.credits;
  }
  if (!credits) return 0;
  return Math.round((points / credits) * 100) / 100;
}

function splitName(profile: CanvasBundle["profile"]): { firstName: string; lastName: string; initials: string } {
  const sortable = profile.sortable_name?.trim();
  if (sortable?.includes(",")) {
    const [last, rest] = sortable.split(",");
    const first = rest.trim().split(/\s+/)[0] || "Student";
    const lastName = last.trim();
    return { firstName: first, lastName, initials: `${first[0] ?? "S"}${lastName[0] ?? ""}`.toUpperCase() };
  }
  const parts = (profile.short_name || profile.name || "Student").trim().split(/\s+/);
  const firstName = parts[0] || "Student";
  const lastName = parts.slice(1).join(" ");
  return {
    firstName,
    lastName,
    initials: `${firstName[0] ?? "S"}${lastName[0] ?? ""}`.toUpperCase(),
  };
}

function datedIn(isoTime: string | null | undefined, timeZone: string): ZonedStamp | null {
  if (!isoTime) return null;
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return null;
  return zonedStamp(date, timeZone);
}

function duePhrase(due: ZonedStamp, today: ZonedStamp): { due: string; urgency: Assignment["urgency"]; dueDay: number } {
  const delta = daysBetween(today.iso, due.iso);
  const weekEnd = addDays(mondayOfIso(today.iso), 6);
  const weekStart = mondayOfIso(today.iso);
  const inCurrentWeek = due.iso >= weekStart && due.iso <= weekEnd;
  let label: string;
  let urgency: Assignment["urgency"];
  if (delta < 0) {
    label = `${due.monthLabel} ${due.day}`;
    urgency = "today";
  } else if (delta === 0) {
    label = `Today · ${due.clock}`;
    urgency = "today";
  } else if (delta === 1) {
    label = `Tomorrow · ${due.clock}`;
    urgency = "soon";
  } else if (delta < 7) {
    label = `${due.weekday} · ${due.clock}`;
    urgency = delta <= 2 ? "soon" : "later";
  } else {
    label = `${due.monthLabel} ${due.day} · ${due.clock}`;
    urgency = "later";
  }
  return { due: label, urgency, dueDay: inCurrentWeek ? due.dow : -1 };
}

function mondayOfIso(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const dow = (js + 6) % 7;
  return addDays(iso, -dow);
}

function moduleLabels(name: string, position: number): { weekLabel: string; title: string } {
  const match = name.match(/^week\s*(\d+)\s*[:\-–—]?\s*(.*)$/i);
  if (match) return { weekLabel: `Week ${match[1]}`, title: match[2]?.trim() || name };
  return { weekLabel: `Module ${position}`, title: name };
}

function moduleKind(type: string | null | undefined, title: string): ModuleItem["kind"] {
  const name = title.toLowerCase();
  if (type === "Quiz" || name.includes("quiz")) return "Quiz";
  if (type === "File" || name.includes("read")) return "Reading";
  if (type === "ExternalUrl" || type === "ExternalTool" || name.includes("video") || name.includes("lecture")) {
    return name.includes("video") ? "Video" : "Lecture";
  }
  if (name.includes("lecture")) return "Lecture";
  if (name.includes("video")) return "Video";
  return "Page";
}

function plannerStatus(item: CanvasPlannerItem): SubmissionStatus {
  const sub = item.submissions;
  if (!sub || typeof sub !== "object") return "unsubmitted";
  if (sub.missing) return "missing";
  if (sub.late) return "late";
  if (sub.submitted || sub.graded) return "submitted";
  return "unsubmitted";
}

function categoriesFor(
  code: string,
  course: CanvasCourse,
  groups: CanvasAssignmentGroup[],
  assignments: CanvasAssignment[],
): GradeCategory[] {
  const published = assignments.filter((item) => item.published !== false && !item.omit_from_final_grade);
  const scored = published.filter((item) => item.grading_type !== "not_graded");
  const useWeights = Boolean(course.apply_assignment_group_weights) && groups.some((group) => (group.group_weight ?? 0) > 0);
  const totalPoints = scored.reduce((sum, item) => sum + (item.points_possible ?? 0), 0);
  const sorted = [...groups].filter((group) => group.name).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  if (!sorted.length) return [{ course: code, name: "Assignments", weight: 100 }];
  return sorted.map((group) => {
    let weight = useWeights ? group.group_weight ?? 0 : 0;
    if (!useWeights) {
      const points = scored
        .filter((item) => item.assignment_group_id === group.id)
        .reduce((sum, item) => sum + (item.points_possible ?? 0), 0);
      weight = totalPoints ? (points / totalPoints) * 100 : 0;
    }
    return { course: code, name: group.name ?? "Assignments", weight: Math.round(weight * 100) / 100 };
  });
}

type BuiltCourse = {
  course: Course;
  categories: GradeCategory[];
  items: GradeItem[];
  modules: CourseModule[];
};

function buildCourse(
  raw: CanvasCourse,
  code: string,
  slug: string,
  color: CourseColor,
  groups: CanvasAssignmentGroup[],
  assignments: CanvasAssignment[],
  modules: CanvasModule[],
  timeZone: string,
  today: ZonedStamp,
): BuiltCourse {
  const categories = categoriesFor(code, raw, groups, assignments);
  const categoryName = new Map(groups.map((group) => [group.id, group.name || "Assignments"]));
  const fallbackCategory = categories[0]?.name ?? "Assignments";
  const items: GradeItem[] = [];
  for (const assignment of assignments) {
    if (assignment.published === false || assignment.omit_from_final_grade || assignment.grading_type === "not_graded") continue;
    const possible = assignment.points_possible ?? 0;
    const status = submissionStatus(assignment.submission);
    const earned = earnedPoints(assignment.submission, possible);
    const due = datedIn(assignment.due_at, timeZone);
    const phrase = due ? duePhrase(due, today) : null;
    const gradedAt = assignment.submission?.posted_at ? datedIn(assignment.submission.posted_at, timeZone) : null;
    const when = earned !== null ? gradedAt ?? due : due;
    items.push({
      id: `a-${assignment.id}`,
      course: code,
      title: assignment.name?.trim() || "Assignment",
      category: categoryName.get(assignment.assignment_group_id ?? -1) || fallbackCategory,
      earned,
      possible,
      date: phrase && earned === null ? phrase.due : when ? `${when.monthLabel} ${when.day}` : "—",
      order: when ? orderStamp(when.iso) : 0,
      feedback: latestComment(assignment.submission),
      status,
    });
  }

  const enrollment = raw.enrollments?.find((item) => item.type === "student") ?? raw.enrollments?.[0];
  const reported = typeof enrollment?.computed_current_score === "number" ? enrollment.computed_current_score : null;
  const grade = reported == null ? 0 : roundScore(reported);
  const letter = normalizeLetter(enrollment?.computed_current_grade, reported);
  const credits = typeof raw.credits === "number" && raw.credits > 0 ? raw.credits : 3;
  const blurbSource = plainText(raw.public_description || raw.syllabus_body || "");
  const course: Course = {
    code,
    slug,
    name: raw.name?.trim() || code,
    color,
    grade,
    letter,
    professor: raw.teachers?.[0]?.display_name?.trim() || "Instructor",
    credits,
    blurb: blurbSource ? clip(blurbSource, 180) : `${code} is active this term.`,
    office: "See Canvas",
  };

  const courseModules: CourseModule[] = [...modules]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((mod, index) => {
      const labels = moduleLabels(mod.name?.trim() || `Module ${index + 1}`, mod.position ?? index + 1);
      const moduleItems: ModuleItem[] = (mod.items ?? [])
        .filter((item) => item.type !== "SubHeader")
        .map((item) => ({
          id: `m-${item.id}`,
          title: item.title?.trim() || "Item",
          kind: moduleKind(item.type, item.title ?? ""),
          done: item.completion_requirement?.completed === true,
        }));
      return {
        id: `mod-${mod.id}`,
        course: code,
        weekLabel: labels.weekLabel,
        title: labels.title,
        items: moduleItems,
      };
    });

  return { course, categories, items, modules: courseModules };
}

type CalendarRow = {
  id: string;
  title: string;
  course: string;
  day: number;
  week: number;
  startMin: number;
  endMin: number;
  where: string;
  iso: string;
};

function calendarRows(
  events: CanvasCalendarEvent[],
  codeById: Map<number, string>,
  weeks: HubSnapshot["schoolWeeks"],
  timeZone: string,
): CalendarRow[] {
  const weekByIso = new Map<string, number>();
  for (const week of weeks) {
    for (const day of week.days) weekByIso.set(day.iso, week.week);
  }
  const rows: CalendarRow[] = [];
  for (const event of events) {
    if (event.type === "assignment") continue;
    const courseId = event.context_code?.startsWith("course_") ? Number(event.context_code.slice("course_".length)) : 0;
    const course = codeById.get(courseId) ?? "";
    let iso: string;
    let startMin: number;
    let endMin: number;
    if (event.all_day) {
      iso = event.all_day_date ?? (event.start_at ? zonedStamp(new Date(event.start_at), timeZone).iso : "");
      startMin = 8 * 60;
      endMin = 9 * 60;
    } else if (event.start_at) {
      const start = zonedStamp(new Date(event.start_at), timeZone);
      const end = event.end_at ? zonedStamp(new Date(event.end_at), timeZone) : start;
      iso = start.iso;
      startMin = start.minutes;
      endMin = end.iso === start.iso ? end.minutes : start.minutes + 60;
    } else {
      continue;
    }
    if (!iso || endMin <= startMin) continue;
    const week = weekByIso.get(iso);
    if (week == null) continue;
    rows.push({
      id: `e${event.id}`,
      title: event.title?.trim() || "Event",
      course,
      day: weeks.find((entry) => entry.week === week)?.days.find((day) => day.iso === iso)?.dow ?? 0,
      week,
      startMin,
      endMin,
      where: event.location_name?.trim() || (event.all_day ? "All day" : "Canvas"),
      iso,
    });
  }
  return rows.sort((a, b) => a.iso.localeCompare(b.iso) || a.startMin - b.startMin);
}

function todaysClasses(rows: CalendarRow[], today: ZonedStamp): ClassSession[] {
  const todayRows = rows.filter((row) => row.iso === today.iso && row.course);
  const sessions: ClassSession[] = todayRows.map((row) => ({
    course: row.course,
    start: formatShortStart(row.startMin),
    end: formatClock(row.endMin),
    where: row.where,
    status: "later",
    startMin: row.startMin,
    endMin: row.endMin,
  }));
  const nextStart = sessions.map((session) => session.startMin ?? 0).filter((start) => start > today.minutes).sort((a, b) => a - b)[0];
  return sessions.map((session) => {
    const start = session.startMin ?? 0;
    const end = session.endMin ?? start;
    let status: ClassSession["status"] = "later";
    if (end <= today.minutes) status = "done";
    else if (start <= today.minutes && end > today.minutes) status = "now";
    else if (start === nextStart) status = "next";
    return { ...session, status };
  });
}

function planFromUpcoming(items: Assignment[], nowMin: number): StudyBlock[] {
  const open = items.filter((item) => item.status !== "submitted").slice(0, 3);
  if (!open.length) {
    return [{ time: "8:00 PM", label: "Nothing due — keep the streak", course: "", minutes: 25 }];
  }
  const evening = 15 * 60 + 30;
  let cursor = nowMin < evening ? evening : Math.min(nowMin + 30, 20 * 60);
  return open.map((item) => {
    const block: StudyBlock = {
      time: formatClock(cursor),
      label: item.title,
      course: item.course,
      minutes: 45,
    };
    cursor = Math.min(cursor + 60, 22 * 60);
    return block;
  });
}

function notificationsFor(
  classes: ClassSession[],
  upcoming: Assignment[],
  coursesByCode: Record<string, Course>,
): Notification[] {
  const notes: Notification[] = [];
  const now = classes.find((session) => session.status === "now");
  if (now) {
    const course = coursesByCode[now.course];
    notes.push({
      id: "live-now",
      title: `${now.course} is happening now`,
      detail: `${course?.name ?? now.course} · ${now.where}`,
      when: "Now",
      color: course?.color ?? "sky",
      href: "/schedule",
    });
  }
  const due = upcoming.find((item) => item.status !== "submitted");
  if (due) {
    const course = coursesByCode[due.course];
    notes.push({
      id: `live-${due.id}`,
      title: due.title,
      detail: `${due.course} · ${due.due}`,
      when: due.urgency === "today" ? "Today" : "Soon",
      color: course?.color ?? "coral",
      href: course ? `/courses/${course.slug}` : "/schedule",
    });
  }
  if (!notes.length) {
    notes.push({
      id: "live-clear",
      title: "Nothing due right now",
      detail: "The planner is clear for this window.",
      when: "Today",
      color: "mint",
      href: "/schedule",
    });
  }
  return notes.slice(0, 3);
}

function officeLine(rows: CalendarRow[], code: string): string | null {
  const office = rows.find((row) => row.course === code && /office/i.test(row.title));
  if (!office) return null;
  return `${DAY_NAMES[office.day]} · ${formatRange(office.startMin, office.endMin)} · ${office.where}`;
}

export function mapCanvasBundle(bundle: CanvasBundle, now = new Date()): HubSnapshot {
  const timeZone = safeZone(bundle.profile.time_zone);
  const today = zonedStamp(now, timeZone);
  const active = bundle.courses.filter(isActiveCourse);
  const termStart = active.find((course) => course.term?.start_at)?.term?.start_at ?? null;
  const termName = active.find((course) => course.term?.name)?.term?.name?.trim() || "This term";
  const week = termWeekNumber(termStart, today.iso);
  const schoolWeeks = buildSchoolWeeks(today.iso, week);
  const usedCodes = new Set<string>();
  const usedSlugs = new Set<string>();
  const codeById = new Map<number, string>();

  const built: BuiltCourse[] = active.map((course, index) => {
    const code = uniqueCode(course.course_code || course.name || `Course ${course.id}`, course.id, usedCodes);
    const slug = slugify(code, course.id, usedSlugs);
    codeById.set(course.id, code);
    return buildCourse(
      course,
      code,
      slug,
      COLORS[index % COLORS.length],
      bundle.groupsByCourse[String(course.id)] ?? [],
      bundle.assignmentsByCourse[String(course.id)] ?? [],
      bundle.modulesByCourse[String(course.id)] ?? [],
      timeZone,
      today,
    );
  });

  const courses = built.map((entry) => entry.course);
  const courseByCode = Object.fromEntries(courses.map((course) => [course.code, course]));
  const courseBySlug = Object.fromEntries(courses.map((course) => [course.slug, course]));
  const assignmentsByCode = new Map<string, CanvasAssignment[]>();
  for (const course of active) {
    const code = codeById.get(course.id);
    if (!code) continue;
    assignmentsByCode.set(code, bundle.assignmentsByCourse[String(course.id)] ?? []);
  }

  const upcoming = collectUpcoming(bundle, codeById, assignmentsByCode, timeZone, today);
  const events = calendarRows(bundle.calendarEvents, codeById, schoolWeeks, timeZone);
  for (const course of courses) {
    const line = officeLine(events, course.code);
    if (line) course.office = line;
  }
  const classes = todaysClasses(events, today);
  const meetings: Meeting[] = events.map((event) => ({
    id: event.id,
    course: event.course,
    day: event.day,
    startMin: event.startMin,
    endMin: event.endMin,
    where: event.where,
    week: event.week,
    title: event.title,
  }));

  const codeByContext = new Map<string, string>();
  for (const course of active) {
    const code = codeById.get(course.id);
    if (code) codeByContext.set(`course_${course.id}`, code);
  }
  const announcements = [...bundle.announcements]
    .map((post) => announcementFrom(post, codeByContext, timeZone))
    .filter((post): post is NonNullable<ReturnType<typeof announcementFrom>> => post !== null)
    .sort((a, b) => b.sort - a.sort)
    .map((post) => {
      const { sort, ...rest } = post;
      void sort;
      return rest;
    });

  const names = splitName(bundle.profile);
  const { done, total } = countWeek(bundle, codeById, timeZone, today);
  const semester = {
    season: termName,
    week,
    today: today.todayLabel,
    todayMinutes: today.minutes,
    todayDow: today.dow,
  };

  return {
    source: "live",
    sourceNote: "Reading Canvas",
    timeZone,
    student: {
      ...student,
      firstName: names.firstName,
      lastName: names.lastName,
      initials: names.initials,
      email: bundle.profile.primary_email || bundle.profile.login_id || student.email,
      studentId: bundle.profile.sis_user_id || String(bundle.profile.id),
      major: "—",
      year: "—",
      advisor: "—",
      gpa: gpaFor(courses),
      weekDone: done,
      weekTotal: total,
    },
    semester,
    courses,
    courseByCode,
    courseBySlug,
    todaysClasses: classes,
    upcoming,
    deansPlan: planFromUpcoming(upcoming, today.minutes),
    quests,
    badges,
    weekActivity,
    meetings,
    schoolWeeks,
    gradeCategories: built.flatMap((entry) => entry.categories),
    gradeItems: built.flatMap((entry) => entry.items),
    announcements,
    modules: built.flatMap((entry) => entry.modules),
    notifications: notificationsFor(classes, upcoming, courseByCode),
    settingToggles,
    focusLengths,
  };
}

type SortedAssignment = Assignment & { sort: number };

function collectUpcoming(
  bundle: CanvasBundle,
  codeById: Map<number, string>,
  assignmentsByCode: Map<string, CanvasAssignment[]>,
  timeZone: string,
  today: ZonedStamp,
): Assignment[] {
  const rows: SortedAssignment[] = [];
  const seen = new Set<string>();
  const push = (row: SortedAssignment) => {
    if (seen.has(row.id)) return;
    seen.add(row.id);
    rows.push(row);
  };

  const fromPlanner = bundle.planner;
  if (fromPlanner) {
    for (const item of fromPlanner) {
      const type = item.plannable_type ?? "assignment";
      if (!WORK_TYPES.has(type)) continue;
      const status = plannerStatus(item);
      if (status === "submitted") continue;
      const code = codeById.get(item.course_id ?? -1);
      if (!code) continue;
      const when = datedIn(item.plannable?.due_at || item.plannable_date, timeZone);
      if (!when) continue;
      const phrase = duePhrase(when, today);
      const title = item.plannable?.title?.trim() || "To do";
      const points = item.plannable?.points_possible ?? null;
      push({
        id: `p-${type}-${item.plannable_id ?? title}`,
        title,
        course: code,
        due: phrase.due,
        dueDay: phrase.dueDay,
        urgency: phrase.urgency,
        xp: xpFor(points),
        kind: kindFor(title, null, type),
        points,
        status,
        sort: orderStamp(when.iso) * 10000 + when.minutes,
      });
    }
  } else {
    for (const [code, assignments] of assignmentsByCode) {
      for (const assignment of assignments) {
        if (assignment.published === false) continue;
        const status = submissionStatus(assignment.submission);
        if (status === "submitted") continue;
        const when = datedIn(assignment.due_at, timeZone);
        if (!when || daysBetween(today.iso, when.iso) < -14) continue;
        const phrase = duePhrase(when, today);
        const title = assignment.name?.trim() || "Assignment";
        push({
          id: `a-${assignment.id}`,
          title,
          course: code,
          due: phrase.due,
          dueDay: phrase.dueDay,
          urgency: phrase.urgency,
          xp: xpFor(assignment.points_possible),
          kind: kindFor(title, assignment.submission_types),
          points: assignment.points_possible ?? null,
          status,
          sort: orderStamp(when.iso) * 10000 + when.minutes,
        });
      }
    }
  }

  return rows
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 8)
    .map((row) => {
      const { sort, ...rest } = row;
      void sort;
      return rest;
    });
}

function announcementFrom(
  post: CanvasAnnouncement,
  codeByContext: Map<string, string>,
  timeZone: string,
): (HubSnapshot["announcements"][number] & { sort: number }) | null {
  const course = codeByContext.get(post.context_code ?? "");
  if (!course) return null;
  const when = post.posted_at ? datedIn(post.posted_at, timeZone) : null;
  const body = clip(plainText(post.message ?? ""), 1200);
  return {
    id: `n-${post.id}`,
    course,
    title: post.title?.trim() || "Announcement",
    body: body || "No message.",
    date: when ? `${when.monthLabel} ${when.day}` : "—",
    author: post.author?.display_name?.trim() || "Instructor",
    sort: when ? orderStamp(when.iso) : 0,
  };
}

function countWeek(bundle: CanvasBundle, codeById: Map<number, string>, timeZone: string, today: ZonedStamp): { done: number; total: number } {
  const start = mondayOfIso(today.iso);
  const end = addDays(start, 6);
  const items = bundle.planner ?? [];
  let done = 0;
  let total = 0;
  for (const item of items) {
    if (!WORK_TYPES.has(item.plannable_type ?? "")) continue;
    if (!codeById.has(item.course_id ?? -1)) continue;
    const when = datedIn(item.plannable?.due_at || item.plannable_date, timeZone);
    if (!when || when.iso < start || when.iso > end) continue;
    total += 1;
    const status = plannerStatus(item);
    if (status === "submitted") done += 1;
  }
  return { done, total };
}

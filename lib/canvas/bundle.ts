import { canvasPageUrl, sameOriginHttpUrl } from "./link";
import { addDays, buildSchoolWeeks, termWeekNumber, zonedStamp } from "./time";
import { canvasGet, canvasGetAll, type CanvasConfig } from "./http";
import type {
  CanvasAnnouncement,
  CanvasAssignment,
  CanvasAssignmentGroup,
  CanvasBundle,
  CanvasCalendarEvent,
  CanvasCourse,
  CanvasModule,
  CanvasPlannerItem,
  CanvasProfile,
} from "./types";

async function soft<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "request failed";
    console.error(`[canvas] ${label}: ${message}`);
    return fallback;
  }
}

async function mapPool<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await run(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

function activeCourses(courses: CanvasCourse[]): CanvasCourse[] {
  return courses.filter((course) => {
    if (course.workflow_state && course.workflow_state !== "available") return false;
    if (course.access_restricted_by_date) return false;
    return true;
  });
}

export async function fetchCanvasBundle(
  config: CanvasConfig,
  fetchImpl: typeof fetch = fetch,
  now = new Date(),
): Promise<CanvasBundle> {
  const [profile, courses] = await Promise.all([
    canvasGet<CanvasProfile>(config, "/api/v1/users/self/profile", fetchImpl),
    canvasGetAll<CanvasCourse>(
      config,
      "/api/v1/courses?enrollment_state=active&enrollment_type=student&state[]=available&include[]=term&include[]=teachers&include[]=total_scores&include[]=syllabus_body&include[]=public_description&per_page=50",
      fetchImpl,
    ),
  ]);

  const active = activeCourses(courses);
  const context = active.map((course) => `context_codes[]=${encodeURIComponent(`course_${course.id}`)}`).join("&");
  const zone = profile.time_zone?.trim() || "UTC";
  let stamp;
  try {
    stamp = zonedStamp(now, zone);
  } catch {
    stamp = zonedStamp(now, "UTC");
  }
  const termStart = active.find((course) => course.term?.start_at)?.term?.start_at ?? null;
  const weeks = buildSchoolWeeks(stamp.iso, termWeekNumber(termStart, stamp.iso));
  const start = weeks[0]?.days[0]?.iso ?? stamp.iso;
  const end = weeks[weeks.length - 1]?.days[6]?.iso ?? stamp.iso;
  const calendarQuery = [context, `context_codes[]=${encodeURIComponent(`user_${profile.id}`)}`].filter(Boolean).join("&");

  const [announcements, planner, calendarEvents, details] = await Promise.all([
    context
      ? soft("announcements", () => canvasGetAll<CanvasAnnouncement>(config, `/api/v1/announcements?${context}&per_page=30`, fetchImpl), [])
      : Promise.resolve([] as CanvasAnnouncement[]),
    soft<CanvasPlannerItem[] | null>(
      "planner",
      () => canvasGetAll<CanvasPlannerItem>(config, `/api/v1/planner/items?start_date=${start}&end_date=${addDays(stamp.iso, 21)}&per_page=50`, fetchImpl),
      null,
    ),
    soft(
      "calendar",
      () =>
        canvasGetAll<CanvasCalendarEvent>(
          config,
          `/api/v1/calendar_events?type=event&start_date=${start}&end_date=${end}&per_page=50&${calendarQuery}`,
          fetchImpl,
        ),
      [],
    ),
    mapPool(active, 4, async (course) => {
      const [assignments, groups, modules] = await Promise.all([
        canvasGetAll<CanvasAssignment>(
          config,
          `/api/v1/courses/${course.id}/assignments?include[]=submission&include[]=submission_comments&per_page=100`,
          fetchImpl,
        ),
        canvasGetAll<CanvasAssignmentGroup>(config, `/api/v1/courses/${course.id}/assignment_groups?per_page=50`, fetchImpl),
        soft(
          `modules ${course.id}`,
          () => canvasGetAll<CanvasModule>(config, `/api/v1/courses/${course.id}/modules?include[]=items&per_page=50`, fetchImpl),
          [],
        ),
      ]);
      return { id: String(course.id), assignments, groups, modules };
    }),
  ]);

  const assignmentsByCourse: CanvasBundle["assignmentsByCourse"] = {};
  const groupsByCourse: CanvasBundle["groupsByCourse"] = {};
  const modulesByCourse: CanvasBundle["modulesByCourse"] = {};
  for (const detail of details) {
    assignmentsByCourse[detail.id] = detail.assignments;
    groupsByCourse[detail.id] = detail.groups;
    modulesByCourse[detail.id] = detail.modules;
  }

  for (const course of courses) {
    course.html_url = canvasPageUrl(config.baseUrl, `/courses/${course.id}`, course.html_url);
  }
  for (const [id, assignments] of Object.entries(assignmentsByCourse)) {
    for (const assignment of assignments) {
      assignment.html_url = canvasPageUrl(
        config.baseUrl,
        `/courses/${id}/assignments/${assignment.id}`,
        assignment.html_url,
      );
    }
  }
  if (planner) {
    for (const item of planner) item.html_url = sameOriginHttpUrl(config.baseUrl, item.html_url);
  }

  return {
    profile,
    courses,
    assignmentsByCourse,
    groupsByCourse,
    modulesByCourse,
    announcements,
    planner,
    calendarEvents,
  };
}

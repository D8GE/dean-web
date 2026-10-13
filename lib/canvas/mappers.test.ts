import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runningPercent } from "../grades";
import { mapCanvasBundle, plainText, submissionStatus } from "./mappers";
import type { CanvasBundle } from "./types";

const NOW = new Date("2026-10-13T15:24:00.000Z");
const bundle = JSON.parse(readFileSync(new URL("./fixtures/bundle.json", import.meta.url), "utf8")) as CanvasBundle;

describe("mapCanvasBundle", () => {
  const hub = mapCanvasBundle(bundle, NOW);

  it("keeps active courses and the reported grade", () => {
    expect(hub.source).toBe("live");
    expect(hub.courses.map((course) => course.code)).toEqual(["CS 101", "HIST 210"]);
    expect(hub.courseBySlug["cs-101"]?.color).toBe("violet");
    expect(hub.courseByCode["CS 101"]).toMatchObject({
      name: "Intro to Programming",
      professor: "Prof. Lindqvist",
      grade: 91.5,
      letter: "A-",
      credits: 3,
      blurb: "Python from variables through loops.",
      office: "Fri · 10:00–11:00 AM · Green Hall 1855",
    });
    expect(hub.courseByCode["HIST 210"]).toMatchObject({
      grade: 88,
      letter: "B+",
      color: "mint",
      blurb: "Primary sources and short essays.",
    });
    expect(hub.student).toMatchObject({
      firstName: "Jacob",
      lastName: "Serrano",
      initials: "JS",
      email: "jacob.serrano@students.edu",
      studentId: "00058241",
      gpa: 3.5,
      weekDone: 1,
      weekTotal: 4,
    });
    expect(hub.semester).toMatchObject({
      season: "Fall 2026",
      week: 8,
      today: "Tuesday, October 13",
      todayDow: 1,
      todayMinutes: 11 * 60 + 24,
    });
    expect(hub.schoolWeeks.map((week) => week.week)).toEqual([6, 7, 8, 9, 10]);
    expect(hub.schoolWeeks.find((week) => week.week === 8)?.range).toBe("Oct 12 – 18");
    expect(JSON.stringify(hub)).not.toContain("token");
  });

  it("maps scores, missing work, and real assignment-group weights", () => {
    const exams = hub.gradeCategories.find((category) => category.course === "CS 101" && category.name === "Exams");
    const homework = hub.gradeCategories.find((category) => category.course === "CS 101" && category.name === "Homework");
    expect(exams?.weight).toBe(40);
    expect(homework?.weight).toBe(60);

    const histEssays = hub.gradeCategories.find((category) => category.course === "HIST 210" && category.name === "Essays");
    const histExams = hub.gradeCategories.find((category) => category.course === "HIST 210" && category.name === "Exams");
    expect(histEssays?.weight).toBe(40);
    expect(histExams?.weight).toBe(60);

    const exam = hub.gradeItems.find((item) => item.id === "a-501");
    expect(exam).toMatchObject({ earned: 90, possible: 100, status: "submitted", date: "Oct 2", feedback: "Algebra was clean." });
    const missing = hub.gradeItems.find((item) => item.id === "a-502");
    expect(missing).toMatchObject({ earned: 0, status: "missing" });
    const open = hub.gradeItems.find((item) => item.id === "a-503");
    expect(open).toMatchObject({ earned: null, status: "unsubmitted", date: "Tomorrow · 11:59 PM" });
    expect(hub.gradeItems.some((item) => item.title === "Secret draft")).toBe(false);

    const book = { gradeCategories: hub.gradeCategories, gradeItems: hub.gradeItems, courseByCode: hub.courseByCode };
    expect(runningPercent("CS 101", book)).toBe(36);
    expect(runningPercent("CS 101", book, { id: "a-503", earned: 100 })).toBe(66);
    expect(runningPercent("HIST 210", book)).toBe(75);
  });

  it("maps planner items, calendar events, announcements, and modules", () => {
    expect(hub.upcoming.map((item) => [item.title, item.status, item.due])).toEqual([
      ["Lab redo", "late", "Today · 10:00 AM"],
      ["Problem set 2", "unsubmitted", "Tomorrow · 11:59 PM"],
      ["Chapter quiz", "unsubmitted", "Thu · 11:59 PM"],
    ]);
    expect(hub.upcoming.find((item) => item.title === "Problem set 2")).toMatchObject({
      course: "CS 101",
      points: 100,
      kind: "Problem set",
      dueDay: 2,
    });
    expect(hub.upcoming.find((item) => item.title === "Chapter quiz")?.kind).toBe("Quiz");
    expect(hub.upcoming.some((item) => item.title === "Exam 1" || item.title === "Ignore me" || item.title === "Reading notes")).toBe(false);

    expect(hub.todaysClasses.map((session) => [session.course, session.start, session.status, session.where])).toEqual([
      ["CS 101", "10:00", "done", "Green Hall 1840"],
      ["CS 101", "11:00", "now", "Science Hall 204"],
    ]);

    const lecture = hub.meetings.find((meeting) => meeting.id === "e1");
    expect(lecture).toMatchObject({ course: "CS 101", day: 1, week: 8, startMin: 11 * 60, endMin: 12 * 60 + 15 });
    const fair = hub.meetings.find((meeting) => meeting.title === "Career fair");
    expect(fair).toMatchObject({ course: "", day: 5, week: 8, startMin: 8 * 60, endMin: 9 * 60 });
    expect(hub.meetings.some((meeting) => meeting.title === "Exam 1")).toBe(false);

    expect(hub.announcements).toEqual([
      {
        id: "n-42",
        course: "CS 101",
        title: "Lab 5 spec is posted",
        body: "Loops and lists, due Thursday.",
        date: "Oct 12",
        author: "Prof. Lindqvist",
      },
    ]);

    expect(hub.modules).toEqual([
      {
        id: "mod-80",
        course: "CS 101",
        weekLabel: "Week 8",
        title: "Loops & lists",
        items: [
          { id: "m-1", title: "Lecture · for and while", kind: "Lecture", done: true },
          { id: "m-2", title: "Lab 5 starter", kind: "Page", done: false },
        ],
      },
    ]);
  });

  it("derives upcoming work from assignments when the planner request failed", () => {
    const derived = mapCanvasBundle({ ...bundle, planner: null }, NOW);
    expect(derived.upcoming.map((item) => item.title)).toEqual(["Problem set 1", "Lab redo", "Problem set 2", "Midterm"]);
    expect(derived.upcoming.find((item) => item.title === "Problem set 1")?.status).toBe("missing");
    expect(derived.upcoming.find((item) => item.title === "Lab redo")?.status).toBe("late");
    expect(derived.upcoming.find((item) => item.title === "Midterm")?.kind).toBe("Quiz");
    expect(derived.student.weekDone).toBe(0);
    expect(derived.student.weekTotal).toBe(0);
  });
});

describe("plainText and submission status", () => {
  it("strips announcement html", () => {
    expect(plainText("<p>Hello&nbsp;&amp; welcome</p><script>nope</script>")).toBe("Hello & welcome");
  });

  it("prefers missing, then late, then submitted", () => {
    expect(submissionStatus({ missing: true, late: true, submitted_at: "2026-10-01T00:00:00Z" })).toBe("missing");
    expect(submissionStatus({ late: true, submitted_at: "2026-10-01T00:00:00Z", workflow_state: "submitted" })).toBe("late");
    expect(submissionStatus({ workflow_state: "graded", score: 10 })).toBe("submitted");
    expect(submissionStatus(null)).toBe("unsubmitted");
  });
});

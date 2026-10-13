import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapCanvasBundle } from "./canvas/mappers";
import type { CanvasBundle } from "./canvas/types";
import {
  allWork,
  announcementWorkId,
  demoSnapshot,
  inboxFor,
  modulePage,
  openWork,
  searchHub,
  workById,
} from "./hub";

const demo = demoSnapshot("test");
const bundle = JSON.parse(readFileSync(new URL("./canvas/fixtures/bundle.json", import.meta.url), "utf8")) as CanvasBundle;
const live = mapCanvasBundle(bundle, new Date("2026-10-13T15:24:00.000Z"));

describe("demo hub surfaces", () => {
  it("keeps the open work ids, prompts, and gradebook aliases", () => {
    expect(openWork(demo).map((work) => work.id)).toEqual(["a1", "a2", "a3", "a4", "a5"]);
    expect(workById(demo, "a1")?.prompt).toMatch(/Two pages/);
    expect(workById(demo, "g-a1")?.id).toBe("a1");
    expect(workById(demo, "g-m1")?.earned).toBe(78);
  });

  it("keeps module and announcement links", () => {
    expect(modulePage(demo, "engl-101", "me8d")?.workId).toBe("a1");
    expect(announcementWorkId(demo, "n-e1")).toBe("a1");
  });

  it("searches courses and keeps the extra inbox notes", () => {
    expect(searchHub(demo, "alvarez").some((hit) => hit.href === "/courses/engl-101")).toBe(true);
    expect(inboxFor(demo).map((note) => note.id)).toEqual(["n1", "n2", "n3", "n4", "n5", "n6"]);
    expect(inboxFor(demo).find((note) => note.id === "n2")?.href).toBe("/assignments/a1");
  });
});

describe("live hub surfaces", () => {
  it("opens a Canvas assignment from either the gradebook id or the planner id", () => {
    const byGrade = workById(live, "a-503");
    expect(byGrade?.title).toBe("Problem set 2");
    expect(byGrade?.courseCode).toBe("CS 101");
    expect(byGrade?.earned).toBe(null);
    expect(workById(live, byGrade?.id ?? "")?.gradeId).toBe("a-503");
    expect(allWork(live).some((work) => work.title === "Chapter quiz")).toBe(true);
  });

  it("reads announcements and module items off the snapshot", () => {
    expect(modulePage(live, "cs-101", "m-2")).toMatchObject({
      itemTitle: "Lab 5 starter",
      courseCode: "CS 101",
      weekLabel: "Week 8",
    });
    expect(searchHub(live, "Lab 5 spec").some((hit) => hit.href === "/announcements/n-42")).toBe(true);
    expect(inboxFor(live).length).toBeGreaterThan(0);
    expect(inboxFor(live).every((note) => note.href.startsWith("/"))).toBe(true);
  });
});

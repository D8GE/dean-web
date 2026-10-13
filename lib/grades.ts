import type { Course, GradeCategory, GradeItem } from "./demo-data";

export type GradeData = {
  gradeCategories: GradeCategory[];
  gradeItems: GradeItem[];
  courseByCode: Record<string, Course>;
};

/** Rounded percent, or null when there is no score or the item is worth no points. */
export function scorePercent(earned: number | null, possible: number): number | null {
  if (earned === null || !(possible > 0)) return null;
  return Math.round((earned / possible) * 100);
}

/** Turn a 0–100 pace into points on this assignment, clamped to what it is worth. */
export function pointsFromPercent(percent: number, possible: number): number {
  if (!(possible > 0)) return 0;
  const points = Math.round((percent / 100) * possible);
  return Math.min(possible, Math.max(0, points));
}

export function letterFor(pct: number): string {
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 60) return "D";
  return "F";
}

export function categoriesFor(course: string, data: GradeData) {
  return data.gradeCategories.filter((category) => category.course === course);
}

export function itemsFor(course: string, data: GradeData): GradeItem[] {
  return data.gradeItems
    .filter((item) => item.course === course)
    .sort((a, b) => {
      const aOpen = a.earned === null ? 0 : 1;
      const bOpen = b.earned === null ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return b.order - a.order;
    });
}

/** Soonest ungraded row. Demo courses have one open item, so the pick matches the old list. */
export function upcomingGradeItem(course: string, data: GradeData): GradeItem | null {
  const open = data.gradeItems.filter((item) => item.course === course && item.earned === null);
  open.sort((a, b) => a.order - b.order);
  return open[0] ?? null;
}

/** Weighted running grade. Ungraded rows are ignored unless a what-if score is supplied. */
export function runningPercent(course: string, data: GradeData, hypo?: { id: string; earned: number }): number {
  const cats = categoriesFor(course, data);
  let weighted = 0;
  let weightSum = 0;
  for (const category of cats) {
    const rows = data.gradeItems.filter(
      (item) =>
        item.course === course &&
        item.category === category.name &&
        (item.earned !== null || item.id === hypo?.id),
    );
    if (!rows.length) continue;
    let earned = 0;
    let possible = 0;
    for (const row of rows) {
      possible += row.possible;
      earned += row.id === hypo?.id ? hypo.earned : (row.earned ?? 0);
    }
    if (!possible) continue;
    weighted += (earned / possible) * category.weight;
    weightSum += category.weight;
  }
  return weightSum ? (weighted / weightSum) * 100 : 0;
}

export function categoryAverage(course: string, category: string, data: GradeData): number | null {
  const rows = data.gradeItems.filter(
    (item) => item.course === course && item.category === category && item.earned !== null,
  );
  if (!rows.length) return null;
  const earned = rows.reduce((sum, row) => sum + (row.earned ?? 0), 0);
  const possible = rows.reduce((sum, row) => sum + row.possible, 0);
  return possible ? (earned / possible) * 100 : null;
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function officialGrade(course: string, data: GradeData): number {
  return data.courseByCode[course]?.grade ?? 0;
}

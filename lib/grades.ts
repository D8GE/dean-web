import { courseByCode, gradeCategories, gradeItems, type GradeItem } from "./demo-data";

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

export function categoriesFor(course: string) {
  return gradeCategories.filter((category) => category.course === course);
}

export function itemsFor(course: string): GradeItem[] {
  return gradeItems
    .filter((item) => item.course === course)
    .sort((a, b) => {
      const aOpen = a.earned === null ? 0 : 1;
      const bOpen = b.earned === null ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return b.order - a.order;
    });
}

export function upcomingGradeItem(course: string): GradeItem | null {
  return itemsFor(course).find((item) => item.earned === null) ?? null;
}

/** Weighted running grade. Ungraded rows are ignored unless a what-if score is supplied. */
export function runningPercent(course: string, hypo?: { id: string; earned: number }): number {
  const cats = categoriesFor(course);
  let weighted = 0;
  let weightSum = 0;
  for (const category of cats) {
    const rows = gradeItems.filter(
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

export function categoryAverage(course: string, category: string): number | null {
  const rows = gradeItems.filter((item) => item.course === course && item.category === category && item.earned !== null);
  if (!rows.length) return null;
  const earned = rows.reduce((sum, row) => sum + (row.earned ?? 0), 0);
  const possible = rows.reduce((sum, row) => sum + row.possible, 0);
  return possible ? (earned / possible) * 100 : null;
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function officialGrade(course: string): number {
  return courseByCode[course]?.grade ?? 0;
}

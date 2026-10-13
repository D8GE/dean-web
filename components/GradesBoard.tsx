"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EmptyNote from "./EmptyNote";
import GradeRing from "./GradeRing";
import TopBar from "./TopBar";
import { statusLabel, type Course } from "@/lib/demo-data";
import {
  categoriesFor,
  categoryAverage,
  formatPercent,
  itemsFor,
  letterFor,
  officialGrade,
  runningPercent,
  upcomingGradeItem,
} from "@/lib/grades";
import FootNote from "./FootNote";
import { useHub } from "./HubProvider";

const SCALE = [
  ["A", "93"],
  ["A-", "90"],
  ["B+", "87"],
  ["B", "83"],
  ["B-", "80"],
  ["C+", "77"],
  ["C", "73"],
];

export default function GradesBoard({ initialSlug = null }: { initialSlug?: string | null }) {
  const hub = useHub();
  const { courses, semester, student } = hub;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>(() => courses.find((course) => course.slug === initialSlug)?.code ?? "all");
  const [status, setStatus] = useState<"all" | "graded" | "open">("all");

  const average = courses.length ? Math.round(courses.reduce((sum, course) => sum + course.grade, 0) / courses.length) : 0;
  const credits = courses.reduce((sum, course) => sum + course.credits, 0);
  const soft = [...courses].sort((a, b) => a.grade - b.grade)[0];
  const course = courses.find((item) => item.code === selected) ?? null;

  return (
    <>
      <TopBar
        eyebrow={`${semester.season} · Week ${semester.week} · ${hub.source === "live" ? "Canvas gradebook" : "demo gradebook"}`}
        title="Grades"
        query={query}
        onQuery={setQuery}
        placeholder="Search assignments…"
      />

      <div className="stats">
        <div className="stat tint-violet">
          <span className="stat-emoji">🎓</span>
          <div>
            <div className="stat-num">{student.gpa.toFixed(2)}</div>
            <div className="stat-label">semester GPA</div>
          </div>
        </div>
        <div className="stat tint-mint">
          <span className="stat-emoji">📈</span>
          <div>
            <div className="stat-num">{average}%</div>
            <div className="stat-label">{hub.source === "demo" && courses.length === 5 ? "average of these five" : "average across them"}</div>
          </div>
        </div>
        <div className="stat tint-sky">
          <span className="stat-emoji">🧾</span>
          <div>
            <div className="stat-num">{credits}</div>
            <div className="stat-label">credits in progress</div>
          </div>
        </div>
        <div className="stat tint-sun">
          <span className="stat-emoji">🎯</span>
          <div>
            <div className="stat-num">{soft?.letter ?? "—"}</div>
            <div className="stat-label">{soft ? `soft spot · ${soft.code}` : "no courses yet"}</div>
          </div>
        </div>
      </div>

      <div className="scale-row" aria-label="Letter scale">
        {SCALE.map(([letter, cut]) => (
          <span key={letter}>
            <strong>{letter}</strong> {cut}+
          </span>
        ))}
      </div>

      <div className="toolbar-line">
        <div className="chip-row">
          <button type="button" className={`chip tint-violet ${selected === "all" ? "is-on" : ""}`} aria-pressed={selected === "all"} onClick={() => setSelected("all")}>
            All courses
          </button>
          {courses.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`chip tint-${item.color} ${selected === item.code ? "is-on" : ""}`}
              aria-pressed={selected === item.code}
              onClick={() => setSelected(item.code)}
            >
              {item.code}
            </button>
          ))}
        </div>
      </div>

      {course ? (
        <CourseGrade key={course.code} course={course} query={query} status={status} onStatus={setStatus} onBack={() => setSelected("all")} />
      ) : (
        <AllCourses query={query} onOpen={setSelected} />
      )}

      <FootNote />
    </>
  );
}

function AllCourses({ query, onOpen }: { query: string; onOpen: (code: string) => void }) {
  const hub = useHub();
  const { courses, gradeItems } = hub;
  const q = query.trim().toLowerCase();
  const list = courses.filter((course) => {
    if (!q) return true;
    const items = gradeItems.filter((item) => item.course === course.code);
    return [course.code, course.name, course.professor, ...items.map((item) => item.title)].join(" ").toLowerCase().includes(q);
  });

  if (!list.length) {
    return (
      <section className="card">
        <EmptyNote emoji="🔍" title="No grades match that search." body="Try a course code or an assignment name." />
      </section>
    );
  }

  return (
    <div className="grade-stack">
      {list.map((course) => {
        const open = upcomingGradeItem(course.code, hub);
        return (
          <button key={course.code} type="button" className={`grade-card tint-${course.color}`} onClick={() => onOpen(course.code)}>
            <GradeRing value={course.grade} color={course.color} label={course.letter} />
            <div className="grade-card-body">
              <div className="grade-card-top">
                <div>
                  <div className="grade-code">{course.code}</div>
                  <div className="muted small">{course.name}</div>
                </div>
                <div className="grade-pct">{course.grade}%</div>
              </div>
              <ul className="cat-list">
                {categoriesFor(course.code, hub).map((category) => {
                  const avg = categoryAverage(course.code, category.name, hub);
                  return (
                    <li key={category.name}>
                      <div className="cat-top">
                        <span>{category.name}</span>
                        <span className="muted small">{category.weight}%</span>
                        <strong>{avg === null ? "—" : `${Math.round(avg)}%`}</strong>
                      </div>
                      <div className={`meter tint-${course.color}`}>
                        <div style={{ width: `${avg ?? 0}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {open && <p className="muted small grade-next">Still open · {open.title}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CourseGrade({
  course,
  query,
  status,
  onStatus,
  onBack,
}: {
  course: Course;
  query: string;
  status: "all" | "graded" | "open";
  onStatus: (value: "all" | "graded" | "open") => void;
  onBack: () => void;
}) {
  const hub = useHub();
  const openItem = upcomingGradeItem(course.code, hub);
  const baseline = openItem ? Math.round(categoryAverage(course.code, openItem.category, hub) ?? course.grade) : 80;
  const [score, setScore] = useState(baseline);
  const hypoItem = openItem;
  const projected = hypoItem ? runningPercent(course.code, hub, { id: hypoItem.id, earned: score }) : officialGrade(course.code, hub);
  const currentLetter = course.letter;
  const nextLetter = letterFor(projected);
  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      itemsFor(course.code, hub).filter((item) => {
        if (status === "graded" && item.earned === null) return false;
        if (status === "open" && item.earned !== null) return false;
        if (!q) return true;
        return [item.title, item.category, item.feedback ?? ""].join(" ").toLowerCase().includes(q);
      }),
    [course.code, hub, q, status],
  );

  return (
    <div className="grid">
      <section className="card span-8">
        <header className="card-head">
          <div className="plan-head">
            <GradeRing value={course.grade} color={course.color} label={course.letter} />
            <div>
              <h2>{course.code}</h2>
              <p className="muted">
                {course.name} · {course.professor}
              </p>
            </div>
          </div>
          <div className="grade-head-actions">
            <Link href={`/courses/${course.slug}`} className="btn3d btn-ghost compact">
              Course page
            </Link>
            <button type="button" className="btn3d btn-soft compact" onClick={onBack}>
              All courses
            </button>
          </div>
        </header>

        <ul className="cat-list">
          {categoriesFor(course.code, hub).map((category) => {
            const avg = categoryAverage(course.code, category.name, hub);
            return (
              <li key={category.name}>
                <div className="cat-top">
                  <span>{category.name}</span>
                  <span className="muted small">weight {category.weight}%</span>
                  <strong>{avg === null ? "—" : `${Math.round(avg)}%`}</strong>
                </div>
                <div className={`meter tint-${course.color}`}>
                  <div style={{ width: `${avg ?? 0}%` }} />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="seg seg-tight" role="tablist" aria-label="Assignment status">
          {(
            [
              ["all", "All"],
              ["graded", "Graded"],
              ["open", "Not yet"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={status === key} className={status === key ? "is-on" : ""} onClick={() => onStatus(key)}>
              {label}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyNote emoji="🗂️" title="No rows in this view." body="Clear the search or switch the filter back to All." />
        ) : (
          <ul className="work-list">
            {rows.map((item) => {
              const pct = item.earned === null ? null : Math.round((item.earned / item.possible) * 100);
              return (
                <li key={item.id}>
                  <Link href={`/assignments/${item.upcomingId ?? item.id}`} className="work-row">
                    <span className="work-name">
                      <strong>{item.title}</strong>
                      <span className="muted small">
                        {item.category} · {item.date}
                        {item.feedback ? ` · ${item.feedback}` : ""}
                      </span>
                    </span>
                    {pct === null ? (
                      <span className={`due ${item.status === "missing" || item.status === "late" ? "due-today" : "due-later"}`}>
                        {statusLabel(item.status) ?? "Upcoming"}
                      </span>
                    ) : (
                      <span className={`score tint-${course.color}`}>
                        {item.earned}/{item.possible}
                        <small>{item.status === "missing" ? "Missing" : item.status === "late" ? "Late" : letterFor(pct)}</small>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`card span-4 whatif tint-${course.color}`}>
        <header className="card-head">
          <div>
            <h2>What if</h2>
            <p className="muted">Drag a score. The letter updates live.</p>
          </div>
        </header>
        {hypoItem ? (
          <>
            <p className="whatif-name">{hypoItem.title}</p>
            <div className="whatif-score">
              <strong>{score}</strong>
              <span> / {hypoItem.possible}</span>
            </div>
            <input
              className="whatif-range"
              type="range"
              min={0}
              max={hypoItem.possible}
              value={score}
              aria-valuemin={0}
              aria-valuemax={hypoItem.possible}
              aria-valuenow={score}
              aria-label={`Hypothetical score on ${hypoItem.title}`}
              onChange={(event) => setScore(Number(event.target.value))}
            />
            <div className="whatif-ends muted small">
              <span>0</span>
              <span>{hypoItem.possible}</span>
            </div>
            <div className="whatif-result">
              <div>
                <span className="muted small">Now</span>
                <strong>
                  {course.grade}% · {currentLetter}
                </strong>
              </div>
              <div>
                <span className="muted small">If you score {score}</span>
                <strong>
                  {formatPercent(projected)}% · {nextLetter}
                </strong>
              </div>
            </div>
            <p className={`whatif-note ${nextLetter === currentLetter ? "" : projected > course.grade ? "is-up" : "is-down"}`}>
              {nextLetter === currentLetter
                ? `Letter stays ${currentLetter}.`
                : projected > course.grade
                  ? `That bumps the letter to ${nextLetter}.`
                  : `That drops the letter to ${nextLetter}.`}
            </p>
            <button type="button" className="btn3d btn-soft full" onClick={() => setScore(baseline)}>
              Reset to current pace
            </button>
          </>
        ) : (
          <EmptyNote emoji="✅" title="Nothing open to project." body="Every scored item in this class is already in." />
        )}
      </section>
    </div>
  );
}

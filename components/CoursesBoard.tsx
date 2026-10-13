"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EmptyNote from "./EmptyNote";
import GradeRing from "./GradeRing";
import TopBar from "./TopBar";
import { PinIcon } from "./Icons";
import { announcements, courses, semester, upcoming, type Course } from "@/lib/demo-data";
import { formatClock, nextMeeting, patternLines } from "@/lib/schedule";

type SortKey = "next" | "grade" | "name";

export default function CoursesBoard() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("next");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((course) => {
      if (onlyOpen && !upcoming.some((item) => item.course === course.code)) return false;
      if (!q) return true;
      return [course.code, course.name, course.professor, course.blurb].join(" ").toLowerCase().includes(q);
    });
    const rank = (course: Course) => {
      const next = nextMeeting(course.code);
      if (!next) return 9_999;
      if (next.live) return next.meeting.startMin;
      if (next.meeting.day === 0) return 2_000 + next.meeting.startMin;
      return 10_000 + next.meeting.day * 1_500 + next.meeting.startMin;
    };
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "grade") return b.grade - a.grade || a.code.localeCompare(b.code);
      return rank(a) - rank(b);
    });
  }, [onlyOpen, query, sort]);

  const average = Math.round(courses.reduce((sum, course) => sum + course.grade, 0) / courses.length);
  const credits = courses.reduce((sum, course) => sum + course.credits, 0);
  const next = courses
    .map((course) => ({ course, next: nextMeeting(course.code) }))
    .filter((row) => row.next && !row.next.live && row.next.when === "Today")
    .sort((a, b) => (a.next!.meeting.startMin - b.next!.meeting.startMin))[0];

  return (
    <>
      <TopBar
        eyebrow={`${semester.season} · ${courses.length} classes · ${credits} credits`}
        title="Courses"
        query={query}
        onQuery={setQuery}
        placeholder="Search your courses…"
      />

      <div className="stats">
        <div className="stat tint-violet">
          <span className="stat-emoji">📚</span>
          <div>
            <div className="stat-num">{courses.length}</div>
            <div className="stat-label">classes this fall</div>
          </div>
        </div>
        <div className="stat tint-sky">
          <span className="stat-emoji">🎓</span>
          <div>
            <div className="stat-num">{credits}</div>
            <div className="stat-label">credits in progress</div>
          </div>
        </div>
        <Link href="/grades" className="stat tint-mint">
          <span className="stat-emoji">📈</span>
          <div>
            <div className="stat-num">{average}%</div>
            <div className="stat-label">average across them</div>
          </div>
        </Link>
        {next ? (
        <Link href={`/courses/${next.course.slug}`} className="stat tint-coral">
          <span className="stat-emoji">⏭️</span>
          <div>
            <div className="stat-num">{next ? next.course.code : "—"}</div>
            <div className="stat-label">{`next · ${formatClock(next.next!.meeting.startMin)}`}</div>
          </div>
        </Link>
        ) : (
        <div className="stat tint-coral">
          <span className="stat-emoji">⏭️</span>
          <div>
            <div className="stat-num">—</div>
            <div className="stat-label">nothing else today</div>
          </div>
        </div>
        )}
      </div>

      <div className="toolbar-line">
        <div className="seg" role="tablist" aria-label="Sort courses">
          {(
            [
              ["next", "Next class"],
              ["grade", "Grade"],
              ["name", "Name"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={sort === key} className={sort === key ? "is-on" : ""} onClick={() => setSort(key)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className={`chip ${onlyOpen ? "is-on tint-coral" : ""}`} aria-pressed={onlyOpen} onClick={() => setOnlyOpen((value) => !value)}>
          Has something due
        </button>
        <span className="muted small">{rows.length} shown</span>
      </div>

      {rows.length === 0 ? (
        <section className="card">
          <EmptyNote emoji="🔍" title="No courses match." body="Try another name, or turn off the due-date filter." />
        </section>
      ) : (
        <div className="course-grid">
          {rows.map((course) => (
            <CourseCard key={course.code} course={course} />
          ))}
        </div>
      )}

      <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </>
  );
}

function CourseCard({ course }: { course: Course }) {
  const next = nextMeeting(course.code);
  const due = upcoming.filter((item) => item.course === course.code);
  const latest = announcements.find((item) => item.course === course.code);
  const lines = patternLines(course.code);
  return (
    <Link href={`/courses/${course.slug}`} className={`course-card tint-${course.color}`}>
      <span className="course-card-bar" />
      <div className="course-card-body">
        <div className="course-card-top">
          <div>
            <span className={`pill tint-${course.color}`}>{course.code}</span>
            <h2>{course.name}</h2>
            <p className="muted small">{course.professor}</p>
          </div>
          <GradeRing value={course.grade} color={course.color} label={course.letter} />
        </div>
        <p className="course-blurb">{course.blurb}</p>
        <ul className="course-meta">
          {lines.map((line) => (
            <li key={line}>
              <PinIcon /> {line}
            </li>
          ))}
        </ul>
        {next && (
          <div className={`next-line ${next.live ? "is-live" : ""}`}>
            <span>{next.live ? "Happening now" : next.when}</span>
            <strong>{formatClock(next.meeting.startMin)}</strong>
            <em>{next.meeting.where}</em>
          </div>
        )}
        <div className="course-card-foot">
          <span className="muted small">
            {due.length ? `${due.length} due this week` : "Nothing due this week"}
            {latest ? ` · ${latest.date}` : ""}
          </span>
          <span className="course-grade-num">{course.grade}%</span>
        </div>
        <div className="meter" aria-hidden="true">
          <div style={{ width: `${course.grade}%` }} />
        </div>
      </div>
    </Link>
  );
}

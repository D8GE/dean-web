"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import FootNote from "./FootNote";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";
import { letterFor, scorePercent } from "@/lib/grades";
import { openWork, postedWork, type WorkRecord } from "@/lib/hub";

type Filter = "all" | "open" | "graded";

export default function AssignmentsBoard() {
  const hub = useHub();
  const { courses, semester } = hub;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [course, setCourse] = useState("all");
  const open = openWork(hub);
  const posted = postedWork(hub);

  const match = (work: WorkRecord) => {
    if (course !== "all" && work.courseCode !== course) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [work.title, work.courseCode, work.kind, work.category, work.prompt].join(" ").toLowerCase().includes(q);
  };

  const openRows = open.filter(match);
  const postedRows = posted.filter(match);
  const showOpen = filter !== "graded";
  const showPosted = filter !== "open";
  const any = (showOpen && openRows.length > 0) || (showPosted && postedRows.length > 0);

  return (
    <>
      <TopBar
        eyebrow={`${semester.today} · ${open.length} still open`}
        title="Work"
        query={query}
        onQuery={setQuery}
        placeholder="Search assignments…"
      />

      <div className="toolbar-line">
        <div className="seg" role="tablist" aria-label="Assignment status">
          {(
            [
              ["all", "All"],
              ["open", "To do"],
              ["graded", "Graded"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={filter === key} className={filter === key ? "is-on" : ""} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="chip-row">
          <button type="button" className={`chip tint-violet ${course === "all" ? "is-on" : ""}`} aria-pressed={course === "all"} onClick={() => setCourse("all")}>
            All courses
          </button>
          {courses.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`chip tint-${item.color} ${course === item.code ? "is-on" : ""}`}
              aria-pressed={course === item.code}
              onClick={() => setCourse(item.code)}
            >
              {item.code}
            </button>
          ))}
        </div>
      </div>

      {!any ? (
        <section className="card">
          <EmptyNote emoji="🗂️" title="Nothing in this view." body="Clear the search or switch the filter back to All." />
        </section>
      ) : (
        <div className="stack-gap">
          {showOpen && (
            <section className="card">
              <header className="card-head">
                <div>
                  <h2>Still open</h2>
                  <p className="muted">{openRows.length ? `${openRows.length} this week` : "Nothing open in this filter"}</p>
                </div>
              </header>
              {openRows.length === 0 ? (
                <EmptyNote emoji="✅" title="Nothing due in this filter." body="Graded rows are below, or switch courses." />
              ) : (
                <ul className="work-list">
                  {openRows.map((work) => (
                    <WorkLink key={work.gradeId} work={work} />
                  ))}
                </ul>
              )}
            </section>
          )}
          {showPosted && (
            <section className="card">
              <header className="card-head">
                <div>
                  <h2>Already scored</h2>
                  <p className="muted">Newest first · same numbers as the gradebook</p>
                </div>
              </header>
              {postedRows.length === 0 ? (
                <EmptyNote emoji="📭" title="No scored rows match." body="Try another course, or switch to To do." />
              ) : (
                <ul className="work-list">
                  {postedRows.map((work) => (
                    <WorkLink key={work.gradeId} work={work} />
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}

      <FootNote />
    </>
  );
}

function WorkLink({ work }: { work: WorkRecord }) {
  const { courseByCode } = useHub();
  const course = courseByCode[work.courseCode];
  const pct = scorePercent(work.earned, work.possible);
  return (
    <li>
      <Link href={`/assignments/${work.id}`} className={`work-row tint-${course?.color ?? "neutral"}`}>
        <span className="work-name">
          <strong>{work.title}</strong>
          <span className="muted small">
            {work.courseCode} · {work.kind} · {work.dueLabel}
          </span>
        </span>
        {work.earned === null ? (
          <span className={`due due-${work.urgency === "posted" ? "later" : work.urgency}`}>
            {work.xp ? `${work.xp} XP` : "Open"}
          </span>
        ) : (
          <span className={`score tint-${course?.color ?? "neutral"}`}>
            {work.earned}/{work.possible}
            <small>{pct === null ? "—" : letterFor(pct)}</small>
          </span>
        )}
      </Link>
    </li>
  );
}

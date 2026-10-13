"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EmptyNote from "./EmptyNote";
import GradeRing from "./GradeRing";
import { CheckIcon, PinIcon } from "./Icons";
import TopBar from "./TopBar";
import {
  announcements,
  courseBySlug,
  modules,
  semester,
  upcoming,
  type CourseModule,
  type ModuleItem,
} from "@/lib/demo-data";
import { categoryAverage, categoriesFor, itemsFor, letterFor } from "@/lib/grades";
import { formatRange, nextMeeting, patternLines } from "@/lib/schedule";

const TABS = ["Overview", "Work", "Modules", "Announcements"] as const;
type Tab = (typeof TABS)[number];

const TAB_FROM: Record<string, Tab> = {
  overview: "Overview",
  work: "Work",
  modules: "Modules",
  announcements: "Announcements",
};

export default function CourseHome({ slug, initialTab = null }: { slug: string; initialTab?: string | null }) {
  const course = courseBySlug[slug];
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>(TAB_FROM[(initialTab ?? "").toLowerCase()] ?? "Overview");
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    for (const mod of modules) {
      if (mod.course !== course?.code) continue;
      for (const item of mod.items) seed[item.id] = item.done;
    }
    return seed;
  });
  const [openModule, setOpenModule] = useState<string | null>(
    () => modules.find((mod) => mod.course === course?.code && mod.weekLabel === "Week 8")?.id ?? null,
  );
  const [workFilter, setWorkFilter] = useState<"all" | "open" | "graded">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const courseModules = useMemo(
    () => (course ? modules.filter((mod) => mod.course === course.code) : []),
    [course],
  );

  if (!course) {
    return (
      <>
        <TopBar eyebrow="Courses" title="Course not found" query={query} onQuery={setQuery} placeholder="Search…" />
        <section className="card">
          <EmptyNote emoji="📚" title="That course isn't on your schedule." body="These five are the ones in the demo gradebook." />
          <Link href="/courses" className="btn3d btn-primary">
            Back to courses
          </Link>
        </section>
      </>
    );
  }

  const q = query.trim().toLowerCase();
  const posts = announcements.filter((item) => item.course === course.code && matches(q, item.title, item.body, item.author));
  const work = itemsFor(course.code).filter((item) => {
    if (workFilter === "open" && item.earned !== null) return false;
    if (workFilter === "graded" && item.earned === null) return false;
    return matches(q, item.title, item.category, item.feedback ?? "");
  });
  const filteredModules = courseModules
    .map((mod) => ({
      ...mod,
      items: mod.items.filter((item) => matches(q, item.title, item.kind, mod.title, mod.weekLabel)),
    }))
    .filter((mod) => (q ? mod.items.length > 0 : true));

  const totalItems = courseModules.reduce((sum, mod) => sum + mod.items.length, 0);
  const doneCount = courseModules.reduce(
    (sum, mod) => sum + mod.items.filter((item) => done[item.id]).length,
    0,
  );
  const next = nextMeeting(course.code);
  const due = upcoming.filter((item) => item.course === course.code);

  return (
    <>
      <TopBar
        eyebrow={
          <>
            <Link href="/courses">Courses</Link>
            {" · "}
            {course.code}
            {" · "}
            {course.professor}
          </>
        }
        title={course.name}
        query={query}
        onQuery={setQuery}
        placeholder="Search this course…"
      />

      <section className={`card course-hero tint-${course.color}`}>
        <div className="course-hero-copy">
          <span className={`pill tint-${course.color}`}>{course.credits} credits</span>
          <p className="course-hero-blurb">{course.blurb}</p>
          <ul className="course-meta">
            {patternLines(course.code).map((line) => (
              <li key={line}>
                <PinIcon /> {line}
              </li>
            ))}
            <li>Office hours · {course.office}</li>
          </ul>
          {next && (
            <Link href={`/schedule?event=class-${next.meeting.id}`} className="hero-next">
              {next.live ? "Happening now" : `Next · ${next.when}`} · {formatRange(next.meeting.startMin, next.meeting.endMin)} · {next.meeting.where}
            </Link>
          )}
        </div>
        <div className="course-hero-grade">
          <GradeRing value={course.grade} color={course.color} label={course.letter} size={88} />
          <div>
            <div className="hero-pct">{course.grade}%</div>
            <Link href={`/grades?course=${course.slug}`} className="muted small">
              Open in gradebook
            </Link>
          </div>
        </div>
      </section>

      <div className="seg seg-page" role="tablist" aria-label="Course sections">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            className={tab === name ? "is-on" : ""}
            onClick={() => setTab(name)}
          >
            {name}
            {name === "Work" && <em>{due.length}</em>}
            {name === "Announcements" && <em>{announcements.filter((item) => item.course === course.code).length}</em>}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid">
          <section className="card span-7">
            <header className="card-head">
              <div>
                <h2>This week</h2>
                <p className="muted">Week {semester.week} · what&apos;s actually left</p>
              </div>
            </header>
            {due.length === 0 ? (
              <EmptyNote emoji="✅" title="Nothing due." body="This course is quiet until next week." />
            ) : (
              <ul className="task-list">
                {due.map((item) => (
                  <li key={item.id} className="task">
                    <div className={`check tint-${course.color}`} aria-hidden="true" />
                    <div className="task-body">
                      <Link href={`/assignments/${item.id}`} className="task-title">
                        {item.title}
                      </Link>
                      <div className="task-meta">
                        <span className={`pill tint-${course.color}`}>{item.kind}</span>
                        <span className="muted">⚡ {item.xp} XP</span>
                      </div>
                    </div>
                    <span className={`due due-${item.urgency}`}>{item.due}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="module-progress">
              <div>
                <strong>
                  {doneCount}/{totalItems} module items done
                </strong>
                <p className="muted small">
                  Check them off under{" "}
                  <button type="button" className="quiet-link" onClick={() => setTab("Modules")}>
                    Modules
                  </button>
                  . It stays on this page.
                </p>
              </div>
              <div className={`meter tint-${course.color}`}>
                <div style={{ width: `${totalItems ? (doneCount / totalItems) * 100 : 0}%` }} />
              </div>
            </div>
          </section>

          <section className="card span-5">
            <header className="card-head">
              <div>
                <h2>Grade so far</h2>
                <p className="muted">Weighted · matches the {course.letter} on the dashboard</p>
              </div>
            </header>
            <ul className="cat-list">
              {categoriesFor(course.code).map((category) => {
                const avg = categoryAverage(course.code, category.name);
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
            {posts[0] && (
              <article className="announce announce-inset">
                <div className="announce-top">
                  <Link href={`/announcements/${posts[0].id}`} className="quiet-link">
                    {posts[0].title}
                  </Link>
                  <span className="muted small">{posts[0].date}</span>
                </div>
                <p>{posts[0].body}</p>
                <span className="muted small">{posts[0].author}</span>
              </article>
            )}
          </section>
        </div>
      )}

      {tab === "Work" && (
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Work</h2>
              <p className="muted">Graded rows expand. The open one is still on the dashboard list.</p>
            </div>
            <div className="seg" role="tablist" aria-label="Filter work">
              {(
                [
                  ["all", "All"],
                  ["open", "To do"],
                  ["graded", "Graded"],
                ] as const
              ).map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={workFilter === key} className={workFilter === key ? "is-on" : ""} onClick={() => setWorkFilter(key)}>
                  {label}
                </button>
              ))}
            </div>
          </header>
          {work.length === 0 ? (
            <EmptyNote emoji="🗂️" title="Nothing in this filter." body="Switch back to All to see the whole gradebook for this class." />
          ) : (
            <ul className="work-list">
              {work.map((item) => {
                const open = expanded === item.id;
                const pct = item.earned === null ? null : Math.round((item.earned / item.possible) * 100);
                return (
                  <li key={item.id} className={open ? "is-open" : ""}>
                    <div className="work-row">
                      <Link href={`/assignments/${item.upcomingId ?? item.id}`} className="work-name">
                        <strong>{item.title}</strong>
                        <span className="muted small">
                          {item.category} · {item.date}
                        </span>
                      </Link>
                      <button
                        type="button"
                        className="work-score-btn"
                        aria-expanded={open}
                        aria-label={`${open ? "Hide" : "Show"} notes for ${item.title}`}
                        onClick={() => setExpanded(open ? null : item.id)}
                      >
                        {pct === null ? (
                          <span className="due due-soon">Not graded</span>
                        ) : (
                          <span className={`score tint-${course.color}`}>
                            {item.earned}/{item.possible}
                            <small>{letterFor(pct)}</small>
                          </span>
                        )}
                      </button>
                    </div>
                    {open && (
                      <p className="work-feedback">
                        {item.feedback ?? (item.earned === null ? "Still open. It'll land in the gradebook after you turn it in." : "Score posted. No written comment on this one.")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "Modules" && (
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Modules</h2>
              <p className="muted">
                {doneCount} of {totalItems} checked off
              </p>
            </div>
          </header>
          {filteredModules.length === 0 ? (
            <EmptyNote emoji="📂" title="No module items match." body="Clear the search to get the weeks back." />
          ) : (
            <ul className="module-list">
              {filteredModules.map((mod) => (
                <ModuleBlock
                  key={mod.id}
                  mod={mod}
                  slug={course.slug}
                  color={course.color}
                  open={openModule === mod.id}
                  done={done}
                  onToggleOpen={() => setOpenModule((current) => (current === mod.id ? "" : mod.id))}
                  onToggleItem={(id) => setDone((current) => ({ ...current, [id]: !current[id] }))}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "Announcements" && (
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Announcements</h2>
              <p className="muted">{course.professor}</p>
            </div>
            <Link href="/announcements" className="btn3d btn-ghost compact">
              All classes
            </Link>
          </header>
          {posts.length === 0 ? (
            <EmptyNote emoji="📭" title="No announcements match." body="The professor has posted a couple this month — clear the search to read them." />
          ) : (
            <ul className="announce-list">
              {posts.map((post) => (
                <li key={post.id}>
                  <article className="announce">
                    <div className="announce-top">
                      <Link href={`/announcements/${post.id}`} className="quiet-link">
                        {post.title}
                      </Link>
                      <span className="muted small">{post.date}</span>
                    </div>
                    <p>{post.body}</p>
                    <span className="muted small">{post.author}</span>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </>
  );
}

function matches(query: string, ...parts: string[]) {
  if (!query) return true;
  return parts.join(" ").toLowerCase().includes(query);
}

function ModuleBlock({
  mod,
  slug,
  color,
  open,
  done,
  onToggleOpen,
  onToggleItem,
}: {
  mod: CourseModule;
  slug: string;
  color: string;
  open: boolean;
  done: Record<string, boolean>;
  onToggleOpen: () => void;
  onToggleItem: (id: string) => void;
}) {
  const finished = mod.items.filter((item) => done[item.id]).length;
  return (
    <li className={`module tint-${color} ${open ? "is-open" : ""}`}>
      <button type="button" className="module-head" aria-expanded={open} onClick={onToggleOpen}>
        <span>
          <span className="muted small">{mod.weekLabel}</span>
          <strong>{mod.title}</strong>
        </span>
        <span className="muted small">
          {finished}/{mod.items.length}
        </span>
      </button>
      {open && (
        <ul className="module-items">
          {mod.items.map((item) => (
            <ModuleRow key={item.id} item={item} slug={slug} color={color} on={!!done[item.id]} onToggle={() => onToggleItem(item.id)} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ModuleRow({
  item,
  slug,
  color,
  on,
  onToggle,
}: {
  item: ModuleItem;
  slug: string;
  color: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <li className={on ? "is-done" : ""}>
      <button type="button" className={`check tint-${color}`} aria-pressed={on} aria-label={`${on ? "Mark not done" : "Mark done"}: ${item.title}`} onClick={onToggle}>
        {on && <CheckIcon />}
      </button>
      <span className="module-kind">{item.kind}</span>
      <Link href={`/courses/${slug}/items/${item.id}`} className="module-title">
        {item.title}
      </Link>
    </li>
  );
}

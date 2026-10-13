"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EmptyNote from "./EmptyNote";
import FootNote from "./FootNote";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";
import { groupHits, hubKindOrder, searchHub, type HubKind, type HubSnapshot } from "@/lib/hub";

const demoStarters = [
  { href: "/assignments/a1", emoji: "📝", title: "Due tonight", detail: "Rhetorical analysis — first draft" },
  { href: "/schedule?event=class-m2", emoji: "📐", title: "Happening now", detail: "MATH 121 · Science Hall 204" },
  { href: "/focus", emoji: "⏱️", title: "3:30 focus block", detail: "Outline the English draft" },
  { href: "/notifications", emoji: "🔔", title: "Notifications", detail: "Calc, the draft, the streak" },
];

function startersFor(hub: HubSnapshot) {
  if (hub.source !== "live") return demoStarters;
  const due = hub.upcoming.find((item) => item.status !== "submitted") ?? hub.upcoming[0];
  const session = hub.todaysClasses.find((item) => item.status === "now") ?? hub.todaysClasses.find((item) => item.status === "next");
  const meeting = session
    ? hub.meetings.find((item) => {
        if (item.course !== session.course || item.day !== hub.semester.todayDow) return false;
        if (session.startMin != null && item.startMin !== session.startMin) return false;
        return true;
      })
    : undefined;
  const block = hub.deansPlan[0];
  const cards = [];
  if (due) {
    cards.push({
      href: `/assignments/${due.id}`,
      emoji: "📝",
      title: due.urgency === "today" ? "Due today" : "Up next",
      detail: due.title,
    });
  }
  if (session) {
    cards.push({
      href: meeting ? `/schedule?event=class-${meeting.id}` : "/schedule",
      emoji: "📐",
      title: session.status === "now" ? "Happening now" : "Up next",
      detail: `${session.course} · ${session.where}`,
    });
  }
  if (block) {
    cards.push({
      href: "/focus?block=0",
      emoji: "⏱️",
      title: `${block.time} focus block`,
      detail: block.label,
    });
  }
  cards.push({
    href: "/notifications",
    emoji: "🔔",
    title: "Notifications",
    detail: hub.notifications[0]?.title ?? "Inbox",
  });
  return cards;
}

export default function SearchBoard({ initialQuery = "" }: { initialQuery?: string }) {
  const hub = useHub();
  const { courses, student, upcoming } = hub;
  const starters = startersFor(hub);
  const [query, setQuery] = useState(initialQuery);
  const [trackedQuery, setTrackedQuery] = useState(initialQuery);
  if (trackedQuery !== initialQuery) {
    setTrackedQuery(initialQuery);
    setQuery(initialQuery);
  }
  const [kind, setKind] = useState<HubKind | "all">("all");
  const hits = useMemo(() => searchHub(hub, query), [hub, query]);
  const shown = kind === "all" ? hits : hits.filter((hit) => hit.kind === kind);
  const groups = groupHits(shown);
  const trimmed = query.trim();

  return (
    <main className="main">
      <TopBar
        eyebrow="Classes, work, announcements, modules"
        title="Search"
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setKind("all");
        }}
        placeholder="Search classes, assignments…"
      />

      {!trimmed ? (
        <>
          <section className="card">
            <EmptyNote
              emoji="🔎"
              title={`What are you looking for, ${student.firstName}?`}
              body="Try a course, a room, a professor, or the thing due tonight."
            />
            <div className="chip-row search-starters">
              {["English", "Lab 5", "Dr. Patel", "DeMoss", "streak"].map((term) => (
                <button key={term} type="button" className="chip" onClick={() => setQuery(term)}>
                  {term}
                </button>
              ))}
            </div>
          </section>
          <div className="starter-grid">
            {starters.map((item) => (
              <Link key={item.href} href={item.href} className="snap-row starter-card">
                <span className="stat-emoji">{item.emoji}</span>
                <span>
                  <strong>{item.title}</strong>
                  <span className="muted small">{item.detail}</span>
                </span>
              </Link>
            ))}
          </div>
          <p className="muted small search-foot">
            {courses.length} courses · {upcoming.length} things due this week
          </p>
        </>
      ) : hits.length === 0 ? (
        <section className="card">
          <EmptyNote
            emoji="📭"
            title="Nothing matches."
            body="Try a course code, a professor, or a room like DeMoss. The five classes are the whole demo."
          />
          <button type="button" className="btn3d btn-ghost" onClick={() => setQuery("")}>
            Clear search
          </button>
        </section>
      ) : (
        <>
          <div className="toolbar-line">
            <div className="chip-row">
              <button type="button" className={`chip tint-violet ${kind === "all" ? "is-on" : ""}`} aria-pressed={kind === "all"} onClick={() => setKind("all")}>
                All · {hits.length}
              </button>
              {hubKindOrder.map((name) => {
                const count = hits.filter((hit) => hit.kind === name).length;
                if (!count) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`chip ${kind === name ? "is-on" : ""}`}
                    aria-pressed={kind === name}
                    onClick={() => setKind(name)}
                  >
                    {name} · {count}
                  </button>
                );
              })}
            </div>
          </div>
          {groups.length === 0 ? (
            <section className="card">
              <EmptyNote emoji="🗂️" title="Nothing in this group." body="Switch back to All to see the rest of the matches." />
            </section>
          ) : (
            <div className="search-groups">
              {groups.map((group) => (
                <section key={group.kind} className="card">
                  <header className="card-head">
                    <div>
                      <h2>{group.kind}</h2>
                      <p className="muted">
                        {group.hits.length} {group.hits.length === 1 ? "match" : "matches"} for “{trimmed}”
                      </p>
                    </div>
                  </header>
                  <ul className="snap-list">
                    {group.hits.map((hit) => (
                      <li key={`${hit.kind}-${hit.id}`}>
                        <Link href={hit.href} className={`snap-row tint-${hit.color}`}>
                          <span className={`pill tint-${hit.color}`}>{hit.kind}</span>
                          <span>
                            <strong>{hit.title}</strong>
                            <span className="muted small">{hit.detail}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <FootNote />
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import TopBar from "./TopBar";
import { announcements, courseByCode, courses, semester } from "@/lib/demo-data";

export default function AnnouncementsBoard() {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const q = query.trim().toLowerCase();
  const rows = announcements.filter((post) => {
    if (course !== "all" && post.course !== course) return false;
    if (!q) return true;
    return [post.title, post.body, post.author, post.course].join(" ").toLowerCase().includes(q);
  });

  return (
    <>
      <TopBar
        eyebrow={`${semester.season} · ${announcements.length} posts`}
        title="Announcements"
        query={query}
        onQuery={setQuery}
        placeholder="Search announcements…"
      />

      <div className="chip-row">
        <button type="button" className={`chip tint-violet ${course === "all" ? "is-on" : ""}`} aria-pressed={course === "all"} onClick={() => setCourse("all")}>
          All classes
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

      {rows.length === 0 ? (
        <section className="card surface-gap">
          <EmptyNote emoji="📭" title="No announcements match." body="Clear the search or pick All classes. Each course has two posts this month." />
        </section>
      ) : (
        <ul className="announce-list surface-gap">
          {rows.map((post) => {
            const tint = courseByCode[post.course];
            return (
              <li key={post.id}>
                <Link href={`/announcements/${post.id}`} className={`announce announce-link tint-${tint.color}`}>
                  <div className="announce-top">
                    <strong>{post.title}</strong>
                    <span className="muted small">{post.date}</span>
                  </div>
                  <p>{post.body}</p>
                  <span className="muted small">
                    {post.course} · {post.author}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </>
  );
}

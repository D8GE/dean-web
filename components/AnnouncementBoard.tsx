"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import TopBar from "./TopBar";
import { announcements, courseByCode } from "@/lib/demo-data";
import { announcementAssignment, announcementExtra, workById } from "@/lib/hub";

export default function AnnouncementBoard({ id }: { id: string }) {
  const post = announcements.find((item) => item.id === id);
  const [query, setQuery] = useState("");

  if (!post) {
    return (
      <>
        <TopBar eyebrow="Announcements" title="Post not found" query={query} onQuery={setQuery} placeholder="Search announcements…" />
        <section className="card">
          <EmptyNote emoji="📭" title="That post isn't in the demo." body="Each of the five courses has two announcements this month." />
          <Link href="/announcements" className="btn3d btn-primary">
            All announcements
          </Link>
        </section>
      </>
    );
  }

  const course = courseByCode[post.course];
  const more = announcementExtra(post.id);
  const related = workById(announcementAssignment(post.id) ?? "");
  const others = announcements.filter((item) => item.course === post.course && item.id !== post.id);

  return (
    <>
      <TopBar
        eyebrow={
          <>
            <Link href="/announcements">Announcements</Link>
            {" · "}
            <Link href={`/courses/${course.slug}?tab=announcements`}>{course.code}</Link>
            {" · "}
            {post.author}
          </>
        }
        title={post.title}
        query={query}
        onQuery={setQuery}
        placeholder="Search announcements…"
      />

      <article className={`card announce-detail tint-${course.color}`}>
        <div className="detail-kicker">
          <span className={`pill tint-${course.color}`}>{course.code}</span>
          <span className="muted small">{post.date}</span>
        </div>
        <p className="prose">{post.body}</p>
        {more && <p className="prose">{more}</p>}
        <p className="muted small">{post.author}</p>
      </article>

      <div className="grid surface-gap">
        {related && (
          <section className="card span-7">
            <header className="card-head">
              <div>
                <h2>Tied to work</h2>
                <p className="muted">{related.dueLabel}</p>
              </div>
            </header>
            <Link href={`/assignments/${related.id}`} className={`snap-row tint-${course.color}`}>
              <span className={`pill tint-${course.color}`}>{related.kind}</span>
              <span>
                <strong>{related.title}</strong>
                <span className="muted small">{related.earned === null ? "Still open" : "Scored"}</span>
              </span>
            </Link>
          </section>
        )}
        <section className={`card ${related ? "span-5" : "span-12"}`}>
          <header className="card-head">
            <div>
              <h2>Also from {course.code}</h2>
              <p className="muted">{course.professor}</p>
            </div>
          </header>
          {others.length === 0 ? (
            <EmptyNote emoji="📭" title="No other posts." body="This is the only announcement in the demo for this class." />
          ) : (
            <ul className="snap-list">
              {others.map((item) => (
                <li key={item.id}>
                  <Link href={`/announcements/${item.id}`} className={`snap-row tint-${course.color}`}>
                    <span>
                      <strong>{item.title}</strong>
                      <span className="muted small">{item.date}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </>
  );
}

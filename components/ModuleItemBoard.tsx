"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import FootNote from "./FootNote";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";
import { modulePage, workById } from "@/lib/hub";

export default function ModuleItemBoard({ slug, itemId }: { slug: string; itemId: string }) {
  const hub = useHub();
  const page = modulePage(hub, slug, itemId);
  const [query, setQuery] = useState("");

  if (!page) {
    return (
      <>
        <TopBar eyebrow="Modules" title="Item not found" query={query} onQuery={setQuery} placeholder="Search modules…" />
        <section className="card">
          <EmptyNote emoji="📂" title="That module item isn't on your courses." body="Week 7 and week 8 are the ones loaded in the demo." />
          <Link href="/courses" className="btn3d btn-primary">
            Back to courses
          </Link>
        </section>
      </>
    );
  }

  const course = hub.courseByCode[page.courseCode];
  const work = page.workId ? workById(hub, page.workId) : null;
  if (!course) {
    return (
      <>
        <TopBar eyebrow="Modules" title="Item not found" query={query} onQuery={setQuery} placeholder="Search modules…" />
        <section className="card">
          <EmptyNote emoji="📂" title="That module item isn't on your courses." body="Week 7 and week 8 are the ones loaded in the demo." />
          <Link href="/courses" className="btn3d btn-primary">
            Back to courses
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <TopBar
        eyebrow={
          <>
            <Link href={`/courses/${page.slug}?tab=modules`}>{course.code}</Link>
            {" · "}
            {page.weekLabel}
            {" · "}
            {page.kind}
          </>
        }
        title={page.itemTitle}
        query={query}
        onQuery={setQuery}
        placeholder="Search this course…"
      />

      <section className={`detail-strip tint-${course.color}`}>
        <div className="detail-main">
          <div className="detail-kicker">
            <span className={`pill tint-${course.color}`}>{page.kind}</span>
            <span className="muted small">{page.done ? "Checked off" : "Still open"}</span>
          </div>
          <div className="detail-title">{page.moduleTitle}</div>
          <div className="detail-meta muted">
            {page.weekLabel} · {course.professor}
          </div>
        </div>
        <div className="detail-side">
          <Link href={`/courses/${page.slug}?tab=modules`} className="btn3d btn-ghost compact">
            Back to modules
          </Link>
        </div>
      </section>

      <div className="grid surface-gap">
        <section className="card span-8">
          <p className="prose">{page.copy.body}</p>
          <h3 className="section-label">Takeaway</h3>
          <p className="prose">{page.copy.takeaway}</p>
          {page.copy.action && (
            <Link href={page.copy.action.href} className="btn3d btn-soft compact quest-action">
              {page.copy.action.label}
            </Link>
          )}
        </section>
        <section className={`card span-4 tint-${course.color}`}>
          <header className="card-head">
            <div>
              <h2>{course.code}</h2>
              <p className="muted">{course.name}</p>
            </div>
          </header>
          {work ? (
            <Link href={`/assignments/${work.id}`} className={`snap-row tint-${course.color}`}>
              <span>
                <strong>{work.title}</strong>
                <span className="muted small">{work.earned === null ? work.dueLabel : "Scored"}</span>
              </span>
            </Link>
          ) : (
            <p className="muted small">No separate assignment is tied to this item. The checkbox on the module is the whole task.</p>
          )}
          <Link href={`/courses/${page.slug}`} className="quiet-link turn-back">
            Course home
          </Link>
        </section>
      </div>

      <FootNote />
    </>
  );
}

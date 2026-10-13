"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import ExternalLink from "./ExternalLink";
import FootNote from "./FootNote";
import Overlay from "./Overlay";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";
import { letterFor, scorePercent } from "@/lib/grades";
import { announcementExtra, announcementForWork, moduleLinkForWork, workById } from "@/lib/hub";

export default function AssignmentBoard({ id }: { id: string }) {
  const hub = useHub();
  const { semester } = hub;
  const work = workById(hub, id);
  const [query, setQuery] = useState("");
  const [ask, setAsk] = useState(false);
  const [turnedIn, setTurnedIn] = useState(false);

  if (!work) {
    return (
      <>
        <TopBar eyebrow="Work" title="Assignment not found" query={query} onQuery={setQuery} placeholder="Search assignments…" />
        <section className="card">
          <EmptyNote emoji="🗂️" title="That assignment isn't in the gradebook." body="The open ones are this week's five. Everything scored is on the work list too." />
          <Link href="/assignments" className="btn3d btn-primary">
            All work
          </Link>
        </section>
      </>
    );
  }

  const course = hub.courseByCode[work.courseCode];
  const post = announcementForWork(hub, work);
  const moduleLink = moduleLinkForWork(hub, work);
  if (!course) {
    return (
      <>
        <TopBar eyebrow="Work" title="Assignment not found" query={query} onQuery={setQuery} placeholder="Search assignments…" />
        <section className="card">
          <EmptyNote emoji="🗂️" title="That assignment isn't in the gradebook." body="The open ones are this week's five. Everything scored is on the work list too." />
          <Link href="/assignments" className="btn3d btn-primary">
            All work
          </Link>
        </section>
      </>
    );
  }
  const pct = scorePercent(work.earned, work.possible);
  const open = work.earned === null;

  return (
    <>
      <TopBar
        eyebrow={
          <>
            <Link href="/assignments">Work</Link>
            {" · "}
            <Link href={`/courses/${course.slug}`}>{course.code}</Link>
            {" · "}
            {course.professor}
          </>
        }
        title={work.title}
        query={query}
        onQuery={setQuery}
        placeholder="Search assignments…"
      />

      <section className={`detail-strip tint-${course.color}`}>
        <div className="detail-main">
          <div className="detail-kicker">
            <span className={`pill tint-${course.color}`}>{work.kind}</span>
            <span className={`pill tint-${course.color}`}>{work.category}</span>
            {open ? <span className={`due due-${work.urgency}`}>{work.dueLabel}</span> : <span className="pill tint-mint">Scored</span>}
          </div>
          <div className="detail-title">{course.name}</div>
          <div className="detail-meta muted">
            {semester.season} · Week {semester.week} · {work.possible} points
            {work.xp ? ` · ${work.xp} XP` : ""}
          </div>
        </div>
        <div className="detail-side">
          <Link href={`/courses/${course.slug}?tab=work`} className="btn3d btn-ghost compact">
            Course work
          </Link>
          <Link href={`/grades?course=${course.slug}`} className="btn3d btn-soft compact">
            Gradebook
          </Link>
          {work.htmlUrl && (
            <ExternalLink href={work.htmlUrl} className="quiet-link">
              View in Canvas
            </ExternalLink>
          )}
        </div>
      </section>

      <div className="grid surface-gap">
        <section className="card span-8">
          <header className="card-head">
            <div>
              <h2>{open ? "What to turn in" : "What it was"}</h2>
              <p className="muted">{course.professor}</p>
            </div>
          </header>
          <p className="prose">{work.prompt}</p>
          {work.steps.length > 0 && (
            <ol className="step-list">
              {work.steps.map((step, index) => (
                <li key={step}>
                  <span className={`step-num tint-${course.color}`}>{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
          {work.rubric.length > 0 && (
            <>
              <h3 className="section-label">What gets marked</h3>
              <ul className="cat-list">
                {work.rubric.map((row) => (
                  <li key={row.name}>
                    <div className="cat-top">
                      <span>{row.name}</span>
                    </div>
                    <p className="muted small">{row.note}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {moduleLink && (
            <p className="preview-line">
              Module page:{" "}
              <Link href={`/courses/${moduleLink.slug}/items/${moduleLink.itemId}`} className="quiet-link">
                Open the week item
              </Link>
            </p>
          )}
        </section>

        <section className={`card span-4 tint-${course.color}`}>
          {open ? (
            <>
              <header className="card-head">
                <div>
                  <h2>{turnedIn ? "Noted here" : "Turn in"}</h2>
                  <p className="muted">{work.dueLabel}</p>
                </div>
              </header>
              {turnedIn ? (
                <div className="ready-banner">
                  <strong>Marked ready on this page.</strong>
                  <p>
                    {hub.source === "live"
                      ? "This didn't submit to Canvas, so the gradebook didn't move. Check it off under Upcoming work"
                      : "Canvas isn't connected, so the gradebook didn't move. Check it off under Upcoming work"}
                    {work.xp ? ` if you want the ${work.xp} XP` : ""}.
                  </p>
                </div>
              ) : (
                <>
                  <p className="prose">
                    Worth {work.possible} points in {work.category.toLowerCase()}.
                    {work.xp ? ` Checking it off on Home banks ${work.xp} XP.` : ""}
                  </p>
                  <button type="button" className="btn3d btn-primary full" onClick={() => setAsk(true)}>
                    Turn in
                  </button>
                </>
              )}
              <Link href="/assignments" className="quiet-link turn-back">
                All open work
              </Link>
            </>
          ) : (
            <>
              <header className="card-head">
                <div>
                  <h2>Score</h2>
                  <p className="muted">{work.dueLabel}</p>
                </div>
              </header>
              <div className="whatif-score">
                <strong>{work.earned}</strong>
                <span> / {work.possible}</span>
              </div>
              <p className="whatif-note">
                {pct === null ? "No point value" : `${pct}% · ${letterFor(pct)}`}
              </p>
              {work.feedback ? (
                <p className="work-feedback is-flush">{work.feedback}</p>
              ) : (
                <p className="muted small">Score posted. No written comment on this one.</p>
              )}
            </>
          )}
        </section>

        {post && (
          <section className="card span-12">
            <header className="card-head">
              <div>
                <h2>From {post.author}</h2>
                <p className="muted">{post.date}</p>
              </div>
              <Link href={`/announcements/${post.id}`} className="btn3d btn-ghost compact">
                Announcement
              </Link>
            </header>
            <p className="prose">{post.body}</p>
            {announcementExtra(post.id) && <p className="prose">{announcementExtra(post.id)}</p>}
          </section>
        )}
      </div>

      {ask && (
        <Overlay title="Turn this in?" kicker={work.title} onClose={() => setAsk(false)}>
          <p className="dialog-copy">
            {hub.source === "live"
              ? "This stays on this page. Canvas doesn't get a submission, and the score won't change. You can still check it off on Home to bank"
              : "Canvas isn't hooked up, so this stays inside the demo. The score won't change. You can still check it off on Home to bank"}
            {work.xp ? ` the ${work.xp} XP` : " the XP"}.
          </p>
          <div className="status-actions">
            <button
              type="button"
              className="btn3d btn-primary"
              onClick={() => {
                setTurnedIn(true);
                setAsk(false);
              }}
            >
              Mark it ready
            </button>
            <button type="button" className="btn3d btn-ghost" onClick={() => setAsk(false)}>
              Not yet
            </button>
          </div>
        </Overlay>
      )}

      <FootNote />
    </>
  );
}

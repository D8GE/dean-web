"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import TopBar from "./TopBar";
import { downloadIcs } from "@/lib/ics";
import FootNote from "./FootNote";
import { useHub } from "./HubProvider";

export default function SettingsBoard() {
  const hub = useHub();
  const { courses, focusLengths, semester, settingToggles, student } = hub;
  const [query, setQuery] = useState("");
  const [toggles, setToggles] = useState(() => Object.fromEntries(settingToggles.map((item) => [item.id, item.on])));
  const [focus, setFocus] = useState<(typeof focusLengths)[number]>(50);
  const [xpOn, setXpOn] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [canvasNote, setCanvasNote] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const q = query.trim().toLowerCase();
  const show = (...parts: string[]) => !q || parts.join(" ").toLowerCase().includes(q);
  const visibleToggles = settingToggles.filter((item) => show(item.label, item.detail, "notification"));
  const showProfile = show(student.firstName, student.lastName, student.email, student.major, student.year, student.advisor, student.studentId, "profile");
  const showFocus = show("focus", "study", "pomodoro", "xp", "session", `${focus}`);
  const showCanvas = show("canvas", "calendar", "ics", "connect", "export", "sync");
  const any = showProfile || showFocus || showCanvas || visibleToggles.length > 0;

  async function copyId() {
    try {
      await navigator.clipboard.writeText(student.studentId);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  return (
    <>
      <TopBar
        eyebrow={`${semester.today} · preferences stay on this page`}
        title="Settings"
        query={query}
        onQuery={setQuery}
        placeholder="Search settings…"
      />

      {!any && (
        <section className="card">
          <EmptyNote emoji="⚙️" title="No settings match." body="Try notifications, focus, Canvas, or your name." />
        </section>
      )}

      <div className="grid">
        {showProfile && (
          <section className="card span-8 profile-card">
            <div className="profile-id">
              <div className="me me-lg">{student.initials}</div>
              <div>
                <h2>
                  {student.firstName} {student.lastName}
                </h2>
                <p className="muted">
                  {student.year} · {student.major}
                </p>
                <Link href="/profile" className="quiet-link">
                  Open profile
                </Link>
              </div>
            </div>
            <dl className="profile-grid">
              <div>
                <dt>Email</dt>
                <dd>{student.email}</dd>
              </div>
              <div>
                <dt>Advisor</dt>
                <dd>{student.advisor}</dd>
              </div>
              <div>
                <dt>Student ID</dt>
                <dd className="id-line">
                  {student.studentId}
                  <button type="button" className="btn3d btn-ghost compact" onClick={copyId}>
                    {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
                  </button>
                </dd>
              </div>
              <div>
                <dt>Standing</dt>
                <dd>Good standing · {student.gpa.toFixed(2)} GPA</dd>
              </div>
            </dl>
          </section>
        )}

        {showProfile && (
          <section className="card span-4">
            <header className="card-head">
              <div>
                <h2>{semester.season}</h2>
                <p className="muted">Week {semester.week} of the term</p>
              </div>
            </header>
            <ul className="snap-list">
              <li className="plain-row">
                <span className="stat-emoji">📚</span>
                <span>
                  <strong>{courses.length} courses</strong>
                  <span className="muted small">{courses.reduce((sum, course) => sum + course.credits, 0)} credits in progress</span>
                </span>
              </li>
              <li className="plain-row">
                <span className="stat-emoji">🔥</span>
                <span>
                  <strong>{student.streakDays}-day streak</strong>
                  <span className="muted small">Level {student.level} · {student.xp.toLocaleString()} XP</span>
                </span>
              </li>
              <li className="plain-row">
                <span className="stat-emoji">🎯</span>
                <span>
                  <strong>Above a 3.50 cutoff</strong>
                  <span className="muted small">Semester GPA is {student.gpa.toFixed(2)}</span>
                </span>
              </li>
            </ul>
          </section>
        )}

        {visibleToggles.length > 0 && (
          <section className="card span-7">
            <header className="card-head">
              <div>
                <h2>Notifications</h2>
                <p className="muted">Demo toggles. They reset when you leave.</p>
              </div>
            </header>
            <ul className="toggle-list">
              {visibleToggles.map((item) => {
                const on = toggles[item.id];
                return (
                  <li key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <p className="muted small">{item.detail}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      className={`switch ${on ? "is-on" : ""}`}
                      onClick={() => setToggles((current) => ({ ...current, [item.id]: !current[item.id] }))}
                    >
                      <span className="knob" />
                      <span className="sr-only">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {showFocus && (
          <section className="card span-5">
            <header className="card-head">
              <div>
                <h2>Study defaults</h2>
                <p className="muted">Used the next time a focus block starts.</p>
              </div>
            </header>
            <p className="field-label">Focus length</p>
            <div className="seg" role="tablist" aria-label="Focus length">
              {focusLengths.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  role="tab"
                  aria-selected={focus === minutes}
                  className={focus === minutes ? "is-on" : ""}
                  onClick={() => setFocus(minutes)}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <div className="toggle-list lone">
              <div>
                <div>
                  <strong>Show XP on assignments</strong>
                  <p className="muted small">The points already on the dashboard list.</p>
                </div>
                <button type="button" role="switch" aria-checked={xpOn} className={`switch ${xpOn ? "is-on" : ""}`} onClick={() => setXpOn((value) => !value)}>
                  <span className="knob" />
                  <span className="sr-only">Show XP on assignments</span>
                </button>
              </div>
            </div>
            <p className="preview-line">
              A block would run <strong>{focus}:00</strong>
              {xpOn ? " and keep the XP chips visible." : " with the XP chips hidden."}
            </p>
            <Link href={`/focus?minutes=${focus}`} className="btn3d btn-primary full">
              Start a {focus} min block
            </Link>
          </section>
        )}

        {showCanvas && (
          <section className="card span-12 connect-card">
            <header className="card-head">
              <div>
                <h2>Connections</h2>
                <p className="muted">
                  {hub.source === "live"
                    ? "Reading your Canvas account with the token on this machine."
                    : "Still a prototype. Nothing here reaches a real school account."}
                </p>
              </div>
            </header>
            <div className="connect-grid">
              <article>
                <div className="connect-mark tint-coral">C</div>
                <div>
                  <strong>Canvas</strong>
                  <p className="muted small">
                    {hub.source === "live" ? "Connected · personal access token" : "Not connected · sample courses only"}
                  </p>
                  {canvasNote && <p className="connect-note">{canvasNote}</p>}
                </div>
                <button
                  type="button"
                  className="btn3d btn-primary compact"
                  onClick={() =>
                    setCanvasNote(
                      hub.source === "live"
                        ? "Connected. Dean is reading Canvas with the token in .env.local."
                        : hub.sourceNote,
                    )
                  }
                >
                  {hub.source === "live" ? "Connected" : "Connect"}
                </button>
              </article>
              <article>
                <div className="connect-mark tint-sky">Cal</div>
                <div>
                  <strong>Calendar export</strong>
                  <p className="muted small">Week {semester.week} classes as an .ics file</p>
                  {downloaded && <p className="connect-note">Download started for week {semester.week}.</p>}
                </div>
                <button
                  type="button"
                  className="btn3d btn-ghost compact"
                  onClick={() => {
                    downloadIcs(semester.week, hub);
                    setDownloaded(true);
                  }}
                >
                  Download .ics
                </button>
              </article>
            </div>
          </section>
        )}
      </div>

      <FootNote />
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import FootNote from "./FootNote";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";
import { badgeCopy } from "@/lib/surface-copy";
import { openWork } from "@/lib/hub";

export default function ProfileBoard() {
  const hub = useHub();
  const { badges, courses, semester, student } = hub;
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const show = (...parts: string[]) => !q || parts.join(" ").toLowerCase().includes(q);
  const showId = show(student.firstName, student.lastName, student.email, student.major, student.year, student.advisor, "profile");
  const showBadges = show("badge", "streak", "quest", ...badges.map((badge) => badge.label));
  const showCourses = show("course", "grade", "gpa", ...courses.flatMap((course) => [course.code, course.name]));
  const showDue = show("due", "work", "assignment", "draft");
  const any = showId || showBadges || showCourses || showDue;
  const due = openWork(hub);

  return (
    <>
      <TopBar
        eyebrow={`${semester.today} · ${student.year}`}
        title={`${student.firstName} ${student.lastName}`}
        query={query}
        onQuery={setQuery}
        placeholder="Search your profile…"
      />

      {!any && (
        <section className="card">
          <p className="prose">Nothing on the profile matches that. Try a course, a badge, or your major.</p>
        </section>
      )}

      <div className="grid">
        {showId && (
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
                <Link href="/settings" className="quiet-link">
                  Preferences in Settings
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
                <dd>{student.studentId}</dd>
              </div>
              <div>
                <dt>Standing</dt>
                <dd>
                  Good standing · {student.gpa.toFixed(2)} GPA
                </dd>
              </div>
            </dl>
          </section>
        )}

        {showId && (
          <section className="card span-4 level-card">
            <div className="level-top">
              <div className="level-badge">
                <span>LVL</span>
                <strong>{student.level}</strong>
              </div>
              <div>
                <h2>Scholar II</h2>
                <p className="muted">
                  {student.xpForNextLevel - student.xp} XP to level {student.level + 1}
                </p>
              </div>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${Math.round((student.xp / student.xpForNextLevel) * 100)}%` }} />
            </div>
            <div className="xp-legend">
              <span>{student.xp.toLocaleString()} XP</span>
              <span>{student.xpForNextLevel.toLocaleString()}</span>
            </div>
            <p className="muted small">{student.streakDays}-day streak · keep it lit tonight</p>
            <Link href="/quests" className="btn3d btn-soft full">
              Daily quests
            </Link>
          </section>
        )}

        {showBadges && (
          <section className="card span-12">
            <header className="card-head">
              <div>
                <h2>Badges</h2>
                <p className="muted">Same five as the home card. Locked ones stay grey.</p>
              </div>
            </header>
            <ul className="badge-list">
              {badges.map((badge) => (
                <li key={badge.label} className={`badge-row ${badge.unlocked ? "" : "is-locked"}`}>
                  <span className={`badge ${badge.unlocked ? "" : "locked"}`} aria-hidden="true">
                    {badge.emoji}
                  </span>
                  <span>
                    <strong>{badge.label}</strong>
                    <span className={`pill ${badge.unlocked ? "tint-mint" : "tint-neutral"}`}>{badge.unlocked ? "Unlocked" : "Locked"}</span>
                    <p className="muted small">{badgeCopy[badge.label]}</p>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {showCourses && (
          <section className="card span-7">
            <header className="card-head">
              <div>
                <h2>{semester.season}</h2>
                <p className="muted">
                  {courses.length} courses · {courses.reduce((sum, course) => sum + course.credits, 0)} credits
                </p>
              </div>
              <Link href="/courses" className="btn3d btn-ghost compact">
                All courses
              </Link>
            </header>
            <ul className="snap-list">
              {courses.map((course) => (
                <li key={course.code}>
                  <Link href={`/courses/${course.slug}`} className={`snap-row tint-${course.color}`}>
                    <span className={`pill tint-${course.color}`}>{course.code}</span>
                    <span>
                      <strong>{course.name}</strong>
                      <span className="muted small">
                        {course.professor} · {course.letter} · {course.grade}%
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {showDue && (
          <section className="card span-5">
            <header className="card-head">
              <div>
                <h2>Still open</h2>
                <p className="muted">This week&apos;s five</p>
              </div>
            </header>
            <ul className="snap-list">
              {due.map((work) => (
                <li key={work.id}>
                  <Link href={`/assignments/${work.id}`} className={`snap-row tint-${courses.find((course) => course.code === work.courseCode)?.color ?? "neutral"}`}>
                    <span>
                      <strong>{work.title}</strong>
                      <span className="muted small">
                        {work.courseCode} · {work.dueLabel}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <FootNote />
    </>
  );
}

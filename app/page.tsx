"use client";

import Link from "next/link";
import AvatarMenu from "@/components/AvatarMenu";
import BadgeRack from "@/components/BadgeRack";
import DeanAvatar from "@/components/DeanAvatar";
import FootNote from "@/components/FootNote";
import NotificationBell from "@/components/NotificationBell";
import PlanScrollButton from "@/components/PlanScrollButton";
import ReshuffleButton from "@/components/ReshuffleButton";
import SearchField from "@/components/SearchField";
import UpcomingList from "@/components/UpcomingList";
import { useHub } from "@/components/HubProvider";
import { PinIcon, PlayIcon } from "@/components/Icons";
import { questAnchor } from "@/lib/hub";

function liveDeanLine(
  classes: { course: string; status: string; start: string }[],
  upcoming: { title: string; due: string; status?: string }[],
): string {
  const now = classes.find((session) => session.status === "now");
  const next = classes.find((session) => session.status === "next");
  const task = upcoming.find((item) => item.status !== "submitted");
  const first = now
    ? `${now.course} is happening right now.`
    : next
      ? `Next up is ${next.course} at ${next.start}.`
      : "No more classes on today's calendar.";
  const second = task ? `I'd start with ${task.title} (${task.due}).` : "Nothing is sitting in the planner.";
  return `${first} ${second}`;
}

function Ring({ value, color }: { value: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={`ring tint-${color}`}>
      <circle cx="28" cy="28" r={r} className="ring-track" />
      <circle
        cx="28"
        cy="28"
        r={r}
        className="ring-fill"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
      />
    </svg>
  );
}

function greeting(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const hub = useHub();
  const { courseByCode, courses, deansPlan, meetings, quests, semester, student, todaysClasses, weekActivity } = hub;
  const xpPct = Math.round((student.xp / student.xpForNextLevel) * 100);
  const maxMin = Math.max(...weekActivity.map((d) => d.minutes));
  const totalFocus = weekActivity.reduce((s, d) => s + d.minutes, 0);
  const online = todaysClasses.filter((session) => /online|zoom|webex|teams/i.test(session.where)).length;
  const classSummary = todaysClasses.length
    ? `${todaysClasses.length} ${todaysClasses.length === 1 ? "class" : "classes"}${online ? ` · ${online} online` : ""}`
    : "Nothing on the calendar";

  return (
    <main className="main">
        {/* Top bar */}
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {hub.source === "demo"
                ? "Monday, October 12 · Week 8 of Fall"
                : `${semester.today} · Week ${semester.week} of ${semester.season}`}
            </p>
            <h1>
              {hub.source === "demo" ? "Good afternoon" : greeting(semester.todayMinutes)}, {student.firstName}{" "}
              <span className="wave">👋</span>
            </h1>
          </div>
          <div className="topbar-right">
            <SearchField placeholder="Search classes, assignments…" />
            <NotificationBell />
            <AvatarMenu />
          </div>
        </header>

        <div className="grid">
          {/* Dean hero */}
          <section className="card dean-card span-8">
            <div className="dean-blob b1" />
            <div className="dean-blob b2" />
            <div className="dean-hero-avatar">
              <DeanAvatar size={132} />
            </div>
            <div className="dean-copy">
              <span className="tag">Dean says</span>
              {hub.source === "demo" ? (
                <p className="dean-quote">
                  Solid morning. Calc is happening right now, then you&apos;re free until 2:00. I blocked{" "}
                  <strong>3:30–4:20</strong> for your English draft so it&apos;s not a midnight thing. Knock that
                  out and you&apos;re ahead for the week.
                </p>
              ) : (
                <p className="dean-quote">{liveDeanLine(hub.todaysClasses, hub.upcoming)}</p>
              )}
              <div className="dean-actions">
                <Link href="/focus" className="btn3d btn-primary">
                  <PlayIcon /> Start focus session
                </Link>
                <PlanScrollButton />
              </div>
            </div>
          </section>

          {/* Level */}
          <section className="card level-card span-4">
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
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="xp-legend">
              <span>{student.xp.toLocaleString()} XP</span>
              <span>{student.xpForNextLevel.toLocaleString()}</span>
            </div>
            <BadgeRack />
          </section>

          {/* Stat strip */}
          <div className="stats span-12">
            <Link href="/profile" className="stat tint-coral">
              <span className="stat-emoji">🔥</span>
              <div>
                <div className="stat-num">{student.streakDays}</div>
                <div className="stat-label">day streak</div>
              </div>
            </Link>
            <Link href="/grades" className="stat tint-violet">
              <span className="stat-emoji">🎓</span>
              <div>
                <div className="stat-num">{student.gpa.toFixed(2)}</div>
                <div className="stat-label">semester GPA</div>
              </div>
            </Link>
            <Link href="/assignments" className="stat tint-mint">
              <span className="stat-emoji">✅</span>
              <div>
                <div className="stat-num">
                  {student.weekDone}
                  <small>/{student.weekTotal}</small>
                </div>
                <div className="stat-label">done this week</div>
              </div>
            </Link>
            <Link href="/focus" className="stat tint-sky">
              <span className="stat-emoji">⏱️</span>
              <div>
                <div className="stat-num">
                  {Math.floor(totalFocus / 60)}h {totalFocus % 60}m
                </div>
                <div className="stat-label">focus time</div>
              </div>
              <div className="spark">
                {weekActivity.map((d, i) => (
                  <span key={i} style={{ height: `${(d.minutes / maxMin) * 100}%` }} />
                ))}
              </div>
            </Link>
          </div>

          {/* Today's classes */}
          <section className="card span-5">
            <header className="card-head">
              <div>
                <h2>Today&apos;s classes</h2>
                <p className="muted">{classSummary}</p>
              </div>
            </header>
            {todaysClasses.length === 0 ? (
              <p className="muted">Nothing on the calendar today.</p>
            ) : (
            <ol className="timeline">
              {todaysClasses.map((s) => {
                const c = courseByCode[s.course];
                const color = c?.color ?? "neutral";
                const meeting = meetings.find((item) => {
                  if (item.course !== s.course || item.day !== semester.todayDow) return false;
                  if (item.week != null && item.week !== semester.week) return false;
                  if (s.startMin != null && item.startMin !== s.startMin) return false;
                  return true;
                });
                return (
                  <li key={`${s.course}-${s.start}`} className={`tl-item status-${s.status} tint-${color}`}>
                    <div className="tl-time">
                      <strong>{s.start}</strong>
                      <span>{s.end}</span>
                    </div>
                    <div className="tl-dot" />
                    <Link href={meeting ? `/schedule?event=class-${meeting.id}` : c ? `/courses/${c.slug}` : "/schedule"} className="tl-card">
                      <div className="tl-title">
                        <span className="pill">{c?.code ?? s.course}</span>
                        {s.status === "now" && <span className="live">● Now</span>}
                        {s.status === "next" && <span className="next">Up next</span>}
                      </div>
                      <div className="tl-name">{c?.name ?? s.course}</div>
                      <div className="tl-where muted">
                        <PinIcon /> {s.where}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
            )}
          </section>

          {/* Upcoming */}
          <div className="span-7">
            <UpcomingList />
          </div>

          {/* Dean's plan */}
          <section className="card plan-card span-5" id="tonight">
            <header className="card-head">
              <div className="plan-head">
                <DeanAvatar size={40} />
                <div>
                  <h2>Dean&apos;s plan for tonight</h2>
                  <p className="muted">Auto-scheduled around your classes</p>
                </div>
              </div>
            </header>
            <ul className="plan">
              {deansPlan.map((b, i) => {
                const c = b.course ? courseByCode[b.course] : null;
                return (
                  <li key={i} className={`plan-item tint-${c ? c.color : "neutral"}`}>
                    <span className="plan-time">{b.time}</span>
                    <div className="plan-block">
                      <div className="plan-label">{b.label}</div>
                      <div className="plan-meta muted">
                        {c ? c.code : "Recharge"} · {b.minutes} min
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <ReshuffleButton />
          </section>

          {/* Grades */}
          <section className="card span-4">
            <header className="card-head">
              <div>
                <h2>Course grades</h2>
                <p className="muted">{hub.source === "demo" ? "Live from your gradebook (demo)" : "Live from your gradebook"}</p>
              </div>
            </header>
            <ul className="grades">
              {courses.map((c) => (
                <li key={c.code}>
                  <Link href={`/grades?course=${c.slug}`} className="grade-row">
                    <div className="ring-wrap">
                      <Ring value={c.grade} color={c.color} />
                      <span className="ring-letter">{c.letter}</span>
                    </div>
                    <div className="grade-body">
                      <div className="grade-code">{c.code}</div>
                      <div className="muted small">{c.name}</div>
                    </div>
                    <div className="grade-pct">{c.grade}%</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Quests */}
          <section className="card span-3">
            <header className="card-head">
              <div>
                <h2>Daily quests</h2>
                <p className="muted">Resets at midnight</p>
              </div>
            </header>
            <ul className="quests">
              {quests.map((q) => (
                <li key={q.title}>
                  <Link href={`/quests#${questAnchor(q.title)}`} className={`quest tint-${q.color}`}>
                    <div className="quest-top">
                      <span className="quest-title">{q.title}</span>
                      <span className="quest-xp">+{q.xp}</span>
                    </div>
                    <div className="quest-bar">
                      <div style={{ width: `${(q.progress / q.goal) * 100}%` }} />
                    </div>
                    <div className="muted small">
                      {q.progress} / {q.goal}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/quests#chest" className="chest">
              <span>🎁</span>
              <div>
                <strong>Weekly chest</strong>
                <div className="muted small">Finish all quests 5 days</div>
              </div>
            </Link>
          </section>
        </div>

        <FootNote />
    </main>
  );
}

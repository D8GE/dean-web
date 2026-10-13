import DeanAvatar from "@/components/DeanAvatar";
import UpcomingList from "@/components/UpcomingList";
import { BellIcon, PinIcon, PlayIcon, SearchIcon } from "@/components/Icons";
import {
  badges,
  courseByCode,
  courses,
  deansPlan,
  quests,
  student,
  todaysClasses,
  weekActivity,
} from "@/lib/demo-data";

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

export default function Home() {
  const xpPct = Math.round((student.xp / student.xpForNextLevel) * 100);
  const maxMin = Math.max(...weekActivity.map((d) => d.minutes));
  const totalFocus = weekActivity.reduce((s, d) => s + d.minutes, 0);

  return (
    <main className="main">
        {/* Top bar */}
        <header className="topbar">
          <div>
            <p className="eyebrow">Monday, October 12 · Week 8 of Fall</p>
            <h1>
              Good afternoon, {student.firstName} <span className="wave">👋</span>
            </h1>
          </div>
          <div className="topbar-right">
            <label className="search">
              <SearchIcon />
              <input placeholder="Search classes, assignments…" />
            </label>
            <button className="icon-btn btn3d" aria-label="Notifications">
              <BellIcon />
              <span className="dot" />
            </button>
            <div className="me">JS</div>
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
              <p className="dean-quote">
                Solid morning. Calc is happening right now, then you&apos;re free until 2:00. I blocked{" "}
                <strong>3:30–4:20</strong> for your English draft so it&apos;s not a midnight thing. Knock that
                out and you&apos;re ahead for the week.
              </p>
              <div className="dean-actions">
                <button className="btn3d btn-primary">
                  <PlayIcon /> Start focus session
                </button>
                <button className="btn3d btn-ghost">See today&apos;s plan</button>
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
            <div className="badges">
              {badges.map((b) => (
                <span key={b.label} className={`badge ${b.unlocked ? "" : "locked"}`} title={b.label}>
                  {b.emoji}
                </span>
              ))}
            </div>
          </section>

          {/* Stat strip */}
          <div className="stats span-12">
            <div className="stat tint-coral">
              <span className="stat-emoji">🔥</span>
              <div>
                <div className="stat-num">{student.streakDays}</div>
                <div className="stat-label">day streak</div>
              </div>
            </div>
            <div className="stat tint-violet">
              <span className="stat-emoji">🎓</span>
              <div>
                <div className="stat-num">{student.gpa.toFixed(2)}</div>
                <div className="stat-label">semester GPA</div>
              </div>
            </div>
            <div className="stat tint-mint">
              <span className="stat-emoji">✅</span>
              <div>
                <div className="stat-num">
                  {student.weekDone}
                  <small>/{student.weekTotal}</small>
                </div>
                <div className="stat-label">done this week</div>
              </div>
            </div>
            <div className="stat tint-sky">
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
            </div>
          </div>

          {/* Today's classes */}
          <section className="card span-5">
            <header className="card-head">
              <div>
                <h2>Today&apos;s classes</h2>
                <p className="muted">4 classes · 1 online</p>
              </div>
            </header>
            <ol className="timeline">
              {todaysClasses.map((s) => {
                const c = courseByCode[s.course];
                return (
                  <li key={s.course} className={`tl-item status-${s.status} tint-${c.color}`}>
                    <div className="tl-time">
                      <strong>{s.start}</strong>
                      <span>{s.end}</span>
                    </div>
                    <div className="tl-dot" />
                    <div className="tl-card">
                      <div className="tl-title">
                        <span className="pill">{c.code}</span>
                        {s.status === "now" && <span className="live">● Now</span>}
                        {s.status === "next" && <span className="next">Up next</span>}
                      </div>
                      <div className="tl-name">{c.name}</div>
                      <div className="tl-where muted">
                        <PinIcon /> {s.where}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Upcoming */}
          <div className="span-7">
            <UpcomingList />
          </div>

          {/* Dean's plan */}
          <section className="card plan-card span-5">
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
            <button className="btn3d btn-soft full">Reshuffle with Dean</button>
          </section>

          {/* Grades */}
          <section className="card span-4">
            <header className="card-head">
              <div>
                <h2>Course grades</h2>
                <p className="muted">Live from your gradebook (demo)</p>
              </div>
            </header>
            <ul className="grades">
              {courses.map((c) => (
                <li key={c.code} className="grade-row">
                  <div className="ring-wrap">
                    <Ring value={c.grade} color={c.color} />
                    <span className="ring-letter">{c.letter}</span>
                  </div>
                  <div className="grade-body">
                    <div className="grade-code">{c.code}</div>
                    <div className="muted small">{c.name}</div>
                  </div>
                  <div className="grade-pct">{c.grade}%</div>
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
                <li key={q.title} className={`quest tint-${q.color}`}>
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
                </li>
              ))}
            </ul>
            <div className="chest">
              <span>🎁</span>
              <div>
                <strong>Weekly chest</strong>
                <div className="muted small">Finish all quests 5 days</div>
              </div>
            </div>
          </section>
        </div>

        <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </main>
  );
}

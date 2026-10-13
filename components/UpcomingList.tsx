"use client";

import { useState } from "react";
import { courseByCode, upcoming } from "@/lib/demo-data";
import { CheckIcon } from "./Icons";

export default function UpcomingList() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [burst, setBurst] = useState<string | null>(null);

  const toggle = (id: string) => {
    setDone((d) => {
      const next = !d[id];
      if (next) {
        setBurst(id);
        window.setTimeout(() => setBurst((b) => (b === id ? null : b)), 900);
      }
      return { ...d, [id]: next };
    });
  };

  const earned = upcoming.filter((a) => done[a.id]).reduce((s, a) => s + a.xp, 0);

  return (
    <section className="card upcoming">
      <header className="card-head">
        <div>
          <h2>Upcoming work</h2>
          <p className="muted">Check it off, bank the XP.</p>
        </div>
        <span className={`xp-chip ${earned ? "pop" : ""}`} key={earned}>
          {earned ? `+${earned} XP today` : "⚡ 400 XP up for grabs"}
        </span>
      </header>
      <ul className="task-list">
        {upcoming.map((a) => {
          const c = courseByCode[a.course];
          const isDone = !!done[a.id];
          return (
            <li key={a.id} className={`task ${isDone ? "is-done" : ""}`}>
              <button
                type="button"
                className={`check tint-${c.color}`}
                onClick={() => toggle(a.id)}
                aria-pressed={isDone}
                aria-label={`Mark ${a.title} ${isDone ? "not done" : "done"}`}
              >
                {isDone && <CheckIcon />}
              </button>
              <div className="task-body">
                <div className="task-title">{a.title}</div>
                <div className="task-meta">
                  <span className={`pill tint-${c.color}`}>{a.course}</span>
                  <span className="muted">{a.kind}</span>
                </div>
              </div>
              <div className="task-right">
                <span className={`due due-${a.urgency}`}>{a.due}</span>
                <span className="task-xp">⚡ {a.xp} XP</span>
              </div>
              {burst === a.id && <span className="xp-burst">+{a.xp} XP</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

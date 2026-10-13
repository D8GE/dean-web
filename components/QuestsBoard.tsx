"use client";

import Link from "next/link";
import { useState } from "react";
import TopBar from "./TopBar";
import { quests, semester, student } from "@/lib/demo-data";
import { questAnchor, questDetail } from "@/lib/hub";

export default function QuestsBoard() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = quests.filter((quest) => {
    const extra = questDetail(quest.title);
    if (!q) return true;
    return [quest.title, extra?.detail ?? ""].join(" ").toLowerCase().includes(q);
  });
  const doneToday = quests.every((quest) => quest.progress >= quest.goal);

  return (
    <>
      <TopBar
        eyebrow={`${semester.today} · resets at midnight`}
        title="Daily quests"
        query={query}
        onQuery={setQuery}
        placeholder="Search quests…"
      />

      <div className="grid">
          <section className="card span-7">
            <header className="card-head">
              <div>
                <h2>Today</h2>
                <p className="muted">Same three as the home card. Progress doesn&apos;t tick up from this page.</p>
              </div>
            </header>
            {rows.length === 0 ? (
              <p className="prose">No quest matches that. The three reset at midnight: study blocks, on-time submits, and pages.</p>
            ) : (
            <ul className="quest-stack">
              {rows.map((quest) => {
                const extra = questDetail(quest.title);
                return (
                  <li key={quest.title} id={questAnchor(quest.title)} className={`quest-card tint-${quest.color}`}>
                    <div className="quest-top">
                      <span className="quest-title">{quest.title}</span>
                      <span className="quest-xp">+{quest.xp} XP</span>
                    </div>
                    <div className="quest-bar">
                      <div style={{ width: `${(quest.progress / quest.goal) * 100}%` }} />
                    </div>
                    <p className="muted small">
                      {quest.progress} / {quest.goal}
                    </p>
                    {extra && <p className="prose">{extra.detail}</p>}
                    {extra && (
                      <Link href={extra.href} className="btn3d btn-soft compact quest-action">
                        {extra.action}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            )}
          </section>

          <section className="card span-5" id="chest">
            <div className="chest">
              <span>🎁</span>
              <div>
                <strong>Weekly chest</strong>
                <div className="muted small">Finish all quests 5 days</div>
              </div>
            </div>
            <p className="prose chest-copy">
              {doneToday
                ? "Today counts. All three are finished."
                : "Today doesn't count yet. All three quests are still open, so it isn't one of the five days."}
            </p>
            <p className="prose">
              The {student.streakDays}-day streak is separate. The streak wants any study block. The chest only counts a day when every quest is done.
            </p>
            <Link href="/focus" className="btn3d btn-primary full">
              Start a study block
            </Link>
          </section>
        </div>

      <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </>
  );
}

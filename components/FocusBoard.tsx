"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DeanAvatar from "./DeanAvatar";
import FootNote from "./FootNote";
import { PlayIcon } from "./Icons";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";

type Phase = "ready" | "running" | "paused" | "done";

function parseMinutes(value: string | null, lengths: readonly number[]) {
  const minutes = Number(value);
  return lengths.includes(minutes) ? minutes : lengths.includes(50) ? 50 : (lengths[0] ?? 50);
}

function parseBlock(value: string | null, count: number) {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index >= count) return 0;
  return index;
}

export default function FocusBoard({ minutes, block }: { minutes: string | null; block: string | null }) {
  const { courseByCode, deansPlan, focusLengths, semester, upcoming } = useHub();
  const [query, setQuery] = useState("");
  const [length, setLength] = useState(() => parseMinutes(minutes, focusLengths));
  const [index, setIndex] = useState(() => parseBlock(block, deansPlan.length));
  const [phase, setPhase] = useState<Phase>("ready");
  const [remaining, setRemaining] = useState(() => parseMinutes(minutes, focusLengths) * 60);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [early, setEarly] = useState(false);

  useEffect(() => {
    if (phase !== "running" || endAt === null) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setPhase("done");
        setEndAt(null);
        setEarly(false);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, endAt]);

  const locked = phase === "running";

  const chooseLength = (next: number) => {
    if (locked) return;
    setLength(next);
    setRemaining(next * 60);
    setPhase("ready");
    setEarly(false);
  };

  const chooseBlock = (next: number) => {
    if (locked) return;
    setIndex(next);
    setRemaining(length * 60);
    setPhase("ready");
    setEarly(false);
  };

  const clock = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;
  const plan = deansPlan[index] ?? deansPlan[0];
  if (!plan) {
    return (
      <>
        <TopBar
          eyebrow={`${semester.today} · a block from tonight's plan`}
          title="Focus"
          query={query}
          onQuery={setQuery}
          placeholder="Search classes, assignments…"
        />
        <section className="card">
          <p className="prose">Nothing is on tonight&apos;s plan.</p>
        </section>
        <FootNote />
      </>
    );
  }
  const course = plan.course ? courseByCode[plan.course] : null;
  const assignment = course ? upcoming.find((item) => item.course === course.code) : undefined;

  return (
    <>
      <TopBar
        eyebrow={`${semester.today} · a block from tonight's plan`}
        title="Focus"
        query={query}
        onQuery={setQuery}
        placeholder="Search classes, assignments…"
      />

      <div className="grid">
        <section className={`card span-8 tint-${course?.color ?? "neutral"}`}>
          <header className="card-head">
            <div className="plan-head">
              <DeanAvatar size={48} />
              <div>
                <h2>{plan.label}</h2>
                <p className="muted">
                  {plan.time} on the plan · {plan.minutes} min parked · {course ? course.code : "Recharge"}
                </p>
              </div>
            </div>
          </header>

          <p className={`focus-clock ${phase === "done" ? "is-done" : ""}`} aria-live="polite">
            {phase === "done" && !early ? "0:00" : clock}
          </p>
          <p className="prose">
            {phase === "done"
              ? early
                ? "Ended early."
                : "Time's up."
              : "Same block Dean already put on tonight's plan. This timer doesn't move the calendar or the gradebook."}
          </p>
          {phase === "done" && (
            <p className="prose">
              {course && assignment
                ? `That's the ${course.code} block. The ${assignment.xp} XP still has to be checked off under Upcoming work.`
                : "Recharge block. A walk doesn't bank XP."}
            </p>
          )}

          <div className="focus-actions">
            {phase === "done" ? (
              <button type="button" className="btn3d btn-primary" onClick={() => {
                setEarly(false);
                setEndAt(null);
                setRemaining(length * 60);
                setPhase("ready");
              }}>
                Run it again
              </button>
            ) : phase === "running" ? (
              <>
                <button type="button" className="btn3d btn-primary" onClick={() => {
                  if (endAt !== null) setRemaining(Math.max(0, Math.round((endAt - Date.now()) / 1000)));
                  setEndAt(null);
                  setPhase("paused");
                }}>
                  Pause
                </button>
                <button type="button" className="btn3d btn-ghost" onClick={() => {
                  setEndAt(null);
                  setEarly(true);
                  setPhase("done");
                }}>
                  End
                </button>
              </>
            ) : (
              <button type="button" className="btn3d btn-primary" onClick={() => {
                setEarly(false);
                setEndAt(Date.now() + remaining * 1000);
                setPhase("running");
              }}>
                <PlayIcon /> {phase === "paused" ? "Resume" : "Start"}
              </button>
            )}
            {assignment && (
              <Link href={`/assignments/${assignment.id}`} className="btn3d btn-ghost">
                Open the assignment
              </Link>
            )}
            <Link href={`/schedule?event=study-${index}`} className="btn3d btn-soft">
              Show on the calendar
            </Link>
          </div>
        </section>

        <section className="card span-4">
          <header className="card-head">
            <div>
              <h2>This block</h2>
              <p className="muted">Length matches Study defaults until you change it here.</p>
            </div>
          </header>
          <p className="field-label">Focus length</p>
          <div className="seg" role="tablist" aria-label="Focus length">
            {focusLengths.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={length === option}
                className={length === option ? "is-on" : ""}
                disabled={locked}
                onClick={() => chooseLength(option)}
              >
                {option} min
              </button>
            ))}
          </div>
          <p className="field-label length-label">Tonight&apos;s blocks</p>
          <div className="chip-row">
            {deansPlan.map((item, itemIndex) => {
              const tint = item.course ? courseByCode[item.course].color : "neutral";
              return (
                <button
                  key={item.time}
                  type="button"
                  className={`chip tint-${tint} ${itemIndex === index ? "is-on" : ""}`}
                  aria-pressed={itemIndex === index}
                  disabled={locked}
                  onClick={() => chooseBlock(itemIndex)}
                >
                  {item.time} · {item.course ? item.course : "Break"}
                </button>
              );
            })}
          </div>
          <p className="preview-line">
            {course ? `${course.name}. ` : "No course on this one. "}
            {assignment ? `${assignment.title} is the open work.` : "Nothing open is tied to it."}
          </p>
        </section>
      </div>

      <FootNote />
    </>
  );
}

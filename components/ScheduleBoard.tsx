"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import EmptyNote from "./EmptyNote";
import { ChevronLeftIcon, PinIcon } from "./Icons";
import TopBar from "./TopBar";
import UpcomingList from "./UpcomingList";
import {
  courseByCode,
  courses,
  semester,
  upcoming,
} from "@/lib/demo-data";
import { downloadIcs } from "@/lib/ics";
import {
  DAY_END,
  DAY_START,
  HOUR_PX,
  allEvents,
  courseOf,
  dayCaption,
  eventMatches,
  formatClock,
  formatRange,
  formatShortStart,
  nextClassId,
  statusFor,
  weekByNumber,
  type CalEvent,
} from "@/lib/schedule";

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, index) => DAY_START + index * 60);

function eventTop(startMin: number) {
  return ((startMin - DAY_START) / 60) * HOUR_PX;
}

function eventHeight(event: CalEvent) {
  return ((event.endMin - event.startMin) / 60) * HOUR_PX - 2;
}

export default function ScheduleBoard({ initialEventId = null }: { initialEventId?: string | null }) {
  const [week, setWeek] = useState(semester.week);
  const [view, setView] = useState<"week" | "day">("week");
  const [day, setDay] = useState(0);
  const [course, setCourse] = useState<string>("all");
  const [showStudy, setShowStudy] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialEventId || "class-m2");
  const [trackedEvent, setTrackedEvent] = useState(initialEventId);
  if (trackedEvent !== initialEventId) {
    setTrackedEvent(initialEventId);
    if (initialEventId) setSelectedId(initialEventId);
  }

  const current = weekByNumber(week);
  const events = useMemo(() => allEvents(showStudy), [showStudy]);
  const visible = events.filter((event) => eventMatches(event, course, query));
  const nextId = nextClassId(events, week);
  const selected = events.find((event) => event.id === selectedId) ?? null;
  const selectedVisible = selected && visible.some((event) => event.id === selected.id) ? selected : null;
  const gridHeight = ((DAY_END - DAY_START) / 60) * HOUR_PX;
  const showNow = week === semester.week;
  const classCount = visible.filter((event) => event.kind === "class").length;

  const openDay = (dow: number) => {
    setDay(dow);
    setView("day");
  };

  return (
    <>
      <TopBar
        eyebrow={`${semester.today} · Week ${semester.week} of Fall`}
        title="Your week"
        query={query}
        onQuery={setQuery}
        placeholder="Search classes, rooms…"
      />

      <div className="grid">
        <section className="card span-12 cal-card">
          <header className="card-head">
            <div>
              <h2>Classes</h2>
              <p className="muted">
                {course === "all" ? `${classCount} meetings this week` : `${courseByCode[course].code} · ${classCount} meetings`}
                {showStudy ? " · study blocks on Monday" : ""}
              </p>
            </div>
            <div className="cal-tools">
              <div className="week-switch">
                <button
                  type="button"
                  className="icon-btn btn3d"
                  aria-label="Previous week"
                  disabled={week <= schoolMin()}
                  onClick={() => setWeek((value) => value - 1)}
                >
                  <ChevronLeftIcon />
                </button>
                <div className="week-label">
                  <strong>{current.range}</strong>
                  <span className="muted small">Week {current.week}</span>
                </div>
                <button
                  type="button"
                  className="icon-btn btn3d flip-btn"
                  aria-label="Next week"
                  disabled={week >= schoolMax()}
                  onClick={() => setWeek((value) => value + 1)}
                >
                  <ChevronLeftIcon />
                </button>
              </div>
              <button
                type="button"
                className="btn3d btn-ghost compact"
                disabled={week === semester.week && (view === "week" || day === 0)}
                onClick={() => {
                  setWeek(semester.week);
                  setDay(0);
                }}
              >
                Today
              </button>
              <div className="seg" role="tablist" aria-label="Calendar view">
                <button type="button" role="tab" aria-selected={view === "week"} className={view === "week" ? "is-on" : ""} onClick={() => setView("week")}>
                  Week
                </button>
                <button type="button" role="tab" aria-selected={view === "day"} className={view === "day" ? "is-on" : ""} onClick={() => setView("day")}>
                  Day
                </button>
              </div>
            </div>
          </header>

          <div className="chip-row">
            <FilterChip label="All classes" color="violet" pressed={course === "all"} onClick={() => setCourse("all")} />
            {courses.map((item) => (
              <FilterChip
                key={item.code}
                label={item.code}
                color={item.color}
                pressed={course === item.code}
                onClick={() => setCourse(item.code)}
              />
            ))}
            <button
              type="button"
              className={`chip tint-violet study-toggle ${showStudy ? "is-on" : ""}`}
              aria-pressed={showStudy}
              onClick={() => setShowStudy((value) => !value)}
            >
              <span className="study-dot" />
              Study blocks
            </button>
            <button type="button" className="chip chip-quiet" onClick={() => downloadIcs(week)}>
              Download .ics
            </button>
          </div>

          {week !== semester.week && (
            <p className="peek-banner">
              Peeking at week {week}. The weekly classes repeat. Deadlines in the list below are still this week&apos;s.
            </p>
          )}

          {visible.length > 0 && <DetailStrip event={selectedVisible} week={week} dayIndex={selectedVisible?.day ?? day} />}

          {visible.length === 0 ? (
            <EmptyNote
              emoji="📭"
              title="Nothing matches."
              body="Clear the search or pick All classes and the week comes back."
            />
          ) : view === "week" ? (
            <div className="cal-scroll">
              <div className="cal" style={{ "--hour": `${HOUR_PX}px` } as CSSProperties}>
                <div className="cal-head">
                  <div />
                  {current.days.map((entry) => {
                    const isToday = showNow && entry.dow === 0;
                    const due = showNow && upcoming.some((item) => item.dueDay === entry.dow);
                    return (
                      <button
                        key={entry.iso}
                        type="button"
                        className={`cal-day ${isToday ? "is-today" : ""} ${entry.dow > 4 ? "is-weekend" : ""}`}
                        onClick={() => openDay(entry.dow)}
                      >
                        <span>
                          {entry.name}
                          {entry.month !== "Oct" || current.week === 6 || current.week === 10 ? ` ${entry.month}` : ""}
                        </span>
                        <strong>{entry.num}</strong>
                        {due && <span className="due-pip" title="Something is due" />}
                      </button>
                    );
                  })}
                </div>
                <div className="cal-main">
                  <div className="cal-hours" style={{ height: gridHeight }}>
                    {HOURS.map((minutes) => (
                      <div key={minutes} className="cal-hour" style={{ height: HOUR_PX }}>
                        {formatClock(minutes).replace(":00", "")}
                      </div>
                    ))}
                  </div>
                  <div className="cal-cols" style={{ height: gridHeight }}>
                    {current.days.map((entry) => {
                      const dayEvents = visible.filter((event) => event.day === entry.dow);
                      const isToday = showNow && entry.dow === 0;
                      return (
                        <div
                          key={entry.iso}
                          className={`cal-col ${isToday ? "is-today" : ""} ${entry.dow > 4 ? "is-weekend" : ""}`}
                        >
                          {dayEvents.length === 0 && <div className="cal-off">{entry.dow > 4 ? "No classes. Streak still counts if you study." : "Nothing scheduled."}</div>}
                          {dayEvents.map((event) => {
                            const tint = courseOf(event);
                            const status = statusFor(event, week, nextId);
                            const selectedOn = event.id === selectedId;
                            const height = eventHeight(event);
                            const short = height < 36;
                            const title = event.kind === "class" ? event.course : event.course || "Break";
                            return (
                              <button
                                key={event.id}
                                type="button"
                                className={`cal-event tint-${tint?.color ?? "neutral"} kind-${event.kind} is-${status} ${selectedOn ? "is-selected" : ""} ${short ? "is-short" : ""}`}
                                style={{ top: eventTop(event.startMin) + 2, height }}
                                title={event.kind === "class" ? `${event.course} · ${event.label}` : event.label}
                                onClick={() => setSelectedId(event.id)}
                              >
                                <span className="cal-event-title">{title}</span>
                                {!short && (
                                  <span className="cal-event-meta">{formatRange(event.startMin, event.endMin)}</span>
                                )}
                                {!short && event.kind === "class" && height > 72 && (
                                  <span className="cal-event-meta">{event.where}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  {showNow && (
                    <div className="cal-now" style={{ top: eventTop(semester.todayMinutes) + 4 }} title="Now · 11:24 AM">
                      <span>Now</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <DayAgenda
              day={day}
              days={current.days}
              events={visible.filter((event) => event.day === day)}
              week={week}
              nextId={nextId}
              selectedId={selectedId}
              onDay={setDay}
              onSelect={setSelectedId}
            />
          )}
        </section>

        <div className="span-7">
          <UpcomingList />
        </div>

        <WeekSnapshot
          onJump={(id, dow) => {
            setSelectedId(id);
            setDay(dow);
            setCourse("all");
            setQuery("");
          }}
        />
      </div>

      <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
    </>
  );
}

function schoolMin() {
  return 6;
}
function schoolMax() {
  return 10;
}

function FilterChip({
  label,
  color,
  pressed,
  onClick,
}: {
  label: string;
  color: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`chip tint-${color} ${pressed ? "is-on" : ""}`} aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  );
}

function DetailStrip({ event, week, dayIndex }: { event: CalEvent | null; week: number; dayIndex: number }) {
  if (!event) {
    return (
      <div className="detail-strip is-empty">
        <EmptyNote emoji="👆" title="Select a block." body="Room, professor, and what's due show up here." />
      </div>
    );
  }
  const course = courseOf(event);
  const day = weekByNumber(week).days[dayIndex];
  const due = course ? upcoming.find((item) => item.course === course.code) : null;
  const status = statusFor(event, week, nextClassId(allEvents(true), week));
  return (
    <div className={`detail-strip tint-${course?.color ?? "neutral"}`}>
      <div className="detail-main">
        <div className="detail-kicker">
          {event.kind === "class" ? (
            <span className={`pill tint-${course?.color}`}>{event.course}</span>
          ) : (
            <span className="pill tint-neutral">Study block</span>
          )}
          {status === "now" && <span className="live">● Now</span>}
          {status === "next" && <span className="next">Up next</span>}
          {status === "done" && week === semester.week && <span className="muted small">Already met</span>}
        </div>
        <div className="detail-title">{event.kind === "class" ? course?.name : event.label}</div>
        <div className="detail-meta muted">
          {dayCaption(day)} · {formatRange(event.startMin, event.endMin)} · {event.minutes} min
        </div>
        <div className="tl-where muted">
          <PinIcon /> {event.where}
          {course ? ` · ${course.professor}` : ""}
        </div>
      </div>
      <div className="detail-side">
        {due && (
          <div className="detail-due">
            <span className="muted small">Due this week</span>
            <strong>
              <Link href={`/assignments/${due.id}`} className="quiet-link">
                {due.title}
              </Link>
            </strong>
            <span className={`due due-${due.urgency}`}>{due.due}</span>
          </div>
        )}
        {course && (
          <Link href={`/courses/${course.slug}`} className="btn3d btn-soft compact">
            Open course
          </Link>
        )}
      </div>
    </div>
  );
}

function DayAgenda({
  day,
  days,
  events,
  week,
  nextId,
  selectedId,
  onDay,
  onSelect,
}: {
  day: number;
  days: { name: string; num: string; month: string; iso: string; dow: number }[];
  events: CalEvent[];
  week: number;
  nextId: string | null;
  selectedId: string;
  onDay: (day: number) => void;
  onSelect: (id: string) => void;
}) {
  const ordered = [...events].sort((a, b) => a.startMin - b.startMin);
  return (
    <div className="day-agenda">
      <div className="day-strip" role="tablist" aria-label="Day">
        {days.map((entry) => (
          <button
            key={entry.iso}
            type="button"
            role="tab"
            aria-selected={entry.dow === day}
            className={`day-pill ${entry.dow === day ? "is-on" : ""} ${week === semester.week && entry.dow === 0 ? "is-today" : ""}`}
            onClick={() => onDay(entry.dow)}
          >
            <span>{entry.name}</span>
            <strong>{entry.num}</strong>
          </button>
        ))}
      </div>
      {ordered.length === 0 ? (
        <EmptyNote
          emoji="🌤️"
          title="Nothing on this day."
          body={day > 4 ? "Weekend. The streak still counts if you open a book." : "No class and no study block with this filter."}
        />
      ) : (
        <ol className="timeline">
          {ordered.map((event) => {
            const course = courseOf(event);
            const status = statusFor(event, week, nextId);
            return (
              <li key={event.id} className={`tl-item status-${status} tint-${course?.color ?? "neutral"} ${event.id === selectedId ? "is-selected" : ""}`}>
                <div className="tl-time">
                  <strong>{formatShortStart(event.startMin)}</strong>
                  <span>{formatClock(event.endMin)}</span>
                </div>
                <div className="tl-dot" />
                <button type="button" className="tl-card tl-btn" onClick={() => onSelect(event.id)}>
                  <div className="tl-title">
                    <span className={`pill tint-${course?.color ?? "neutral"}`}>{event.kind === "class" ? event.course : "Plan"}</span>
                    {status === "now" && <span className="live">● Now</span>}
                    {status === "next" && <span className="next">Up next</span>}
                  </div>
                  <div className="tl-name">{event.kind === "class" ? course?.name : event.label}</div>
                  <div className="tl-where muted">
                    <PinIcon /> {event.where}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function WeekSnapshot({ onJump }: { onJump: (id: string, dow: number) => void }) {
  const classes = allEvents(false);
  const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const onDay = (dow: number) =>
    classes.filter((event) => event.day === dow).sort((a, b) => a.startMin - b.startMin);
  const counts = [0, 1, 2, 3, 4].map((dow) => ({ dow, count: onDay(dow).length, first: onDay(dow)[0] }));
  const busiest = counts.reduce((best, row) => (row.count > best.count ? row : best), counts[0]);
  const lightest = counts.reduce((best, row) => (row.count < best.count ? row : best), counts[0]);
  const next = onDay(0).find((event) => event.startMin > semester.todayMinutes);
  const studyMinutes = allEvents(true)
    .filter((event) => event.kind === "study")
    .reduce((sum, event) => sum + event.minutes, 0);
  const lightNames = onDay(lightest.dow).map((event) => event.course);

  return (
    <section className="card span-5 snapshot">
      <header className="card-head">
        <div>
          <h2>This week</h2>
          <p className="muted">Monday is doing the heavy lifting</p>
        </div>
      </header>
      <ul className="snap-list">
        {next && (
          <li>
            <button type="button" className="snap-row tint-mint" onClick={() => onJump(next.id, 0)}>
              <span className="stat-emoji">⏭️</span>
              <span>
                <strong>Next up · {next.course}</strong>
                <span className="muted small">
                  Today · {formatClock(next.startMin)} · {next.where}
                </span>
              </span>
            </button>
          </li>
        )}
        <li>
          <button type="button" className="snap-row tint-violet" onClick={() => busiest.first && onJump(busiest.first.id, busiest.dow)}>
            <span className="stat-emoji">📚</span>
            <span>
              <strong>Busiest · {names[busiest.dow]}</strong>
              <span className="muted small">{busiest.count} classes on the schedule</span>
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="snap-row tint-sun" onClick={() => lightest.first && onJump(lightest.first.id, lightest.dow)}>
            <span className="stat-emoji">🌤️</span>
            <span>
              <strong>Lightest · {names[lightest.dow]}</strong>
              <span className="muted small">
                {lightest.count} {lightest.count === 1 ? "class" : "classes"} · {lightNames.join(", ")}
              </span>
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="snap-row tint-coral" onClick={() => onJump("study-0", 0)}>
            <span className="stat-emoji">⏱️</span>
            <span>
              <strong>
                {Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m blocked tonight
              </strong>
              <span className="muted small">English draft, then problem set 4</span>
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}

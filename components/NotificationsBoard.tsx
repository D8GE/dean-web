"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyNote from "./EmptyNote";
import FootNote from "./FootNote";
import TopBar from "./TopBar";
import { useHub } from "./HubProvider";
import { inboxFor } from "@/lib/hub";
import { useInbox } from "./useInbox";

export default function NotificationsBoard() {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const hub = useHub();
  const inbox = inboxFor(hub);
  const { notes, hiddenCount, hide, hideAll, restore } = useInbox();
  const q = query.trim().toLowerCase();
  const shown = notes.filter((note) => !q || [note.title, note.detail, note.when].join(" ").toLowerCase().includes(q));

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <>
      <TopBar
        eyebrow={`${hub.semester.today} · ${inbox.length} ${hub.source === "live" ? "in the inbox" : "in the demo inbox"}`}
        title="Notifications"
        query={query}
        onQuery={setQuery}
        placeholder="Search notifications…"
      />

      <div className="toolbar-line">
        <button type="button" className="btn3d btn-ghost compact" onClick={refresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
        {notes.length > 0 && (
          <button type="button" className="btn3d btn-soft compact" onClick={hideAll}>
            Dismiss all
          </button>
        )}
        {hiddenCount > 0 && (
          <button type="button" className="btn3d btn-ghost compact" onClick={restore}>
            Restore {hiddenCount}
          </button>
        )}
      </div>

      {refreshing ? (
        <section className="card" aria-busy="true" aria-live="polite">
          <div className="skel skel-line title" />
          <div className="skel skel-line" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
          <p className="sr-only">Refreshing notifications</p>
        </section>
      ) : shown.length === 0 ? (
        <section className="card">
          <EmptyNote
            emoji={notes.length === 0 ? "✨" : "🔍"}
            title={notes.length === 0 ? "You're caught up." : "Nothing matches."}
            body={
              notes.length === 0
                ? "Dismissed notes stay gone on this browser until you restore them."
                : "Clear the search. Dismissed notes are hidden until you restore them."
            }
          />
          {notes.length === 0 && hiddenCount > 0 && (
            <button type="button" className="btn3d btn-primary" onClick={restore}>
              Restore notifications
            </button>
          )}
        </section>
      ) : (
        <ul className="inbox-list">
          {shown.map((note) => (
            <li key={note.id} className="note-line">
              <Link href={note.href} className={`note-row tint-${note.color}`}>
                <span className="note-when">{note.when}</span>
                <span className="note-title">{note.title}</span>
                <span className="muted small">{note.detail}</span>
              </Link>
              <button type="button" className="btn3d btn-ghost compact" onClick={() => hide(note.id)}>
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      )}

      <FootNote />
    </>
  );
}

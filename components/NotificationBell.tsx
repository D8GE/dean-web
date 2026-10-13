"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "./Icons";
import { useInbox } from "./useInbox";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { notes } = useInbox();
  const preview = notes.slice(0, 4);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const countLabel = notes.length === 0 ? "Caught up" : `${notes.length} new`;

  return (
    <div className="bell-wrap" ref={wrap}>
      <button
        type="button"
        className="icon-btn btn3d"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((value) => !value);
          setSeen(true);
        }}
      >
        <BellIcon />
        {!seen && notes.length > 0 && <span className="dot" />}
      </button>
      {open && (
        <div className="note-pop" role="menu">
          <div className="note-pop-head">
            <strong>Notifications</strong>
            <span className="muted small">{countLabel}</span>
          </div>
          {preview.length === 0 ? (
            <div className="note-row">
              <span className="note-title">You&apos;re caught up.</span>
              <span className="muted small">Dismissed notes can be restored on the inbox.</span>
            </div>
          ) : (
            preview.map((note) => (
              <Link
                key={note.id}
                href={note.href}
                className={`note-row tint-${note.color}`}
                onClick={() => setOpen(false)}
              >
                <span className="note-when">{note.when}</span>
                <span className="note-title">{note.title}</span>
                <span className="muted small">{note.detail}</span>
              </Link>
            ))
          )}
          <Link href="/notifications" className="suggest-all" onClick={() => setOpen(false)}>
            Open notifications
          </Link>
        </div>
      )}
    </div>
  );
}

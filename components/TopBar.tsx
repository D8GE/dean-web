"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BellIcon, SearchIcon } from "./Icons";
import { useHub } from "./HubProvider";

export default function TopBar({
  eyebrow,
  title,
  query,
  onQuery,
  placeholder,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  query: string;
  onQuery: (value: string) => void;
  placeholder: string;
}) {
  const { notifications, student } = useHub();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

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

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <label className="search">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          {query && (
            <button type="button" className="search-clear" onClick={() => onQuery("")} aria-label="Clear search">
              ×
            </button>
          )}
        </label>
        <div className="bell-wrap" ref={wrap}>
          <button
            type="button"
            className="icon-btn btn3d"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setSeen(true);
            }}
          >
            <BellIcon />
            {!seen && <span className="dot" />}
          </button>
          {open && (
            <div className="note-pop" role="menu">
              <div className="note-pop-head">
                <strong>Notifications</strong>
                <span className="muted small">{notifications.length} new</span>
              </div>
              {notifications.map((note) => (
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
              ))}
            </div>
          )}
        </div>
        <Link href="/settings" className="me" aria-label="Settings">
          {student.initials}
        </Link>
      </div>
    </header>
  );
}

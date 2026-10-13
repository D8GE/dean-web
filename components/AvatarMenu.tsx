"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Overlay from "./Overlay";
import { student } from "@/lib/demo-data";

const links = [
  { href: "/profile", label: "Profile", detail: "Major, streak, badges" },
  { href: "/assignments", label: "Work", detail: "Open and graded" },
  { href: "/grades", label: "Grades", detail: "Gradebook and what-if" },
  { href: "/notifications", label: "Notifications", detail: "The inbox" },
  { href: "/settings", label: "Settings", detail: "Reminders and focus length" },
];

export default function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const [signOut, setSignOut] = useState(false);
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
    <div className="menu-wrap" ref={wrap}>
      <button
        type="button"
        className="me"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {student.initials}
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <div className="menu-id">
            <strong>
              {student.firstName} {student.lastName}
            </strong>
            <span className="muted small">
              {student.year} · {student.major}
            </span>
          </div>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="menu-row" role="menuitem" onClick={() => setOpen(false)}>
              <span>{item.label}</span>
              <span className="muted small">{item.detail}</span>
            </Link>
          ))}
          <button
            type="button"
            className="menu-row menu-signout"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setSignOut(true);
            }}
          >
            <span>Sign out</span>
            <span className="muted small">Demo account</span>
          </button>
        </div>
      )}
      {signOut && (
        <Overlay title="Still signed in" kicker="This demo doesn't have accounts to leave." onClose={() => setSignOut(false)}>
          <p className="dialog-copy">
            Jacob stays on this browser. Canvas isn&apos;t connected, and there&apos;s no second student to switch to.
          </p>
          <div className="status-actions">
            <Link href="/profile" className="btn3d btn-primary" onClick={() => setSignOut(false)}>
              View profile
            </Link>
            <button type="button" className="btn3d btn-ghost" onClick={() => setSignOut(false)}>
              Stay here
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

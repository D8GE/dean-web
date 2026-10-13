"use client";

import type { ReactNode } from "react";
import AvatarMenu from "./AvatarMenu";
import NotificationBell from "./NotificationBell";
import SearchField from "./SearchField";

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
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <SearchField value={query} onValue={onQuery} placeholder={placeholder} />
        <NotificationBell />
        <AvatarMenu />
      </div>
    </header>
  );
}

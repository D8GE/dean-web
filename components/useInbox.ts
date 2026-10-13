"use client";

import { useCallback, useEffect, useState } from "react";
import { inbox, type InboxNote } from "@/lib/hub";

const KEY = "dean-inbox-hidden";
const EVENT = "dean-inbox";

function readHidden(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeHidden(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function useInbox() {
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setHidden(readHidden());
    // localStorage is only available on the client.
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const hide = useCallback((id: string) => {
    const next = Array.from(new Set([...readHidden(), id]));
    writeHidden(next);
  }, []);

  const hideAll = useCallback(() => {
    writeHidden(inbox.map((note) => note.id));
  }, []);

  const restore = useCallback(() => {
    writeHidden([]);
  }, []);

  const notes: InboxNote[] = inbox.filter((note) => !hidden.includes(note.id));
  return { notes, hiddenCount: hidden.length, hide, hideAll, restore };
}

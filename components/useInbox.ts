"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useHub } from "./HubProvider";
import { inboxFor, type InboxNote } from "@/lib/hub";

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
  const hub = useHub();
  const inbox = useMemo(() => inboxFor(hub), [hub]);
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
  }, [inbox]);

  const restore = useCallback(() => {
    writeHidden([]);
  }, []);

  const notes: InboxNote[] = inbox.filter((note) => !hidden.includes(note.id));
  return { notes, hiddenCount: hidden.length, hide, hideAll, restore };
}

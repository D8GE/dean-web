"use client";

import { useHub } from "./HubProvider";

export default function FootNote() {
  const { source } = useHub();
  const label = source === "live" ? "live from Canvas" : "demo data only";
  return <footer className="foot muted small">Dean V0 prototype · {label}</footer>;
}

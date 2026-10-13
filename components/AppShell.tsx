"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "dean-sidebar-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((open) => !open)} />
      {children}
    </div>
  );
}

"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "dean-sidebar-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  // Width animation stays off until the saved preference is applied, so a
  // reload doesn't expand and then collapse.
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available on the client
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!animate) return;
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [animate, collapsed]);

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""} ${animate ? "is-animated" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => {
          setAnimate(true);
          setCollapsed((open) => !open);
        }}
      />
      {children}
    </div>
  );
}

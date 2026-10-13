"use client";

import { useState } from "react";
import DeanAvatar from "./DeanAvatar";
import { BookIcon, CalendarIcon, ChartIcon, ChevronLeftIcon, GearIcon, HomeIcon, SparkIcon } from "./Icons";
import { student } from "@/lib/demo-data";

const nav = [
  { label: "Home", icon: HomeIcon, color: "violet" },
  { label: "Schedule", icon: CalendarIcon, color: "sky" },
  { label: "Courses", icon: BookIcon, color: "mint" },
  { label: "Grades", icon: ChartIcon, color: "sun" },
  { label: "Dean", icon: SparkIcon, color: "coral" },
] as const;

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  // Visual-only for V0: highlights the clicked item, no real routing yet.
  const [active, setActive] = useState("Home");

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeftIcon />
      </button>

      <div className="sidebar-inner">
        <div className="brand">
          <DeanAvatar size={44} />
          <div className="brand-copy">
            <div className="brand-name">Dean</div>
            <div className="brand-sub">your school hub</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main">
          {nav.map(({ label, icon: Icon, color }) => (
            <a
              key={label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActive(label);
              }}
              className={`nav-item tint-${color} ${active === label ? "is-active" : ""} ${label === "Dean" ? "has-badge" : ""}`}
              aria-current={active === label ? "page" : undefined}
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon">
                <Icon />
              </span>
              <span className="nav-label">{label}</span>
              {label === "Dean" && <span className="nav-badge">2</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="streak-mini" title={collapsed ? `${student.streakDays} day streak` : undefined}>
            <span className="streak-mini-flame">🔥</span>
            <div className="streak-copy">
              <div className="streak-mini-num">{student.streakDays} days</div>
              <div className="streak-mini-sub">Keep it lit tonight</div>
            </div>
          </div>
          <a href="#" className="nav-item subtle" title={collapsed ? "Settings" : undefined} onClick={(e) => e.preventDefault()}>
            <span className="nav-icon">
              <GearIcon />
            </span>
            <span className="nav-label">Settings</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

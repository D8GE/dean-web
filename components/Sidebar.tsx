"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DeanAvatar from "./DeanAvatar";
import { BookIcon, CalendarIcon, ChartIcon, ChevronLeftIcon, GearIcon, HomeIcon, SparkIcon } from "./Icons";
import { useHub } from "./HubProvider";

const nav = [
  { label: "Home", href: "/", icon: HomeIcon, color: "violet" },
  { label: "Schedule", href: "/schedule", icon: CalendarIcon, color: "sky" },
  { label: "Courses", href: "/courses", icon: BookIcon, color: "mint" },
  { label: "Grades", href: "/grades", icon: ChartIcon, color: "sun" },
  // Dean stays a visual tab. No page — the auto-scheduler isn't built yet.
  { label: "Dean", href: "", icon: SparkIcon, color: "coral" },
] as const;

function isCurrent(pathname: string, href: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const settingsOn = isCurrent(pathname, "/settings");
  const { source, sourceNote, student } = useHub();

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
        <Link href="/" className="brand">
          <DeanAvatar size={44} />
          <div className="brand-copy">
            <div className="brand-name">Dean</div>
            <div className="brand-sub">your school hub</div>
          </div>
        </Link>

        <nav className="nav" aria-label="Main">
          {nav.map(({ label, href, icon: Icon, color }) => {
            const active = isCurrent(pathname, href);
            const className = `nav-item tint-${color} ${active ? "is-active" : ""} ${label === "Dean" ? "has-badge" : ""}`;
            const inner = (
              <>
                <span className="nav-icon">
                  <Icon />
                </span>
                <span className="nav-label">{label}</span>
                {label === "Dean" && <span className="nav-badge">2</span>}
              </>
            );
            if (!href) {
              return (
                <a
                  key={label}
                  href="#dean"
                  onClick={(event) => event.preventDefault()}
                  className={className}
                  title={collapsed ? label : undefined}
                >
                  {inner}
                </a>
              );
            }
            return (
              <Link
                key={label}
                href={href}
                className={className}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <p
            className={`source-pill ${source === "live" ? "is-live" : ""}`}
            data-source={source}
            title={source === "live" ? "Reading Canvas" : sourceNote}
          >
            <i />
            <span className="source-label">{source === "live" ? "Live" : "Demo"}</span>
          </p>
          <div className="streak-mini" title={collapsed ? `${student.streakDays} day streak` : undefined}>
            <span className="streak-mini-flame">🔥</span>
            <div className="streak-copy">
              <div className="streak-mini-num">{student.streakDays} days</div>
              <div className="streak-mini-sub">Keep it lit tonight</div>
            </div>
          </div>
          <Link
            href="/settings"
            className={`nav-item subtle ${settingsOn ? "is-active" : ""}`}
            aria-current={settingsOn ? "page" : undefined}
            title={collapsed ? "Settings" : undefined}
          >
            <span className="nav-icon">
              <GearIcon />
            </span>
            <span className="nav-label">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

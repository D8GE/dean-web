"use client";

import Overlay from "./Overlay";
import { useHub } from "./HubProvider";
import { badgeCopy } from "@/lib/surface-copy";

export default function BadgeDialog({ active, onClose }: { active: string | null; onClose: () => void }) {
  const { badges } = useHub();
  return (
    <Overlay title="Badges" kicker="Five on the board. Three are lit." onClose={onClose}>
      <ul className="badge-list">
        {badges.map((badge) => (
          <li key={badge.label} className={`badge-row ${badge.label === active ? "is-active" : ""} ${badge.unlocked ? "" : "is-locked"}`}>
            <span className={`badge ${badge.unlocked ? "" : "locked"}`} aria-hidden="true">
              {badge.emoji}
            </span>
            <span>
              <strong>{badge.label}</strong>
              <span className={`pill ${badge.unlocked ? "tint-mint" : "tint-neutral"}`}>{badge.unlocked ? "Unlocked" : "Locked"}</span>
              <p className="muted small">{badgeCopy[badge.label]}</p>
            </span>
          </li>
        ))}
      </ul>
    </Overlay>
  );
}

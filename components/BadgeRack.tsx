"use client";

import { useState } from "react";
import BadgeDialog from "./BadgeDialog";
import { useHub } from "./HubProvider";

export default function BadgeRack() {
  const { badges } = useHub();
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="badges">
        {badges.map((badge) => (
          <button
            key={badge.label}
            type="button"
            className={`badge ${badge.unlocked ? "" : "locked"}`}
            title={badge.label}
            aria-label={`${badge.label}${badge.unlocked ? "" : ", locked"}`}
            onClick={() => setActive(badge.label)}
          >
            {badge.emoji}
          </button>
        ))}
      </div>
      {active && <BadgeDialog active={active} onClose={() => setActive(null)} />}
    </>
  );
}

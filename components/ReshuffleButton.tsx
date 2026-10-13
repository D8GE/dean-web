"use client";

import Link from "next/link";
import { useState } from "react";
import Overlay from "./Overlay";
import { useHub } from "./HubProvider";

export default function ReshuffleButton() {
  const { courseByCode, deansPlan, source } = useHub();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn3d btn-soft full" onClick={() => setOpen(true)}>
        Reshuffle with Dean
      </button>
      {open && (
        <Overlay
          title="Tonight's plan stays put"
          kicker="The auto-scheduler isn't on the Dean tab yet, so these blocks don't move."
          onClose={() => setOpen(false)}
        >
          <ul className="plan">
            {deansPlan.map((block) => {
              const course = block.course ? courseByCode[block.course] : null;
              return (
                <li key={block.time} className={`plan-item tint-${course ? course.color : "neutral"}`}>
                  <span className="plan-time">{block.time}</span>
                  <div className="plan-block">
                    <div className="plan-label">{block.label}</div>
                    <div className="plan-meta muted">
                      {course ? course.code : "Recharge"} · {block.minutes} min
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="status-actions">
            <Link href="/focus?block=0" className="btn3d btn-primary" onClick={() => setOpen(false)}>
              {source === "live" ? `Start the ${deansPlan[0]?.time ?? "next"} block` : "Start the 3:30 block"}
            </Link>
            <Link href="/schedule?event=study-0" className="btn3d btn-ghost" onClick={() => setOpen(false)}>
              Show on the calendar
            </Link>
          </div>
        </Overlay>
      )}
    </>
  );
}

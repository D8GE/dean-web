"use client";

export default function PlanScrollButton() {
  return (
    <button
      type="button"
      className="btn3d btn-ghost"
      onClick={() => document.getElementById("tonight")?.scrollIntoView({ behavior: "smooth", block: "start" })}
    >
      See today&apos;s plan
    </button>
  );
}

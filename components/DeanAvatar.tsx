"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";

type Props = {
  size?: number;
  className?: string;
};

const MAX_LOOK = 18;
const REST_LOOK = { x: 10, y: -16 };
const TRACK_EASE = 0.12;
const REST_EASE = 0.045;

/** Dean, drawn like a Grok Bot: one flat shape, a pair of eyes, and a mortarboard. */
export default function DeanAvatar({ size = 96, className = "" }: Props) {
  const clipId = `dean-face-${useId().replace(/:/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const target = useRef({ ...REST_LOOK });
  const current = useRef({ ...REST_LOOK });
  const frame = useRef(0);

  useEffect(() => {
    return () => cancelAnimationFrame(frame.current);
  }, []);

  function apply(x: number, y: number) {
    eyesRef.current?.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  }

  function step() {
    const returning =
      target.current.x === REST_LOOK.x && target.current.y === REST_LOOK.y;
    const ease = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 1
      : returning
        ? REST_EASE
        : TRACK_EASE;
    current.current.x += (target.current.x - current.current.x) * ease;
    current.current.y += (target.current.y - current.current.y) * ease;
    const dx = target.current.x - current.current.x;
    const dy = target.current.y - current.current.y;
    if (Math.hypot(dx, dy) < 0.04) {
      current.current = { ...target.current };
      apply(current.current.x, current.current.y);
      frame.current = 0;
      return;
    }
    apply(current.current.x, current.current.y);
    frame.current = requestAnimationFrame(step);
  }

  function aim(x: number, y: number) {
    target.current = { x, y };
    if (!frame.current) frame.current = requestAnimationFrame(step);
  }

  function onMove(event: MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = 120 / rect.width;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + (68 / 120) * rect.height;
    const dx = (event.clientX - cx) * scale;
    const dy = (event.clientY - cy) * scale;
    const dist = Math.hypot(dx, dy) || 1;
    const influence = Math.min(1, dist / 36);
    aim((dx / dist) * MAX_LOOK * influence, (dy / dist) * MAX_LOOK * influence);
  }

  return (
    <svg
      ref={svgRef}
      className={`dean-avatar ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Dean, your study coach"
      onMouseMove={onMove}
      onMouseLeave={() => aim(REST_LOOK.x, REST_LOOK.y)}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="60" cy="68" r="48" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <circle className="dean-face" cx="60" cy="68" r="48" fill="#6C5CE7" />
        <g
          ref={eyesRef}
          className="dean-eyes"
          transform={`translate(${REST_LOOK.x} ${REST_LOOK.y})`}
        >
          <rect x="44.5" y="64" width="12" height="19" rx="6" fill="#FFFFFF" />
          <rect x="64.5" y="64" width="12" height="19" rx="6" fill="#FFFFFF" />
        </g>
      </g>

      <g className="dean-cap">
        <path d="M40 30 L40 38 Q60 46 80 38 L80 30 Z" fill="#2B2547" />
        <path d="M60 8 L98 24 L60 40 L22 24 Z" fill="#3A3170" />
        <circle cx="60" cy="24" r="2.3" fill="#FFC83D" />
        <path
          d="M60 24 L90 28 L90 38"
          stroke="#FFC83D"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="87" y="36" width="6.5" height="8" rx="2.4" fill="#FFC83D" />
      </g>
    </svg>
  );
}

export default function GradeRing({
  value,
  color,
  label,
  size = 56,
}: {
  value: number;
  color: string;
  label: string;
  size?: number;
}) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 56 56" className={`ring tint-${color}`}>
        <circle cx="28" cy="28" r={r} className="ring-track" />
        <circle
          cx="28"
          cy="28"
          r={r}
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, value)) / 100)}
        />
      </svg>
      <span className="ring-letter" style={{ fontSize: size < 64 ? 15 : 22 }}>
        {label}
      </span>
    </div>
  );
}

type IconProps = { className?: string };

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></svg>
);
export const CalendarIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="4.5" width="18" height="16" rx="3.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /><circle cx="8.5" cy="14" r="0.6" fill="currentColor" /><circle cx="12" cy="14" r="0.6" fill="currentColor" /><circle cx="15.5" cy="14" r="0.6" fill="currentColor" /></svg>
);
export const BookIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /><path d="M9 8h7M9 11.5h5" /></svg>
);
export const ChartIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const SparkIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" /><path d="M19 17.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>
);
export const GearIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const BellIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
);
export const PinIcon = ({ className }: IconProps) => (
  <svg {...base} width={16} height={16} className={className}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} width={16} height={16} strokeWidth={3} className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const PlayIcon = ({ className }: IconProps) => (
  <svg {...base} width={18} height={18} className={className}><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
);
export const ChevronLeftIcon = ({ className }: IconProps) => (
  <svg {...base} width={16} height={16} strokeWidth={2.6} className={className}><path d="M14 6 8 12l6 6" /></svg>
);

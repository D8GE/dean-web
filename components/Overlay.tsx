"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export default function Overlay({
  title,
  kicker,
  onClose,
  children,
}: {
  title: string;
  kicker?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div
        className="card overlay-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="card-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {kicker && <p className="muted">{kicker}</p>}
          </div>
          <button ref={closeRef} type="button" className="btn3d btn-ghost compact" onClick={onClose}>
            Close
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./Icons";
import { searchHub, type HubHit } from "@/lib/hub";

export default function SearchField({
  value,
  onValue,
  placeholder,
}: {
  value?: string;
  onValue?: (value: string) => void;
  placeholder: string;
}) {
  const router = useRouter();
  const [inner, setInner] = useState("");
  const query = value ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const listId = useId();
  const hits = searchHub(query).slice(0, 6);

  const setQuery = (next: string) => {
    onValue?.(next);
    if (value === undefined) setInner(next);
    setActive(null);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!anchor.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [open]);

  const goToSearch = () => {
    const href = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
    setOpen(false);
    router.push(href);
  };

  const goToHit = (hit: HubHit) => {
    setOpen(false);
    router.push(hit.href);
  };

  const show = open && query.trim().length > 0;

  return (
    <div className="search-anchor" ref={anchor}>
      <label className="search">
        <SearchIcon />
        <input
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-controls={show ? listId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && hits.length) {
              event.preventDefault();
              setOpen(true);
              setActive((current) => (current === null ? 0 : Math.min(hits.length - 1, current + 1)));
            } else if (event.key === "ArrowUp" && hits.length) {
              event.preventDefault();
              setActive((current) => (current === null ? 0 : Math.max(0, current - 1)));
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (active !== null && hits[active]) goToHit(hits[active]);
              else goToSearch();
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {query && (
          <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            ×
          </button>
        )}
      </label>
      {show && (
        <div className="search-pop" id={listId} role="listbox" aria-label="Search suggestions">
          {hits.length === 0 ? (
            <p className="suggest-empty">Nothing on this pass. Enter opens the full search.</p>
          ) : (
            hits.map((hit, index) => (
              <Link
                key={`${hit.kind}-${hit.id}`}
                href={hit.href}
                role="option"
                aria-selected={active === index}
                className={`suggest-row tint-${hit.color} ${active === index ? "is-on" : ""}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => setOpen(false)}
              >
                <span className={`pill tint-${hit.color}`}>{hit.kind}</span>
                <span className="suggest-copy">
                  <span className="suggest-title">{hit.title}</span>
                  <span className="muted small">{hit.detail}</span>
                </span>
              </Link>
            ))
          )}
          <button type="button" className="suggest-all" onClick={goToSearch}>
            {query.trim() ? `Search all of Dean for “${query.trim()}”` : "Search all of Dean"}
          </button>
        </div>
      )}
    </div>
  );
}

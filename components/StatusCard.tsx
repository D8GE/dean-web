import type { ReactNode } from "react";

export default function StatusCard({
  emoji,
  title,
  body,
  children,
}: {
  emoji: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <main className="main">
      <div className="status-wrap">
        <section className="card status-card">
          <div className="empty-note">
            <span aria-hidden="true">{emoji}</span>
            <div>
              <h1>{title}</h1>
              <p className="muted">{body}</p>
            </div>
          </div>
          {children && <div className="status-actions">{children}</div>}
          <footer className="foot muted small">Dean V0 prototype · demo data only</footer>
        </section>
      </div>
    </main>
  );
}

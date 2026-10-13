export default function LoadingScreen({ label = "Loading Dean…" }: { label?: string }) {
  return (
    <main className="main" aria-busy="true" aria-live="polite">
      <header className="topbar">
        <div>
          <div className="skel skel-line short" />
          <div className="skel skel-line title" />
        </div>
        <div className="topbar-right">
          <div className="skel skel-search" />
          <div className="skel skel-sq" />
          <div className="skel skel-sq" />
        </div>
      </header>
      <div className="grid">
        <div className="card span-8 skel-block tall" />
        <div className="card span-4 skel-block tall" />
        <div className="card span-12 skel-block" />
      </div>
      <p className="sr-only">{label}</p>
    </main>
  );
}

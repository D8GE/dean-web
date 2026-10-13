"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#ffffff",
          color: "#1f1b3a",
          fontFamily: 'ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            border: "2px solid #eeedf5",
            borderRadius: 22,
            padding: 24,
          }}
        >
          <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Dean hit a wall.</h1>
          <p style={{ margin: "0 0 18px", fontWeight: 650, lineHeight: 1.45 }}>
            The shell didn&apos;t load. Try again, and the week should come back.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 14,
              padding: "12px 18px",
              fontWeight: 800,
              background: "#6c5ce7",
              color: "#fff",
              boxShadow: "0 4px 0 #4f3fc9",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

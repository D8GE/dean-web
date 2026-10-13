"use client";

import Link from "next/link";
import { useEffect } from "react";
import StatusCard from "@/components/StatusCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusCard
      emoji="🛠️"
      title="That page didn't come through."
      body="Your courses are still on the home screen. Try this page again, or head back and pick up the week from there."
    >
      <button type="button" className="btn3d btn-primary" onClick={reset}>
        Try again
      </button>
      <Link href="/" className="btn3d btn-ghost">
        Back home
      </Link>
    </StatusCard>
  );
}

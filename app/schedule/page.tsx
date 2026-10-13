import type { Metadata } from "next";
import ScheduleBoard from "@/components/ScheduleBoard";

export const metadata: Metadata = { title: "Schedule · Dean" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;
  return (
    <main className="main">
      <ScheduleBoard initialEventId={event ?? null} />
    </main>
  );
}

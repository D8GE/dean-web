import type { Metadata } from "next";
import ScheduleBoard from "@/components/ScheduleBoard";

export const metadata: Metadata = { title: "Schedule · Dean" };

export default function SchedulePage() {
  return (
    <main className="main">
      <ScheduleBoard />
    </main>
  );
}

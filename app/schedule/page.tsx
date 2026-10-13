import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ScheduleBoard from "@/components/ScheduleBoard";

export const metadata: Metadata = { title: "Schedule · Dean" };

export default function SchedulePage() {
  return (
    <AppShell>
      <main className="main">
        <ScheduleBoard />
      </main>
    </AppShell>
  );
}

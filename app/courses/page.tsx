import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import CoursesBoard from "@/components/CoursesBoard";

export const metadata: Metadata = { title: "Courses · Dean" };

export default function CoursesPage() {
  return (
    <AppShell>
      <main className="main">
        <CoursesBoard />
      </main>
    </AppShell>
  );
}

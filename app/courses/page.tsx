import type { Metadata } from "next";
import CoursesBoard from "@/components/CoursesBoard";

export const metadata: Metadata = { title: "Courses · Dean" };

export default function CoursesPage() {
  return (
    <main className="main">
      <CoursesBoard />
    </main>
  );
}

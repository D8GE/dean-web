import type { Metadata } from "next";
import AssignmentsBoard from "@/components/AssignmentsBoard";

export const metadata: Metadata = { title: "Work · Dean" };

export default function AssignmentsPage() {
  return (
    <main className="main">
      <AssignmentsBoard />
    </main>
  );
}

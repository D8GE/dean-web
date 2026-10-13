import type { Metadata } from "next";
import ProfileBoard from "@/components/ProfileBoard";
import { student } from "@/lib/demo-data";

export const metadata: Metadata = { title: `${student.firstName} ${student.lastName} · Dean` };

export default function ProfilePage() {
  return (
    <main className="main">
      <ProfileBoard />
    </main>
  );
}

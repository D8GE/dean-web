import type { Metadata } from "next";
import ProfileBoard from "@/components/ProfileBoard";
import { loadHub } from "@/lib/load-hub";

export async function generateMetadata(): Promise<Metadata> {
  const hub = await loadHub();
  return { title: `${hub.student.firstName} ${hub.student.lastName} · Dean` };
}

export default function ProfilePage() {
  return (
    <main className="main">
      <ProfileBoard />
    </main>
  );
}

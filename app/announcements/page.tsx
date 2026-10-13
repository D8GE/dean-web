import type { Metadata } from "next";
import AnnouncementsBoard from "@/components/AnnouncementsBoard";

export const metadata: Metadata = { title: "Announcements · Dean" };

export default function AnnouncementsPage() {
  return (
    <main className="main">
      <AnnouncementsBoard />
    </main>
  );
}

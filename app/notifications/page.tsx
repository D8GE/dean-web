import type { Metadata } from "next";
import NotificationsBoard from "@/components/NotificationsBoard";

export const metadata: Metadata = { title: "Notifications · Dean" };

export default function NotificationsPage() {
  return (
    <main className="main">
      <NotificationsBoard />
    </main>
  );
}

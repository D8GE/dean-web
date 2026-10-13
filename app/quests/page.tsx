import type { Metadata } from "next";
import QuestsBoard from "@/components/QuestsBoard";

export const metadata: Metadata = { title: "Quests · Dean" };

export default function QuestsPage() {
  return (
    <main className="main">
      <QuestsBoard />
    </main>
  );
}

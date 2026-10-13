import type { Metadata } from "next";
import SettingsBoard from "@/components/SettingsBoard";

export const metadata: Metadata = { title: "Settings · Dean" };

export default function SettingsPage() {
  return (
    <main className="main">
      <SettingsBoard />
    </main>
  );
}

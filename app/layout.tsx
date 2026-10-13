import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { HubProvider } from "@/components/HubProvider";
import { loadHub } from "@/lib/load-hub";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dean · Your school hub",
  description: "A playful, gamified school dashboard with Dean, your study coach.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hub = await loadHub();
  return (
    <html lang="en">
      <body>
        <HubProvider hub={hub}>
          <AppShell>{children}</AppShell>
        </HubProvider>
      </body>
    </html>
  );
}

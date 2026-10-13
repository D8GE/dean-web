import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dean · Your school hub",
  description: "A playful, gamified school dashboard with Dean, your study coach.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

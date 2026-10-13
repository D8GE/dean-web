import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import GradesBoard from "@/components/GradesBoard";

export const metadata: Metadata = { title: "Grades · Dean" };

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course } = await searchParams;
  return (
    <AppShell>
      <main className="main">
        <GradesBoard initialSlug={course ?? null} />
      </main>
    </AppShell>
  );
}

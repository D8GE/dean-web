import type { Metadata } from "next";
import FocusBoard from "@/components/FocusBoard";

export const metadata: Metadata = { title: "Focus · Dean" };

export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<{ minutes?: string; block?: string }>;
}) {
  const { minutes, block } = await searchParams;
  return (
    <main className="main">
      <FocusBoard minutes={minutes ?? null} block={block ?? null} />
    </main>
  );
}

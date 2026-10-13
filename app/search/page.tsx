import type { Metadata } from "next";
import SearchBoard from "@/components/SearchBoard";

export const metadata: Metadata = { title: "Search · Dean" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchBoard initialQuery={q ?? ""} />;
}

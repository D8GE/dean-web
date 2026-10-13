import type { Metadata } from "next";
import AssignmentBoard from "@/components/AssignmentBoard";
import { allWork, demoSnapshot, workById } from "@/lib/hub";
import { loadHub } from "@/lib/load-hub";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  const ids = new Set<string>();
  for (const work of allWork(demoSnapshot("demo"))) {
    ids.add(work.id);
    ids.add(work.gradeId);
  }
  return [...ids].map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hub = await loadHub();
  const work = workById(hub, id);
  return { title: work ? `${work.title} · Dean` : "Assignment · Dean" };
}

export default async function AssignmentPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="main">
      <AssignmentBoard id={id} />
    </main>
  );
}

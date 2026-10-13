import type { Metadata } from "next";
import AssignmentBoard from "@/components/AssignmentBoard";
import { allWork, workById } from "@/lib/hub";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  const ids = new Set<string>();
  for (const work of allWork()) {
    ids.add(work.id);
    ids.add(work.gradeId);
  }
  return [...ids].map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = workById(id);
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

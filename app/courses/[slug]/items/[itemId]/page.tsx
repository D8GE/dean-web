import type { Metadata } from "next";
import ModuleItemBoard from "@/components/ModuleItemBoard";
import { moduleItemParams, modulePage } from "@/lib/hub";

type Props = { params: Promise<{ slug: string; itemId: string }> };

export function generateStaticParams() {
  return moduleItemParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, itemId } = await params;
  const page = modulePage(slug, itemId);
  return { title: page ? `${page.itemTitle} · Dean` : "Module · Dean" };
}

export default async function ModuleItemPage({ params }: Props) {
  const { slug, itemId } = await params;
  return (
    <main className="main">
      <ModuleItemBoard slug={slug} itemId={itemId} />
    </main>
  );
}

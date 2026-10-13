import type { Metadata } from "next";
import ModuleItemBoard from "@/components/ModuleItemBoard";
import { demoSnapshot, moduleItemParams, modulePage } from "@/lib/hub";
import { loadHub } from "@/lib/load-hub";

type Props = { params: Promise<{ slug: string; itemId: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return moduleItemParams(demoSnapshot("demo"));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, itemId } = await params;
  const hub = await loadHub();
  const page = modulePage(hub, slug, itemId);
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

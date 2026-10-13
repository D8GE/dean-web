import type { Metadata } from "next";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import { demoSnapshot } from "@/lib/hub";
import { loadHub } from "@/lib/load-hub";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return demoSnapshot("demo").announcements.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hub = await loadHub();
  const post = hub.announcements.find((item) => item.id === id);
  return { title: post ? `${post.title} · Dean` : "Announcement · Dean" };
}

export default async function AnnouncementPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="main">
      <AnnouncementBoard id={id} />
    </main>
  );
}

import type { Metadata } from "next";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import { announcements } from "@/lib/demo-data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return announcements.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = announcements.find((item) => item.id === id);
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

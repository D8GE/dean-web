import type { Metadata } from "next";
import CourseHome from "@/components/CourseHome";
import { loadHub } from "@/lib/load-hub";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = await loadHub();
  const course = hub.courseBySlug[slug];
  return { title: course ? `${course.code} · Dean` : "Course · Dean" };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="main">
      <CourseHome key={slug} slug={slug} />
    </main>
  );
}

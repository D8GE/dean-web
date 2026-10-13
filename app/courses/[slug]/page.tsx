import type { Metadata } from "next";
import CourseHome from "@/components/CourseHome";
import { courseBySlug, courses } from "@/lib/demo-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug[slug];
  return { title: course ? `${course.code} · Dean` : "Course · Dean" };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="main">
      <CourseHome slug={slug} />
    </main>
  );
}

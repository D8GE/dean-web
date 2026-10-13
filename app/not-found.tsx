import Link from "next/link";
import StatusCard from "@/components/StatusCard";

export default function NotFound() {
  return (
    <StatusCard
      emoji="🗺️"
      title="That page isn't on the map."
      body="Home, the five courses, the week, and the gradebook are the pages that exist. The Dean tab still isn't one of them."
    >
      <Link href="/" className="btn3d btn-primary">
        Back home
      </Link>
      <Link href="/courses" className="btn3d btn-ghost">
        Courses
      </Link>
      <Link href="/search" className="btn3d btn-soft">
        Search
      </Link>
    </StatusCard>
  );
}

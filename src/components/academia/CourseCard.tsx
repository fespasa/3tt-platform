import Link from "next/link";
import type { CourseWithInstructor } from "@/types/database.types";
import CourseLevelBadge from "./CourseLevelBadge";
import type { CourseLevel } from "@/types/database.types";

export default function CourseCard({ course }: { course: CourseWithInstructor }) {
  const rating = Number(course.avg_rating ?? 0);
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  return (
    <Link href={`/academia/${course.slug}`} className="card p-0 overflow-hidden group block">
      <div className="aspect-video relative overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title ?? ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏐</div>
        )}
        <div className="absolute top-3 left-3">
          <CourseLevelBadge level={(course.level ?? "fundamentos") as CourseLevel} />
        </div>
        {course.price === 0 && (
          <span className="absolute top-3 right-3 bg-teal text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Gratis
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{course.title}</h3>
        <p className="text-xs text-muted mb-2">{course.instructor_name}</p>
        {rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-500 text-xs">{stars}</span>
            <span className="text-xs text-muted">({course.reviews_count})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-black text-foreground">
            {course.price === 0 || !course.price ? "Gratis" : `${course.price}€`}
          </span>
          {(course.enrollments_count ?? 0) > 0 && (
            <span className="text-xs text-muted">{course.enrollments_count} alumnos</span>
          )}
        </div>
      </div>
    </Link>
  );
}

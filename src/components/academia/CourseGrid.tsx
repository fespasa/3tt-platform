import type { CourseWithInstructor } from "@/types/database.types";
import CourseCard from "./CourseCard";

export default function CourseGrid({ courses, loading = false }: { courses: CourseWithInstructor[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-0 overflow-hidden animate-pulse">
            <div className="aspect-video" style={{ background: "var(--bg-tertiary)" }} />
            <div className="p-5 space-y-3">
              <div className="h-4 rounded" style={{ background: "var(--bg-tertiary)", width: "80%" }} />
              <div className="h-3 rounded" style={{ background: "var(--bg-tertiary)", width: "50%" }} />
              <div className="h-4 rounded" style={{ background: "var(--bg-tertiary)", width: "30%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-24 text-muted">
        <div className="text-6xl mb-4">🏐</div>
        <p className="text-lg font-semibold">No se encontraron cursos</p>
        <p className="text-sm mt-2">Prueba con otros filtros o vuelve más tarde.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

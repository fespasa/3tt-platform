import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { CourseWithInstructor } from "@/types/database.types";

export const metadata: Metadata = { title: "Academia" };

export default async function AcademiaPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("v_courses_with_instructor")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="badge badge-teal mb-3">Academia 3TT</span>
        <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight">
          Aprende con los mejores
        </h1>
        <p className="text-gray3tt text-lg mt-3 max-w-xl">
          Cursos impartidos por entrenadores, jugadores y profesionales del volleyball.
        </p>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-24 text-gray3tt">
          <div className="text-6xl mb-4">🏐</div>
          <p className="text-lg font-semibold">Cursos próximamente</p>
          <p className="text-sm mt-2">Estamos preparando el contenido. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(courses as CourseWithInstructor[]).map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseWithInstructor }) {
  return (
    <a href={`/academia/${course.slug}`} className="card p-0 overflow-hidden group">
      <div className="aspect-video bg-navy relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏐</div>
        )}
        <span className="absolute top-3 left-3 badge badge-teal capitalize">{course.level}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-navy text-sm line-clamp-2 mb-1">{course.title}</h3>
        <p className="text-xs text-gray3tt mb-3">{course.instructor_name}</p>
        <div className="flex items-center justify-between">
          <span className="font-black text-navy">{course.price === 0 ? "Gratis" : `${course.price}€`}</span>
          <span className="text-xs text-gray3tt">{course.duration_mins} min</span>
        </div>
      </div>
    </a>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import StatsCard from "@/components/admin/StatsCard";
import type { CourseWithInstructor } from "@/types/database.types";

export default function AdminCursos() {
  const supabase = createClient();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("v_courses_with_instructor")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  useEffect(() => { load(); }, []);

  const del = async (course: CourseWithInstructor) => {
    if (!confirm(`¿Eliminar "${course.title}"?`)) return;
    await supabase.from("courses").delete().eq("id", course.id!);
    load();
  };

  const published = courses.filter(c => c.is_published);
  const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrollments_count ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">Cursos</h1>
          <p className="text-muted text-sm mt-1">{courses.length} cursos en total</p>
        </div>
        <button
          onClick={() => router.push("/admin/cursos/nuevo/editar")}
          className="btn-primary !text-sm !py-2 !px-5"
        >
          + Nuevo curso
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard icon="🎓" label="Total" value={courses.length} />
        <StatsCard icon="✅" label="Publicados" value={published.length} />
        <StatsCard icon="👥" label="Inscripciones" value={totalEnrollments} />
        <StatsCard icon="⭐" label="Rating medio" value={
          courses.length > 0
            ? (courses.reduce((a, c) => a + Number(c.avg_rating ?? 0), 0) / courses.length).toFixed(1)
            : "—"
        } />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-left">
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Imagen</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Título</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Instructor</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Nivel</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Precio</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Inscritos</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">
                  <div className="text-4xl mb-2">🎓</div>
                  No hay cursos aún. ¡Crea el primero!
                </td></tr>
              )}
              {courses.map(course => (
                <tr key={course.id} className="border-b border-theme hover:bg-teal/[0.03]">
                  <td className="px-4 py-2">
                    <img
                      src={course.thumbnail_url || "/images/placeholder-course.jpg"}
                      alt=""
                      className="w-16 h-10 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground max-w-[180px] truncate">{course.title}</td>
                  <td className="px-4 py-3 text-muted text-xs">{course.instructor_name ?? "—"}</td>
                  <td className="px-4 py-3"><span className="badge badge-teal text-[10px] capitalize">{course.level}</span></td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {course.price === 0 || !course.price ? "Gratis" : `${course.price}€`}
                  </td>
                  <td className="px-4 py-3 text-muted">{course.enrollments_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={course.is_published ? "published" : "draft"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/cursos/${course.id}/editar`)}
                        className="text-teal hover:underline text-xs font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => del(course)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

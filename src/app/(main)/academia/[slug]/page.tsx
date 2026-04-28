import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title, subtitle").eq("slug", slug).single();
  if (!data) return { title: "Curso no encontrado" };
  return { title: data.title, description: data.subtitle ?? undefined };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("v_courses_with_instructor")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*, course_lessons(*)")
    .eq("course_id", course.id!)
    .order("position");

  const totalLessons = modules?.reduce((acc, m) => acc + (m.course_lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-navy py-16 px-6 md:px-[6%]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3">
            <span className="badge badge-teal capitalize mb-4">{course.level}</span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">{course.title}</h1>
            {course.subtitle && <p className="text-white/70 text-lg mb-6">{course.subtitle}</p>}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-sm overflow-hidden">
                {course.instructor_avatar
                  ? <img src={course.instructor_avatar} alt={course.instructor_name ?? ""} className="w-full h-full object-cover" />
                  : "👤"
                }
              </div>
              <span className="text-white/70 text-sm">{course.instructor_name}</span>
            </div>
            <div className="flex gap-6 text-white/50 text-sm">
              <span>⭐ {Number(course.avg_rating).toFixed(1)} ({course.reviews_count} reseñas)</span>
              <span>👥 {course.enrollments_count} alumnos</span>
              <span>🎬 {course.duration_mins} min</span>
            </div>
          </div>

          {/* Purchase card */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-xl">
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title ?? ""} className="w-full aspect-video object-cover rounded-xl mb-5" />
            )}
            <div className="text-3xl font-black text-navy mb-4">
              {course.price === 0 || !course.price ? "Gratis" : formatPrice(course.price)}
            </div>
            <button className="btn-primary w-full text-center mb-3">
              {course.price === 0 ? "Acceder al curso" : "Comprar ahora"}
            </button>
            <p className="text-xs text-gray3tt text-center">Acceso de por vida · Certificado incluido</p>
            <div className="mt-4 space-y-2 text-xs text-gray3tt border-t pt-4">
              <p>✓ {totalLessons} lecciones en video</p>
              <p>✓ Materiales descargables</p>
              <p>✓ Acceso desde cualquier dispositivo</p>
              <p>✓ Resolución de dudas con el instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-[6%] py-12 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-3 space-y-8">
          {/* Description */}
          {course.description && (
            <div>
              <h2 className="text-xl font-black text-navy mb-4">Descripción</h2>
              <p className="text-gray3tt leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Curriculum */}
          {modules && modules.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-navy mb-4">
                Contenido del curso · {modules.length} módulos · {totalLessons} lecciones
              </h2>
              <div className="space-y-3">
                {modules.map(mod => (
                  <details key={mod.id} className="border border-gray/20 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-navy text-sm hover:bg-offwhite">
                      <span>{mod.title}</span>
                      <span className="text-xs text-gray3tt">{mod.course_lessons?.length ?? 0} lecciones</span>
                    </summary>
                    <div className="border-t border-gray/10">
                      {(mod.course_lessons ?? []).map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm border-b border-gray/10 last:border-0">
                          <span className="text-teal">{lesson.is_preview ? "▶" : "🔒"}</span>
                          <span className="flex-1 text-navy/80">{lesson.title}</span>
                          {(lesson.video_duration ?? 0) > 0 && (
                            <span className="text-xs text-gray3tt">{Math.floor((lesson.video_duration ?? 0) / 60)}:{String((lesson.video_duration ?? 0) % 60).padStart(2, "0")}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructor sidebar */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <h3 className="font-black text-navy text-sm uppercase tracking-wide mb-4">Instructor</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-offwhite overflow-hidden flex-shrink-0">
                {course.instructor_avatar
                  ? <img src={course.instructor_avatar} alt={course.instructor_name ?? ""} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                }
              </div>
              <div>
                <p className="font-bold text-navy text-sm">{course.instructor_name}</p>
                <p className="text-xs text-gray3tt">Instructor verificado</p>
              </div>
            </div>
            {course.instructor_bio && (
              <p className="text-xs text-gray3tt leading-relaxed">{course.instructor_bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

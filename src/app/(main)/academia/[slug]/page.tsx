import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CourseLevelBadge from "@/components/academia/CourseLevelBadge";
import EnrollButton from "@/components/academia/EnrollButton";
import ReviewList from "@/components/academia/ReviewList";
import type { CourseLevel } from "@/types/database.types";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title, subtitle").eq("slug", slug).single();
  if (!data) return { title: "Curso no encontrado" };
  return { title: `${data.title} — Academia 3TT`, description: data.subtitle ?? undefined };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch course
  const { data: course } = await supabase
    .from("v_courses_with_instructor")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  // Fetch modules with lessons
  const { data: modules } = await supabase
    .from("course_modules")
    .select("*, course_lessons(*)")
    .eq("course_id", course.id!)
    .order("position");

  // Sort lessons within each module by position
  modules?.forEach(m => {
    m.course_lessons?.sort((a: any, b: any) => a.position - b.position);
  });

  // Check enrollment
  let isEnrolled = false;
  let enrollment = null;
  if (user) {
    const { data: enr } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id!)
      .single();
    if (enr) {
      isEnrolled = true;
      enrollment = enr;
    }
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("course_reviews")
    .select("*, profiles:user_id(full_name, avatar_url)")
    .eq("course_id", course.id!)
    .order("created_at", { ascending: false })
    .limit(20);

  // Check if user already reviewed
  const userReviewed = user ? reviews?.some((r: any) => r.user_id === user.id) : false;

  const totalLessons = modules?.reduce((acc, m) => acc + (m.course_lessons?.length ?? 0), 0) ?? 0;
  const previewCount = modules?.reduce(
    (acc, m) => acc + (m.course_lessons?.filter((l: any) => l.is_preview)?.length ?? 0), 0
  ) ?? 0;

  const rating = Number(course.avg_rating ?? 0);
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div style={{ background: "var(--bg-secondary)" }} className="py-16 px-6 md:px-[6%]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3">
            <div className="mb-4">
              <CourseLevelBadge level={(course.level ?? "fundamentos") as CourseLevel} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-secondary text-lg mb-6">{course.subtitle}</p>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-sm overflow-hidden">
                {course.instructor_avatar
                  ? <img src={course.instructor_avatar} alt={course.instructor_name ?? ""} className="w-full h-full object-cover" />
                  : "👤"}
              </div>
              <span className="text-secondary text-sm">{course.instructor_name}</span>
            </div>
            <div className="flex gap-6 text-muted text-sm">
              {rating > 0 && <span className="text-amber-500">{stars} ({course.reviews_count})</span>}
              <span>👥 {course.enrollments_count ?? 0} alumnos</span>
              <span>🎬 {totalLessons} lecciones</span>
              {(course.duration_mins ?? 0) > 0 && <span>⏱ {course.duration_mins} min</span>}
            </div>
          </div>

          {/* Purchase card */}
          <div className="md:col-span-2 card p-6">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title ?? ""}
                className="w-full aspect-video object-cover rounded-xl mb-5"
              />
            )}
            <div className="text-3xl font-black text-foreground mb-4">
              {course.price === 0 || !course.price ? "Gratis" : `${course.price}€`}
            </div>

            <EnrollButton
              courseId={course.id!}
              courseSlug={course.slug!}
              price={course.price ?? 0}
              isEnrolled={isEnrolled}
              isLoggedIn={!!user}
            />

            {isEnrolled && enrollment && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted mb-1">
                  <span>Progreso</span>
                  <span>{enrollment.progress_pct ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${enrollment.progress_pct ?? 0}%` }} />
                </div>
              </div>
            )}

            <p className="text-xs text-muted text-center mt-4">Acceso de por vida · Certificado incluido</p>
            <div className="mt-4 space-y-2 text-xs text-muted" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <p>✓ {totalLessons} lecciones en video</p>
              <p>✓ Acceso desde cualquier dispositivo</p>
              <p>✓ Certificado al completar</p>
              {previewCount > 0 && <p>✓ {previewCount} lecciones de prueba gratis</p>}
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
              <h2 className="text-xl font-black text-foreground mb-4">Descripción</h2>
              <p className="text-secondary leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Curriculum */}
          {modules && modules.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-foreground mb-4">
                Contenido del curso · {modules.length} módulos · {totalLessons} lecciones
              </h2>
              <div className="space-y-3">
                {modules.map(mod => (
                  <details key={mod.id} className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-foreground text-sm" style={{ background: "var(--bg-secondary)" }}>
                      <span>{mod.title}</span>
                      <span className="text-xs text-muted">{mod.course_lessons?.length ?? 0} lecciones</span>
                    </summary>
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {(mod.course_lessons ?? []).map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-4 py-3 text-sm"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <span className={lesson.is_preview ? "text-teal" : "text-muted"}>
                            {lesson.is_preview ? "▶" : "🔒"}
                          </span>
                          <span className="flex-1 text-secondary">{lesson.title}</span>
                          {(lesson.video_duration ?? 0) > 0 && (
                            <span className="text-xs text-muted">
                              {Math.floor((lesson.video_duration ?? 0) / 60)}:{String((lesson.video_duration ?? 0) % 60).padStart(2, "0")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ReviewList
            reviews={(reviews ?? []) as any}
            courseId={course.id!}
            isEnrolled={isEnrolled}
            userReviewed={!!userReviewed}
            isLoggedIn={!!user}
          />
        </div>

        {/* Instructor sidebar */}
        <div className="md:col-span-2">
          <div className="card p-6 sticky top-24">
            <h3 className="font-black text-foreground text-sm uppercase tracking-wide mb-4">Instructor</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--bg-tertiary)" }}>
                {course.instructor_avatar
                  ? <img src={course.instructor_avatar} alt={course.instructor_name ?? ""} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{course.instructor_name}</p>
                <p className="text-xs text-muted">Instructor verificado</p>
              </div>
            </div>
            {course.instructor_bio && (
              <p className="text-xs text-muted leading-relaxed">{course.instructor_bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

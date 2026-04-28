import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import PlayerClient from "./PlayerClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title").eq("slug", slug).single();
  return { title: data ? `${data.title} — Aprender` : "Curso" };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirectTo=/academia/${slug}/aprender`);

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  if (!enrollment) redirect(`/academia/${slug}`);

  // Fetch modules with lessons
  const { data: modules } = await supabase
    .from("course_modules")
    .select("*, course_lessons(*)")
    .eq("course_id", course.id)
    .order("position");

  modules?.forEach(m => {
    m.course_lessons?.sort((a: any, b: any) => a.position - b.position);
  });

  // Fetch lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, watch_seconds")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  // Fetch quizzes
  const { data: quizzes } = await supabase
    .from("module_quizzes")
    .select("*, quiz_questions(*, quiz_options(*))")
    .eq("course_id", course.id);

  // Fetch quiz attempts
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, passed")
    .eq("user_id", user.id);

  // Fetch certificate
  const { data: certificate } = await supabase
    .from("course_certificates")
    .select("certificate_number, issued_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  return (
    <PlayerClient
      course={course}
      modules={(modules ?? []) as any}
      progressData={(progress ?? []) as any}
      quizzes={(quizzes ?? []) as any}
      quizAttempts={(attempts ?? []) as any}
      enrollmentProgressPct={enrollment.progress_pct ?? 0}
      certificate={certificate as any}
      userName={user.user_metadata?.full_name ?? user.email ?? "Alumno"}
    />
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId } = await req.json();

  // Check enrollment and 100% progress
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("progress_pct")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment || (enrollment.progress_pct ?? 0) < 100) {
    return NextResponse.json({ error: "Debes completar el curso al 100%" }, { status: 400 });
  }

  // Check all quizzes passed
  const { data: quizzes } = await supabase
    .from("module_quizzes")
    .select("id")
    .eq("course_id", courseId);

  if (quizzes && quizzes.length > 0) {
    const quizIds = quizzes.map(q => q.id);
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("quiz_id, passed")
      .eq("user_id", user.id)
      .in("quiz_id", quizIds);

    const passedIds = new Set((attempts ?? []).filter(a => a.passed).map(a => a.quiz_id));
    const allPassed = quizIds.every(id => passedIds.has(id));
    if (!allPassed) {
      return NextResponse.json({ error: "Debes aprobar todos los quizzes" }, { status: 400 });
    }
  }

  // Check if certificate already exists
  const { data: existing } = await supabase
    .from("course_certificates")
    .select("certificate_number")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ certificateNumber: existing.certificate_number });
  }

  // Generate unique certificate number: 3TT-YYYY-XXXXX
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const certificateNumber = `3TT-${year}-${random}`;

  const { error } = await supabase
    .from("course_certificates")
    .insert({
      user_id: user.id,
      course_id: courseId,
      certificate_number: certificateNumber,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ certificateNumber });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId, rating, comment } = await req.json();

  if (!courseId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "courseId y rating (1-5) requeridos" }, { status: 400 });
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment) {
    return NextResponse.json({ error: "Debes estar inscrito para dejar una reseña" }, { status: 403 });
  }

  // Upsert review (one per user per course)
  const { error } = await supabase
    .from("course_reviews")
    .upsert(
      { user_id: user.id, course_id: courseId, rating, comment: comment || null },
      { onConflict: "user_id,course_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

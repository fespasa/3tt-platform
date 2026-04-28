import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { lessonId, courseId, completed, watchSeconds } = await req.json();

  if (!lessonId || !courseId) {
    return NextResponse.json({ error: "lessonId y courseId requeridos" }, { status: 400 });
  }

  // Upsert lesson progress
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        completed: completed ?? false,
        completed_at: completed ? new Date().toISOString() : null,
        watch_seconds: watchSeconds ?? 0,
      },
      { onConflict: "user_id,lesson_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // The DB trigger update_course_progress() auto-recalculates progress_pct

  return NextResponse.json({ success: true });
}

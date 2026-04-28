import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 });
  }

  // Check course exists and is free
  const { data: course } = await supabase
    .from("courses")
    .select("id, price, is_published")
    .eq("id", courseId)
    .single();

  if (!course || !course.is_published) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  if (course.price > 0) {
    return NextResponse.json({ error: "Este curso no es gratuito" }, { status: 400 });
  }

  // Check not already enrolled
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ enrolled: true, message: "Ya estás inscrito" });
  }

  // Create enrollment
  const { error } = await supabase
    .from("course_enrollments")
    .insert({ user_id: user.id, course_id: courseId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrolled: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { quizId, answers } = await req.json();
  // answers: Record<questionId, selectedOptionId>

  if (!quizId || !answers) {
    return NextResponse.json({ error: "quizId y answers requeridos" }, { status: 400 });
  }

  // Fetch quiz with questions and correct options
  const { data: quiz } = await supabase
    .from("module_quizzes")
    .select("*, quiz_questions(id, quiz_options(id, is_correct))")
    .eq("id", quizId)
    .single();

  if (!quiz) {
    return NextResponse.json({ error: "Quiz no encontrado" }, { status: 404 });
  }

  // Calculate score
  const questions = quiz.quiz_questions ?? [];
  let correct = 0;
  for (const q of questions) {
    const selectedId = answers[q.id];
    const correctOption = (q.quiz_options ?? []).find((o: any) => o.is_correct);
    if (correctOption && selectedId === correctOption.id) {
      correct++;
    }
  }

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= (quiz.passing_score ?? 70);

  // Save attempt
  const { error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      score,
      passed,
      answers,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ score, passed, correct, total: questions.length });
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Option { id?: string; option_text: string; is_correct: boolean; position: number }
interface Question { id?: string; question_text: string; position: number; options: Option[] }
interface QuizData { id?: string; title: string; passing_score: number; questions: Question[] }

interface QuizEditorProps {
  moduleId: string;
  courseId: string;
}

export default function QuizEditor({ moduleId, courseId }: QuizEditorProps) {
  const supabase = createClient();
  const [quiz, setQuiz] = useState<QuizData>({ title: "Quiz del módulo", passing_score: 70, questions: [] });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("module_quizzes")
      .select("*, quiz_questions(*, quiz_options(*))")
      .eq("module_id", moduleId)
      .single()
      .then(({ data }) => {
        if (data) {
          setQuiz({
            id: data.id,
            title: data.title,
            passing_score: data.passing_score,
            questions: (data.quiz_questions ?? [])
              .sort((a: any, b: any) => a.position - b.position)
              .map((q: any) => ({
                id: q.id,
                question_text: q.question_text,
                position: q.position,
                options: (q.quiz_options ?? [])
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((o: any) => ({
                    id: o.id, option_text: o.option_text,
                    is_correct: o.is_correct, position: o.position,
                  })),
              })),
          });
        }
        setLoaded(true);
      });
  }, [moduleId]);

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question_text: "", position: prev.questions.length,
        options: [
          { option_text: "", is_correct: true, position: 0 },
          { option_text: "", is_correct: false, position: 1 },
        ],
      }],
    }));
  };

  const addOption = (qi: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { option_text: "", is_correct: false, position: q.options.length }] } : q
      ),
    }));
  };

  const setCorrect = (qi: number, oi: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })) } : q
      ),
    }));
  };

  const saveQuiz = async () => {
    setSaving(true);

    // Delete existing quiz for this module (cascade deletes questions and options)
    if (quiz.id) {
      await supabase.from("module_quizzes").delete().eq("id", quiz.id);
    }

    // Create quiz
    const { data: savedQuiz } = await supabase
      .from("module_quizzes")
      .insert({ module_id: moduleId, course_id: courseId, title: quiz.title, passing_score: quiz.passing_score })
      .select("id")
      .single();

    if (savedQuiz) {
      for (let qi = 0; qi < quiz.questions.length; qi++) {
        const q = quiz.questions[qi];
        const { data: savedQ } = await supabase
          .from("quiz_questions")
          .insert({ quiz_id: savedQuiz.id, question_text: q.question_text, position: qi })
          .select("id")
          .single();

        if (savedQ) {
          for (let oi = 0; oi < q.options.length; oi++) {
            const o = q.options[oi];
            await supabase.from("quiz_options").insert({
              question_id: savedQ.id, option_text: o.option_text,
              is_correct: o.is_correct, position: oi,
            });
          }
        }
      }
      setQuiz(prev => ({ ...prev, id: savedQuiz.id }));
    }

    setSaving(false);
  };

  if (!loaded) return <p className="text-muted text-sm">Cargando quiz...</p>;

  return (
    <div className="card p-5 space-y-4">
      <h4 className="font-bold text-foreground text-sm">📝 Quiz del módulo</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted mb-0.5 block">Título</label>
          <input className="input !text-sm" value={quiz.title}
            onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-muted mb-0.5 block">Nota mínima (%)</label>
          <input className="input !text-sm !w-24" type="number" value={quiz.passing_score}
            onChange={e => setQuiz(prev => ({ ...prev, passing_score: parseInt(e.target.value) || 70 }))} />
        </div>
      </div>

      {quiz.questions.map((q, qi) => (
        <div key={qi} className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-muted">P{qi + 1}.</span>
            <input className="input !text-sm flex-1" value={q.question_text} placeholder="Pregunta..."
              onChange={e => setQuiz(prev => ({
                ...prev,
                questions: prev.questions.map((qq, i) => i === qi ? { ...qq, question_text: e.target.value } : qq),
              }))} />
            <button onClick={() => setQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qi) }))}
              className="text-red-400 text-xs">✕</button>
          </div>
          <div className="space-y-1.5 ml-6">
            {q.options.map((o, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input type="radio" name={`correct-${qi}`} checked={o.is_correct}
                  onChange={() => setCorrect(qi, oi)} className="accent-teal" />
                <input className="input !text-sm flex-1" value={o.option_text} placeholder={`Opción ${oi + 1}`}
                  onChange={e => setQuiz(prev => ({
                    ...prev,
                    questions: prev.questions.map((qq, i) => i === qi ? {
                      ...qq, options: qq.options.map((oo, j) => j === oi ? { ...oo, option_text: e.target.value } : oo),
                    } : qq),
                  }))} />
                {q.options.length > 2 && (
                  <button onClick={() => setQuiz(prev => ({
                    ...prev,
                    questions: prev.questions.map((qq, i) => i === qi ? {
                      ...qq, options: qq.options.filter((_, j) => j !== oi),
                    } : qq),
                  }))} className="text-red-400 text-xs">✕</button>
                )}
              </div>
            ))}
            {q.options.length < 4 && (
              <button onClick={() => addOption(qi)} className="text-teal text-xs hover:underline ml-6">+ Añadir opción</button>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button onClick={addQuestion} className="btn-secondary !text-xs !py-1.5 !px-3">+ Añadir pregunta</button>
        <button onClick={saveQuiz} disabled={saving} className="btn-primary !text-xs !py-1.5 !px-3 disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar quiz"}
        </button>
      </div>
    </div>
  );
}

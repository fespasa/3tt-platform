"use client";

import { useState } from "react";

interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  quiz_options: Option[];
}

interface QuizWidgetProps {
  quizId: string;
  quizTitle: string;
  passingScore: number;
  questions: Question[];
  onComplete: (passed: boolean) => void;
}

export default function QuizWidget({ quizId, quizTitle, passingScore, questions, onComplete }: QuizWidgetProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = questions.every(q => answers[q.id]);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);

    const res = await fetch("/api/courses/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers }),
    });

    const data = await res.json();
    setResult(data);
    setSubmitting(false);
    onComplete(data.passed);
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">{result.passed ? "🎉" : "📚"}</div>
        <h3 className="text-xl font-black text-foreground mb-2">
          {result.passed ? "¡Quiz superado!" : "Inténtalo de nuevo"}
        </h3>
        <p className="text-secondary mb-4">
          Has acertado {result.correct} de {result.total} preguntas ({result.score}%).
          {!result.passed && ` Necesitas al menos ${passingScore}% para aprobar.`}
        </p>
        {!result.passed && (
          <button onClick={retry} className="btn-primary !text-sm">
            Reintentar quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <span className="badge badge-teal mb-2">📝 Quiz</span>
        <h3 className="text-xl font-black text-foreground">{quizTitle}</h3>
        <p className="text-muted text-sm mt-1">Necesitas al menos {passingScore}% para aprobar.</p>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="card p-5">
            <p className="font-semibold text-foreground text-sm mb-3">
              {qi + 1}. {q.question_text}
            </p>
            <div className="space-y-2">
              {q.quiz_options.map(opt => {
                const selected = answers[q.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                      selected
                        ? "border-teal bg-teal/10 text-foreground"
                        : "border-transparent hover:bg-teal/5 text-secondary"
                    }`}
                    style={{ borderColor: selected ? "var(--teal)" : "var(--border)" }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.id}
                      checked={selected}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                      className="accent-teal"
                    />
                    <span className="text-sm">{opt.option_text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="btn-primary !text-sm disabled:opacity-50"
        >
          {submitting ? "Evaluando..." : `Enviar respuestas (${Object.keys(answers).length}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}

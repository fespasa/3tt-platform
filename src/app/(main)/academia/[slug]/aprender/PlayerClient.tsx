"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/academia/VideoPlayer";
import LessonSidebar from "@/components/academia/LessonSidebar";
import QuizWidget from "@/components/academia/QuizWidget";
import CertificateDownload from "@/components/academia/CertificateDownload";

interface Lesson {
  id: string; title: string; description: string | null;
  video_url: string | null; video_duration: number | null;
  is_preview: boolean | null; position: number;
}
interface Module {
  id: string; title: string; position: number;
  course_lessons: Lesson[];
}
interface Quiz {
  id: string; module_id: string; title: string; passing_score: number;
  quiz_questions: { id: string; question_text: string; position: number;
    quiz_options: { id: string; option_text: string; is_correct: boolean; position: number }[];
  }[];
}

interface Props {
  course: { id: string; title: string; slug: string };
  modules: Module[];
  progressData: { lesson_id: string; completed: boolean; watch_seconds: number }[];
  quizzes: Quiz[];
  quizAttempts: { quiz_id: string; passed: boolean }[];
  enrollmentProgressPct: number;
  certificate: { certificate_number: string; issued_at: string } | null;
  userName: string;
}

export default function PlayerClient({
  course, modules, progressData, quizzes, quizAttempts,
  enrollmentProgressPct, certificate, userName,
}: Props) {
  const router = useRouter();

  // Build flat list of lessons for navigation
  const allLessons = useMemo(() =>
    modules.flatMap(m => m.course_lessons.map(l => ({ ...l, moduleId: m.id }))),
    [modules]
  );

  // Progress tracking
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(progressData.filter(p => p.completed).map(p => p.lesson_id))
  );
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(
    () => new Set(quizAttempts.filter(a => a.passed).map(a => a.quiz_id))
  );
  const [progressPct, setProgressPct] = useState(enrollmentProgressPct);

  // Current view state
  const firstIncomplete = allLessons.find(l => !completedIds.has(l.id));
  const [currentLessonId, setCurrentLessonId] = useState(firstIncomplete?.id ?? allLessons[0]?.id ?? "");
  const [showQuiz, setShowQuiz] = useState<string | null>(null); // moduleId if showing quiz

  const currentLesson = allLessons.find(l => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const nextLesson = allLessons[currentIndex + 1];

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mark lesson complete
  const markComplete = useCallback(async (lessonId: string) => {
    if (completedIds.has(lessonId)) return;

    setCompletedIds(prev => new Set([...prev, lessonId]));
    const newPct = Math.round(((completedIds.size + 1) / allLessons.length) * 100);
    setProgressPct(newPct);

    await fetch("/api/courses/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId: course.id, completed: true }),
    });

    router.refresh();
  }, [completedIds, allLessons.length, course.id, router]);

  // Save watch time
  const saveWatchTime = useCallback(async (seconds: number) => {
    if (!currentLesson) return;
    await fetch("/api/courses/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: currentLesson.id,
        courseId: course.id,
        completed: completedIds.has(currentLesson.id),
        watchSeconds: seconds,
      }),
    });
  }, [currentLesson, course.id, completedIds]);

  // Build modules for sidebar
  const sidebarModules = modules.map(m => {
    const quiz = quizzes.find(q => q.module_id === m.id);
    return {
      ...m,
      hasQuiz: !!quiz,
      quizPassed: quiz ? passedQuizIds.has(quiz.id) : false,
    };
  });

  // All quizzes passed check
  const allQuizzesPassed = quizzes.every(q => passedQuizIds.has(q.id));
  const isComplete = progressPct >= 100 && allQuizzesPassed;

  // Current quiz data
  const currentQuiz = showQuiz ? quizzes.find(q => q.module_id === showQuiz) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden btn-secondary !p-2 !text-sm"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 transform transition-transform lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className="relative z-10 h-full">
          <LessonSidebar
            modules={sidebarModules}
            currentLessonId={currentLessonId}
            completedLessonIds={completedIds}
            progressPct={progressPct}
            courseTitle={course.title}
            onSelectLesson={(id) => { setCurrentLessonId(id); setShowQuiz(null); setSidebarOpen(false); }}
            onSelectQuiz={(moduleId) => { setShowQuiz(moduleId); setSidebarOpen(false); }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href={`/academia/${course.slug}`} className="text-sm text-muted hover:text-teal transition-colors">
            ← Volver al curso
          </Link>
          {isComplete && certificate && (
            <CertificateDownload
              courseTitle={course.title}
              userName={userName}
              certificateNumber={certificate.certificate_number}
              issuedAt={certificate.issued_at}
            />
          )}
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Completion banner */}
          {isComplete && (
            <div className="bg-teal/10 border border-teal/20 rounded-xl p-6 mb-8 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-black text-foreground mb-1">¡Curso completado!</h3>
              <p className="text-secondary text-sm">Enhorabuena, has terminado todas las lecciones y quizzes.</p>
              {!certificate && (
                <button
                  onClick={async () => {
                    await fetch("/api/courses/certificate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ courseId: course.id }),
                    });
                    router.refresh();
                  }}
                  className="btn-primary !text-sm mt-4"
                >
                  Generar certificado
                </button>
              )}
            </div>
          )}

          {showQuiz && currentQuiz ? (
            /* Quiz view */
            <QuizWidget
              quizId={currentQuiz.id}
              quizTitle={currentQuiz.title}
              passingScore={currentQuiz.passing_score}
              questions={currentQuiz.quiz_questions.map(q => ({
                ...q,
                quiz_options: q.quiz_options.sort((a, b) => a.position - b.position),
              })).sort((a, b) => a.position - b.position)}
              onComplete={(passed) => {
                if (passed) {
                  setPassedQuizIds(prev => new Set([...prev, currentQuiz.id]));
                }
              }}
            />
          ) : currentLesson ? (
            /* Lesson view */
            <>
              {currentLesson.video_url ? (
                <VideoPlayer
                  src={currentLesson.video_url}
                  onTimeUpdate={saveWatchTime}
                  onEnded={() => markComplete(currentLesson.id)}
                  className="mb-6"
                />
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  <p className="text-muted">Sin vídeo disponible</p>
                </div>
              )}

              <h2 className="text-xl font-black text-foreground mb-2">{currentLesson.title}</h2>
              {currentLesson.description && (
                <p className="text-secondary text-sm mb-6">{currentLesson.description}</p>
              )}

              <div className="flex items-center gap-3">
                {!completedIds.has(currentLesson.id) && (
                  <button
                    onClick={() => markComplete(currentLesson.id)}
                    className="btn-secondary !text-sm"
                  >
                    ✓ Marcar como completada
                  </button>
                )}
                {nextLesson && (
                  <button
                    onClick={() => { setCurrentLessonId(nextLesson.id); setShowQuiz(null); }}
                    className="btn-primary !text-sm"
                  >
                    Siguiente lección →
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

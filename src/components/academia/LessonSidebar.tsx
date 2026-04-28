"use client";

import { useState } from "react";
import ProgressBar from "./ProgressBar";

interface Lesson {
  id: string;
  title: string;
  video_duration: number | null;
  is_preview: boolean | null;
}

interface Module {
  id: string;
  title: string;
  position: number;
  course_lessons: Lesson[];
  hasQuiz: boolean;
  quizPassed: boolean;
}

interface LessonSidebarProps {
  modules: Module[];
  currentLessonId: string;
  completedLessonIds: Set<string>;
  progressPct: number;
  courseTitle: string;
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (moduleId: string) => void;
}

export default function LessonSidebar({
  modules, currentLessonId, completedLessonIds, progressPct,
  courseTitle, onSelectLesson, onSelectQuiz,
}: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    // Open the module containing the current lesson
    for (const mod of modules) {
      if (mod.course_lessons.some(l => l.id === currentLessonId)) {
        return new Set([mod.id]);
      }
    }
    return new Set(modules[0] ? [modules[0].id] : []);
  });

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fmtDuration = (secs: number | null) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 className="font-bold text-foreground text-sm line-clamp-1 mb-2">{courseTitle}</h2>
        <div className="flex items-center gap-2">
          <ProgressBar value={progressPct} className="flex-1" />
          <span className="text-xs text-muted font-semibold">{progressPct}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {modules.map(mod => {
          const isOpen = openModules.has(mod.id);
          const completedInModule = mod.course_lessons.filter(l => completedLessonIds.has(l.id)).length;
          const totalInModule = mod.course_lessons.length;

          return (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:opacity-80 transition-opacity"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-left flex-1 line-clamp-1">{mod.title}</span>
                <span className="text-xs text-muted ml-2">{completedInModule}/{totalInModule}</span>
                <span className="ml-2 text-muted">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div>
                  {mod.course_lessons.map(lesson => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isCompleted = completedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                          isCurrent ? "bg-teal/10 text-teal font-semibold" : "text-secondary hover:bg-teal/5"
                        }`}
                      >
                        <span className="flex-shrink-0 w-5 text-center">
                          {isCompleted ? <span className="text-teal">✓</span> : isCurrent ? "▶" : "○"}
                        </span>
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        {lesson.video_duration ? (
                          <span className="text-xs text-muted">{fmtDuration(lesson.video_duration)}</span>
                        ) : null}
                      </button>
                    );
                  })}

                  {mod.hasQuiz && (
                    <button
                      onClick={() => onSelectQuiz(mod.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-purple-500 dark:text-purple-400 hover:bg-purple-500/5"
                    >
                      <span className="flex-shrink-0 w-5 text-center">
                        {mod.quizPassed ? "✓" : "📝"}
                      </span>
                      <span className="flex-1">Quiz del módulo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

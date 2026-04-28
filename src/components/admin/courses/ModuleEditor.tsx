"use client";

import LessonEditor from "./LessonEditor";

interface LessonData {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  is_preview: boolean;
  position: number;
}

interface ModuleData {
  id?: string;
  title: string;
  position: number;
  lessons: LessonData[];
}

interface ModuleEditorProps {
  mod: ModuleData;
  index: number;
  onChangeTitle: (title: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onAddLesson: () => void;
  onChangeLesson: (lessonIndex: number, field: keyof LessonData, value: string | number | boolean) => void;
  onDeleteLesson: (lessonIndex: number) => void;
  onMoveLessonUp: (lessonIndex: number) => void;
  onMoveLessonDown: (lessonIndex: number) => void;
}

export default function ModuleEditor({
  mod, index, onChangeTitle, onDelete, onMoveUp, onMoveDown,
  isFirst, isLast, onAddLesson, onChangeLesson, onDeleteLesson,
  onMoveLessonUp, onMoveLessonDown,
}: ModuleEditorProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="text-muted hover:text-foreground disabled:opacity-30 text-sm px-1">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-muted hover:text-foreground disabled:opacity-30 text-sm px-1">↓</button>
        </div>
        <span className="text-xs font-bold text-muted uppercase">Módulo {index + 1}</span>
        <input
          className="input !text-sm flex-1"
          value={mod.title}
          onChange={e => onChangeTitle(e.target.value)}
          placeholder="Título del módulo"
        />
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs font-semibold">Eliminar</button>
      </div>

      <div className="space-y-3 mb-4">
        {mod.lessons.map((lesson, li) => (
          <LessonEditor
            key={li}
            lesson={lesson}
            index={li}
            onChange={(field, value) => onChangeLesson(li, field, value)}
            onDelete={() => onDeleteLesson(li)}
            onMoveUp={() => onMoveLessonUp(li)}
            onMoveDown={() => onMoveLessonDown(li)}
            isFirst={li === 0}
            isLast={li === mod.lessons.length - 1}
          />
        ))}
      </div>

      <button onClick={onAddLesson} className="btn-secondary !text-xs !py-1.5 !px-3">
        + Añadir lección
      </button>
    </div>
  );
}

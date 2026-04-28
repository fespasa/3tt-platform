"use client";

interface LessonData {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  is_preview: boolean;
  position: number;
}

interface LessonEditorProps {
  lesson: LessonData;
  index: number;
  onChange: (field: keyof LessonData, value: string | number | boolean) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function LessonEditor({
  lesson, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: LessonEditorProps) {
  return (
    <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted uppercase">Lección {index + 1}</span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="text-muted hover:text-foreground disabled:opacity-30 text-xs px-1">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-muted hover:text-foreground disabled:opacity-30 text-xs px-1">↓</button>
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs ml-2">✕</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted mb-0.5 block">Título</label>
          <input className="input !text-sm" value={lesson.title} onChange={e => onChange("title", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted mb-0.5 block">Video URL</label>
          <input className="input !text-sm font-mono" value={lesson.video_url} onChange={e => onChange("video_url", e.target.value)} />
        </div>
      </div>
      <div className="mt-2">
        <label className="text-xs text-muted mb-0.5 block">Descripción</label>
        <textarea className="input !text-sm" rows={2} value={lesson.description} onChange={e => onChange("description", e.target.value)} />
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div>
          <label className="text-xs text-muted mb-0.5 block">Duración (seg)</label>
          <input className="input !text-sm !w-24" type="number" value={lesson.video_duration}
            onChange={e => onChange("video_duration", parseInt(e.target.value) || 0)} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input type="checkbox" checked={lesson.is_preview} onChange={e => onChange("is_preview", e.target.checked)} className="accent-teal" />
          <span className="text-xs text-secondary">Preview gratuita</span>
        </label>
      </div>
    </div>
  );
}

"use client";

import type { Discipline, CourseLevel } from "@/types/database.types";

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "fundamentos", label: "Fundamentos" },
  { value: "avanzado", label: "Avanzado" },
  { value: "especializacion", label: "Especialización" },
  { value: "elite", label: "Élite" },
];

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: "pista", label: "Pista" },
  { value: "playa", label: "Playa" },
  { value: "minivolley", label: "Minivolley" },
  { value: "volleyhierba", label: "Volleyhierba" },
  { value: "watervolley", label: "Watervolley" },
  { value: "general", label: "General" },
];

export interface CourseFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  discipline: Discipline;
  instructor_id: string;
  price: number;
  thumbnail_url: string;
  preview_url: string;
  duration_mins: number;
  is_published: boolean;
  is_featured: boolean;
  tags: string;
}

interface CourseFormProps {
  form: CourseFormData;
  onChange: (key: keyof CourseFormData, value: string | number | boolean) => void;
  instructors: { id: string; name: string }[];
}

export default function CourseForm({ form, onChange, instructors }: CourseFormProps) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-black text-foreground text-lg">Datos generales</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Título</label>
          <input className="input" value={form.title}
            onChange={e => {
              onChange("title", e.target.value);
              if (!form.slug || form.slug === slugify(form.title)) {
                onChange("slug", slugify(e.target.value));
              }
            }} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Slug</label>
          <input className="input font-mono" value={form.slug} onChange={e => onChange("slug", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-muted uppercase mb-1 block">Subtítulo</label>
        <input className="input" value={form.subtitle} onChange={e => onChange("subtitle", e.target.value)} />
      </div>

      <div>
        <label className="text-xs font-bold text-muted uppercase mb-1 block">Descripción</label>
        <textarea className="input" rows={4} value={form.description} onChange={e => onChange("description", e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Nivel</label>
          <select className="input" value={form.level} onChange={e => onChange("level", e.target.value)}>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Disciplina</label>
          <select className="input" value={form.discipline} onChange={e => onChange("discipline", e.target.value)}>
            {DISCIPLINES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Instructor</label>
          <select className="input" value={form.instructor_id} onChange={e => onChange("instructor_id", e.target.value)}>
            <option value="">Seleccionar...</option>
            {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Precio (€)</label>
          <input className="input" type="number" step="0.01" value={form.price}
            onChange={e => onChange("price", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Duración (min)</label>
          <input className="input" type="number" value={form.duration_mins}
            onChange={e => onChange("duration_mins", parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Tags (coma separados)</label>
          <input className="input" value={form.tags} onChange={e => onChange("tags", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Thumbnail URL</label>
          <input className="input" value={form.thumbnail_url} onChange={e => onChange("thumbnail_url", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Preview/Trailer URL</label>
          <input className="input" value={form.preview_url} onChange={e => onChange("preview_url", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={e => onChange("is_published", e.target.checked)} className="accent-teal w-4 h-4" />
          <span className="text-sm font-medium text-secondary">Publicado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={e => onChange("is_featured", e.target.checked)} className="accent-teal w-4 h-4" />
          <span className="text-sm font-medium text-secondary">Destacado</span>
        </label>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

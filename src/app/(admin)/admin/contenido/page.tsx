"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";

type ContentItem = {
  id: string; title: string; slug: string; type: string;
  description: string | null; content_body: string | null;
  audio_url: string | null; video_url: string | null;
  thumbnail_url: string | null; tags: string[] | null;
  is_published: boolean | null; is_premium: boolean | null;
  published_at: string | null; views: number | null;
  created_at: string | null;
};

type ContentForm = {
  title: string; slug: string; type: string; description: string;
  content_body: string; audio_url: string; thumbnail_url: string;
  tags: string; is_published: boolean; is_premium: boolean;
};

const TYPES = [
  { value: "podcast",   label: "Podcast" },
  { value: "interview", label: "Entrevista" },
  { value: "article",   label: "Artículo" },
  { value: "report",    label: "Reportaje" },
];

const PLACEHOLDER_IMAGES: Record<string, string> = {
  podcast:   "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop",
  interview: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
  article:   "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=400&fit=crop",
  report:    "https://images.unsplash.com/photo-1547347298-4571f8a4e68a?w=600&h=400&fit=crop",
};

const emptyForm: ContentForm = {
  title: "", slug: "", type: "podcast", description: "",
  content_body: "", audio_url: "", thumbnail_url: "",
  tags: "", is_published: false, is_premium: false,
};

export default function AdminContenido() {
  const supabase = createClient();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    let q = supabase.from("content_items").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("type", filter as "podcast" | "interview" | "article" | "report");
    const { data } = await q.limit(100);
    if (data) setItems(data);
  };

  useEffect(() => { load(); }, [filter]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: ContentItem) => {
    setEditing(item);
    setForm({
      title: item.title, slug: item.slug, type: item.type,
      description: item.description ?? "", content_body: item.content_body ?? "",
      audio_url: item.audio_url ?? "", thumbnail_url: item.thumbnail_url ?? "",
      tags: (item.tags ?? []).join(", "),
      is_published: item.is_published ?? false, is_premium: item.is_premium ?? false,
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      title: form.title, slug: form.slug, type: form.type as "podcast" | "interview" | "article" | "report",
      description: form.description || null,
      content_body: form.content_body || null,
      audio_url: form.audio_url || null,
      thumbnail_url: form.thumbnail_url || PLACEHOLDER_IMAGES[form.type] || null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : null,
      is_published: form.is_published, is_premium: form.is_premium,
      published_at: form.is_published ? new Date().toISOString() : null,
    };
    if (editing) {
      await supabase.from("content_items").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("content_items").insert(payload);
    }
    setSaving(false); setModalOpen(false); load();
  };

  const togglePublish = async (item: ContentItem) => {
    const newState = !item.is_published;
    await supabase.from("content_items").update({
      is_published: newState,
      published_at: newState ? new Date().toISOString() : null,
    }).eq("id", item.id);
    load();
  };

  const del = async (item: ContentItem) => {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    await supabase.from("content_items").delete().eq("id", item.id);
    load();
  };

  const set = (k: keyof ContentForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Contenido</h1>
          <p className="text-muted text-sm mt-1">Podcast, entrevistas, artículos y reportajes</p>
        </div>
        <button onClick={openNew} className="btn-primary !text-sm !py-2 !px-5">+ Nuevo contenido</button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{ value: "all", label: "Todos" }, ...TYPES].map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === t.value ? "bg-teal text-white" : "bg-teal/5 text-muted border border-theme hover:border-teal/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-left">
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Imagen</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Título</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Tipo</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Vistas</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted">
                  <div className="text-4xl mb-2">🎙️</div>
                  No hay contenido aún. ¡Crea el primero!
                </td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-theme hover:bg-teal/[0.03]">
                  <td className="px-4 py-2">
                    <img
                      src={item.thumbnail_url || PLACEHOLDER_IMAGES[item.type] || ""}
                      alt=""
                      className="w-16 h-10 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground max-w-[200px] truncate">{item.title}</td>
                  <td className="px-4 py-3"><span className="badge badge-navy text-[10px]">{item.type}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={item.is_published ?? false} /></td>
                  <td className="px-4 py-3 text-gray3tt">{item.views ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="text-teal hover:underline text-xs font-semibold">Editar</button>
                      <button onClick={() => togglePublish(item)} className="text-muted hover:text-white text-xs">
                        {item.is_published ? "Despublicar" : "Publicar"}
                      </button>
                      <button onClick={() => del(item)} className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar contenido" : "Nuevo contenido"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Título</label>
              <input className="input" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Slug</label>
              <input className="input font-mono" value={form.slug} onChange={e => set("slug", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Tipo</label>
              <select className="input" value={form.type} onChange={e => set("type", e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Tags (separados por coma)</label>
              <input className="input" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="voleibol, entrevista" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Descripción</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Contenido (Markdown)</label>
            <textarea className="input font-mono text-xs" rows={6} value={form.content_body} onChange={e => set("content_body", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">URL de audio</label>
              <input className="input" value={form.audio_url} onChange={e => set("audio_url", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">URL thumbnail</label>
              <input className="input" value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="Se autoasigna si vacío" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => set("is_published", e.target.checked)} className="accent-teal w-4 h-4" />
              <span className="text-sm font-medium text-secondary">Publicado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={e => set("is_premium", e.target.checked)} className="accent-teal w-4 h-4" />
              <span className="text-sm font-medium text-secondary">Premium</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-theme">
            <button onClick={() => setModalOpen(false)} className="btn-secondary !py-2 !px-4 !text-sm">Cancelar</button>
            <button onClick={save} disabled={saving || !form.title || !form.slug} className="btn-primary !py-2 !px-4 !text-sm">
              {saving ? "Guardando..." : editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

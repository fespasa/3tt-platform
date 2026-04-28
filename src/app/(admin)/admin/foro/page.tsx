"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import type { ForumCategory } from "@/types/database.types";

type CategoryForm = {
  name: string; slug: string; description: string; icon: string;
  position: number; is_active: boolean; target_role: string;
};

const empty: CategoryForm = { name: "", slug: "", description: "", icon: "💬", position: 0, is_active: true, target_role: "" };

export default function AdminForo() {
  const supabase = createClient();
  const [cats, setCats] = useState<ForumCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ForumCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("forum_categories").select("*").order("position");
    if (data) setCats(data);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (cat: ForumCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description ?? "",
      icon: cat.icon ?? "💬", position: cat.position ?? 0,
      is_active: cat.is_active ?? true, target_role: cat.target_role ?? "",
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name, slug: form.slug, description: form.description || null,
      icon: form.icon || null, position: form.position,
      is_active: form.is_active, target_role: (form.target_role || null) as "player" | "coach" | "professional" | "admin" | null,
    };
    if (editing) {
      await supabase.from("forum_categories").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("forum_categories").insert(payload);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const toggleActive = async (cat: ForumCategory) => {
    await supabase.from("forum_categories").update({ is_active: !cat.is_active }).eq("id", cat.id);
    load();
  };

  const del = async (cat: ForumCategory) => {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("forum_categories").delete().eq("id", cat.id);
    load();
  };

  const set = (k: keyof CategoryForm, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">Categorías del foro</h1>
          <p className="text-muted text-sm mt-1">{cats.length} categorías</p>
        </div>
        <button onClick={openNew} className="btn-primary !text-sm !py-2 !px-5">+ Nueva categoría</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-left">
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Pos</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Icono</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Nombre</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Slug</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Rol</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(cat => (
                <tr key={cat.id} className="border-b border-theme hover:bg-teal/[0.03] transition-colors">
                  <td className="px-4 py-3 text-gray3tt">{cat.position}</td>
                  <td className="px-4 py-3 text-xl">{cat.icon}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-gray3tt font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray3tt text-xs">{cat.target_role ?? "Todos"}</td>
                  <td className="px-4 py-3"><StatusBadge status={cat.is_active ?? true} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(cat)} className="text-teal hover:underline text-xs font-semibold">Editar</button>
                      <button onClick={() => toggleActive(cat)} className="text-muted hover:text-foreground text-xs">
                        {cat.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button onClick={() => del(cat)} className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Nombre</label>
              <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Técnica individual" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Slug</label>
              <input className="input font-mono" value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="tecnica" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Descripción</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Icono</label>
              <input className="input text-center text-xl" value={form.icon} onChange={e => set("icon", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Posición</label>
              <input className="input" type="number" value={form.position} onChange={e => set("position", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Rol destino</label>
              <select className="input" value={form.target_role} onChange={e => set("target_role", e.target.value)}>
                <option value="">Todos</option>
                <option value="player">Jugadores</option>
                <option value="coach">Entrenadores</option>
                <option value="professional">Profesionales</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="accent-teal w-4 h-4" />
            <span className="text-sm font-medium text-secondary">Activa</span>
          </label>
          <div className="flex justify-end gap-3 pt-3 border-t border-theme">
            <button onClick={() => setModalOpen(false)} className="btn-secondary !py-2 !px-4 !text-sm">Cancelar</button>
            <button onClick={save} disabled={saving || !form.name || !form.slug} className="btn-primary !py-2 !px-4 !text-sm">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear categoría"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

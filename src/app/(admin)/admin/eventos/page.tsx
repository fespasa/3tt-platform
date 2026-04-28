"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Event } from "@/types/database.types";

type EventForm = {
  title: string; slug: string; type: string; status: string;
  description: string; start_date: string; end_date: string;
  location: string; is_online: boolean; online_url: string;
  capacity: number; price: number; price_member: number;
  thumbnail_url: string;
};

const EVENT_TYPES = [
  { value: "clinic",           label: "Clinic" },
  { value: "torneo_signature", label: "Torneo 3TT" },
  { value: "webinar",          label: "Webinar" },
  { value: "masterclass",      label: "Masterclass" },
];

const STATUSES = ["draft", "published", "cancelled", "completed"];

const emptyForm: EventForm = {
  title: "", slug: "", type: "clinic", status: "draft",
  description: "", start_date: "", end_date: "",
  location: "", is_online: false, online_url: "",
  capacity: 50, price: 0, price_member: 0,
  thumbnail_url: "",
};

export default function AdminEventos() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("start_date", { ascending: false }).limit(50);
    if (data) setEvents(data);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (ev: Event) => {
    setEditing(ev);
    setForm({
      title: ev.title, slug: ev.slug, type: ev.type, status: ev.status ?? "draft",
      description: ev.description ?? "", start_date: ev.start_date?.slice(0, 16) ?? "",
      end_date: ev.end_date?.slice(0, 16) ?? "", location: ev.location ?? "",
      is_online: ev.is_online ?? false, online_url: ev.online_url ?? "",
      capacity: ev.capacity ?? 50, price: ev.price ?? 0, price_member: ev.price_member ?? 0,
      thumbnail_url: ev.thumbnail_url ?? "",
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      title: form.title, slug: form.slug, type: form.type as "clinic" | "torneo_signature" | "webinar" | "masterclass", status: form.status as "draft" | "published" | "cancelled" | "completed",
      description: form.description || null,
      start_date: form.start_date, end_date: form.end_date,
      location: form.location || null, is_online: form.is_online,
      online_url: form.online_url || null,
      capacity: form.capacity, price: form.price, price_member: form.price_member,
      thumbnail_url: form.thumbnail_url || "https://images.unsplash.com/photo-1547347298-4571f8a4e68a?w=600&h=400&fit=crop",
    };
    if (editing) {
      await supabase.from("events").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("events").insert(payload);
    }
    setSaving(false); setModalOpen(false); load();
  };

  const del = async (ev: Event) => {
    if (!confirm(`¿Eliminar "${ev.title}"?`)) return;
    await supabase.from("events").delete().eq("id", ev.id);
    load();
  };

  const set = (k: keyof EventForm, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-white">Eventos</h1>
          <p className="text-white/35 text-sm mt-1">{events.length} eventos</p>
        </div>
        <button onClick={openNew} className="btn-primary !text-sm !py-2 !px-5">+ Nuevo evento</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Imagen</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Título</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Tipo</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Fecha</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Precio</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30">
                  <div className="text-4xl mb-2">📅</div>
                  No hay eventos aún. ¡Crea el primero!
                </td></tr>
              )}
              {events.map(ev => (
                <tr key={ev.id} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                  <td className="px-4 py-2">
                    <img src={ev.thumbnail_url || "https://images.unsplash.com/photo-1547347298-4571f8a4e68a?w=600&h=400&fit=crop"} alt="" className="w-16 h-10 object-cover rounded-lg" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-white max-w-[180px] truncate">{ev.title}</td>
                  <td className="px-4 py-3"><span className="badge badge-navy text-[10px]">{ev.type}</span></td>
                  <td className="px-4 py-3 text-gray3tt text-xs">{fmtDate(ev.start_date)}</td>
                  <td className="px-4 py-3 text-white font-semibold">{ev.price ? `${ev.price}€` : "Gratis"}</td>
                  <td className="px-4 py-3"><StatusBadge status={ev.status ?? "draft"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(ev)} className="text-teal hover:underline text-xs font-semibold">Editar</button>
                      <button onClick={() => del(ev)} className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar evento" : "Nuevo evento"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Título</label>
              <input className="input" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Slug</label>
              <input className="input font-mono" value={form.slug} onChange={e => set("slug", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Tipo</label>
              <select className="input" value={form.type} onChange={e => set("type", e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Estado</label>
              <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Aforo</label>
              <input className="input" type="number" value={form.capacity} onChange={e => set("capacity", parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Descripción</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Inicio</label>
              <input className="input" type="datetime-local" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Fin</label>
              <input className="input" type="datetime-local" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Precio</label>
              <input className="input" type="number" step="0.01" value={form.price} onChange={e => set("price", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Precio miembros</label>
              <input className="input" type="number" step="0.01" value={form.price_member} onChange={e => set("price_member", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Ubicación</label>
              <input className="input" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-white/35 uppercase mb-1 block">Thumbnail URL</label>
            <input className="input" value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="Se autoasigna si vacío" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_online} onChange={e => set("is_online", e.target.checked)} className="accent-teal w-4 h-4" />
            <span className="text-sm font-medium text-white/70">Evento online</span>
          </label>
          {form.is_online && (
            <div>
              <label className="text-xs font-bold text-white/35 uppercase mb-1 block">URL del evento online</label>
              <input className="input" value={form.online_url} onChange={e => set("online_url", e.target.value)} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button onClick={() => setModalOpen(false)} className="btn-secondary !py-2 !px-4 !text-sm">Cancelar</button>
            <button onClick={save} disabled={saving || !form.title || !form.slug || !form.start_date || !form.end_date} className="btn-primary !py-2 !px-4 !text-sm">
              {saving ? "Guardando..." : editing ? "Guardar" : "Crear evento"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

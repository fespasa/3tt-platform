"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import type { MembershipPlan } from "@/types/database.types";

type PlanForm = {
  name: string; slug: string; price_annual: number;
  price_monthly: number; is_active: boolean; features: string;
};

const emptyForm: PlanForm = {
  name: "", slug: "free", price_annual: 0, price_monthly: 0,
  is_active: true, features: "{}",
};

export default function AdminPlanes() {
  const supabase = createClient();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("membership_plans").select("*").order("price_annual");
    if (data) setPlans(data);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (plan: MembershipPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name, slug: plan.slug,
      price_annual: plan.price_annual, price_monthly: plan.price_monthly ?? 0,
      is_active: plan.is_active ?? true,
      features: JSON.stringify(plan.features ?? {}, null, 2),
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    let features;
    try { features = JSON.parse(form.features); } catch { features = {}; }
    const payload = {
      name: form.name, slug: form.slug as "free" | "basic" | "advanced",
      price_annual: form.price_annual, price_monthly: form.price_monthly,
      is_active: form.is_active, features,
    };
    if (editing) {
      await supabase.from("membership_plans").update(payload).eq("id", editing.id);
    }
    setSaving(false); setModalOpen(false); load();
  };

  const toggleActive = async (plan: MembershipPlan) => {
    await supabase.from("membership_plans").update({ is_active: !plan.is_active }).eq("id", plan.id);
    load();
  };

  const set = (k: keyof PlanForm, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-foreground">Planes de membresía</h1>
        <p className="text-muted text-sm mt-1">Configura precios y características de cada plan</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const feat = (plan.features ?? {}) as Record<string, unknown>;
          return (
            <div key={plan.id} className={`card p-6 relative ${plan.is_active ? "" : "opacity-50"}`}>
              <div className="absolute top-4 right-4">
                <StatusBadge status={plan.is_active ?? false} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-1">{plan.name}</h3>
              <p className="text-xs text-muted uppercase font-bold tracking-wider mb-4">{plan.slug}</p>
              <div className="mb-4">
                <span className="text-3xl font-black text-teal">{plan.price_annual}€</span>
                <span className="text-sm text-muted">/año</span>
                {plan.price_monthly ? (
                  <p className="text-sm text-muted">{plan.price_monthly}€/mes</p>
                ) : null}
              </div>
              <div className="border-t border-theme pt-4 mb-4">
                <p className="text-xs font-bold text-muted uppercase mb-2">Características</p>
                <ul className="space-y-1.5">
                  {Object.entries(feat).map(([k, v]) => (
                    <li key={k} className="text-sm text-white/60 flex items-center gap-2">
                      <span className={v ? "text-teal" : "text-muted"}>
                        {v === true ? "✓" : v === false ? "✗" : `→ ${v}`}
                      </span>
                      <span>{k.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(plan)} className="btn-primary !text-xs !py-1.5 !px-3 flex-1">Editar</button>
                <button onClick={() => toggleActive(plan)} className="btn-secondary !text-xs !py-1.5 !px-3">
                  {plan.is_active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar plan">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Nombre</label>
              <input className="input" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Slug</label>
              <input className="input font-mono" value={form.slug} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Precio anual (€)</label>
              <input className="input" type="number" step="0.01" value={form.price_annual} onChange={e => set("price_annual", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-1 block">Precio mensual (€)</label>
              <input className="input" type="number" step="0.01" value={form.price_monthly} onChange={e => set("price_monthly", parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Características (JSON)</label>
            <textarea className="input font-mono text-xs" rows={6} value={form.features} onChange={e => set("features", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="accent-teal w-4 h-4" />
            <span className="text-sm font-medium text-secondary">Plan activo</span>
          </label>
          <div className="flex justify-end gap-3 pt-3 border-t border-theme">
            <button onClick={() => setModalOpen(false)} className="btn-secondary !py-2 !px-4 !text-sm">Cancelar</button>
            <button onClick={save} disabled={saving} className="btn-primary !py-2 !px-4 !text-sm">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

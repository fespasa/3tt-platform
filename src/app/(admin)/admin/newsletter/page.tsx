"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import StatsCard from "@/components/admin/StatsCard";

type Subscriber = {
  id: number; email: string; source: string | null;
  tags: string[] | null; is_active: boolean | null; created_at: string | null;
};

export default function AdminNewsletter() {
  const supabase = createClient();
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    if (data) setSubs(data);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (sub: Subscriber) => {
    await supabase.from("newsletter_subscribers").update({ is_active: !sub.is_active }).eq("id", sub.id);
    load();
  };

  const copyEmails = () => {
    const emails = subs.filter(s => s.is_active).map(s => s.email).join("\n");
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = subs.filter(s => s.is_active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Newsletter</h1>
          <p className="text-white/35 text-sm mt-1">Suscriptores de la lista de correo</p>
        </div>
        <button onClick={copyEmails} className="btn-secondary !text-sm !py-2 !px-5">
          {copied ? "✓ Copiados" : "Copiar emails activos"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatsCard icon="📧" label="Total" value={subs.length} />
        <StatsCard icon="✅" label="Activos" value={activeCount} />
        <StatsCard icon="🚫" label="Inactivos" value={subs.length - activeCount} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Fuente</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Tags</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Fecha</th>
                <th className="px-4 py-3 text-xs font-bold text-white/35 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">
                  <div className="text-4xl mb-2">📧</div>
                  No hay suscriptores aún.
                </td></tr>
              )}
              {subs.map(sub => (
                <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-mono text-sm text-white">{sub.email}</td>
                  <td className="px-4 py-3 text-gray3tt text-xs">{sub.source ?? "—"}</td>
                  <td className="px-4 py-3">
                    {sub.tags?.map(tag => (
                      <span key={tag} className="badge badge-teal text-[10px] mr-1">{tag}</span>
                    )) ?? <span className="text-gray3tt text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={sub.is_active ?? true} /></td>
                  <td className="px-4 py-3 text-gray3tt text-xs">
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString("es-ES") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(sub)} className="text-white/40 hover:text-white text-xs">
                      {sub.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Profile } from "@/types/database.types";

const ROLES = ["player", "coach", "professional", "admin"];

export default function AdminUsuarios() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    let q = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
    if (search) q = q.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
    const { data } = await q;
    if (data) setUsers(data);
  };

  useEffect(() => { load(); }, [search]);

  const updateRole = async (user: Profile, role: string) => {
    await supabase.from("profiles").update({ role: role as Profile["role"] }).eq("id", user.id);
    load();
  };

  const toggleCollaborator = async (user: Profile) => {
    await supabase.from("profiles").update({ is_collaborator: !user.is_collaborator }).eq("id", user.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Usuarios</h1>
          <p className="text-muted text-sm mt-1">{users.length} perfiles</p>
        </div>
        <input
          className="input !w-64"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Avatar</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Nombre</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Username</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Rol</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Membresía</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Colaborador</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">
                  <div className="text-4xl mb-2">👥</div>
                  No hay usuarios registrados aún.
                </td></tr>
              )}
              {users.map(user => (
                <tr key={user.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal text-xs font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{user.full_name}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">@{user.username ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input !py-1.5 !px-2.5 !text-xs"
                      value={user.role}
                      onChange={e => updateRole(user, e.target.value)}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><span className="badge badge-teal text-[10px]">{user.membership}</span></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleCollaborator(user)}
                      className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                        user.is_collaborator ? "bg-teal/10 text-teal" : "text-muted"
                      }`}
                      style={!user.is_collaborator ? { background: "var(--border)" } : undefined}
                    >
                      {user.is_collaborator ? "✓ Sí" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "—"}
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

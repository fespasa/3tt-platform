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
          <h1 className="text-2xl font-black text-navy">Usuarios</h1>
          <p className="text-gray3tt text-sm mt-1">{users.length} perfiles</p>
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
              <tr className="border-b border-gray/20 text-left">
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Avatar</th>
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Nombre</th>
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Username</th>
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Rol</th>
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Membresía</th>
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Colaborador</th>
                <th className="px-4 py-3 text-xs font-bold text-gray3tt uppercase">Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray3tt">
                  <div className="text-4xl mb-2">👥</div>
                  No hay usuarios registrados aún.
                </td></tr>
              )}
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray/10 hover:bg-offwhite/50">
                  <td className="px-4 py-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal text-xs font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">{user.full_name}</td>
                  <td className="px-4 py-3 text-gray3tt font-mono text-xs">@{user.username ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs border border-gray/20 rounded px-2 py-1 bg-white"
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
                        user.is_collaborator ? "bg-teal/10 text-teal" : "bg-gray-100 text-gray3tt hover:bg-gray-200"
                      }`}
                    >
                      {user.is_collaborator ? "✓ Sí" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray3tt text-xs">
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

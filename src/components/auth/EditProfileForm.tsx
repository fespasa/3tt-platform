"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check } from "lucide-react";

const ROLES = [
  { value: "player",       label: "Jugador/a",              emoji: "🎽" },
  { value: "coach",        label: "Entrenador/a",           emoji: "📋" },
  { value: "professional", label: "Profesional del deporte", emoji: "🩺" },
] as const;

const DISCIPLINES = [
  { value: "pista",        label: "Pista (Indoor)", emoji: "🏟️" },
  { value: "playa",        label: "Playa (Beach)",  emoji: "🏖️" },
  { value: "minivolley",   label: "Minivolley",     emoji: "🧒" },
  { value: "volleyhierba", label: "Volley hierba",  emoji: "🌿" },
  { value: "watervolley",  label: "Watervolley",    emoji: "💧" },
  { value: "general",      label: "General",        emoji: "🏐" },
] as const;

type Role = typeof ROLES[number]["value"];
type Discipline = typeof DISCIPLINES[number]["value"];

type Profile = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  role?: string | null;
  discipline?: string | null;
  avatar_url?: string | null;
} | null;

type Props = { profile: Profile; userEmail: string };

export default function EditProfileForm({ profile, userEmail }: Props) {
  const router = useRouter();
  const [fullName, setFullName]   = useState(profile?.full_name ?? "");
  const [username, setUsername]   = useState(profile?.username ?? "");
  const [bio, setBio]             = useState(profile?.bio ?? "");
  const [role, setRole]           = useState<Role>((profile?.role as Role) ?? "player");
  const [discipline, setDiscipline] = useState<Discipline>((profile?.discipline as Discipline) ?? "pista");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sesión caducada"); setLoading(false); return; }

    // Check username uniqueness (only if changed)
    if (username !== profile?.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.trim().toLowerCase())
        .neq("id", user.id)
        .single();
      if (existing) { setError("Ese username ya está en uso"); setLoading(false); return; }
    }

    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name:  fullName.trim(),
        username:   username.trim().toLowerCase(),
        bio:        bio.trim() || null,
        role,
        discipline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setLoading(false);
    if (err) { setError(err.message); return; }

    setSaved(true);
    setTimeout(() => {
      router.push("/perfil");
      router.refresh();
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Email (read-only) */}
      <div>
        <label className="text-navy/60 text-xs font-semibold uppercase tracking-wide block mb-1.5">Email</label>
        <input type="email" value={userEmail} disabled className="input opacity-50 cursor-not-allowed" />
        <p className="text-xs text-gray3tt mt-1">El email no se puede cambiar desde aquí.</p>
      </div>

      {/* Name */}
      <div>
        <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Nombre completo</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Tu nombre"
          required
          className="input"
        />
      </div>

      {/* Username */}
      <div>
        <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray3tt text-sm">@</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
            placeholder="tu_username"
            required
            className="input pl-7"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Bio <span className="normal-case font-normal">(opcional)</span></label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Cuéntanos algo sobre ti..."
          rows={3}
          maxLength={300}
          className="input resize-none"
        />
        <p className="text-xs text-gray3tt mt-1 text-right">{bio.length}/300</p>
      </div>

      {/* Role */}
      <div>
        <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-2">Rol</label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                role === r.value
                  ? "border-teal bg-teal/10 text-teal"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="leading-tight text-center">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discipline */}
      <div>
        <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-2">Disciplina</label>
        <div className="grid grid-cols-4 gap-2">
          {DISCIPLINES.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDiscipline(d.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                discipline === d.value
                  ? "border-teal bg-teal/10 text-teal"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              <span className="text-xl">{d.emoji}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || saved}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {saved && <Check size={16} />}
        {loading ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </form>
  );
}

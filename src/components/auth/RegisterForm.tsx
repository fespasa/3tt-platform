"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserRole = "player" | "coach" | "professional";

export default function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Este email ya está registrado. ¿Quieres acceder?");
        } else if (authError.message.includes("valid email")) {
          setError("Introduce un email válido");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Sync to ActiveCampaign (best-effort, don't block registration)
      fetch("/api/auth/activecampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, role }),
      }).catch(() => {
        // Silent fail — AC sync is non-critical
      });

      setSuccess(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-teal/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground">¡Cuenta creada!</h2>
        <p className="text-muted text-sm">
          Revisa tu bandeja de entrada y confirma tu email para activar tu cuenta.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="btn-primary w-full mt-4"
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="text-secondary text-xs font-semibold uppercase tracking-wider block mb-1.5">
          Nombre completo
        </label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label className="text-secondary text-xs font-semibold uppercase tracking-wider block mb-1.5">
          Email
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label className="text-secondary text-xs font-semibold uppercase tracking-wider block mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="input"
        />
      </div>

      <div>
        <label className="text-secondary text-xs font-semibold uppercase tracking-wider block mb-1.5">
          ¿Eres?
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="input"
        >
          <option value="player">Jugador/a</option>
          <option value="coach">Entrenador/a</option>
          <option value="professional">Profesional del deporte</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>
    </form>
  );
}

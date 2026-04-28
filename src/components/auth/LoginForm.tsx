"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("Email o contraseña incorrectos");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Login exitoso — redirigir
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Email
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input !bg-navy !border-white/15 !text-white placeholder:!text-white/30"
        />
      </div>

      <div>
        <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input !bg-navy !border-white/15 !text-white placeholder:!text-white/30"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Accediendo…" : "Acceder"}
      </button>
    </form>
  );
}

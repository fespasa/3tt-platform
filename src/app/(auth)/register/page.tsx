import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-navy-soft rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <svg width="40" height="40" viewBox="0 0 88 88" fill="none" className="mx-auto mb-4">
            <rect x="4"  y="6"  width="28" height="10" rx="1.5" fill="white"/>
            <rect x="18" y="6"  width="14" height="30" rx="1.5" fill="white"/>
            <rect x="4"  y="28" width="28" height="10" rx="1.5" fill="white"/>
            <rect x="18" y="28" width="14" height="30" rx="1.5" fill="white"/>
            <rect x="4"  y="50" width="28" height="10" rx="1.5" fill="white"/>
            <rect x="38" y="6"  width="20" height="10" rx="1.5" fill="white"/>
            <rect x="44" y="6"  width="8"  height="54" rx="1.5" fill="white"/>
            <rect x="62" y="6"  width="22" height="10" rx="1.5" fill="white"/>
            <rect x="68" y="6"  width="8"  height="54" rx="1.5" fill="white"/>
            <rect x="4"  y="74" width="80" height="10" rx="3"   fill="#00A8A8"/>
          </svg>
          <h1 className="text-2xl font-black text-white">Únete a la Tribu</h1>
          <p className="text-white/50 text-sm mt-1">Crea tu cuenta gratuita en 3Touch Tribe</p>
        </div>

        {/* TODO: RegisterForm client component */}
        <form className="space-y-4">
          <div>
            <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Nombre completo</label>
            <input type="text" placeholder="Tu nombre" className="input !bg-navy !border-white/15 !text-white placeholder:!text-white/30" />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Email</label>
            <input type="email" placeholder="tu@email.com" className="input !bg-navy !border-white/15 !text-white placeholder:!text-white/30" />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" className="input !bg-navy !border-white/15 !text-white placeholder:!text-white/30" />
          </div>
          <div>
            <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">¿Eres?</label>
            <select className="input !bg-navy !border-white/15 !text-white">
              <option value="player">Jugador/a</option>
              <option value="coach">Entrenador/a</option>
              <option value="professional">Profesional del deporte</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Crear cuenta gratis</button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-teal hover:text-teal-light font-semibold">Acceder</Link>
        </p>
      </div>
    </div>
  );
}

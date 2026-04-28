import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-teal/[0.03] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-navy-soft/50 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <Image src="/images/logo-3tt.svg" alt="3TT" width={48} height={58} className="mx-auto" />
            </Link>
            <h1 className="font-display text-4xl text-white tracking-tight">Únete a la Tribu</h1>
            <p className="text-white/35 text-sm mt-2">Crea tu cuenta gratuita en 3Touch Tribe</p>
          </div>

          {/* TODO: RegisterForm client component */}
          <form className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Nombre completo</label>
              <input type="text" placeholder="Tu nombre" className="input" />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" placeholder="tu@email.com" className="input" />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" className="input" />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">¿Eres?</label>
              <select className="input">
                <option value="player">Jugador/a</option>
                <option value="coach">Entrenador/a</option>
                <option value="professional">Profesional del deporte</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Crear cuenta gratis</button>
          </form>

          <p className="text-center text-white/30 text-sm mt-8">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-teal hover:text-teal-light font-semibold transition-colors">Acceder</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Acceder" };

export default function LoginPage() {
  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-4">
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
          <h1 className="text-2xl font-black text-white">Bienvenido de nuevo</h1>
          <p className="text-white/50 text-sm mt-1">Accede a tu cuenta de 3Touch Tribe</p>
        </div>

        <Suspense fallback={<div className="text-white/50 text-center py-4">Cargando…</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-white/40 text-sm mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-teal hover:text-teal-light font-semibold">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

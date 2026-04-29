import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Logo3TT from "@/components/Logo3TT";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-teal/[0.03] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="card backdrop-blur-xl rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <Logo3TT size={48} className="mx-auto" />
            </Link>
            <h1 className="font-display text-4xl text-foreground tracking-tight">Únete a la Tribu</h1>
            <p className="text-muted text-sm mt-2">Crea tu cuenta gratuita en 3Touch Tribe</p>
          </div>

          <Suspense fallback={<div className="text-muted text-center py-4">Cargando...</div>}>
            <RegisterForm />
          </Suspense>

          <p className="text-center text-muted text-sm mt-8">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-teal hover:text-teal-light font-semibold transition-colors">Acceder</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

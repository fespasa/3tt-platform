import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Inicio" };

export default function HomePage() {
  return (
    <div className="gradient-navy text-white min-h-[calc(100vh-70px)] flex flex-col items-center justify-center text-center px-6">
      <p className="text-teal text-xs font-bold uppercase tracking-widest mb-4">🏐 En construcción</p>
      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
        3TOUCH<br /><span className="text-teal">TRIBE</span>
      </h1>
      <p className="text-white/60 text-lg max-w-md mb-10">
        La primera plataforma digital del volleyball en español.
        Formación, comunidad y experiencias live.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/academia" className="btn-primary">Explorar Academia</Link>
        <Link href="/comunidad" className="btn-secondary !text-white !border-white/20 hover:!bg-white/10">Ver Comunidad</Link>
      </div>
    </div>
  );
}

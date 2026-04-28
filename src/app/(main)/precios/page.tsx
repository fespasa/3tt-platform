import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Planes y Precios" };

const INCLUDED_FREE = [
  "Podcast completo",
  "Foros de comunidad",
  "Noticias y artículos",
  "Acceso a eventos gratuitos",
];

const INCLUDED_BASIC = [
  "Todo lo de Gratuito",
  "Cursos de nivel básico e intermedio",
  "Descuentos en cursos premium",
  "Badge exclusivo en el foro",
];

const INCLUDED_ADVANCED = [
  "Todo lo de Básico",
  "Acceso ilimitado a todos los cursos",
  "Masterclasses en directo",
  "Grupo privado de mentoring",
  "Certificados de formación",
  "Prioridad en soporte",
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-teal flex-shrink-0">
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Plan = {
  name: string;
  price_annual: number;
  price_monthly: number;
  description: string;
};

export default async function PreciosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbPlans } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_annual", { ascending: true });

  // Check active membership if logged in
  const { data: activeMembership } = user
    ? await supabase
        .from("user_memberships")
        .select("plan_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()
    : { data: null };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <p className="text-teal text-xs font-bold uppercase tracking-widest mb-3">Planes</p>
        <h1 className="text-4xl md:text-5xl font-black text-navy mb-4">Simple y transparente</h1>
        <p className="text-gray3tt text-lg max-w-lg mx-auto">
          Empieza gratis. Mejora cuando estés listo. Sin permanencias.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">

        {/* FREE */}
        <div className="card p-7 flex flex-col">
          <div className="mb-6">
            <h2 className="font-black text-navy text-xl mb-1">Gratuito</h2>
            <p className="text-gray3tt text-sm">Para empezar a explorar</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-navy">0€</span>
            <span className="text-gray3tt text-sm ml-2">para siempre</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {INCLUDED_FREE.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-navy/80">
                <CheckIcon /> {item}
              </li>
            ))}
          </ul>
          {user
            ? <span className="btn-secondary !py-2.5 !text-sm block text-center cursor-default opacity-60">Plan actual</span>
            : <Link href="/register" className="btn-secondary !py-2.5 !text-sm block text-center">Empezar gratis</Link>
          }
        </div>

        {/* BASIC */}
        <div className="card p-7 flex flex-col border-teal/30">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-black text-navy text-xl">Básico</h2>
              <span className="badge badge-teal text-xs">Popular</span>
            </div>
            <p className="text-gray3tt text-sm">Para los que quieren progresar</p>
          </div>
          <div className="mb-2">
            <span className="text-4xl font-black text-navy">150€</span>
            <span className="text-gray3tt text-sm ml-2">/año</span>
          </div>
          <p className="text-xs text-gray3tt mb-6">≈ 12,50€/mes · facturado anualmente</p>
          <ul className="space-y-3 mb-8 flex-1">
            {INCLUDED_BASIC.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-navy/80">
                <CheckIcon /> {item}
              </li>
            ))}
          </ul>
          {activeMembership
            ? <span className="btn-primary !py-2.5 !text-sm block text-center cursor-default opacity-60">Plan actual</span>
            : <Link href={user ? "/checkout?plan=basic" : "/register"} className="btn-primary !py-2.5 !text-sm block text-center">
                {user ? "Activar Básico" : "Empezar con Básico"}
              </Link>
          }
        </div>

        {/* ADVANCED */}
        <div className="card p-7 flex flex-col bg-navy text-white border-navy">
          <div className="mb-6">
            <h2 className="font-black text-xl mb-1">Advanced</h2>
            <p className="text-white/50 text-sm">Para los serios con el volleyball</p>
          </div>
          <div className="mb-2">
            <span className="text-4xl font-black">250€</span>
            <span className="text-white/50 text-sm ml-2">/año</span>
          </div>
          <p className="text-xs text-white/40 mb-6">≈ 20,83€/mes · facturado anualmente</p>
          <ul className="space-y-3 mb-8 flex-1">
            {INCLUDED_ADVANCED.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="8" fill="#00A8A8" opacity="0.25" />
                  <path d="M5 8l2 2 4-4" stroke="#00A8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={user ? "/checkout?plan=advanced" : "/register"}
            className="block text-center py-2.5 px-4 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            {user ? "Activar Advanced" : "Empezar con Advanced"}
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-navy text-center mb-8">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {[
            {
              q: "¿Puedo cancelar en cualquier momento?",
              a: "Sí. Puedes cancelar tu membresía en cualquier momento desde tu perfil. El acceso se mantiene hasta el final del período pagado.",
            },
            {
              q: "¿Los cursos tienen fecha de caducidad?",
              a: "Los cursos que compres individualmente son tuyos para siempre. Las membresías dan acceso mientras estén activas.",
            },
            {
              q: "¿Hay descuentos para equipos o clubes?",
              a: "Sí, ofrecemos tarifas especiales para grupos. Escríbenos a hola@3touchtribe.com para más información.",
            },
            {
              q: "¿Qué métodos de pago aceptáis?",
              a: "Aceptamos tarjeta de crédito/débito (Visa, Mastercard, Amex) a través de Stripe. Próximamente también transferencia bancaria.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="card p-5 group">
              <summary className="font-semibold text-navy text-sm cursor-pointer list-none flex items-center justify-between">
                {q}
                <span className="text-gray3tt ml-2 transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="text-gray3tt text-sm mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

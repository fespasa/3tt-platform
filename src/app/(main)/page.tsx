import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Logo3TT from "@/components/Logo3TT";
import { ArrowRight, Play, Users, BookOpen, Mic, Calendar, ChevronRight, Zap, Trophy, Globe } from "lucide-react";
import HeroBackground from "@/components/home/HeroBackground";
import ScrollReveal from "@/components/home/ScrollReveal";
import AnimatedCounter from "@/components/home/AnimatedCounter";

export const metadata: Metadata = {
  title: "3Touch Tribe — La plataforma del volleyball en español",
  description: "Formación, comunidad y experiencias live para jugadores, entrenadores y profesionales del volleyball.",
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: threads }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, slug, thumbnail_url, price, level")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("forum_threads")
      .select("id, title, slug, created_at, forum_categories(name, slug)")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  return (
    <div className="overflow-hidden">
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />

      {/* ════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero">
        <HeroBackground />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 md:py-40">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-4 py-1.5 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                <span className="text-teal text-xs font-semibold uppercase tracking-wider">La primera plataforma del volleyball en español</span>
              </div>

              <h1 className="heading-xl mb-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                <span className="text-foreground">3TOUCH</span>
                <br />
                <span className="text-gradient">TRIBE</span>
              </h1>

              <p className="text-secondary text-lg md:text-xl max-w-lg leading-relaxed mb-10 animate-fade-up font-body" style={{ animationDelay: "0.6s" }}>
                Formación de calidad, comunidad activa y experiencias live para
                jugadores, entrenadores y profesionales del volleyball.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.8s" }}>
                <Link href="/academia" className="btn-primary group flex items-center gap-2 text-base">
                  Explorar Academia
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/register" className="btn-secondary flex items-center gap-2 text-base">
                  Unirse gratis
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-surface-alt border-2 border-theme flex items-center justify-center" style={{ borderColor: "var(--bg-primary)" }}>
                        <Users size={12} className="text-teal/60" />
                      </div>
                    ))}
                  </div>
                  <span className="text-muted text-sm">+500 miembros</span>
                </div>
                <div className="w-px h-6" style={{ background: "var(--border)" }} />
                <div className="flex items-center gap-1.5 text-muted text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  100% en español
                </div>
              </div>
            </div>

            {/* Right: Logo */}
            <div className="flex-shrink-0 animate-scale-in" style={{ animationDelay: "0.6s" }}>
              <div className="relative">
                {/* Glow behind logo */}
                <div className="absolute inset-0 scale-150 bg-teal/[0.06] rounded-full blur-[60px]" />
                <Logo3TT size={280} className="relative drop-shadow-[0_0_40px_rgba(0,168,168,0.15)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1.5s" }}>
          <span className="text-muted text-xs uppercase tracking-widest" style={{ opacity: 0.5 }}>Scroll</span>
          <div className="w-5 h-8 rounded-full flex justify-center pt-1.5" style={{ border: "1px solid var(--border)" }}>
            <div className="w-1 h-2 bg-teal/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES — What we offer
          ════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 gradient-section">
        <div className="divider-glow mb-32" />
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="section-label">Todo en un lugar</span>
              <h2 className="heading-lg text-foreground mt-4">
                Hecho para la <span className="text-gradient">tribu</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BookOpen,
                title: "Academia",
                text: "Cursos en vídeo con instructores de élite. Técnica, táctica, preparación física y mentalidad.",
                href: "/academia",
              },
              {
                icon: Users,
                title: "Comunidad",
                text: "Foros activos para debatir, preguntar y conectar con jugadores y entrenadores de toda España y LATAM.",
                href: "/comunidad",
              },
              {
                icon: Mic,
                title: "Podcast",
                text: "Entrevistas y análisis con referentes del volleyball. Escucha en cualquier momento.",
                href: "/podcast",
              },
              {
                icon: Calendar,
                title: "Eventos",
                text: "Torneos, campus y meetups. Experiencias live que conectan a la tribu en persona.",
                href: "/eventos",
              },
            ].map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <Link href={f.href} className="card-glow group block p-7 h-full">
                  <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-5 group-hover:bg-teal/20 group-hover:border-teal/30 transition-all duration-500">
                    <f.icon size={22} className="text-teal" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-3 group-hover:text-teal transition-colors">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4">{f.text}</p>
                  <div className="flex items-center gap-1 text-teal/60 text-sm font-semibold group-hover:text-teal group-hover:gap-2 transition-all">
                    Explorar <ChevronRight size={14} />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS BAR
          ════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <AnimatedCounter end={500} suffix="+" label="Miembros activos" />
            <AnimatedCounter end={25} suffix="+" label="Cursos disponibles" />
            <AnimatedCounter end={100} suffix="+" label="Horas de contenido" />
            <AnimatedCounter end={12} label="Países representados" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          LATEST COURSES
          ════════════════════════════════════════════ */}
      {courses && courses.length > 0 && (
        <section className="py-32 px-6 gradient-section">
          <div className="divider-glow mb-32" />
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="section-label">Formación</span>
                  <h2 className="heading-md text-foreground mt-4">Últimos cursos</h2>
                </div>
                <Link href="/academia" className="hidden md:flex items-center gap-2 text-teal text-sm font-semibold hover:gap-3 transition-all">
                  Ver todos <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <ScrollReveal key={course.id} delay={i * 150}>
                  <Link href={`/academia/${course.slug}`} className="card-glow group block overflow-hidden">
                    <div className="aspect-video relative overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-alt">
                          <Play size={40} className="text-teal/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="badge badge-teal text-[10px]">{course.level ?? "todos"}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground text-sm leading-tight mb-3 group-hover:text-teal transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-teal font-bold text-lg font-display">
                          {course.price > 0 ? `${course.price}€` : "GRATIS"}
                        </span>
                        <ArrowRight size={16} className="text-muted group-hover:text-teal group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <Link href="/academia" className="md:hidden flex items-center justify-center gap-2 text-teal text-sm font-semibold mt-8 hover:gap-3 transition-all">
              Ver todos los cursos <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          WHY 3TT — Value proposition
          ════════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal variant="left">
              <div>
                <span className="section-label">Por qué 3Touch Tribe</span>
                <h2 className="heading-lg text-foreground mt-4 mb-8">
                  El volleyball merece
                  <br />
                  <span className="text-gradient">su propia casa</span>
                </h2>
                <p className="text-secondary text-lg leading-relaxed mb-8">
                  Creamos el espacio que la comunidad volleybolera siempre necesitó:
                  contenido profesional en español, una comunidad real y experiencias
                  que te hacen crecer dentro y fuera de la cancha.
                </p>
                <div className="space-y-5">
                  {[
                    { icon: Zap, text: "Contenido creado por profesionales en activo" },
                    { icon: Trophy, text: "Metodología basada en el alto rendimiento" },
                    { icon: Globe, text: "Comunidad hispanohablante internacional" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center flex-shrink-0">
                        <item.icon size={18} className="text-teal" />
                      </div>
                      <span className="text-secondary text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={200}>
              <div className="relative">
                {/* Abstract volleyball court visualization */}
                <div className="aspect-square relative rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
                    {/* Court perspective */}
                    <defs>
                      <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="400">
                        <stop offset="0%" stopColor="#00A8A8" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#00A8A8" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Perspective court */}
                    <polygon points="80,350 320,350 380,150 20,150" fill="url(#courtGrad)" stroke="rgba(0,168,168,0.2)" strokeWidth="1" />
                    {/* Center line */}
                    <line x1="200" y1="350" x2="200" y2="150" stroke="rgba(0,168,168,0.15)" strokeWidth="1" />
                    {/* Net */}
                    <line x1="20" y1="250" x2="380" y2="250" stroke="rgba(0,168,168,0.3)" strokeWidth="2" strokeDasharray="6 4" />
                    {/* Attack lines */}
                    <line x1="125" y1="350" x2="85" y2="150" stroke="rgba(0,168,168,0.1)" strokeWidth="1" />
                    <line x1="275" y1="350" x2="315" y2="150" stroke="rgba(0,168,168,0.1)" strokeWidth="1" />

                    {/* Ball trajectory - 3 touches */}
                    <circle cx="120" cy="310" r="6" fill="#00A8A8" opacity="0.3">
                      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="220" r="8" fill="#00A8A8" opacity="0.5">
                      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" begin="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="280" cy="270" r="10" fill="#00A8A8" opacity="0.7">
                      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" begin="1s" repeatCount="indefinite" />
                    </circle>

                    {/* Trajectory path */}
                    <path d="M120 310 Q160 230 200 220 Q240 210 280 270" stroke="#00A8A8" strokeWidth="1" opacity="0.2" strokeDasharray="4 4">
                      <animate attributeName="strokeDashoffset" from="80" to="0" dur="3s" repeatCount="indefinite" />
                    </path>

                    {/* Labels */}
                    <text x="112" y="335" fill="#00A8A8" opacity="0.4" fontSize="10" fontFamily="monospace">1</text>
                    <text x="192" y="210" fill="#00A8A8" opacity="0.5" fontSize="10" fontFamily="monospace">2</text>
                    <text x="272" y="260" fill="#00A8A8" opacity="0.6" fontSize="10" fontFamily="monospace">3</text>
                  </svg>

                  {/* Glowing corner accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-teal/20 rounded-tl-3xl" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-teal/20 rounded-br-3xl" />
                </div>

                {/* Floating stat card */}
                <div className="absolute -bottom-4 -right-4 backdrop-blur-xl rounded-xl p-4 shadow-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-hover)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                      <Trophy size={18} className="text-teal" />
                    </div>
                    <div>
                      <div className="text-foreground text-sm font-bold">3 Toques</div>
                      <div className="text-muted text-xs">Recepción · Colocación · Ataque</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          COMMUNITY THREADS
          ════════════════════════════════════════════ */}
      {threads && threads.length > 0 && (
        <section className="py-32 px-6 gradient-section">
          <div className="divider-glow mb-32" />
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="section-label">Conversaciones</span>
                  <h2 className="heading-md text-foreground mt-4">En la comunidad</h2>
                </div>
                <Link href="/comunidad" className="flex items-center gap-2 text-teal text-sm font-semibold hover:gap-3 transition-all">
                  Ver todo <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {threads.map((thread, i) => {
                const cat = thread.forum_categories as unknown as { name: string; slug: string } | null;
                return (
                  <ScrollReveal key={thread.id} delay={i * 100}>
                    <Link
                      href={`/comunidad/${cat?.slug}/${thread.slug}`}
                      className="card-glow group flex items-center gap-5 p-5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                        <Users size={18} className="text-teal/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate group-hover:text-teal transition-colors">{thread.title}</p>
                        {cat && <p className="text-xs text-muted mt-0.5">{cat.name}</p>}
                      </div>
                      <ChevronRight size={16} className="text-muted group-hover:text-teal/50 transition-colors flex-shrink-0" />
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          CTA FINAL
          ════════════════════════════════════════════ */}
      <section className="relative py-40 px-6 gradient-cta overflow-hidden">
        <div className="divider-glow mb-40" />

        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal/[0.04] blur-[100px]" />
        </div>

        <ScrollReveal variant="scale">
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="heading-lg text-foreground mb-6">
              Únete a la <span className="text-gradient">tribu</span>
            </h2>
            <p className="text-secondary text-xl leading-relaxed mb-10 max-w-xl mx-auto">
              Regístrate gratis y accede al podcast, los foros y contenidos exclusivos.
              La comunidad del volleyball te espera.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn-primary group flex items-center gap-2 text-lg px-10 py-4">
                Crear cuenta gratis
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="text-muted text-xs mt-6" style={{ opacity: 0.5 }}>Sin compromiso · Cancela cuando quieras</p>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

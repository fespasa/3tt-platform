import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "3Touch Tribe — La plataforma del volleyball en español",
  description: "Formación, comunidad y experiencias live para jugadores, entrenadores y profesionales del volleyball.",
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch latest courses and recent forum threads in parallel
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

      {/* ── HERO ── */}
      <section className="gradient-navy text-white pt-24 pb-32 px-6 text-center relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-teal text-xs font-bold uppercase tracking-widest mb-5">🏐 La primera plataforma del volleyball en español</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            3TOUCH<br /><span className="text-teal">TRIBE</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Formación de calidad, comunidad activa y experiencias live para jugadores,
            entrenadores y profesionales del volleyball.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/academia" className="btn-primary !text-base !py-3 !px-8">
              Explorar Academia
            </Link>
            <Link href="/register" className="btn-secondary !text-white !border-white/20 hover:!bg-white/10 !text-base !py-3 !px-8">
              Unirse gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-offwhite">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal text-xs font-bold uppercase tracking-widest text-center mb-3">Todo en un lugar</p>
          <h2 className="text-3xl md:text-4xl font-black text-navy text-center mb-12">Hecho para la tribu</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎓",
                title: "Academia",
                text: "Cursos en vídeo con instructores de élite. Técnica, táctica, preparación física y mentalidad.",
                href: "/academia",
              },
              {
                icon: "💬",
                title: "Comunidad",
                text: "Foros activos para debatir, preguntar y conectar con jugadores y entrenadores de toda España y LATAM.",
                href: "/comunidad",
              },
              {
                icon: "🎙️",
                title: "Podcast",
                text: "Entrevistas y análisis con referentes del volleyball. Escucha en cualquier momento y lugar.",
                href: "/podcast",
              },
            ].map(f => (
              <Link key={f.title} href={f.href} className="card p-7 hover:border-teal/30 hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-black text-navy text-lg mb-2">{f.title}</h3>
                <p className="text-gray3tt text-sm leading-relaxed">{f.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST COURSES ── */}
      {courses && courses.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-navy">Últimos cursos</h2>
              <Link href="/academia" className="text-teal text-sm font-semibold hover:underline">Ver todos →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/academia/${course.slug}`}
                  className="card overflow-hidden hover:border-teal/30 hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-video bg-navy overflow-hidden">
                    {course.thumbnail_url
                      ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">🏐</div>
                    }
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-navy text-xs capitalize">{course.level ?? "todos los niveles"}</span>
                    </div>
                    <h3 className="font-semibold text-navy text-sm leading-tight mb-2">{course.title}</h3>
                    <p className="text-teal font-black text-sm">
                      {course.price > 0 ? `${course.price}€` : "Gratuito"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMMUNITY THREADS ── */}
      {threads && threads.length > 0 && (
        <section className="py-20 px-6 bg-offwhite">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-navy">En la comunidad</h2>
              <Link href="/comunidad" className="text-teal text-sm font-semibold hover:underline">Ver todo →</Link>
            </div>
            <div className="space-y-3">
              {threads.map(thread => {
                const cat = thread.forum_categories as unknown as { name: string; slug: string } | null;
                return (
                  <Link
                    key={thread.id}
                    href={`/comunidad/${cat?.slug}/${thread.slug}`}
                    className="card flex items-center gap-4 p-4 hover:border-teal/30 transition-colors"
                  >
                    <div className="text-2xl flex-shrink-0">💬</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">{thread.title}</p>
                      {cat && <p className="text-xs text-gray3tt mt-0.5">{cat.name}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="gradient-navy py-24 px-6 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Únete a la tribu</h2>
          <p className="text-white/60 text-lg mb-8">
            Regístrate gratis y accede al podcast, los foros y contenidos exclusivos.
          </p>
          <Link href="/register" className="btn-primary !text-base !py-3 !px-10">
            Crear cuenta gratis
          </Link>
        </div>
      </section>

    </div>
  );
}

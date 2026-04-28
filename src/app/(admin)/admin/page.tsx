"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatsCard from "@/components/admin/StatsCard";

interface Stats {
  users: number;
  threads: number;
  replies: number;
  newsletter: number;
  content: number;
  events: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const [users, threads, replies, newsletter, content, events] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("forum_threads").select("*", { count: "exact", head: true }),
        supabase.from("forum_replies").select("*", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("content_items").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        users: users.count ?? 0,
        threads: threads.count ?? 0,
        replies: replies.count ?? 0,
        newsletter: newsletter.count ?? 0,
        content: content.count ?? 0,
        events: events.count ?? 0,
      });
    })();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy tracking-tight">Dashboard</h1>
        <p className="text-gray3tt text-sm mt-1">Vista general de 3Touch Tribe</p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray/20 rounded w-20 mb-3" />
              <div className="h-8 bg-gray/20 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard icon="👥" label="Usuarios" value={stats.users} sub="Perfiles registrados" />
          <StatsCard icon="💬" label="Hilos foro" value={stats.threads} sub="Discusiones creadas" />
          <StatsCard icon="↩️" label="Respuestas" value={stats.replies} sub="En el foro" />
          <StatsCard icon="📧" label="Newsletter" value={stats.newsletter} sub="Suscriptores" />
          <StatsCard icon="🎙️" label="Contenido" value={stats.content} sub="Podcast, artículos..." />
          <StatsCard icon="📅" label="Eventos" value={stats.events} sub="Clinics, torneos..." />
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="text-lg font-black text-navy mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/contenido" className="btn-primary !text-sm !py-2 !px-5">+ Nuevo contenido</a>
          <a href="/admin/eventos" className="btn-primary !text-sm !py-2 !px-5">+ Nuevo evento</a>
          <a href="/admin/foro" className="btn-secondary !text-sm !py-2 !px-5">Gestionar foro</a>
          <a href="/admin/newsletter" className="btn-secondary !text-sm !py-2 !px-5">Ver newsletter</a>
        </div>
      </div>

      {/* Placeholder hero image */}
      <div className="mt-10 rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=400&fit=crop"
          alt="Volleyball action"
          className="w-full h-48 object-cover"
        />
      </div>
    </div>
  );
}

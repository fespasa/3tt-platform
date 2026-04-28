import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import NewThreadButton from "@/components/comunidad/NewThreadButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_categories")
    .select("name, description")
    .eq("slug", slug)
    .single();
  return { title: data?.name ?? "Comunidad" };
}

export default async function ComunidadCategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: category } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: threads } = await supabase
    .from("forum_threads")
    .select(`
      id, title, slug, created_at, is_pinned, is_locked, views,
      profiles:author_id (full_name, username, avatar_url),
      forum_replies(count)
    `)
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray3tt mb-6">
        <Link href="/comunidad" className="hover:text-teal transition-colors">Comunidad</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy">{category.name}</h1>
          {category.description && (
            <p className="text-gray3tt mt-2">{category.description}</p>
          )}
        </div>
        {user && <NewThreadButton categoryId={String(category.id)} categorySlug={slug} />}
      </div>

      {/* Threads */}
      {threads && threads.length > 0 ? (
        <div className="space-y-2">
          {threads.map(thread => {
            const profile = thread.profiles as unknown as { full_name: string; username: string; avatar_url?: string } | null;
            const replyCount = (thread.forum_replies as unknown as [{ count: number }])?.[0]?.count ?? 0;

            return (
              <Link
                key={thread.id}
                href={`/comunidad/${slug}/${thread.slug}`}
                className="card flex items-start gap-4 p-4 hover:border-teal/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-teal font-black text-sm flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    : profile?.full_name?.[0]?.toUpperCase() ?? "?"
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {thread.is_pinned && (
                      <span className="badge badge-teal text-xs">📌 Fijado</span>
                    )}
                    {thread.is_locked && (
                      <span className="badge badge-navy text-xs">🔒 Cerrado</span>
                    )}
                    <h2 className="font-semibold text-navy text-sm hover:text-teal transition-colors truncate">
                      {thread.title}
                    </h2>
                  </div>
                  <p className="text-xs text-gray3tt mt-1">
                    por <span className="font-semibold">@{profile?.username}</span>
                    {" · "}
                    {thread.created_at && formatDate(thread.created_at, { day: "numeric", month: "short" })}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray3tt flex-shrink-0">
                  <span title="Respuestas">💬 {replyCount}</span>
                  <span title="Vistas">👁 {thread.views ?? 0}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🏐</p>
          <p className="text-navy font-semibold mb-1">Aún no hay hilos</p>
          <p className="text-gray3tt text-sm">
            {user ? "¡Sé el primero en empezar una conversación!" : "Inicia sesión para participar."}
          </p>
          {!user && (
            <Link href="/login" className="btn-primary !py-2 !px-4 !text-sm inline-block mt-4">
              Acceder
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

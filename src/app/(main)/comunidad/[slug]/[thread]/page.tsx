import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import ReplyForm from "@/components/comunidad/ReplyForm";

type Props = { params: Promise<{ slug: string; thread: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { thread: threadSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_threads")
    .select("title")
    .eq("slug", threadSlug)
    .single();
  return { title: data?.title ?? "Hilo" };
}

type Profile = { full_name: string; username: string; avatar_url?: string; role?: string };

function UserAvatar({ profile, size = "md" }: { profile: Profile | null; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${cls} rounded-full bg-navy flex items-center justify-center text-teal font-black flex-shrink-0 overflow-hidden`}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
        : profile?.full_name?.[0]?.toUpperCase() ?? "?"
      }
    </div>
  );
}

export default async function ThreadDetailPage({ params }: Props) {
  const { slug, thread: threadSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get category
  const { data: category } = await supabase
    .from("forum_categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Get thread
  const { data: thread } = await supabase
    .from("forum_threads")
    .select(`*, profiles:author_id (full_name, username, avatar_url, role)`)
    .eq("slug", threadSlug)
    .eq("category_id", category.id)
    .single();

  if (!thread) notFound();

  // Increment views (fire and forget)
  supabase
    .from("forum_threads")
    .update({ views: (thread.views ?? 0) + 1 })
    .eq("id", thread.id)
    .then(() => {});

  // Get replies
  const { data: replies } = await supabase
    .from("forum_replies")
    .select(`*, profiles:author_id (full_name, username, avatar_url, role)`)
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const authorProfile = thread.profiles as unknown as Profile | null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray3tt mb-6">
        <Link href="/comunidad" className="hover:text-teal transition-colors">Comunidad</Link>
        <span className="mx-2">/</span>
        <Link href={`/comunidad/${slug}`} className="hover:text-teal transition-colors">{category.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-navy truncate">{thread.title}</span>
      </nav>

      {/* Thread header */}
      <div className="mb-8">
        <div className="flex gap-2 flex-wrap mb-3">
          {thread.is_pinned && <span className="badge badge-teal text-xs">📌 Fijado</span>}
          {thread.is_locked && <span className="badge badge-navy text-xs">🔒 Cerrado</span>}
        </div>
        <h1 className="text-2xl font-black text-navy">{thread.title}</h1>
      </div>

      {/* Original post */}
      <div className="card p-6 mb-4">
        <div className="flex gap-4">
          <UserAvatar profile={authorProfile} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-navy text-sm">@{authorProfile?.username}</span>
              {authorProfile?.role && (
                <span className="badge badge-navy text-xs capitalize">{authorProfile.role}</span>
              )}
              <span className="text-xs text-gray3tt ml-auto">
                {thread.created_at && formatDate(thread.created_at, { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-navy/80 leading-relaxed whitespace-pre-wrap">
              {thread.content}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="space-y-3 mb-8">
          <p className="text-sm font-semibold text-gray3tt uppercase tracking-wide">
            {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
          </p>
          {replies.map(reply => {
            const replyProfile = reply.profiles as unknown as Profile | null;
            return (
              <div key={reply.id} className="card p-5">
                <div className="flex gap-3">
                  <UserAvatar profile={replyProfile} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-navy text-sm">@{replyProfile?.username}</span>
                      {replyProfile?.role && (
                        <span className="text-xs text-gray3tt capitalize">{replyProfile.role}</span>
                      )}
                      <span className="text-xs text-gray3tt ml-auto">
                        {reply.created_at && formatDate(reply.created_at, { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply form */}
      {user && !thread.is_locked ? (
        <div className="mt-8">
          <h2 className="font-black text-navy text-sm uppercase tracking-wide mb-4">Tu respuesta</h2>
          <ReplyForm threadId={thread.id} categorySlug={slug} threadSlug={threadSlug} />
        </div>
      ) : !user ? (
        <div className="card p-6 text-center mt-8">
          <p className="text-navy font-semibold mb-3">Inicia sesión para responder</p>
          <Link href={`/login?redirectTo=/comunidad/${slug}/${threadSlug}`} className="btn-primary !py-2 !px-6 !text-sm">
            Acceder
          </Link>
        </div>
      ) : (
        <div className="card p-4 text-center mt-8">
          <p className="text-gray3tt text-sm">🔒 Este hilo está cerrado</p>
        </div>
      )}
    </div>
  );
}

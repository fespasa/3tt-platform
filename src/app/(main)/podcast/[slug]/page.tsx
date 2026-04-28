import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select("title, description")
    .eq("slug", slug)
    .eq("type", "podcast")
    .single();
  return { title: data?.title ?? "Episodio" };
}

export default async function PodcastEpisodePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: episode } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .eq("type", "podcast")
    .single();

  if (!episode || !episode.is_published) notFound();

  // Related episodes
  const { data: related } = await supabase
    .from("content_items")
    .select("id, title, slug, thumbnail_url, published_at")
    .eq("type", "podcast")
    .eq("is_published", true)
    .neq("id", episode.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const duration = episode.duration_mins;
  const formatDuration = (mins: number) => {
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins}min`;
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray3tt mb-6">
        <Link href="/podcast" className="hover:text-teal transition-colors">Podcast</Link>
        <span className="mx-2">/</span>
        <span className="text-navy truncate">{episode.title}</span>
      </nav>

      {/* Hero */}
      <div className="card overflow-hidden mb-8">
        {episode.thumbnail_url && (
          <div className="aspect-video bg-navy overflow-hidden">
            <img src={episode.thumbnail_url} alt={episode.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {episode.tags?.map((tag: string) => (
              <span key={tag} className="badge badge-teal text-xs">{tag}</span>
            ))}
            {duration && (
              <span className="text-xs text-gray3tt">🎙️ {formatDuration(duration)}</span>
            )}
            {episode.published_at && (
              <span className="text-xs text-gray3tt ml-auto">
                {formatDate(episode.published_at, { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-navy mb-4">{episode.title}</h1>
          {episode.description && (
            <p className="text-gray3tt leading-relaxed">{episode.description}</p>
          )}
        </div>
      </div>

      {/* Audio player placeholder */}
      {episode.audio_url && (
        <div className="card p-5 mb-8">
          <p className="text-xs text-gray3tt uppercase font-semibold tracking-wide mb-3">Escuchar episodio</p>
          <audio
            controls
            className="w-full"
            src={episode.audio_url}
          >
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      )}

      {/* Content body */}
      {episode.content_body && (
        <div className="card p-6 mb-10">
          <h2 className="font-black text-navy text-sm uppercase tracking-wide mb-4">Notas del episodio</h2>
          <div className="text-navy/80 text-sm leading-relaxed whitespace-pre-wrap">
            {episode.content_body}
          </div>
        </div>
      )}

      {/* Related episodes */}
      {related && related.length > 0 && (
        <div>
          <h2 className="font-black text-navy text-lg mb-5">Más episodios</h2>
          <div className="space-y-3">
            {related.map(ep => (
              <Link
                key={ep.id}
                href={`/podcast/${ep.slug}`}
                className="card flex items-center gap-4 p-4 hover:border-teal/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-navy flex-shrink-0 overflow-hidden">
                  {ep.thumbnail_url
                    ? <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🎙️</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy text-sm truncate">{ep.title}</p>
                  {ep.published_at && (
                    <p className="text-xs text-gray3tt mt-0.5">
                      {formatDate(ep.published_at, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

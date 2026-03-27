import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { ContentItem } from "@/types/database.types";

export const metadata: Metadata = { title: "Podcast" };

export default async function PodcastPage() {
  const supabase = await createClient();
  const { data: episodes } = await supabase
    .from("content_items")
    .select("*")
    .eq("type", "podcast")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <span className="badge badge-teal mb-4">🎙️ Podcast</span>
        <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-4">
          3TT Podcast
        </h1>
        <p className="text-gray3tt text-lg max-w-xl mx-auto">
          Conversaciones con los protagonistas del volleyball español e internacional.
          Entrenadores, jugadores y profesionales que viven el deporte desde dentro.
        </p>
      </div>

      {!episodes || episodes.length === 0 ? (
        <div className="text-center py-24 text-gray3tt">
          <div className="text-6xl mb-4">🎙️</div>
          <p className="text-lg font-semibold">Episodios próximamente</p>
          <p className="text-sm mt-2">El primer episodio está en camino. ¡Suscríbete para no perdértelo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(episodes as ContentItem[]).map((ep, i) => (
            <EpisodeRow key={ep.id} episode={ep} number={episodes.length - i} />
          ))}
        </div>
      )}

      {/* Subscribe CTA */}
      <div className="mt-16 bg-navy rounded-2xl p-8 text-center text-white">
        <p className="text-teal text-xs font-bold uppercase tracking-widest mb-3">Disponible en</p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {["Spotify", "Apple Podcasts", "iVoox", "Google Podcasts"].map(p => (
            <span key={p} className="text-white/60 text-sm font-medium hover:text-teal cursor-pointer transition-colors">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EpisodeRow({ episode, number }: { episode: ContentItem; number: number }) {
  const mins = episode.duration_mins ?? 0;
  return (
    <div className="card p-5 flex gap-4 hover:border-teal/30 transition-colors cursor-pointer">
      <div className="w-14 h-14 rounded-xl bg-offwhite flex items-center justify-center font-black text-navy text-lg flex-shrink-0">
        #{number}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-navy text-sm line-clamp-1 mb-1">{episode.title}</h3>
        <p className="text-xs text-gray3tt line-clamp-2 mb-2">{episode.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray3tt">
          {episode.published_at && <span>{formatDate(episode.published_at)}</span>}
          {mins > 0 && <span>· {mins} min</span>}
          {episode.is_premium && <span className="badge badge-teal !text-[10px] !py-0.5">Premium</span>}
        </div>
      </div>
      <button className="w-10 h-10 rounded-full bg-teal/10 hover:bg-teal hover:text-white text-teal flex items-center justify-center flex-shrink-0 transition-colors">
        ▶
      </button>
    </div>
  );
}

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Event } from "@/types/database.types";

export const metadata: Metadata = { title: "Eventos" };

const EVENT_LABELS: Record<string, string> = {
  clinic:           "Clinic",
  torneo_signature: "Torneo 3TT",
  webinar:          "Webinar",
  masterclass:      "Masterclass",
};

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("end_date", new Date().toISOString())
    .order("start_date");

  const { data: pastEvents } = await supabase
    .from("events")
    .select("*")
    .in("status", ["completed", "published"])
    .lt("end_date", new Date().toISOString())
    .order("start_date", { ascending: false })
    .limit(6);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="badge badge-teal mb-3">Experiencias Live</span>
        <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight">Eventos</h1>
        <p className="text-gray3tt text-lg mt-3 max-w-xl">
          Clinics, torneos signature y masterclasses. Experiencias presenciales y online
          para todos los niveles.
        </p>
      </div>

      {/* Próximos eventos */}
      <h2 className="text-lg font-black text-navy uppercase tracking-wide mb-5">Próximos eventos</h2>
      {!events || events.length === 0 ? (
        <div className="bg-offwhite rounded-2xl p-12 text-center text-gray3tt mb-12">
          <div className="text-5xl mb-3">🏆</div>
          <p className="font-semibold">No hay eventos programados aún</p>
          <p className="text-sm mt-1">Suscríbete para ser el primero en enterarte</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(events as Event[]).map(ev => <EventCard key={ev.id} event={ev} />)}
        </div>
      )}

      {/* Eventos pasados */}
      {pastEvents && pastEvents.length > 0 && (
        <>
          <h2 className="text-lg font-black text-navy uppercase tracking-wide mb-5 mt-8">Ediciones anteriores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
            {(pastEvents as Event[]).map(ev => <EventCard key={ev.id} event={ev} past />)}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  return (
    <div className={`card overflow-hidden ${past ? "grayscale" : ""}`}>
      <div className="aspect-[16/9] bg-navy relative">
        {event.thumbnail_url
          ? <img src={event.thumbnail_url} alt={event.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🏆</div>
        }
        <span className="absolute top-3 left-3 badge badge-teal">{EVENT_LABELS[event.type] ?? event.type}</span>
        {event.is_online && <span className="absolute top-3 right-3 badge badge-navy">Online</span>}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-navy text-sm mb-2 line-clamp-2">{event.title}</h3>
        <div className="text-xs text-gray3tt space-y-1 mb-4">
          <p>📅 {formatDate(event.start_date, { dateStyle: "long" })}</p>
          {event.location && <p>📍 {event.location}</p>}
          {event.capacity && <p>👥 Aforo: {event.capacity} personas</p>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black text-navy text-sm">{event.price === 0 ? "Gratis" : formatPrice(event.price)}</span>
            {event.price_member && (
              <span className="text-xs text-teal ml-2">{formatPrice(event.price_member)} socios</span>
            )}
          </div>
          {!past && (
            <a href={`/eventos/${event.slug}`} className="btn-primary !py-2 !px-4 !text-xs">
              Inscribirme
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { ForumCategory } from "@/types/database.types";

export const metadata: Metadata = { title: "Comunidad" };

export default async function ComunidadPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("is_active", true)
    .order("position");

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="badge badge-teal mb-3">Hub de la Tribu</span>
        <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight">Comunidad</h1>
        <p className="text-gray3tt text-lg mt-3">
          Debates, análisis técnico y espacio de encuentro para toda la tribu del volleyball.
        </p>
      </div>

      <div className="space-y-3">
        {(categories ?? []).map((cat: ForumCategory) => (
          <a
            key={cat.id}
            href={`/comunidad/${cat.slug}`}
            className="card flex items-center gap-5 p-5 hover:border-teal/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-offwhite flex items-center justify-center text-2xl flex-shrink-0">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy text-sm">{cat.name}</h3>
              <p className="text-xs text-gray3tt truncate">{cat.description}</p>
            </div>
            {cat.target_role && (
              <span className="badge badge-navy capitalize text-xs hidden sm:inline-flex">
                {cat.target_role}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

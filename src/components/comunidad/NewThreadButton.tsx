"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { Loader2, X } from "lucide-react";

type Props = { categoryId: string; categorySlug: string };

export default function NewThreadButton({ categoryId, categorySlug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Debes iniciar sesión"); setLoading(false); return; }

    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const { data, error: err } = await supabase
      .from("forum_threads")
      .insert({ category_id: Number(categoryId), author_id: user.id, title: title.trim(), slug, content: content.trim() })
      .select("slug")
      .single();

    setLoading(false);
    if (err) { setError(err.message); return; }

    setOpen(false);
    setTitle("");
    setContent("");
    router.push(`/comunidad/${categorySlug}/${data.slug}`);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary !py-2 !px-4 !text-sm flex-shrink-0">
        + Nuevo hilo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-navy text-lg">Nuevo hilo</h2>
              <button onClick={() => setOpen(false)} className="text-gray3tt hover:text-navy">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
              )}
              <div>
                <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="¿Sobre qué quieres hablar?"
                  required
                  maxLength={200}
                  className="input"
                />
              </div>
              <div>
                <label className="text-navy/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">Contenido</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Desarrolla tu pregunta o tema..."
                  required
                  rows={6}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary !py-2 !px-4 !text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Publicando…" : "Publicar hilo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

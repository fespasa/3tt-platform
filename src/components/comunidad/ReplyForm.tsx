"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type Props = { threadId: string; categorySlug: string; threadSlug: string };

export default function ReplyForm({ threadId, categorySlug, threadSlug }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Debes iniciar sesión"); setLoading(false); return; }

    const { error: err } = await supabase
      .from("forum_replies")
      .insert({ thread_id: threadId, author_id: user.id, content: content.trim() });

    setLoading(false);
    if (err) { setError(err.message); return; }

    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escribe tu respuesta..."
        required
        rows={5}
        className="input resize-none"
      />
      <div className="flex justify-end">
        <button type="submit" disabled={loading || !content.trim()} className="btn-primary !py-2 !px-5 !text-sm flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Enviando…" : "Responder"}
        </button>
      </div>
    </form>
  );
}

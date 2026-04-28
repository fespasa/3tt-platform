"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await fetch("/api/courses/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, rating, comment }),
    });
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="card p-5">
      <h4 className="font-bold text-foreground text-sm mb-3">Deja tu reseña</h4>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            className="text-2xl transition-colors"
          >
            <span className={(hover || rating) >= star ? "text-amber-500" : "text-muted"}>★</span>
          </button>
        ))}
      </div>
      <textarea
        className="input text-sm"
        rows={3}
        placeholder="Cuéntanos qué te ha parecido el curso (opcional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="btn-primary !text-sm !py-2 mt-3 disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Enviar reseña"}
      </button>
    </div>
  );
}

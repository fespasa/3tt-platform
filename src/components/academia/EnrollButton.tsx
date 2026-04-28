"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  price: number;
  priceMember?: number | null;
  isEnrolled: boolean;
  isLoggedIn: boolean;
}

export default function EnrollButton({
  courseId, courseSlug, price, priceMember, isEnrolled, isLoggedIn,
}: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isFree = price === 0;

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/academia/${courseSlug}/aprender`)}
        className="btn-primary w-full text-center"
      >
        Continuar aprendiendo →
      </button>
    );
  }

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirectTo=/academia/${courseSlug}`);
      return;
    }

    setLoading(true);

    if (isFree) {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        router.push(`/academia/${courseSlug}/aprender`);
        router.refresh();
      }
    } else {
      // Paid: create Stripe Checkout session
      const res = await fetch("/api/courses/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    }

    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="btn-primary w-full text-center disabled:opacity-50"
      >
        {loading
          ? "Procesando..."
          : isFree
            ? "Inscribirse gratis"
            : `Comprar por ${formatPrice(price)}`}
      </button>
      {!isFree && priceMember && priceMember < price && (
        <p className="text-xs text-muted text-center mt-2">
          Miembros: <span className="text-teal font-semibold">{formatPrice(priceMember)}</span>
        </p>
      )}
    </div>
  );
}

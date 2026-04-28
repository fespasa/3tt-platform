"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const LEVELS = [
  { value: "", label: "Todos los niveles" },
  { value: "fundamentos", label: "Fundamentos" },
  { value: "avanzado", label: "Avanzado" },
  { value: "especializacion", label: "Especialización" },
  { value: "elite", label: "Élite" },
];

const DISCIPLINES = [
  { value: "", label: "Todas las disciplinas" },
  { value: "pista", label: "Pista" },
  { value: "playa", label: "Playa" },
  { value: "minivolley", label: "Minivolley" },
  { value: "volleyhierba", label: "Volleyhierba" },
  { value: "watervolley", label: "Watervolley" },
  { value: "general", label: "General" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Cualquier precio" },
  { value: "free", label: "Gratis" },
  { value: "paid", label: "De pago" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "popular", label: "Más populares" },
  { value: "rating", label: "Mejor valorados" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export default function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/academia?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <input
        type="text"
        placeholder="Buscar cursos..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={e => {
          clearTimeout((window as any).__searchTimer);
          (window as any).__searchTimer = setTimeout(() => update("q", e.target.value), 400);
        }}
        className="input !py-2 !text-sm flex-1 min-w-[200px]"
      />
      <select
        className="input !py-2 !text-sm !w-auto"
        value={searchParams.get("level") ?? ""}
        onChange={e => update("level", e.target.value)}
      >
        {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
      <select
        className="input !py-2 !text-sm !w-auto"
        value={searchParams.get("discipline") ?? ""}
        onChange={e => update("discipline", e.target.value)}
      >
        {DISCIPLINES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
      </select>
      <select
        className="input !py-2 !text-sm !w-auto"
        value={searchParams.get("price") ?? ""}
        onChange={e => update("price", e.target.value)}
      >
        {PRICE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <select
        className="input !py-2 !text-sm !w-auto"
        value={searchParams.get("sort") ?? "recent"}
        onChange={e => update("sort", e.target.value)}
      >
        {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
}

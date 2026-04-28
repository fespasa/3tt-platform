import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CourseWithInstructor } from "@/types/database.types";
import CourseGrid from "@/components/academia/CourseGrid";
import CourseFilters from "@/components/academia/CourseFilters";

export const metadata: Metadata = { title: "Academia — 3Touch Tribe" };

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AcademiaPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("v_courses_with_instructor")
    .select("*")
    .eq("is_published", true);

  // Apply filters
  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }
  if (params.level) {
    query = query.eq("level", params.level as any);
  }
  if (params.discipline) {
    query = query.eq("discipline", params.discipline as any);
  }
  if (params.price === "free") {
    query = query.eq("price", 0);
  } else if (params.price === "paid") {
    query = query.gt("price", 0);
  }

  // Sort
  switch (params.sort) {
    case "popular":
      query = query.order("enrollments_count", { ascending: false, nullsFirst: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false, nullsFirst: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: courses } = await query.limit(30);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="badge badge-teal mb-3">Academia 3TT</span>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Aprende con los mejores
        </h1>
        <p className="text-muted text-lg mt-3 max-w-xl">
          Cursos impartidos por entrenadores, jugadores y profesionales del volleyball.
        </p>
      </div>

      <Suspense fallback={null}>
        <CourseFilters />
      </Suspense>

      <CourseGrid courses={(courses ?? []) as CourseWithInstructor[]} />
    </div>
  );
}

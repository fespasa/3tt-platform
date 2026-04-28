# Courses Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Udemy-style courses platform for 3Touch Tribe with public catalog, lesson player, quizzes, certificates, Stripe payments, and admin CRUD.

**Architecture:** Next.js 15 App Router with server components for data fetching and client components for interactivity. Supabase for DB/auth/storage. Stripe Checkout for payments. jsPDF for client-side certificate generation. HLS.js for adaptive video streaming. All pages use the existing CSS variable theme system (light/dark).

**Tech Stack:** Next.js 15, React 19, Supabase (existing), Stripe (installed), HLS.js (new), jsPDF (new), Tailwind CSS 3, TypeScript 5

---

## File Map

### New files to create

```
# Database migration
supabase/migrations/20260428_quizzes_certificates.sql

# Type updates
src/types/database.types.ts                          (modify — add quiz/certificate types)

# Shared components
src/components/academia/CourseCard.tsx                (course card for catalog grid)
src/components/academia/CourseFilters.tsx             (search + filter bar)
src/components/academia/CourseGrid.tsx                (responsive grid with loading skeletons)
src/components/academia/VideoPlayer.tsx               (HTML5 + HLS.js player)
src/components/academia/LessonSidebar.tsx             (module/lesson nav for player)
src/components/academia/QuizWidget.tsx                (quiz form + scoring)
src/components/academia/ReviewForm.tsx                (star rating + comment form)
src/components/academia/ReviewList.tsx                (list of course reviews)
src/components/academia/ProgressBar.tsx               (linear progress bar)
src/components/academia/CertificateDownload.tsx       (PDF generation + download button)
src/components/academia/CourseLevelBadge.tsx          (colored badge per level)
src/components/academia/EnrollButton.tsx              (handles free enroll + paid checkout)

# Public pages
src/app/(main)/academia/page.tsx                     (modify — add filters, improve grid)
src/app/(main)/academia/[slug]/page.tsx              (modify — add reviews, enrollment logic)
src/app/(main)/academia/[slug]/aprender/page.tsx     (new — lesson player page)
src/app/(main)/academia/[slug]/aprender/layout.tsx   (new — player layout without main nav)

# API routes
src/app/api/courses/enroll/route.ts                  (free enrollment endpoint)
src/app/api/courses/checkout/route.ts                (Stripe Checkout session creation)
src/app/api/courses/progress/route.ts                (mark lesson complete / save watch time)
src/app/api/courses/review/route.ts                  (submit review)
src/app/api/courses/quiz/route.ts                    (submit quiz attempt)
src/app/api/courses/certificate/route.ts             (issue certificate number)
src/app/api/webhooks/stripe/route.ts                 (Stripe webhook handler)

# Admin pages
src/app/(admin)/admin/cursos/page.tsx                (course list table)
src/app/(admin)/admin/cursos/[id]/editar/page.tsx    (course editor)

# Admin components
src/components/admin/courses/CourseForm.tsx           (general course data form)
src/components/admin/courses/ModuleEditor.tsx         (module + lessons list)
src/components/admin/courses/LessonEditor.tsx         (single lesson form)
src/components/admin/courses/QuizEditor.tsx           (quiz questions editor)

# Admin sidebar update
src/components/admin/AdminSidebar.tsx                 (modify — add "Cursos" nav item)
```

---

## Task 1: Database Migration — Quiz & Certificate Tables

**Files:**
- Create: `supabase/migrations/20260428_quizzes_certificates.sql`

- [ ] **Step 1: Write the migration SQL file**

Create `supabase/migrations/20260428_quizzes_certificates.sql`:

```sql
-- =============================================
-- Quiz & Certificate tables for courses platform
-- =============================================

-- Quizzes por módulo
CREATE TABLE module_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Quiz del módulo',
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Preguntas de quiz
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opciones de respuesta
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0
);

-- Intentos de quiz
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Certificados generados
CREATE TABLE course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Índices
CREATE INDEX idx_module_quizzes_module ON module_quizzes(module_id);
CREATE INDEX idx_module_quizzes_course ON module_quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_course_certificates_user ON course_certificates(user_id);
CREATE INDEX idx_course_certificates_course ON course_certificates(course_id);

-- RLS
ALTER TABLE module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- module_quizzes: everyone can read, only admin can write
CREATE POLICY "quizzes_select" ON module_quizzes FOR SELECT USING (true);
CREATE POLICY "quizzes_admin_insert" ON module_quizzes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_update" ON module_quizzes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_delete" ON module_quizzes FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- quiz_questions: everyone can read, only admin can write
CREATE POLICY "questions_select" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "questions_admin_insert" ON quiz_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "questions_admin_update" ON quiz_questions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "questions_admin_delete" ON quiz_questions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- quiz_options: everyone can read, only admin can write
CREATE POLICY "options_select" ON quiz_options FOR SELECT USING (true);
CREATE POLICY "options_admin_insert" ON quiz_options FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "options_admin_update" ON quiz_options FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "options_admin_delete" ON quiz_options FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- quiz_attempts: users can read their own, authenticated can insert
CREATE POLICY "attempts_select_own" ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert" ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- course_certificates: users can read their own, insert via service role
CREATE POLICY "certificates_select_own" ON course_certificates FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "certificates_insert" ON course_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Run: Use Supabase MCP `execute_sql` tool with project_id `sxfzgbvwlxikonohczeo` to execute the SQL above.

Expected: All tables created, RLS enabled, policies applied, indices created.

- [ ] **Step 3: Verify tables exist**

Run: Use Supabase MCP `list_tables` with project_id `sxfzgbvwlxikonohczeo`.

Expected: `module_quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `course_certificates` all appear in the list.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260428_quizzes_certificates.sql
git commit -m "feat(db): add quiz and certificate tables with RLS"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `src/types/database.types.ts` (add type aliases at the bottom, near line 1364-1377)

- [ ] **Step 1: Regenerate types from Supabase**

Run: `npx supabase gen types typescript --project-id sxfzgbvwlxikonohczeo > src/types/database.types.ts`

This will pull the new quiz/certificate tables into the generated types.

- [ ] **Step 2: Add domain aliases at the bottom of the file**

Append after the existing domain aliases (after `export type Discipline = ...`):

```typescript
// Course sub-types
export type CourseModule = Tables<"course_modules">
export type CourseLesson = Tables<"course_lessons">
export type CourseEnrollment = Tables<"course_enrollments">
export type CourseReview = Tables<"course_reviews">
export type LessonProgress = Tables<"lesson_progress">

// Quiz types
export type ModuleQuiz = Tables<"module_quizzes">
export type QuizQuestion = Tables<"quiz_questions">
export type QuizOption = Tables<"quiz_options">
export type QuizAttempt = Tables<"quiz_attempts">

// Certificate types
export type CourseCertificate = Tables<"course_certificates">

// Composite types for frontend
export type ModuleWithLessons = CourseModule & {
  course_lessons: CourseLesson[];
}

export type QuizWithQuestions = ModuleQuiz & {
  quiz_questions: (QuizQuestion & {
    quiz_options: QuizOption[];
  })[];
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/database.types.ts
git commit -m "feat(types): add quiz, certificate, and course sub-types"
```

---

## Task 3: Install New Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install hls.js and jspdf**

Run: `npm install hls.js jspdf`

- [ ] **Step 2: Verify installation**

Run: `npm ls hls.js jspdf`

Expected: Both packages listed with versions.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install hls.js and jspdf for video player and certificates"
```

---

## Task 4: Shared Components — CourseLevelBadge & ProgressBar

**Files:**
- Create: `src/components/academia/CourseLevelBadge.tsx`
- Create: `src/components/academia/ProgressBar.tsx`

- [ ] **Step 1: Create CourseLevelBadge**

Create `src/components/academia/CourseLevelBadge.tsx`:

```tsx
import type { CourseLevel } from "@/types/database.types";

const LEVEL_STYLES: Record<CourseLevel, string> = {
  fundamentos:      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  avanzado:         "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
  especializacion:  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
  elite:            "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
};

const LEVEL_LABELS: Record<CourseLevel, string> = {
  fundamentos: "Fundamentos",
  avanzado: "Avanzado",
  especializacion: "Especialización",
  elite: "Élite",
};

export default function CourseLevelBadge({ level }: { level: CourseLevel }) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.fundamentos;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${style}`}>
      {LEVEL_LABELS[level] ?? level}
    </span>
  );
}
```

- [ ] **Step 2: Create ProgressBar**

Create `src/components/academia/ProgressBar.tsx`:

```tsx
export default function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academia/CourseLevelBadge.tsx src/components/academia/ProgressBar.tsx
git commit -m "feat: add CourseLevelBadge and ProgressBar components"
```

---

## Task 5: Shared Component — VideoPlayer

**Files:**
- Create: `src/components/academia/VideoPlayer.tsx`

- [ ] **Step 1: Create VideoPlayer component**

Create `src/components/academia/VideoPlayer.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
  className?: string;
}

export default function VideoPlayer({ src, onTimeUpdate, onEnded, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const lastReportedRef = useRef(0);

  // Report watched_seconds every 30s
  const reportTime = useCallback(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;
    const currentTime = Math.floor(video.currentTime);
    if (currentTime - lastReportedRef.current >= 30) {
      lastReportedRef.current = currentTime;
      onTimeUpdate(currentTime);
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHLS = src.endsWith(".m3u8") || src.includes(".m3u8?");

    if (isHLS && !video.canPlayType("application/vnd.apple.mpegurl")) {
      // Use HLS.js for browsers without native HLS support
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        const hls = new Hls({ startLevel: -1 });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    } else {
      // Native playback (MP4 or native HLS like Safari)
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Report time on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && onTimeUpdate) {
        onTimeUpdate(Math.floor(video.currentTime));
      }
    };
  }, [onTimeUpdate]);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const cycleSpeed = () => {
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        playsInline
        onTimeUpdate={reportTime}
        onEnded={() => {
          if (onTimeUpdate && videoRef.current) {
            onTimeUpdate(Math.floor(videoRef.current.currentTime));
          }
          onEnded?.();
        }}
      />
      <button
        onClick={cycleSpeed}
        className="absolute bottom-14 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded hover:bg-black/90 transition-colors"
        title="Cambiar velocidad"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/academia/VideoPlayer.tsx
git commit -m "feat: add VideoPlayer component with HLS.js support"
```

---

## Task 6: Shared Component — CourseCard & CourseGrid

**Files:**
- Create: `src/components/academia/CourseCard.tsx`
- Create: `src/components/academia/CourseGrid.tsx`

- [ ] **Step 1: Create CourseCard**

Create `src/components/academia/CourseCard.tsx`:

```tsx
import Link from "next/link";
import type { CourseWithInstructor } from "@/types/database.types";
import CourseLevelBadge from "./CourseLevelBadge";
import type { CourseLevel } from "@/types/database.types";

export default function CourseCard({ course }: { course: CourseWithInstructor }) {
  const rating = Number(course.avg_rating ?? 0);
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  return (
    <Link href={`/academia/${course.slug}`} className="card p-0 overflow-hidden group block">
      <div className="aspect-video relative overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title ?? ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏐</div>
        )}
        <div className="absolute top-3 left-3">
          <CourseLevelBadge level={(course.level ?? "fundamentos") as CourseLevel} />
        </div>
        {course.price === 0 && (
          <span className="absolute top-3 right-3 bg-teal text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Gratis
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{course.title}</h3>
        <p className="text-xs text-muted mb-2">{course.instructor_name}</p>
        {rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-500 text-xs">{stars}</span>
            <span className="text-xs text-muted">({course.reviews_count})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-black text-foreground">
            {course.price === 0 || !course.price ? "Gratis" : `${course.price}€`}
          </span>
          {(course.enrollments_count ?? 0) > 0 && (
            <span className="text-xs text-muted">{course.enrollments_count} alumnos</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create CourseGrid**

Create `src/components/academia/CourseGrid.tsx`:

```tsx
import type { CourseWithInstructor } from "@/types/database.types";
import CourseCard from "./CourseCard";

export default function CourseGrid({ courses, loading = false }: { courses: CourseWithInstructor[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-0 overflow-hidden animate-pulse">
            <div className="aspect-video" style={{ background: "var(--bg-tertiary)" }} />
            <div className="p-5 space-y-3">
              <div className="h-4 rounded" style={{ background: "var(--bg-tertiary)", width: "80%" }} />
              <div className="h-3 rounded" style={{ background: "var(--bg-tertiary)", width: "50%" }} />
              <div className="h-4 rounded" style={{ background: "var(--bg-tertiary)", width: "30%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-24 text-muted">
        <div className="text-6xl mb-4">🏐</div>
        <p className="text-lg font-semibold">No se encontraron cursos</p>
        <p className="text-sm mt-2">Prueba con otros filtros o vuelve más tarde.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academia/CourseCard.tsx src/components/academia/CourseGrid.tsx
git commit -m "feat: add CourseCard and CourseGrid components"
```

---

## Task 7: Shared Component — CourseFilters

**Files:**
- Create: `src/components/academia/CourseFilters.tsx`

- [ ] **Step 1: Create CourseFilters**

Create `src/components/academia/CourseFilters.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/academia/CourseFilters.tsx
git commit -m "feat: add CourseFilters component with search, level, discipline, price filters"
```

---

## Task 8: Rewrite Catalog Page (`/academia`)

**Files:**
- Modify: `src/app/(main)/academia/page.tsx`

- [ ] **Step 1: Rewrite the catalog page with filters and new components**

Rewrite `src/app/(main)/academia/page.tsx`:

```tsx
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
    query = query.eq("level", params.level);
  }
  if (params.discipline) {
    query = query.eq("discipline", params.discipline);
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
```

- [ ] **Step 2: Verify build**

Run: `npx next build` (or `npm run build`)

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/academia/page.tsx
git commit -m "feat: rewrite academia catalog page with filters and CourseGrid"
```

---

## Task 9: EnrollButton Component + API Route for Free Enrollment

**Files:**
- Create: `src/components/academia/EnrollButton.tsx`
- Create: `src/app/api/courses/enroll/route.ts`

- [ ] **Step 1: Create the free enrollment API route**

Create `src/app/api/courses/enroll/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 });
  }

  // Check course exists and is free
  const { data: course } = await supabase
    .from("courses")
    .select("id, price, is_published")
    .eq("id", courseId)
    .single();

  if (!course || !course.is_published) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  if (course.price > 0) {
    return NextResponse.json({ error: "Este curso no es gratuito" }, { status: 400 });
  }

  // Check not already enrolled
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ enrolled: true, message: "Ya estás inscrito" });
  }

  // Create enrollment
  const { error } = await supabase
    .from("course_enrollments")
    .insert({ user_id: user.id, course_id: courseId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrolled: true });
}
```

- [ ] **Step 2: Create EnrollButton component**

Create `src/components/academia/EnrollButton.tsx`:

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/courses/enroll/route.ts src/components/academia/EnrollButton.tsx
git commit -m "feat: add free enrollment API route and EnrollButton component"
```

---

## Task 10: Rewrite Course Detail Page (`/academia/[slug]`)

**Files:**
- Modify: `src/app/(main)/academia/[slug]/page.tsx`

- [ ] **Step 1: Rewrite course detail page with enrollment logic and reviews**

Rewrite `src/app/(main)/academia/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CourseLevelBadge from "@/components/academia/CourseLevelBadge";
import EnrollButton from "@/components/academia/EnrollButton";
import ReviewList from "@/components/academia/ReviewList";
import type { CourseLevel } from "@/types/database.types";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title, subtitle").eq("slug", slug).single();
  if (!data) return { title: "Curso no encontrado" };
  return { title: `${data.title} — Academia 3TT`, description: data.subtitle ?? undefined };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch course
  const { data: course } = await supabase
    .from("v_courses_with_instructor")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  // Fetch modules with lessons
  const { data: modules } = await supabase
    .from("course_modules")
    .select("*, course_lessons(*)")
    .eq("course_id", course.id!)
    .order("position");

  // Sort lessons within each module by position
  modules?.forEach(m => {
    m.course_lessons?.sort((a: any, b: any) => a.position - b.position);
  });

  // Check enrollment
  let isEnrolled = false;
  let enrollment = null;
  if (user) {
    const { data: enr } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id!)
      .single();
    if (enr) {
      isEnrolled = true;
      enrollment = enr;
    }
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("course_reviews")
    .select("*, profiles:user_id(full_name, avatar_url)")
    .eq("course_id", course.id!)
    .order("created_at", { ascending: false })
    .limit(20);

  // Check if user already reviewed
  const userReviewed = user ? reviews?.some((r: any) => r.user_id === user.id) : false;

  const totalLessons = modules?.reduce((acc, m) => acc + (m.course_lessons?.length ?? 0), 0) ?? 0;
  const previewCount = modules?.reduce(
    (acc, m) => acc + (m.course_lessons?.filter((l: any) => l.is_preview)?.length ?? 0), 0
  ) ?? 0;

  const rating = Number(course.avg_rating ?? 0);
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div style={{ background: "var(--bg-secondary)" }} className="py-16 px-6 md:px-[6%]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3">
            <div className="mb-4">
              <CourseLevelBadge level={(course.level ?? "fundamentos") as CourseLevel} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-secondary text-lg mb-6">{course.subtitle}</p>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-sm overflow-hidden">
                {course.instructor_avatar
                  ? <img src={course.instructor_avatar} alt={course.instructor_name ?? ""} className="w-full h-full object-cover" />
                  : "👤"}
              </div>
              <span className="text-secondary text-sm">{course.instructor_name}</span>
            </div>
            <div className="flex gap-6 text-muted text-sm">
              {rating > 0 && <span className="text-amber-500">{stars} ({course.reviews_count})</span>}
              <span>👥 {course.enrollments_count ?? 0} alumnos</span>
              <span>🎬 {totalLessons} lecciones</span>
              {(course.duration_mins ?? 0) > 0 && <span>⏱ {course.duration_mins} min</span>}
            </div>
          </div>

          {/* Purchase card */}
          <div className="md:col-span-2 card p-6">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title ?? ""}
                className="w-full aspect-video object-cover rounded-xl mb-5"
              />
            )}
            <div className="text-3xl font-black text-foreground mb-4">
              {course.price === 0 || !course.price ? "Gratis" : `${course.price}€`}
            </div>

            <EnrollButton
              courseId={course.id!}
              courseSlug={course.slug!}
              price={course.price ?? 0}
              isEnrolled={isEnrolled}
              isLoggedIn={!!user}
            />

            {isEnrolled && enrollment && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted mb-1">
                  <span>Progreso</span>
                  <span>{enrollment.progress_pct ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${enrollment.progress_pct ?? 0}%` }} />
                </div>
              </div>
            )}

            <p className="text-xs text-muted text-center mt-4">Acceso de por vida · Certificado incluido</p>
            <div className="mt-4 space-y-2 text-xs text-muted" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <p>✓ {totalLessons} lecciones en video</p>
              <p>✓ Acceso desde cualquier dispositivo</p>
              <p>✓ Certificado al completar</p>
              {previewCount > 0 && <p>✓ {previewCount} lecciones de prueba gratis</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-[6%] py-12 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-3 space-y-8">
          {/* Description */}
          {course.description && (
            <div>
              <h2 className="text-xl font-black text-foreground mb-4">Descripción</h2>
              <p className="text-secondary leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Curriculum */}
          {modules && modules.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-foreground mb-4">
                Contenido del curso · {modules.length} módulos · {totalLessons} lecciones
              </h2>
              <div className="space-y-3">
                {modules.map(mod => (
                  <details key={mod.id} className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-foreground text-sm" style={{ background: "var(--bg-secondary)" }}>
                      <span>{mod.title}</span>
                      <span className="text-xs text-muted">{mod.course_lessons?.length ?? 0} lecciones</span>
                    </summary>
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {(mod.course_lessons ?? []).map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-4 py-3 text-sm"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <span className={lesson.is_preview ? "text-teal" : "text-muted"}>
                            {lesson.is_preview ? "▶" : "🔒"}
                          </span>
                          <span className="flex-1 text-secondary">{lesson.title}</span>
                          {(lesson.video_duration ?? 0) > 0 && (
                            <span className="text-xs text-muted">
                              {Math.floor((lesson.video_duration ?? 0) / 60)}:{String((lesson.video_duration ?? 0) % 60).padStart(2, "0")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ReviewList
            reviews={(reviews ?? []) as any}
            courseId={course.id!}
            isEnrolled={isEnrolled}
            userReviewed={!!userReviewed}
            isLoggedIn={!!user}
          />
        </div>

        {/* Instructor sidebar */}
        <div className="md:col-span-2">
          <div className="card p-6 sticky top-24">
            <h3 className="font-black text-foreground text-sm uppercase tracking-wide mb-4">Instructor</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--bg-tertiary)" }}>
                {course.instructor_avatar
                  ? <img src={course.instructor_avatar} alt={course.instructor_name ?? ""} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{course.instructor_name}</p>
                <p className="text-xs text-muted">Instructor verificado</p>
              </div>
            </div>
            {course.instructor_bio && (
              <p className="text-xs text-muted leading-relaxed">{course.instructor_bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/academia/\[slug\]/page.tsx
git commit -m "feat: rewrite course detail page with enrollment, progress, and reviews"
```

---

## Task 11: ReviewList & ReviewForm Components + API Route

**Files:**
- Create: `src/components/academia/ReviewList.tsx`
- Create: `src/components/academia/ReviewForm.tsx`
- Create: `src/app/api/courses/review/route.ts`

- [ ] **Step 1: Create review API route**

Create `src/app/api/courses/review/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId, rating, comment } = await req.json();

  if (!courseId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "courseId y rating (1-5) requeridos" }, { status: 400 });
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment) {
    return NextResponse.json({ error: "Debes estar inscrito para dejar una reseña" }, { status: 403 });
  }

  // Upsert review (one per user per course)
  const { error } = await supabase
    .from("course_reviews")
    .upsert(
      { user_id: user.id, course_id: courseId, rating, comment: comment || null },
      { onConflict: "user_id,course_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create ReviewForm**

Create `src/components/academia/ReviewForm.tsx`:

```tsx
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
```

- [ ] **Step 3: Create ReviewList**

Create `src/components/academia/ReviewList.tsx`:

```tsx
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  user_id: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

interface ReviewListProps {
  reviews: Review[];
  courseId: string;
  isEnrolled: boolean;
  userReviewed: boolean;
  isLoggedIn: boolean;
}

export default function ReviewList({ reviews, courseId, isEnrolled, userReviewed, isLoggedIn }: ReviewListProps) {
  return (
    <div>
      <h2 className="text-xl font-black text-foreground mb-4">
        Reseñas {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {isEnrolled && !userReviewed && isLoggedIn && (
        <div className="mb-6">
          <ReviewForm courseId={courseId} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted text-sm">Aún no hay reseñas para este curso.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => {
            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            return (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "var(--bg-tertiary)" }}>
                    {review.profiles?.avatar_url
                      ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                      : "👤"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.profiles?.full_name ?? "Usuario"}</p>
                    <span className="text-amber-500 text-xs">{stars}</span>
                  </div>
                  {review.created_at && (
                    <span className="text-xs text-muted ml-auto">
                      {new Date(review.created_at).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
                {review.comment && <p className="text-secondary text-sm">{review.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/courses/review/route.ts src/components/academia/ReviewForm.tsx src/components/academia/ReviewList.tsx
git commit -m "feat: add course review system (API route + ReviewForm + ReviewList)"
```

---

## Task 12: Progress API Route

**Files:**
- Create: `src/app/api/courses/progress/route.ts`

- [ ] **Step 1: Create progress API route**

Create `src/app/api/courses/progress/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { lessonId, courseId, completed, watchSeconds } = await req.json();

  if (!lessonId || !courseId) {
    return NextResponse.json({ error: "lessonId y courseId requeridos" }, { status: 400 });
  }

  // Upsert lesson progress
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        completed: completed ?? false,
        completed_at: completed ? new Date().toISOString() : null,
        watch_seconds: watchSeconds ?? 0,
      },
      { onConflict: "user_id,lesson_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // The DB trigger update_course_progress() auto-recalculates progress_pct

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/courses/progress/route.ts
git commit -m "feat: add lesson progress API route"
```

---

## Task 13: LessonSidebar Component

**Files:**
- Create: `src/components/academia/LessonSidebar.tsx`

- [ ] **Step 1: Create LessonSidebar**

Create `src/components/academia/LessonSidebar.tsx`:

```tsx
"use client";

import { useState } from "react";
import ProgressBar from "./ProgressBar";

interface Lesson {
  id: string;
  title: string;
  video_duration: number | null;
  is_preview: boolean | null;
}

interface Module {
  id: string;
  title: string;
  position: number;
  course_lessons: Lesson[];
  hasQuiz: boolean;
  quizPassed: boolean;
}

interface LessonSidebarProps {
  modules: Module[];
  currentLessonId: string;
  completedLessonIds: Set<string>;
  progressPct: number;
  courseTitle: string;
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (moduleId: string) => void;
}

export default function LessonSidebar({
  modules, currentLessonId, completedLessonIds, progressPct,
  courseTitle, onSelectLesson, onSelectQuiz,
}: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    // Open the module containing the current lesson
    for (const mod of modules) {
      if (mod.course_lessons.some(l => l.id === currentLessonId)) {
        return new Set([mod.id]);
      }
    }
    return new Set(modules[0] ? [modules[0].id] : []);
  });

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fmtDuration = (secs: number | null) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 className="font-bold text-foreground text-sm line-clamp-1 mb-2">{courseTitle}</h2>
        <div className="flex items-center gap-2">
          <ProgressBar value={progressPct} className="flex-1" />
          <span className="text-xs text-muted font-semibold">{progressPct}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {modules.map(mod => {
          const isOpen = openModules.has(mod.id);
          const completedInModule = mod.course_lessons.filter(l => completedLessonIds.has(l.id)).length;
          const totalInModule = mod.course_lessons.length;

          return (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:opacity-80 transition-opacity"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-left flex-1 line-clamp-1">{mod.title}</span>
                <span className="text-xs text-muted ml-2">{completedInModule}/{totalInModule}</span>
                <span className="ml-2 text-muted">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div>
                  {mod.course_lessons.map(lesson => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isCompleted = completedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                          isCurrent ? "bg-teal/10 text-teal font-semibold" : "text-secondary hover:bg-teal/5"
                        }`}
                      >
                        <span className="flex-shrink-0 w-5 text-center">
                          {isCompleted ? <span className="text-teal">✓</span> : isCurrent ? "▶" : "○"}
                        </span>
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        {lesson.video_duration ? (
                          <span className="text-xs text-muted">{fmtDuration(lesson.video_duration)}</span>
                        ) : null}
                      </button>
                    );
                  })}

                  {mod.hasQuiz && (
                    <button
                      onClick={() => onSelectQuiz(mod.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-purple-500 dark:text-purple-400 hover:bg-purple-500/5"
                    >
                      <span className="flex-shrink-0 w-5 text-center">
                        {mod.quizPassed ? "✓" : "📝"}
                      </span>
                      <span className="flex-1">Quiz del módulo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/academia/LessonSidebar.tsx
git commit -m "feat: add LessonSidebar component for course player"
```

---

## Task 14: QuizWidget Component + API Route

**Files:**
- Create: `src/components/academia/QuizWidget.tsx`
- Create: `src/app/api/courses/quiz/route.ts`

- [ ] **Step 1: Create quiz API route**

Create `src/app/api/courses/quiz/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { quizId, answers } = await req.json();
  // answers: Record<questionId, selectedOptionId>

  if (!quizId || !answers) {
    return NextResponse.json({ error: "quizId y answers requeridos" }, { status: 400 });
  }

  // Fetch quiz with questions and correct options
  const { data: quiz } = await supabase
    .from("module_quizzes")
    .select("*, quiz_questions(id, quiz_options(id, is_correct))")
    .eq("id", quizId)
    .single();

  if (!quiz) {
    return NextResponse.json({ error: "Quiz no encontrado" }, { status: 404 });
  }

  // Calculate score
  const questions = quiz.quiz_questions ?? [];
  let correct = 0;
  for (const q of questions) {
    const selectedId = answers[q.id];
    const correctOption = (q.quiz_options ?? []).find((o: any) => o.is_correct);
    if (correctOption && selectedId === correctOption.id) {
      correct++;
    }
  }

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= (quiz.passing_score ?? 70);

  // Save attempt
  const { error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      score,
      passed,
      answers,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ score, passed, correct, total: questions.length });
}
```

- [ ] **Step 2: Create QuizWidget**

Create `src/components/academia/QuizWidget.tsx`:

```tsx
"use client";

import { useState } from "react";

interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  quiz_options: Option[];
}

interface QuizWidgetProps {
  quizId: string;
  quizTitle: string;
  passingScore: number;
  questions: Question[];
  onComplete: (passed: boolean) => void;
}

export default function QuizWidget({ quizId, quizTitle, passingScore, questions, onComplete }: QuizWidgetProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = questions.every(q => answers[q.id]);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);

    const res = await fetch("/api/courses/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers }),
    });

    const data = await res.json();
    setResult(data);
    setSubmitting(false);
    onComplete(data.passed);
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">{result.passed ? "🎉" : "📚"}</div>
        <h3 className="text-xl font-black text-foreground mb-2">
          {result.passed ? "¡Quiz superado!" : "Inténtalo de nuevo"}
        </h3>
        <p className="text-secondary mb-4">
          Has acertado {result.correct} de {result.total} preguntas ({result.score}%).
          {!result.passed && ` Necesitas al menos ${passingScore}% para aprobar.`}
        </p>
        {!result.passed && (
          <button onClick={retry} className="btn-primary !text-sm">
            Reintentar quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <span className="badge badge-teal mb-2">📝 Quiz</span>
        <h3 className="text-xl font-black text-foreground">{quizTitle}</h3>
        <p className="text-muted text-sm mt-1">Necesitas al menos {passingScore}% para aprobar.</p>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="card p-5">
            <p className="font-semibold text-foreground text-sm mb-3">
              {qi + 1}. {q.question_text}
            </p>
            <div className="space-y-2">
              {q.quiz_options.map(opt => {
                const selected = answers[q.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                      selected
                        ? "border-teal bg-teal/10 text-foreground"
                        : "border-transparent hover:bg-teal/5 text-secondary"
                    }`}
                    style={{ borderColor: selected ? "var(--teal)" : "var(--border)" }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.id}
                      checked={selected}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                      className="accent-teal"
                    />
                    <span className="text-sm">{opt.option_text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="btn-primary !text-sm disabled:opacity-50"
        >
          {submitting ? "Evaluando..." : `Enviar respuestas (${Object.keys(answers).length}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/courses/quiz/route.ts src/components/academia/QuizWidget.tsx
git commit -m "feat: add quiz system (API route + QuizWidget component)"
```

---

## Task 15: Lesson Player Page (`/academia/[slug]/aprender`)

**Files:**
- Create: `src/app/(main)/academia/[slug]/aprender/layout.tsx`
- Create: `src/app/(main)/academia/[slug]/aprender/page.tsx`

- [ ] **Step 1: Create player layout (no main Navbar/Footer)**

Create `src/app/(main)/academia/[slug]/aprender/layout.tsx`:

```tsx
export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
```

Note: this layout is nested inside (main)/layout.tsx which already has Navbar. We want the player to be full-screen, so we'll use a client component that hides the navbar. For simplicity, we'll instead create the player as a self-contained client component that handles its own layout.

- [ ] **Step 2: Create the player page**

Create `src/app/(main)/academia/[slug]/aprender/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import PlayerClient from "./PlayerClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title").eq("slug", slug).single();
  return { title: data ? `${data.title} — Aprender` : "Curso" };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirectTo=/academia/${slug}/aprender`);

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  if (!enrollment) redirect(`/academia/${slug}`);

  // Fetch modules with lessons
  const { data: modules } = await supabase
    .from("course_modules")
    .select("*, course_lessons(*)")
    .eq("course_id", course.id)
    .order("position");

  modules?.forEach(m => {
    m.course_lessons?.sort((a: any, b: any) => a.position - b.position);
  });

  // Fetch lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, watch_seconds")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  // Fetch quizzes
  const { data: quizzes } = await supabase
    .from("module_quizzes")
    .select("*, quiz_questions(*, quiz_options(*))")
    .eq("course_id", course.id);

  // Fetch quiz attempts
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, passed")
    .eq("user_id", user.id);

  // Fetch certificate
  const { data: certificate } = await supabase
    .from("course_certificates")
    .select("certificate_number, issued_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  return (
    <PlayerClient
      course={course}
      modules={(modules ?? []) as any}
      progressData={(progress ?? []) as any}
      quizzes={(quizzes ?? []) as any}
      quizAttempts={(attempts ?? []) as any}
      enrollmentProgressPct={enrollment.progress_pct ?? 0}
      certificate={certificate as any}
      userName={user.user_metadata?.full_name ?? user.email ?? "Alumno"}
    />
  );
}
```

- [ ] **Step 3: Create PlayerClient component**

Create `src/app/(main)/academia/[slug]/aprender/PlayerClient.tsx`:

```tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/academia/VideoPlayer";
import LessonSidebar from "@/components/academia/LessonSidebar";
import QuizWidget from "@/components/academia/QuizWidget";
import CertificateDownload from "@/components/academia/CertificateDownload";

interface Lesson {
  id: string; title: string; description: string | null;
  video_url: string | null; video_duration: number | null;
  is_preview: boolean | null; position: number;
}
interface Module {
  id: string; title: string; position: number;
  course_lessons: Lesson[];
}
interface Quiz {
  id: string; module_id: string; title: string; passing_score: number;
  quiz_questions: { id: string; question_text: string; position: number;
    quiz_options: { id: string; option_text: string; is_correct: boolean; position: number }[];
  }[];
}

interface Props {
  course: { id: string; title: string; slug: string };
  modules: Module[];
  progressData: { lesson_id: string; completed: boolean; watch_seconds: number }[];
  quizzes: Quiz[];
  quizAttempts: { quiz_id: string; passed: boolean }[];
  enrollmentProgressPct: number;
  certificate: { certificate_number: string; issued_at: string } | null;
  userName: string;
}

export default function PlayerClient({
  course, modules, progressData, quizzes, quizAttempts,
  enrollmentProgressPct, certificate, userName,
}: Props) {
  const router = useRouter();

  // Build flat list of lessons for navigation
  const allLessons = useMemo(() =>
    modules.flatMap(m => m.course_lessons.map(l => ({ ...l, moduleId: m.id }))),
    [modules]
  );

  // Progress tracking
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(progressData.filter(p => p.completed).map(p => p.lesson_id))
  );
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(
    () => new Set(quizAttempts.filter(a => a.passed).map(a => a.quiz_id))
  );
  const [progressPct, setProgressPct] = useState(enrollmentProgressPct);

  // Current view state
  const firstIncomplete = allLessons.find(l => !completedIds.has(l.id));
  const [currentLessonId, setCurrentLessonId] = useState(firstIncomplete?.id ?? allLessons[0]?.id ?? "");
  const [showQuiz, setShowQuiz] = useState<string | null>(null); // moduleId if showing quiz

  const currentLesson = allLessons.find(l => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const nextLesson = allLessons[currentIndex + 1];

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mark lesson complete
  const markComplete = useCallback(async (lessonId: string) => {
    if (completedIds.has(lessonId)) return;

    setCompletedIds(prev => new Set([...prev, lessonId]));
    const newPct = Math.round(((completedIds.size + 1) / allLessons.length) * 100);
    setProgressPct(newPct);

    await fetch("/api/courses/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId: course.id, completed: true }),
    });

    router.refresh();
  }, [completedIds, allLessons.length, course.id, router]);

  // Save watch time
  const saveWatchTime = useCallback(async (seconds: number) => {
    if (!currentLesson) return;
    await fetch("/api/courses/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: currentLesson.id,
        courseId: course.id,
        completed: completedIds.has(currentLesson.id),
        watchSeconds: seconds,
      }),
    });
  }, [currentLesson, course.id, completedIds]);

  // Build modules for sidebar
  const sidebarModules = modules.map(m => {
    const quiz = quizzes.find(q => q.module_id === m.id);
    return {
      ...m,
      hasQuiz: !!quiz,
      quizPassed: quiz ? passedQuizIds.has(quiz.id) : false,
    };
  });

  // All quizzes passed check
  const allQuizzesPassed = quizzes.every(q => passedQuizIds.has(q.id));
  const isComplete = progressPct >= 100 && allQuizzesPassed;

  // Current quiz data
  const currentQuiz = showQuiz ? quizzes.find(q => q.module_id === showQuiz) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden btn-secondary !p-2 !text-sm"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 transform transition-transform lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className="relative z-10 h-full">
          <LessonSidebar
            modules={sidebarModules}
            currentLessonId={currentLessonId}
            completedLessonIds={completedIds}
            progressPct={progressPct}
            courseTitle={course.title}
            onSelectLesson={(id) => { setCurrentLessonId(id); setShowQuiz(null); setSidebarOpen(false); }}
            onSelectQuiz={(moduleId) => { setShowQuiz(moduleId); setSidebarOpen(false); }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href={`/academia/${course.slug}`} className="text-sm text-muted hover:text-teal transition-colors">
            ← Volver al curso
          </Link>
          {isComplete && certificate && (
            <CertificateDownload
              courseTitle={course.title}
              userName={userName}
              certificateNumber={certificate.certificate_number}
              issuedAt={certificate.issued_at}
            />
          )}
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Completion banner */}
          {isComplete && (
            <div className="bg-teal/10 border border-teal/20 rounded-xl p-6 mb-8 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-black text-foreground mb-1">¡Curso completado!</h3>
              <p className="text-secondary text-sm">Enhorabuena, has terminado todas las lecciones y quizzes.</p>
              {!certificate && (
                <button
                  onClick={async () => {
                    await fetch("/api/courses/certificate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ courseId: course.id }),
                    });
                    router.refresh();
                  }}
                  className="btn-primary !text-sm mt-4"
                >
                  Generar certificado
                </button>
              )}
            </div>
          )}

          {showQuiz && currentQuiz ? (
            /* Quiz view */
            <QuizWidget
              quizId={currentQuiz.id}
              quizTitle={currentQuiz.title}
              passingScore={currentQuiz.passing_score}
              questions={currentQuiz.quiz_questions.map(q => ({
                ...q,
                quiz_options: q.quiz_options.sort((a, b) => a.position - b.position),
              })).sort((a, b) => a.position - b.position)}
              onComplete={(passed) => {
                if (passed) {
                  setPassedQuizIds(prev => new Set([...prev, currentQuiz.id]));
                }
              }}
            />
          ) : currentLesson ? (
            /* Lesson view */
            <>
              {currentLesson.video_url ? (
                <VideoPlayer
                  src={currentLesson.video_url}
                  onTimeUpdate={saveWatchTime}
                  onEnded={() => markComplete(currentLesson.id)}
                  className="mb-6"
                />
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  <p className="text-muted">Sin vídeo disponible</p>
                </div>
              )}

              <h2 className="text-xl font-black text-foreground mb-2">{currentLesson.title}</h2>
              {currentLesson.description && (
                <p className="text-secondary text-sm mb-6">{currentLesson.description}</p>
              )}

              <div className="flex items-center gap-3">
                {!completedIds.has(currentLesson.id) && (
                  <button
                    onClick={() => markComplete(currentLesson.id)}
                    className="btn-secondary !text-sm"
                  >
                    ✓ Marcar como completada
                  </button>
                )}
                {nextLesson && (
                  <button
                    onClick={() => { setCurrentLessonId(nextLesson.id); setShowQuiz(null); }}
                    className="btn-primary !text-sm"
                  >
                    Siguiente lección →
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(main\)/academia/\[slug\]/aprender/
git commit -m "feat: add lesson player page with video, sidebar, quiz integration"
```

---

## Task 16: CertificateDownload Component + API Route

**Files:**
- Create: `src/components/academia/CertificateDownload.tsx`
- Create: `src/app/api/courses/certificate/route.ts`

- [ ] **Step 1: Create certificate API route**

Create `src/app/api/courses/certificate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId } = await req.json();

  // Check enrollment and 100% progress
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("progress_pct")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment || (enrollment.progress_pct ?? 0) < 100) {
    return NextResponse.json({ error: "Debes completar el curso al 100%" }, { status: 400 });
  }

  // Check all quizzes passed
  const { data: quizzes } = await supabase
    .from("module_quizzes")
    .select("id")
    .eq("course_id", courseId);

  if (quizzes && quizzes.length > 0) {
    const quizIds = quizzes.map(q => q.id);
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("quiz_id, passed")
      .eq("user_id", user.id)
      .in("quiz_id", quizIds);

    const passedIds = new Set((attempts ?? []).filter(a => a.passed).map(a => a.quiz_id));
    const allPassed = quizIds.every(id => passedIds.has(id));
    if (!allPassed) {
      return NextResponse.json({ error: "Debes aprobar todos los quizzes" }, { status: 400 });
    }
  }

  // Check if certificate already exists
  const { data: existing } = await supabase
    .from("course_certificates")
    .select("certificate_number")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ certificateNumber: existing.certificate_number });
  }

  // Generate unique certificate number: 3TT-YYYY-XXXXX
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const certificateNumber = `3TT-${year}-${random}`;

  const { error } = await supabase
    .from("course_certificates")
    .insert({
      user_id: user.id,
      course_id: courseId,
      certificate_number: certificateNumber,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ certificateNumber });
}
```

- [ ] **Step 2: Create CertificateDownload component**

Create `src/components/academia/CertificateDownload.tsx`:

```tsx
"use client";

import { useCallback } from "react";

interface CertificateDownloadProps {
  courseTitle: string;
  userName: string;
  certificateNumber: string;
  issuedAt: string;
}

export default function CertificateDownload({
  courseTitle, userName, certificateNumber, issuedAt,
}: CertificateDownloadProps) {
  const download = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const w = 297;
    const h = 210;

    // Background
    doc.setFillColor(27, 35, 48); // #1B2330 navy
    doc.rect(0, 0, w, h, "F");

    // Border
    doc.setDrawColor(0, 168, 168); // teal
    doc.setLineWidth(1);
    doc.rect(10, 10, w - 20, h - 20);
    doc.setLineWidth(0.3);
    doc.rect(13, 13, w - 26, h - 26);

    // Header
    doc.setTextColor(0, 168, 168);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3TOUCH TRIBE", w / 2, 35, { align: "center" });

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text("CERTIFICADO DE FINALIZACIÓN", w / 2, 55, { align: "center" });

    // Divider line
    doc.setDrawColor(0, 168, 168);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - 40, 62, w / 2 + 40, 62);

    // "otorgado a"
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Se otorga a", w / 2, 78, { align: "center" });

    // Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(userName, w / 2, 95, { align: "center" });

    // "por completar"
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("por completar satisfactoriamente el curso", w / 2, 112, { align: "center" });

    // Course title
    doc.setTextColor(0, 168, 168);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    // Wrap long titles
    const titleLines = doc.splitTextToSize(courseTitle, 200);
    doc.text(titleLines, w / 2, 128, { align: "center" });

    // Date and certificate number
    const dateStr = new Date(issuedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${dateStr}`, w / 2 - 50, 165, { align: "center" });
    doc.text(`Certificado Nº: ${certificateNumber}`, w / 2 + 50, 165, { align: "center" });

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("www.3touchtribe.com", w / 2, 190, { align: "center" });

    doc.save(`certificado-${certificateNumber}.pdf`);
  }, [courseTitle, userName, certificateNumber, issuedAt]);

  return (
    <button onClick={download} className="btn-primary !text-sm">
      📜 Descargar certificado
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/courses/certificate/route.ts src/components/academia/CertificateDownload.tsx
git commit -m "feat: add certificate generation (API route + PDF download component)"
```

---

## Task 17: Stripe Checkout API Route + Webhook

**Files:**
- Create: `src/app/api/courses/checkout/route.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Create Stripe Checkout route**

Create `src/app/api/courses/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId } = await req.json();

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price, slug, thumbnail_url")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();

  if (!course || course.price <= 0) {
    return NextResponse.json({ error: "Curso no encontrado o es gratuito" }, { status: 400 });
  }

  // Check not already enrolled
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Ya estás inscrito" }, { status: 400 });
  }

  // Check membership for discount
  const { data: profile } = await supabase
    .from("profiles")
    .select("membership")
    .eq("id", user.id)
    .single();

  // TODO: apply member pricing if profile.membership !== 'free'
  const priceInCents = Math.round(course.price * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: {
          name: course.title,
          images: course.thumbnail_url ? [course.thumbnail_url] : [],
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    }],
    metadata: {
      course_id: course.id,
      user_id: user.id,
      type: "course_purchase",
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/academia/${course.slug}/aprender?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/academia/${course.slug}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: Create Stripe webhook handler**

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { course_id, user_id, type } = session.metadata ?? {};

    if (type !== "course_purchase" || !course_id || !user_id) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    // Create payment record
    const { data: payment } = await supabase
      .from("payments")
      .insert({
        user_id,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "eur",
        type: "course",
        reference_id: course_id,
        stripe_payment_id: session.payment_intent as string,
        status: "completed",
      })
      .select("id")
      .single();

    // Create enrollment
    await supabase
      .from("course_enrollments")
      .insert({
        user_id,
        course_id,
        payment_id: payment?.id ?? null,
      });

    // Revenue share: trigger handle_course_payment() handles this via DB trigger
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/courses/checkout/route.ts src/app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe Checkout and webhook for course purchases"
```

---

## Task 18: Admin — Courses List Page

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx` (add nav item)
- Create: `src/app/(admin)/admin/cursos/page.tsx`

- [ ] **Step 1: Add "Cursos" to admin sidebar nav**

In `src/components/admin/AdminSidebar.tsx`, add to the NAV array after the "Contenido" entry (line ~10):

```typescript
  { href: "/admin/cursos",    label: "Cursos",      icon: "🎓" },
```

- [ ] **Step 2: Create admin cursos list page**

Create `src/app/(admin)/admin/cursos/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import StatsCard from "@/components/admin/StatsCard";
import type { CourseWithInstructor } from "@/types/database.types";

export default function AdminCursos() {
  const supabase = createClient();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("v_courses_with_instructor")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  useEffect(() => { load(); }, []);

  const del = async (course: CourseWithInstructor) => {
    if (!confirm(`¿Eliminar "${course.title}"?`)) return;
    await supabase.from("courses").delete().eq("id", course.id!);
    load();
  };

  const published = courses.filter(c => c.is_published);
  const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrollments_count ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">Cursos</h1>
          <p className="text-muted text-sm mt-1">{courses.length} cursos en total</p>
        </div>
        <button
          onClick={() => router.push("/admin/cursos/nuevo/editar")}
          className="btn-primary !text-sm !py-2 !px-5"
        >
          + Nuevo curso
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard icon="🎓" label="Total" value={courses.length} />
        <StatsCard icon="✅" label="Publicados" value={published.length} />
        <StatsCard icon="👥" label="Inscripciones" value={totalEnrollments} />
        <StatsCard icon="⭐" label="Rating medio" value={
          courses.length > 0
            ? (courses.reduce((a, c) => a + Number(c.avg_rating ?? 0), 0) / courses.length).toFixed(1)
            : "—"
        } />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-left">
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Imagen</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Título</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Instructor</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Nivel</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Precio</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Inscritos</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-muted uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">
                  <div className="text-4xl mb-2">🎓</div>
                  No hay cursos aún. ¡Crea el primero!
                </td></tr>
              )}
              {courses.map(course => (
                <tr key={course.id} className="border-b border-theme hover:bg-teal/[0.03]">
                  <td className="px-4 py-2">
                    <img
                      src={course.thumbnail_url || "/images/placeholder-course.jpg"}
                      alt=""
                      className="w-16 h-10 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground max-w-[180px] truncate">{course.title}</td>
                  <td className="px-4 py-3 text-muted text-xs">{course.instructor_name ?? "—"}</td>
                  <td className="px-4 py-3"><span className="badge badge-teal text-[10px] capitalize">{course.level}</span></td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {course.price === 0 || !course.price ? "Gratis" : `${course.price}€`}
                  </td>
                  <td className="px-4 py-3 text-muted">{course.enrollments_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={course.is_published ? "published" : "draft"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/cursos/${course.id}/editar`)}
                        className="text-teal hover:underline text-xs font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => del(course)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/app/\(admin\)/admin/cursos/page.tsx
git commit -m "feat: add admin courses list page with stats and table"
```

---

## Task 19: Admin — Course Editor Page (General Data + Modules + Lessons)

**Files:**
- Create: `src/app/(admin)/admin/cursos/[id]/editar/page.tsx`
- Create: `src/components/admin/courses/CourseForm.tsx`
- Create: `src/components/admin/courses/ModuleEditor.tsx`
- Create: `src/components/admin/courses/LessonEditor.tsx`

This is the largest task. It combines the course general form, module management, and lesson editing into a single page.

- [ ] **Step 1: Create CourseForm component**

Create `src/components/admin/courses/CourseForm.tsx`:

```tsx
"use client";

import type { Discipline, CourseLevel } from "@/types/database.types";

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "fundamentos", label: "Fundamentos" },
  { value: "avanzado", label: "Avanzado" },
  { value: "especializacion", label: "Especialización" },
  { value: "elite", label: "Élite" },
];

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: "pista", label: "Pista" },
  { value: "playa", label: "Playa" },
  { value: "minivolley", label: "Minivolley" },
  { value: "volleyhierba", label: "Volleyhierba" },
  { value: "watervolley", label: "Watervolley" },
  { value: "general", label: "General" },
];

export interface CourseFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  discipline: Discipline;
  instructor_id: string;
  price: number;
  thumbnail_url: string;
  preview_url: string;
  duration_mins: number;
  is_published: boolean;
  is_featured: boolean;
  tags: string;
}

interface CourseFormProps {
  form: CourseFormData;
  onChange: (key: keyof CourseFormData, value: string | number | boolean) => void;
  instructors: { id: string; name: string }[];
}

export default function CourseForm({ form, onChange, instructors }: CourseFormProps) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-black text-foreground text-lg">Datos generales</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Título</label>
          <input className="input" value={form.title}
            onChange={e => {
              onChange("title", e.target.value);
              if (!form.slug || form.slug === slugify(form.title)) {
                onChange("slug", slugify(e.target.value));
              }
            }} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Slug</label>
          <input className="input font-mono" value={form.slug} onChange={e => onChange("slug", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-muted uppercase mb-1 block">Subtítulo</label>
        <input className="input" value={form.subtitle} onChange={e => onChange("subtitle", e.target.value)} />
      </div>

      <div>
        <label className="text-xs font-bold text-muted uppercase mb-1 block">Descripción</label>
        <textarea className="input" rows={4} value={form.description} onChange={e => onChange("description", e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Nivel</label>
          <select className="input" value={form.level} onChange={e => onChange("level", e.target.value)}>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Disciplina</label>
          <select className="input" value={form.discipline} onChange={e => onChange("discipline", e.target.value)}>
            {DISCIPLINES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Instructor</label>
          <select className="input" value={form.instructor_id} onChange={e => onChange("instructor_id", e.target.value)}>
            <option value="">Seleccionar...</option>
            {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Precio (€)</label>
          <input className="input" type="number" step="0.01" value={form.price}
            onChange={e => onChange("price", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Duración (min)</label>
          <input className="input" type="number" value={form.duration_mins}
            onChange={e => onChange("duration_mins", parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Tags (coma separados)</label>
          <input className="input" value={form.tags} onChange={e => onChange("tags", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Thumbnail URL</label>
          <input className="input" value={form.thumbnail_url} onChange={e => onChange("thumbnail_url", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Preview/Trailer URL</label>
          <input className="input" value={form.preview_url} onChange={e => onChange("preview_url", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={e => onChange("is_published", e.target.checked)} className="accent-teal w-4 h-4" />
          <span className="text-sm font-medium text-secondary">Publicado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={e => onChange("is_featured", e.target.checked)} className="accent-teal w-4 h-4" />
          <span className="text-sm font-medium text-secondary">Destacado</span>
        </label>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}
```

- [ ] **Step 2: Create LessonEditor component**

Create `src/components/admin/courses/LessonEditor.tsx`:

```tsx
"use client";

interface LessonData {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  is_preview: boolean;
  position: number;
}

interface LessonEditorProps {
  lesson: LessonData;
  index: number;
  onChange: (field: keyof LessonData, value: string | number | boolean) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function LessonEditor({
  lesson, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: LessonEditorProps) {
  return (
    <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted uppercase">Lección {index + 1}</span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="text-muted hover:text-foreground disabled:opacity-30 text-xs px-1">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-muted hover:text-foreground disabled:opacity-30 text-xs px-1">↓</button>
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs ml-2">✕</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted mb-0.5 block">Título</label>
          <input className="input !text-sm" value={lesson.title} onChange={e => onChange("title", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted mb-0.5 block">Video URL</label>
          <input className="input !text-sm font-mono" value={lesson.video_url} onChange={e => onChange("video_url", e.target.value)} />
        </div>
      </div>
      <div className="mt-2">
        <label className="text-xs text-muted mb-0.5 block">Descripción</label>
        <textarea className="input !text-sm" rows={2} value={lesson.description} onChange={e => onChange("description", e.target.value)} />
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div>
          <label className="text-xs text-muted mb-0.5 block">Duración (seg)</label>
          <input className="input !text-sm !w-24" type="number" value={lesson.video_duration}
            onChange={e => onChange("video_duration", parseInt(e.target.value) || 0)} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input type="checkbox" checked={lesson.is_preview} onChange={e => onChange("is_preview", e.target.checked)} className="accent-teal" />
          <span className="text-xs text-secondary">Preview gratuita</span>
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ModuleEditor component**

Create `src/components/admin/courses/ModuleEditor.tsx`:

```tsx
"use client";

import LessonEditor from "./LessonEditor";

interface LessonData {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  is_preview: boolean;
  position: number;
}

interface ModuleData {
  id?: string;
  title: string;
  position: number;
  lessons: LessonData[];
}

interface ModuleEditorProps {
  mod: ModuleData;
  index: number;
  onChangeTitle: (title: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onAddLesson: () => void;
  onChangeLesson: (lessonIndex: number, field: keyof LessonData, value: string | number | boolean) => void;
  onDeleteLesson: (lessonIndex: number) => void;
  onMoveLessonUp: (lessonIndex: number) => void;
  onMoveLessonDown: (lessonIndex: number) => void;
}

export default function ModuleEditor({
  mod, index, onChangeTitle, onDelete, onMoveUp, onMoveDown,
  isFirst, isLast, onAddLesson, onChangeLesson, onDeleteLesson,
  onMoveLessonUp, onMoveLessonDown,
}: ModuleEditorProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="text-muted hover:text-foreground disabled:opacity-30 text-sm px-1">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-muted hover:text-foreground disabled:opacity-30 text-sm px-1">↓</button>
        </div>
        <span className="text-xs font-bold text-muted uppercase">Módulo {index + 1}</span>
        <input
          className="input !text-sm flex-1"
          value={mod.title}
          onChange={e => onChangeTitle(e.target.value)}
          placeholder="Título del módulo"
        />
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs font-semibold">Eliminar</button>
      </div>

      <div className="space-y-3 mb-4">
        {mod.lessons.map((lesson, li) => (
          <LessonEditor
            key={li}
            lesson={lesson}
            index={li}
            onChange={(field, value) => onChangeLesson(li, field, value)}
            onDelete={() => onDeleteLesson(li)}
            onMoveUp={() => onMoveLessonUp(li)}
            onMoveDown={() => onMoveLessonDown(li)}
            isFirst={li === 0}
            isLast={li === mod.lessons.length - 1}
          />
        ))}
      </div>

      <button onClick={onAddLesson} className="btn-secondary !text-xs !py-1.5 !px-3">
        + Añadir lección
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create Course Editor page**

Create `src/app/(admin)/admin/cursos/[id]/editar/page.tsx`:

```tsx
"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CourseForm, { type CourseFormData } from "@/components/admin/courses/CourseForm";
import ModuleEditor from "@/components/admin/courses/ModuleEditor";

interface LessonData {
  id?: string; title: string; description: string;
  video_url: string; video_duration: number; is_preview: boolean; position: number;
}
interface ModuleData {
  id?: string; title: string; position: number; lessons: LessonData[];
}

const emptyForm: CourseFormData = {
  title: "", slug: "", subtitle: "", description: "",
  level: "fundamentos", discipline: "general", instructor_id: "",
  price: 0, thumbnail_url: "", preview_url: "", duration_mins: 0,
  is_published: false, is_featured: false, tags: "",
};

const emptyLesson: LessonData = {
  title: "", description: "", video_url: "", video_duration: 0, is_preview: false, position: 0,
};

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "nuevo";
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(isNew ? null : id);

  useEffect(() => {
    // Load instructors (collaborators)
    supabase
      .from("collaborators")
      .select("id, profiles:user_id(full_name)")
      .then(({ data }) => {
        if (data) {
          setInstructors(data.map((c: any) => ({ id: c.id, name: c.profiles?.full_name ?? "Sin nombre" })));
        }
      });

    // Load existing course
    if (!isNew) {
      supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data: course }) => {
          if (course) {
            setForm({
              title: course.title, slug: course.slug, subtitle: course.subtitle ?? "",
              description: course.description ?? "", level: course.level,
              discipline: course.discipline, instructor_id: course.instructor_id,
              price: course.price, thumbnail_url: course.thumbnail_url ?? "",
              preview_url: course.preview_url ?? "", duration_mins: course.duration_mins ?? 0,
              is_published: course.is_published ?? false, is_featured: course.is_featured ?? false,
              tags: (course.tags ?? []).join(", "),
            });
          }
        });

      // Load modules with lessons
      supabase
        .from("course_modules")
        .select("*, course_lessons(*)")
        .eq("course_id", id)
        .order("position")
        .then(({ data }) => {
          if (data) {
            setModules(data.map(m => ({
              id: m.id,
              title: m.title,
              position: m.position,
              lessons: (m.course_lessons ?? [])
                .sort((a: any, b: any) => a.position - b.position)
                .map((l: any) => ({
                  id: l.id, title: l.title, description: l.description ?? "",
                  video_url: l.video_url ?? "", video_duration: l.video_duration ?? 0,
                  is_preview: l.is_preview ?? false, position: l.position,
                })),
            })));
          }
        });
    }
  }, []);

  const setField = (key: keyof CourseFormData, value: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const addModule = () => {
    setModules(prev => [...prev, { title: `Módulo ${prev.length + 1}`, position: prev.length, lessons: [] }]);
  };

  const save = async () => {
    setSaving(true);

    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const payload = {
      title: form.title, slug: form.slug, subtitle: form.subtitle || null,
      description: form.description || null, level: form.level, discipline: form.discipline,
      instructor_id: form.instructor_id, price: form.price,
      thumbnail_url: form.thumbnail_url || null, preview_url: form.preview_url || null,
      duration_mins: form.duration_mins, is_published: form.is_published,
      is_featured: form.is_featured, tags,
      lessons_count: modules.reduce((acc, m) => acc + m.lessons.length, 0),
    };

    let savedCourseId = courseId;

    if (isNew || !courseId) {
      const { data, error } = await supabase.from("courses").insert(payload).select("id").single();
      if (error) { alert("Error: " + error.message); setSaving(false); return; }
      savedCourseId = data.id;
      setCourseId(data.id);
    } else {
      await supabase.from("courses").update(payload).eq("id", courseId);
    }

    if (!savedCourseId) { setSaving(false); return; }

    // Save modules and lessons
    // Delete existing modules (cascade deletes lessons)
    if (!isNew && courseId) {
      await supabase.from("course_modules").delete().eq("course_id", courseId);
    }

    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      const { data: savedModule } = await supabase
        .from("course_modules")
        .insert({ course_id: savedCourseId, title: mod.title, position: mi })
        .select("id")
        .single();

      if (savedModule) {
        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          await supabase.from("course_lessons").insert({
            course_id: savedCourseId,
            module_id: savedModule.id,
            title: lesson.title,
            description: lesson.description || null,
            video_url: lesson.video_url || null,
            video_duration: lesson.video_duration || null,
            is_preview: lesson.is_preview,
            position: li,
          });
        }
      }
    }

    setSaving(false);
    if (isNew) {
      router.replace(`/admin/cursos/${savedCourseId}/editar`);
    }
    router.refresh();
  };

  // Module operations
  const moveModule = (idx: number, dir: -1 | 1) => {
    setModules(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  const deleteModule = (idx: number) => {
    if (!confirm("¿Eliminar este módulo y sus lecciones?")) return;
    setModules(prev => prev.filter((_, i) => i !== idx));
  };

  // Lesson operations
  const addLesson = (moduleIdx: number) => {
    setModules(prev => prev.map((m, i) =>
      i === moduleIdx ? { ...m, lessons: [...m.lessons, { ...emptyLesson, position: m.lessons.length }] } : m
    ));
  };

  const changeLesson = (moduleIdx: number, lessonIdx: number, field: string, value: any) => {
    setModules(prev => prev.map((m, mi) =>
      mi === moduleIdx ? {
        ...m,
        lessons: m.lessons.map((l, li) => li === lessonIdx ? { ...l, [field]: value } : l),
      } : m
    ));
  };

  const deleteLesson = (moduleIdx: number, lessonIdx: number) => {
    setModules(prev => prev.map((m, mi) =>
      mi === moduleIdx ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIdx) } : m
    ));
  };

  const moveLesson = (moduleIdx: number, lessonIdx: number, dir: -1 | 1) => {
    setModules(prev => prev.map((m, mi) => {
      if (mi !== moduleIdx) return m;
      const arr = [...m.lessons];
      const swap = lessonIdx + dir;
      [arr[lessonIdx], arr[swap]] = [arr[swap], arr[lessonIdx]];
      return { ...m, lessons: arr };
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">{isNew ? "Nuevo curso" : "Editar curso"}</h1>
          <p className="text-muted text-sm mt-1">{form.title || "Sin título"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/admin/cursos")} className="btn-secondary !text-sm !py-2 !px-4">
            ← Volver
          </button>
          <button onClick={save} disabled={saving || !form.title || !form.slug || !form.instructor_id}
            className="btn-primary !text-sm !py-2 !px-5 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar todo"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CourseForm form={form} onChange={setField} instructors={instructors} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-foreground text-lg">Módulos y lecciones</h3>
            <button onClick={addModule} className="btn-secondary !text-sm !py-1.5 !px-4">
              + Añadir módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((mod, mi) => (
              <ModuleEditor
                key={mi}
                mod={mod}
                index={mi}
                onChangeTitle={(title) => setModules(prev => prev.map((m, i) => i === mi ? { ...m, title } : m))}
                onDelete={() => deleteModule(mi)}
                onMoveUp={() => moveModule(mi, -1)}
                onMoveDown={() => moveModule(mi, 1)}
                isFirst={mi === 0}
                isLast={mi === modules.length - 1}
                onAddLesson={() => addLesson(mi)}
                onChangeLesson={(li, field, value) => changeLesson(mi, li, field as string, value)}
                onDeleteLesson={(li) => deleteLesson(mi, li)}
                onMoveLessonUp={(li) => moveLesson(mi, li, -1)}
                onMoveLessonDown={(li) => moveLesson(mi, li, 1)}
              />
            ))}
            {modules.length === 0 && (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">📚</div>
                <p>Aún no hay módulos. Añade el primero para organizar las lecciones.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/courses/ src/app/\(admin\)/admin/cursos/\[id\]/editar/page.tsx
git commit -m "feat: add admin course editor with modules and lessons"
```

---

## Task 20: Admin — Quiz Editor

**Files:**
- Create: `src/components/admin/courses/QuizEditor.tsx`
- Modify: `src/app/(admin)/admin/cursos/[id]/editar/page.tsx` (add quiz section)

- [ ] **Step 1: Create QuizEditor component**

Create `src/components/admin/courses/QuizEditor.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Option { id?: string; option_text: string; is_correct: boolean; position: number }
interface Question { id?: string; question_text: string; position: number; options: Option[] }
interface QuizData { id?: string; title: string; passing_score: number; questions: Question[] }

interface QuizEditorProps {
  moduleId: string;
  courseId: string;
}

export default function QuizEditor({ moduleId, courseId }: QuizEditorProps) {
  const supabase = createClient();
  const [quiz, setQuiz] = useState<QuizData>({ title: "Quiz del módulo", passing_score: 70, questions: [] });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("module_quizzes")
      .select("*, quiz_questions(*, quiz_options(*))")
      .eq("module_id", moduleId)
      .single()
      .then(({ data }) => {
        if (data) {
          setQuiz({
            id: data.id,
            title: data.title,
            passing_score: data.passing_score,
            questions: (data.quiz_questions ?? [])
              .sort((a: any, b: any) => a.position - b.position)
              .map((q: any) => ({
                id: q.id,
                question_text: q.question_text,
                position: q.position,
                options: (q.quiz_options ?? [])
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((o: any) => ({
                    id: o.id, option_text: o.option_text,
                    is_correct: o.is_correct, position: o.position,
                  })),
              })),
          });
        }
        setLoaded(true);
      });
  }, [moduleId]);

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question_text: "", position: prev.questions.length,
        options: [
          { option_text: "", is_correct: true, position: 0 },
          { option_text: "", is_correct: false, position: 1 },
        ],
      }],
    }));
  };

  const addOption = (qi: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { option_text: "", is_correct: false, position: q.options.length }] } : q
      ),
    }));
  };

  const setCorrect = (qi: number, oi: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })) } : q
      ),
    }));
  };

  const saveQuiz = async () => {
    setSaving(true);

    // Delete existing quiz for this module (cascade deletes questions and options)
    if (quiz.id) {
      await supabase.from("module_quizzes").delete().eq("id", quiz.id);
    }

    // Create quiz
    const { data: savedQuiz } = await supabase
      .from("module_quizzes")
      .insert({ module_id: moduleId, course_id: courseId, title: quiz.title, passing_score: quiz.passing_score })
      .select("id")
      .single();

    if (savedQuiz) {
      for (let qi = 0; qi < quiz.questions.length; qi++) {
        const q = quiz.questions[qi];
        const { data: savedQ } = await supabase
          .from("quiz_questions")
          .insert({ quiz_id: savedQuiz.id, question_text: q.question_text, position: qi })
          .select("id")
          .single();

        if (savedQ) {
          for (let oi = 0; oi < q.options.length; oi++) {
            const o = q.options[oi];
            await supabase.from("quiz_options").insert({
              question_id: savedQ.id, option_text: o.option_text,
              is_correct: o.is_correct, position: oi,
            });
          }
        }
      }
      setQuiz(prev => ({ ...prev, id: savedQuiz.id }));
    }

    setSaving(false);
  };

  if (!loaded) return <p className="text-muted text-sm">Cargando quiz...</p>;

  return (
    <div className="card p-5 space-y-4">
      <h4 className="font-bold text-foreground text-sm">📝 Quiz del módulo</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted mb-0.5 block">Título</label>
          <input className="input !text-sm" value={quiz.title}
            onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-muted mb-0.5 block">Nota mínima (%)</label>
          <input className="input !text-sm !w-24" type="number" value={quiz.passing_score}
            onChange={e => setQuiz(prev => ({ ...prev, passing_score: parseInt(e.target.value) || 70 }))} />
        </div>
      </div>

      {quiz.questions.map((q, qi) => (
        <div key={qi} className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-muted">P{qi + 1}.</span>
            <input className="input !text-sm flex-1" value={q.question_text} placeholder="Pregunta..."
              onChange={e => setQuiz(prev => ({
                ...prev,
                questions: prev.questions.map((qq, i) => i === qi ? { ...qq, question_text: e.target.value } : qq),
              }))} />
            <button onClick={() => setQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qi) }))}
              className="text-red-400 text-xs">✕</button>
          </div>
          <div className="space-y-1.5 ml-6">
            {q.options.map((o, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input type="radio" name={`correct-${qi}`} checked={o.is_correct}
                  onChange={() => setCorrect(qi, oi)} className="accent-teal" />
                <input className="input !text-sm flex-1" value={o.option_text} placeholder={`Opción ${oi + 1}`}
                  onChange={e => setQuiz(prev => ({
                    ...prev,
                    questions: prev.questions.map((qq, i) => i === qi ? {
                      ...qq, options: qq.options.map((oo, j) => j === oi ? { ...oo, option_text: e.target.value } : oo),
                    } : qq),
                  }))} />
                {q.options.length > 2 && (
                  <button onClick={() => setQuiz(prev => ({
                    ...prev,
                    questions: prev.questions.map((qq, i) => i === qi ? {
                      ...qq, options: qq.options.filter((_, j) => j !== oi),
                    } : qq),
                  }))} className="text-red-400 text-xs">✕</button>
                )}
              </div>
            ))}
            {q.options.length < 4 && (
              <button onClick={() => addOption(qi)} className="text-teal text-xs hover:underline ml-6">+ Añadir opción</button>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button onClick={addQuestion} className="btn-secondary !text-xs !py-1.5 !px-3">+ Añadir pregunta</button>
        <button onClick={saveQuiz} disabled={saving} className="btn-primary !text-xs !py-1.5 !px-3 disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar quiz"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add QuizEditor to course editor page**

In `src/app/(admin)/admin/cursos/[id]/editar/page.tsx`, after the modules section, add a quiz section for each saved module. Add this import at the top:

```typescript
import QuizEditor from "@/components/admin/courses/QuizEditor";
```

And after the `</div>` closing the modules section, add:

```tsx
{/* Quiz editors — only show for saved courses with saved modules */}
{courseId && modules.some(m => m.id) && (
  <div>
    <h3 className="font-black text-foreground text-lg mb-4">Quizzes por módulo</h3>
    <div className="space-y-4">
      {modules.filter(m => m.id).map(mod => (
        <div key={mod.id}>
          <p className="text-sm font-semibold text-secondary mb-2">{mod.title}</p>
          <QuizEditor moduleId={mod.id!} courseId={courseId} />
        </div>
      ))}
    </div>
    <p className="text-xs text-muted mt-2">Los quizzes se guardan por separado. Primero guarda el curso y módulos, luego edita los quizzes.</p>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/courses/QuizEditor.tsx src/app/\(admin\)/admin/cursos/\[id\]/editar/page.tsx
git commit -m "feat: add quiz editor to admin course editor"
```

---

## Task 21: Build Verification & Deploy

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: No errors. If there are errors, fix them.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Test locally**

Run: `npm run dev` and verify:
- `/academia` loads with filter bar and course grid
- `/academia/[slug]` shows course detail with modules and enroll button
- `/admin/cursos` shows course list table
- `/admin/cursos/nuevo/editar` shows course creation form

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors and final adjustments"
```

- [ ] **Step 5: Push and deploy**

```bash
git push origin main
```

Then deploy to Vercel via the established deployment process.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | DB migration (quizzes + certificates) | 1 new |
| 2 | Update TypeScript types | 1 modified |
| 3 | Install hls.js + jspdf | package.json |
| 4 | CourseLevelBadge + ProgressBar | 2 new |
| 5 | VideoPlayer (HLS.js) | 1 new |
| 6 | CourseCard + CourseGrid | 2 new |
| 7 | CourseFilters | 1 new |
| 8 | Rewrite catalog page | 1 modified |
| 9 | EnrollButton + free enrollment API | 2 new |
| 10 | Rewrite course detail page | 1 modified |
| 11 | ReviewList + ReviewForm + API | 3 new |
| 12 | Progress API route | 1 new |
| 13 | LessonSidebar | 1 new |
| 14 | QuizWidget + quiz API | 2 new |
| 15 | Player page (layout + page + client) | 3 new |
| 16 | CertificateDownload + API | 2 new |
| 17 | Stripe Checkout + webhook | 2 new |
| 18 | Admin courses list | 1 new + 1 modified |
| 19 | Admin course editor | 4 new |
| 20 | Admin quiz editor | 1 new + 1 modified |
| 21 | Build verification + deploy | — |

**Total:** ~28 new files, ~4 modified files

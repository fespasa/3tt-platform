// ============================================================
// 3TOUCH TRIBE — Database Types
// Auto-generado desde Supabase (proyecto: sxfzgbvwlxikonohczeo)
// Actualizar con: npx supabase gen types typescript --project-id sxfzgbvwlxikonohczeo
// ============================================================

export type UserRole = "player" | "coach" | "professional" | "admin";
export type MembershipType = "free" | "basic" | "advanced";
export type CourseLevel = "fundamentos" | "avanzado" | "especializacion" | "elite";
export type Discipline = "pista" | "playa" | "minivolley" | "volleyhierba" | "watervolley" | "general";
export type ContentType = "podcast" | "interview" | "article" | "report";
export type EventType = "clinic" | "torneo_signature" | "webinar" | "masterclass";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type RegistrationStatus = "pending" | "confirmed" | "waitlist" | "cancelled";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  membership: MembershipType;
  discipline: Discipline | null;
  location: string | null;
  social_links: { instagram?: string; linkedin?: string; youtube?: string };
  is_collaborator: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  slug: MembershipType;
  price_annual: number;
  price_monthly: number | null;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Collaborator {
  id: string;
  user_id: string;
  bio_professional: string | null;
  certifications: Record<string, unknown>[];
  revenue_share_pct: number;
  bank_iban: string | null;
  total_earnings: number;
  is_verified: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  instructor_id: string;
  level: CourseLevel;
  discipline: Discipline;
  price: number;
  thumbnail_url: string | null;
  preview_url: string | null;
  duration_mins: number;
  lessons_count: number;
  tags: string[];
  required_membership: MembershipType;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseWithInstructor extends Course {
  instructor_name: string;
  instructor_avatar: string | null;
  instructor_bio: string | null;
  revenue_share_pct: number;
  avg_rating: number;
  reviews_count: number;
  enrollments_count: number;
}

export interface ForumCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  target_role: UserRole | null;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumThread {
  id: string;
  category_id: number;
  author_id: string;
  title: string;
  content: string;
  tags: string[];
  views: number;
  replies_count: number;
  likes_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_reply_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  slug: string;
  type: ContentType;
  title: string;
  description: string | null;
  content_body: string | null;
  video_url: string | null;
  audio_url: string | null;
  thumbnail_url: string | null;
  duration_mins: number | null;
  guests: { name: string; role: string; avatar?: string }[];
  tags: string[];
  discipline: Discipline;
  is_premium: boolean;
  is_published: boolean;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: EventType;
  status: EventStatus;
  location: string | null;
  is_online: boolean;
  online_url: string | null;
  start_date: string;
  end_date: string;
  capacity: number | null;
  price: number;
  price_member: number | null;
  instructors: { name: string; role?: string }[];
  thumbnail_url: string | null;
  registration_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  type: "course" | "membership" | "event";
  reference_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  created_at: string;
}

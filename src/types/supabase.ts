// ============================================================
// 3TOUCH TRIBE — Supabase Database Types (auto-generado)
// Proyecto: sxfzgbvwlxikonohczeo
// Regenerar: npx supabase gen types typescript --project-id sxfzgbvwlxikonohczeo > src/types/supabase.ts
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      collaborators: {
        Row: {
          bank_iban: string | null
          bio_professional: string | null
          certifications: Json | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          revenue_share_pct: number | null
          total_earnings: number | null
          user_id: string
        }
        Insert: {
          bank_iban?: string | null
          bio_professional?: string | null
          certifications?: Json | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          revenue_share_pct?: number | null
          total_earnings?: number | null
          user_id: string
        }
        Update: {
          bank_iban?: string | null
          bio_professional?: string | null
          certifications?: Json | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          revenue_share_pct?: number | null
          total_earnings?: number | null
          user_id?: string
        }
        Relationships: [
          { foreignKeyName: "collaborators_user_id_fkey"; columns: ["user_id"]; isOneToOne: true; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
      }
      content_items: {
        Row: {
          audio_url: string | null; content_body: string | null; created_at: string | null
          description: string | null; discipline: Database["public"]["Enums"]["discipline"] | null
          duration_mins: number | null; guests: Json | null; id: string
          is_premium: boolean | null; is_published: boolean | null; published_at: string | null
          slug: string; tags: string[] | null; thumbnail_url: string | null; title: string
          type: Database["public"]["Enums"]["content_type"]; updated_at: string | null
          video_url: string | null; views: number | null
        }
        Insert: { audio_url?: string | null; content_body?: string | null; created_at?: string | null; description?: string | null; discipline?: Database["public"]["Enums"]["discipline"] | null; duration_mins?: number | null; guests?: Json | null; id?: string; is_premium?: boolean | null; is_published?: boolean | null; published_at?: string | null; slug: string; tags?: string[] | null; thumbnail_url?: string | null; title: string; type: Database["public"]["Enums"]["content_type"]; updated_at?: string | null; video_url?: string | null; views?: number | null }
        Update: { audio_url?: string | null; content_body?: string | null; created_at?: string | null; description?: string | null; discipline?: Database["public"]["Enums"]["discipline"] | null; duration_mins?: number | null; guests?: Json | null; id?: string; is_premium?: boolean | null; is_published?: boolean | null; published_at?: string | null; slug?: string; tags?: string[] | null; thumbnail_url?: string | null; title?: string; type?: Database["public"]["Enums"]["content_type"]; updated_at?: string | null; video_url?: string | null; views?: number | null }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null; description: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          duration_mins: number | null; id: string; instructor_id: string
          is_featured: boolean | null; is_published: boolean | null; lessons_count: number | null
          level: Database["public"]["Enums"]["course_level"]
          preview_url: string | null; price: number; published_at: string | null
          required_membership: Database["public"]["Enums"]["membership_type"] | null
          slug: string; subtitle: string | null; tags: string[] | null
          thumbnail_url: string | null; title: string; updated_at: string | null
        }
        Insert: { created_at?: string | null; description?: string | null; discipline?: Database["public"]["Enums"]["discipline"]; duration_mins?: number | null; id?: string; instructor_id: string; is_featured?: boolean | null; is_published?: boolean | null; lessons_count?: number | null; level?: Database["public"]["Enums"]["course_level"]; preview_url?: string | null; price?: number; published_at?: string | null; required_membership?: Database["public"]["Enums"]["membership_type"] | null; slug: string; subtitle?: string | null; tags?: string[] | null; thumbnail_url?: string | null; title: string; updated_at?: string | null }
        Update: { created_at?: string | null; description?: string | null; discipline?: Database["public"]["Enums"]["discipline"]; duration_mins?: number | null; id?: string; instructor_id?: string; is_featured?: boolean | null; is_published?: boolean | null; lessons_count?: number | null; level?: Database["public"]["Enums"]["course_level"]; preview_url?: string | null; price?: number; published_at?: string | null; required_membership?: Database["public"]["Enums"]["membership_type"] | null; slug?: string; subtitle?: string | null; tags?: string[] | null; thumbnail_url?: string | null; title?: string; updated_at?: string | null }
        Relationships: [{ foreignKeyName: "courses_instructor_id_fkey"; columns: ["instructor_id"]; isOneToOne: false; referencedRelation: "collaborators"; referencedColumns: ["id"] }]
      }
      events: {
        Row: {
          capacity: number | null; created_at: string | null; description: string | null
          end_date: string; id: string; instructors: Json | null; is_online: boolean | null
          location: string | null; online_url: string | null; price: number | null
          price_member: number | null; registration_deadline: string | null; slug: string
          start_date: string; status: Database["public"]["Enums"]["event_status"] | null
          thumbnail_url: string | null; title: string
          type: Database["public"]["Enums"]["event_type"]; updated_at: string | null
        }
        Insert: { capacity?: number | null; created_at?: string | null; description?: string | null; end_date: string; id?: string; instructors?: Json | null; is_online?: boolean | null; location?: string | null; online_url?: string | null; price?: number | null; price_member?: number | null; registration_deadline?: string | null; slug: string; start_date: string; status?: Database["public"]["Enums"]["event_status"] | null; thumbnail_url?: string | null; title: string; type: Database["public"]["Enums"]["event_type"]; updated_at?: string | null }
        Update: { capacity?: number | null; created_at?: string | null; description?: string | null; end_date?: string; id?: string; instructors?: Json | null; is_online?: boolean | null; location?: string | null; online_url?: string | null; price?: number | null; price_member?: number | null; registration_deadline?: string | null; slug?: string; start_date?: string; status?: Database["public"]["Enums"]["event_status"] | null; thumbnail_url?: string | null; title?: string; type?: Database["public"]["Enums"]["event_type"]; updated_at?: string | null }
        Relationships: []
      }
      forum_categories: {
        Row: { created_at: string | null; description: string | null; icon: string | null; id: number; is_active: boolean | null; name: string; position: number | null; slug: string; target_role: Database["public"]["Enums"]["user_role"] | null }
        Insert: { created_at?: string | null; description?: string | null; icon?: string | null; id?: number; is_active?: boolean | null; name: string; position?: number | null; slug: string; target_role?: Database["public"]["Enums"]["user_role"] | null }
        Update: { created_at?: string | null; description?: string | null; icon?: string | null; id?: number; is_active?: boolean | null; name?: string; position?: number | null; slug?: string; target_role?: Database["public"]["Enums"]["user_role"] | null }
        Relationships: []
      }
      forum_threads: {
        Row: { author_id: string; category_id: number; content: string; created_at: string | null; id: string; is_locked: boolean | null; is_pinned: boolean | null; last_reply_at: string | null; likes_count: number | null; replies_count: number | null; tags: string[] | null; title: string; updated_at: string | null; views: number | null }
        Insert: { author_id: string; category_id: number; content: string; created_at?: string | null; id?: string; is_locked?: boolean | null; is_pinned?: boolean | null; last_reply_at?: string | null; likes_count?: number | null; replies_count?: number | null; tags?: string[] | null; title: string; updated_at?: string | null; views?: number | null }
        Update: { author_id?: string; category_id?: number; content?: string; created_at?: string | null; id?: string; is_locked?: boolean | null; is_pinned?: boolean | null; last_reply_at?: string | null; likes_count?: number | null; replies_count?: number | null; tags?: string[] | null; title?: string; updated_at?: string | null; views?: number | null }
        Relationships: [{ foreignKeyName: "forum_threads_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "forum_threads_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "forum_categories"; referencedColumns: ["id"] }]
      }
      profiles: {
        Row: { avatar_url: string | null; bio: string | null; created_at: string | null; discipline: Database["public"]["Enums"]["discipline"] | null; full_name: string; id: string; is_collaborator: boolean | null; location: string | null; membership: Database["public"]["Enums"]["membership_type"]; role: Database["public"]["Enums"]["user_role"]; social_links: Json | null; updated_at: string | null; username: string | null }
        Insert: { avatar_url?: string | null; bio?: string | null; created_at?: string | null; discipline?: Database["public"]["Enums"]["discipline"] | null; full_name: string; id: string; is_collaborator?: boolean | null; location?: string | null; membership?: Database["public"]["Enums"]["membership_type"]; role?: Database["public"]["Enums"]["user_role"]; social_links?: Json | null; updated_at?: string | null; username?: string | null }
        Update: { avatar_url?: string | null; bio?: string | null; created_at?: string | null; discipline?: Database["public"]["Enums"]["discipline"] | null; full_name?: string; id?: string; is_collaborator?: boolean | null; location?: string | null; membership?: Database["public"]["Enums"]["membership_type"]; role?: Database["public"]["Enums"]["user_role"]; social_links?: Json | null; updated_at?: string | null; username?: string | null }
        Relationships: []
      }
    }
    Views: {
      v_collaborator_earnings: {
        Row: { avatar_url: string | null; collaborator_id: string | null; courses_count: number | null; full_name: string | null; platform_revenue: number | null; total_earnings: number | null; total_gross: number | null }
        Relationships: []
      }
      v_courses_with_instructor: {
        Row: { avg_rating: number | null; created_at: string | null; description: string | null; discipline: Database["public"]["Enums"]["discipline"] | null; duration_mins: number | null; enrollments_count: number | null; id: string | null; instructor_avatar: string | null; instructor_bio: string | null; instructor_id: string | null; instructor_name: string | null; is_featured: boolean | null; is_published: boolean | null; lessons_count: number | null; level: Database["public"]["Enums"]["course_level"] | null; preview_url: string | null; price: number | null; published_at: string | null; required_membership: Database["public"]["Enums"]["membership_type"] | null; revenue_share_pct: number | null; reviews_count: number | null; slug: string | null; subtitle: string | null; tags: string[] | null; thumbnail_url: string | null; title: string | null; updated_at: string | null }
        Relationships: []
      }
    }
    Enums: {
      content_type: "podcast" | "interview" | "article" | "report"
      course_level: "fundamentos" | "avanzado" | "especializacion" | "elite"
      discipline: "pista" | "playa" | "minivolley" | "volleyhierba" | "watervolley" | "general"
      event_status: "draft" | "published" | "cancelled" | "completed"
      event_type: "clinic" | "torneo_signature" | "webinar" | "masterclass"
      membership_type: "free" | "basic" | "advanced"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      registration_status: "pending" | "confirmed" | "waitlist" | "cancelled"
      user_role: "player" | "coach" | "professional" | "admin"
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

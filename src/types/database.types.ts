export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
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
          {
            foreignKeyName: "collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          audio_url: string | null
          content_body: string | null
          created_at: string | null
          description: string | null
          discipline: Database["public"]["Enums"]["discipline"] | null
          duration_mins: number | null
          guests: Json | null
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          audio_url?: string | null
          content_body?: string | null
          created_at?: string | null
          description?: string | null
          discipline?: Database["public"]["Enums"]["discipline"] | null
          duration_mins?: number | null
          guests?: Json | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          audio_url?: string | null
          content_body?: string | null
          created_at?: string | null
          description?: string | null
          discipline?: Database["public"]["Enums"]["discipline"] | null
          duration_mins?: number | null
          guests?: Json | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          course_id: string
          id: string
          issued_at: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          id?: string
          issued_at?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          id?: string
          issued_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          payment_id: string | null
          progress_pct: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          payment_id?: string | null
          progress_pct?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          payment_id?: string | null
          progress_pct?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_preview: boolean | null
          module_id: string
          position: number
          resources: Json | null
          title: string
          video_duration: number | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_preview?: boolean | null
          module_id: string
          position: number
          resources?: Json | null
          title: string
          video_duration?: number | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_preview?: boolean | null
          module_id?: string
          position?: number
          resources?: Json | null
          title?: string
          video_duration?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          position: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          duration_mins: number | null
          id: string
          instructor_id: string
          is_featured: boolean | null
          is_published: boolean | null
          lessons_count: number | null
          level: Database["public"]["Enums"]["course_level"]
          preview_url: string | null
          price: number
          published_at: string | null
          required_membership:
            | Database["public"]["Enums"]["membership_type"]
            | null
          slug: string
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discipline?: Database["public"]["Enums"]["discipline"]
          duration_mins?: number | null
          id?: string
          instructor_id: string
          is_featured?: boolean | null
          is_published?: boolean | null
          lessons_count?: number | null
          level?: Database["public"]["Enums"]["course_level"]
          preview_url?: string | null
          price?: number
          published_at?: string | null
          required_membership?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          slug: string
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discipline?: Database["public"]["Enums"]["discipline"]
          duration_mins?: number | null
          id?: string
          instructor_id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          lessons_count?: number | null
          level?: Database["public"]["Enums"]["course_level"]
          preview_url?: string | null
          price?: number
          published_at?: string | null
          required_membership?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          slug?: string
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "v_collaborator_earnings"
            referencedColumns: ["collaborator_id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          amount_paid: number | null
          event_id: string
          id: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          registered_at: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          event_id: string
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          registered_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          event_id?: string
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          registered_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          instructors: Json | null
          is_online: boolean | null
          location: string | null
          online_url: string | null
          price: number | null
          price_member: number | null
          registration_deadline: string | null
          slug: string
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          instructors?: Json | null
          is_online?: boolean | null
          location?: string | null
          online_url?: string | null
          price?: number | null
          price_member?: number | null
          registration_deadline?: string | null
          slug: string
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          thumbnail_url?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          instructors?: Json | null
          is_online?: boolean | null
          location?: string | null
          online_url?: string | null
          price?: number | null
          price_member?: number | null
          registration_deadline?: string | null
          slug?: string
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          position: number | null
          slug: string
          target_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          position?: number | null
          slug: string
          target_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          position?: number | null
          slug?: string
          target_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_solution: boolean | null
          likes_count: number | null
          parent_id: string | null
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          thread_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          author_id: string
          category_id: number
          content: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          likes_count: number | null
          replies_count: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          category_id: number
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          likes_count?: number | null
          replies_count?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          category_id?: number
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          likes_count?: number | null
          replies_count?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
          watch_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
          watch_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
          watch_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: number
          is_active: boolean | null
          name: string
          price_annual: number
          price_monthly: number | null
          slug: Database["public"]["Enums"]["membership_type"]
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          name: string
          price_annual: number
          price_monthly?: number | null
          slug: Database["public"]["Enums"]["membership_type"]
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          name?: string
          price_annual?: number
          price_monthly?: number | null
          slug?: Database["public"]["Enums"]["membership_type"]
        }
        Relationships: []
      }
      module_quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          module_id: string
          passing_score: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          module_id: string
          passing_score?: number
          title?: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          module_id?: string
          passing_score?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: number
          is_active: boolean | null
          source: string | null
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          is_active?: boolean | null
          source?: string | null
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          is_active?: boolean | null
          source?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          reference_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_invoice_id: string | null
          stripe_payment_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          reference_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          reference_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          discipline: Database["public"]["Enums"]["discipline"] | null
          full_name: string
          id: string
          is_collaborator: boolean | null
          location: string | null
          membership: Database["public"]["Enums"]["membership_type"]
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          discipline?: Database["public"]["Enums"]["discipline"] | null
          full_name: string
          id: string
          is_collaborator?: boolean | null
          location?: string | null
          membership?: Database["public"]["Enums"]["membership_type"]
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          discipline?: Database["public"]["Enums"]["discipline"] | null
          full_name?: string
          id?: string
          is_collaborator?: boolean | null
          location?: string | null
          membership?: Database["public"]["Enums"]["membership_type"]
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "module_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          position?: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          id: string
          position: number
          question_text: string
          quiz_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number
          question_text: string
          quiz_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number
          question_text?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "module_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_share_records: {
        Row: {
          collaborator_id: string
          course_id: string
          created_at: string | null
          gross_amount: number
          id: string
          paid_at: string | null
          payment_id: string
          platform_fee: number
          share_amount: number
          share_pct: number
        }
        Insert: {
          collaborator_id: string
          course_id: string
          created_at?: string | null
          gross_amount: number
          id?: string
          paid_at?: string | null
          payment_id: string
          platform_fee: number
          share_amount: number
          share_pct: number
        }
        Update: {
          collaborator_id?: string
          course_id?: string
          created_at?: string | null
          gross_amount?: number
          id?: string
          paid_at?: string | null
          payment_id?: string
          platform_fee?: number
          share_amount?: number
          share_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_share_records_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_share_records_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "v_collaborator_earnings"
            referencedColumns: ["collaborator_id"]
          },
          {
            foreignKeyName: "revenue_share_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_share_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_courses_with_instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_share_records_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_likes: {
        Row: {
          created_at: string | null
          id: string
          reply_id: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_likes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memberships: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          plan_id: number
          starts_at: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id: number
          starts_at?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: number
          starts_at?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_collaborator_earnings: {
        Row: {
          avatar_url: string | null
          collaborator_id: string | null
          courses_count: number | null
          full_name: string | null
          platform_revenue: number | null
          total_earnings: number | null
          total_gross: number | null
        }
        Relationships: []
      }
      v_courses_with_instructor: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          description: string | null
          discipline: Database["public"]["Enums"]["discipline"] | null
          duration_mins: number | null
          enrollments_count: number | null
          id: string | null
          instructor_avatar: string | null
          instructor_bio: string | null
          instructor_id: string | null
          instructor_name: string | null
          is_featured: boolean | null
          is_published: boolean | null
          lessons_count: number | null
          level: Database["public"]["Enums"]["course_level"] | null
          preview_url: string | null
          price: number | null
          published_at: string | null
          required_membership:
            | Database["public"]["Enums"]["membership_type"]
            | null
          revenue_share_pct: number | null
          reviews_count: number | null
          slug: string | null
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "v_collaborator_earnings"
            referencedColumns: ["collaborator_id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_type: "podcast" | "interview" | "article" | "report"
      course_level: "fundamentos" | "avanzado" | "especializacion" | "elite"
      discipline:
        | "pista"
        | "playa"
        | "minivolley"
        | "volleyhierba"
        | "watervolley"
        | "general"
      event_status: "draft" | "published" | "cancelled" | "completed"
      event_type: "clinic" | "torneo_signature" | "webinar" | "masterclass"
      membership_type: "free" | "basic" | "advanced"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      registration_status: "pending" | "confirmed" | "waitlist" | "cancelled"
      user_role: "player" | "coach" | "professional" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_type: ["podcast", "interview", "article", "report"],
      course_level: ["fundamentos", "avanzado", "especializacion", "elite"],
      discipline: [
        "pista",
        "playa",
        "minivolley",
        "volleyhierba",
        "watervolley",
        "general",
      ],
      event_status: ["draft", "published", "cancelled", "completed"],
      event_type: ["clinic", "torneo_signature", "webinar", "masterclass"],
      membership_type: ["free", "basic", "advanced"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      registration_status: ["pending", "confirmed", "waitlist", "cancelled"],
      user_role: ["player", "coach", "professional", "admin"],
    },
  },
} as const


// ═══════════════════════════════════════════
// Domain type aliases
// ═══════════════════════════════════════════

type TableRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
type ViewRow<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"]
type EnumVal<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

// Core types
export type Course = TableRow<"courses">
export type CourseWithInstructor = ViewRow<"v_courses_with_instructor">
export type CourseLevel = EnumVal<"course_level">
export type Discipline = EnumVal<"discipline">

// Course sub-types
export type CourseModule = TableRow<"course_modules">
export type CourseLesson = TableRow<"course_lessons">
export type CourseEnrollment = TableRow<"course_enrollments">
export type CourseReview = TableRow<"course_reviews">
export type LessonProgress = TableRow<"lesson_progress">

// Quiz types
export type ModuleQuiz = TableRow<"module_quizzes">
export type QuizQuestion = TableRow<"quiz_questions">
export type QuizOption = TableRow<"quiz_options">
export type QuizAttempt = TableRow<"quiz_attempts">

// Certificate types
export type CourseCertificate = TableRow<"course_certificates">

// Other domain types
export type Profile = TableRow<"profiles">
export type ContentItem = TableRow<"content_items">
export type Event = TableRow<"events">
export type ForumCategory = TableRow<"forum_categories">
export type MembershipPlan = TableRow<"membership_plans">

// Composite types for frontend
export type ModuleWithLessons = CourseModule & {
  course_lessons: CourseLesson[];
}

export type QuizWithQuestions = ModuleQuiz & {
  quiz_questions: (QuizQuestion & {
    quiz_options: QuizOption[];
  })[];
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  next_auth: {
    Tables: {
      accounts: {
        Row: {
          id: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
          oauth_token_secret: string | null
          oauth_token: string | null
          userId: string | null
        }
        Insert: {
          id?: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          oauth_token_secret?: string | null
          oauth_token?: string | null
          userId?: string | null
        }
        Update: {
          id?: string
          type?: string
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          oauth_token_secret?: string | null
          oauth_token?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          id: string
          expires: string
          sessionToken: string
          userId: string | null
        }
        Insert: {
          id?: string
          expires: string
          sessionToken: string
          userId?: string | null
        }
        Update: {
          id?: string
          expires?: string
          sessionToken?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          emailVerified: string | null
          image: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          emailVerified?: string | null
          image?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          emailVerified?: string | null
          image?: string | null
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          identifier: string | null
          token: string
          expires: string
        }
        Insert: {
          identifier?: string | null
          token: string
          expires: string
        }
        Update: {
          identifier?: string | null
          token?: string
          expires?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          image: string | null
          password_hash: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          image?: string | null
          password_hash?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          image?: string | null
          password_hash?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          stripe_customer_id: string | null
          plan_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          stripe_customer_id?: string | null
          plan_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          plan_tier?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          google_account_id: string | null
          google_location_id: string | null
          name: string
          address: string | null
          phone: string | null
          google_place_id: string | null
          is_verified: boolean
          last_synced_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          google_account_id?: string | null
          google_location_id?: string | null
          name: string
          address?: string | null
          phone?: string | null
          google_place_id?: string | null
          is_verified?: boolean
          last_synced_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          google_account_id?: string | null
          google_location_id?: string | null
          name?: string
          address?: string | null
          phone?: string | null
          google_place_id?: string | null
          is_verified?: boolean
          last_synced_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          location_id: string
          organization_id: string
          google_review_id: string
          reviewer_name: string | null
          reviewer_photo_url: string | null
          star_rating: number
          comment: string | null
          review_created_at: string | null
          review_updated_at: string | null
          sentiment: string | null
          sentiment_score: number | null
          sentiment_themes: string[] | null
          requires_urgent_response: boolean
          is_spam: boolean
          ai_analysis: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          organization_id: string
          google_review_id: string
          reviewer_name?: string | null
          reviewer_photo_url?: string | null
          star_rating: number
          comment?: string | null
          review_created_at?: string | null
          review_updated_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          sentiment_themes?: string[] | null
          requires_urgent_response?: boolean
          is_spam?: boolean
          ai_analysis?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          organization_id?: string
          google_review_id?: string
          reviewer_name?: string | null
          reviewer_photo_url?: string | null
          star_rating?: number
          comment?: string | null
          review_created_at?: string | null
          review_updated_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          sentiment_themes?: string[] | null
          requires_urgent_response?: boolean
          is_spam?: boolean
          ai_analysis?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          id: string
          review_id: string
          organization_id: string
          content: string
          status: string
          is_ai_generated: boolean
          ai_model: string | null
          ai_tokens_used: number | null
          approved_by: string | null
          approved_at: string | null
          published_at: string | null
          published_google_reply_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          organization_id: string
          content: string
          status?: string
          is_ai_generated?: boolean
          ai_model?: string | null
          ai_tokens_used?: number | null
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          published_google_reply_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          organization_id?: string
          content?: string
          status?: string
          is_ai_generated?: boolean
          ai_model?: string | null
          ai_tokens_used?: number | null
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          published_google_reply_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          stripe_current_period_end: string | null
          status: string
          plan_tier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          stripe_current_period_end?: string | null
          status: string
          plan_tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          stripe_current_period_end?: string | null
          status?: string
          plan_tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          new_review_email: boolean
          new_review_in_app: boolean
          weekly_digest: boolean
          negative_review_alert: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          new_review_email?: boolean
          new_review_in_app?: boolean
          weekly_digest?: boolean
          negative_review_alert?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          new_review_email?: boolean
          new_review_in_app?: boolean
          weekly_digest?: boolean
          negative_review_alert?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          type: string | null
          title: string | null
          message: string | null
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          type?: string | null
          title?: string | null
          message?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          type?: string | null
          title?: string | null
          message?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_voice_configs: {
        Row: {
          id: string
          organization_id: string
          location_id: string | null
          tone: string
          formality: number
          humor_level: number
          use_emoji: boolean
          signature_name: string | null
          preferred_phrases: string[] | null
          avoid_phrases: string[] | null
          response_length: string
          custom_examples: Json | null
          values: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          location_id?: string | null
          tone?: string
          formality?: number
          humor_level?: number
          use_emoji?: boolean
          signature_name?: string | null
          preferred_phrases?: string[] | null
          avoid_phrases?: string[] | null
          response_length?: string
          custom_examples?: Json | null
          values?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          location_id?: string | null
          tone?: string
          formality?: number
          humor_level?: number
          use_emoji?: boolean
          signature_name?: string | null
          preferred_phrases?: string[] | null
          avoid_phrases?: string[] | null
          response_length?: string
          custom_examples?: Json | null
          values?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_voice_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_voice_configs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      google_oauth_tokens: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string | null
          scope: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at?: string | null
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string | null
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_oauth_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_log: {
        Row: {
          id: string
          organization_id: string
          model: string | null
          input_tokens: number | null
          output_tokens: number | null
          cost_usd: number | null
          operation: string | null
          review_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          model?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          cost_usd?: number | null
          operation?: string | null
          review_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          model?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          cost_usd?: number | null
          operation?: string | null
          review_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_log_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_org_role: {
        Args: {
          p_org_id: string
          p_roles: string[]
        }
        Returns: boolean
      }
      user_org_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

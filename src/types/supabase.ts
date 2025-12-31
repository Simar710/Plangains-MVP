export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          username: string | null;
          role: "member" | "creator" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          role?: "member" | "creator" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          role?: "member" | "creator" | "admin";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      creators: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          display_name: string;
          bio: string | null;
          monthly_price_cents: number;
          stripe_account_id: string | null;
          stripe_onboarding_complete: boolean;
          is_active: boolean;
          profile_complete: boolean;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          display_name: string;
          bio?: string | null;
          monthly_price_cents?: number;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          is_active?: boolean;
          profile_complete?: boolean;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          display_name?: string;
          bio?: string | null;
          monthly_price_cents?: number;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          is_active?: boolean;
          profile_complete?: boolean;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          member_id: string;
          creator_id: string;
          status:
            | "active"
            | "past_due"
            | "canceled"
            | "incomplete"
            | "trialing"
            | "unpaid"
            | "free"
            | "paused"
            | "incomplete_expired";
          price_cents: number;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          stripe_checkout_session_id: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          creator_id: string;
          status:
            | "active"
            | "past_due"
            | "canceled"
            | "incomplete"
            | "trialing"
            | "unpaid"
            | "free"
            | "paused"
            | "incomplete_expired";
          price_cents: number;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_checkout_session_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          creator_id?: string;
          status?:
            | "active"
            | "past_due"
            | "canceled"
            | "incomplete"
            | "trialing"
            | "unpaid"
            | "free"
            | "paused"
            | "incomplete_expired";
          price_cents?: number;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_checkout_session_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_member_id_fkey";
            columns: ["member_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      programs: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          }
        ];
      };
      program_days: {
        Row: {
          id: string;
          program_id: string;
          day_number: number;
          title: string | null;
        };
        Insert: {
          id?: string;
          program_id: string;
          day_number: number;
          title?: string | null;
        };
        Update: {
          id?: string;
          program_id?: string;
          day_number?: number;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey";
            columns: ["program_id"];
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      program_exercises: {
        Row: {
          id: string;
          program_day_id: string;
          name: string;
          instructions: string | null;
          position: number;
        };
        Insert: {
          id?: string;
          program_day_id: string;
          name: string;
          instructions?: string | null;
          position?: number;
        };
        Update: {
          id?: string;
          program_day_id?: string;
          name?: string;
          instructions?: string | null;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "program_exercises_program_day_id_fkey";
            columns: ["program_day_id"];
            referencedRelation: "program_days";
            referencedColumns: ["id"];
          }
        ];
      };
      workouts: {
        Row: {
          id: string;
          subscription_id: string;
          program_day_id: string | null;
          performed_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          program_day_id?: string | null;
          performed_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          program_day_id?: string | null;
          performed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_program_day_id_fkey";
            columns: ["program_day_id"];
            referencedRelation: "program_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workouts_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          exercise_name: string;
          weight: number | null;
          reps: number | null;
          rpe: number | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_name: string;
          weight?: number | null;
          reps?: number | null;
          rpe?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_name?: string;
          weight?: number | null;
          reps?: number | null;
          rpe?: number | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_id_fkey";
            columns: ["workout_id"];
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

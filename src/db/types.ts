export type Role = "member" | "creator" | "admin";

export type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
  role: Role;
  created_at: string;
};

export type Creator = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  monthly_price_cents: number;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  created_at: string;
};

export type Subscription = {
  id: string;
  member_id: string;
  creator_id: string;
  status: "active" | "past_due" | "canceled" | "incomplete" | "trialing" | "unpaid" | "free";
  price_cents: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  current_period_end: string | null;
  created_at: string;
};

export type Program = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
};

export type ProgramDay = {
  id: string;
  program_id: string;
  day_number: number;
  title: string | null;
};

export type ProgramExercise = {
  id: string;
  program_day_id: string;
  name: string;
  instructions: string | null;
  position: number;
};

export type Workout = {
  id: string;
  subscription_id: string;
  program_day_id: string | null;
  performed_at: string;
};

export type WorkoutSet = {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  notes: string | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      creators: { Row: Creator };
      subscriptions: { Row: Subscription };
      programs: { Row: Program };
      program_days: { Row: ProgramDay };
      program_exercises: { Row: ProgramExercise };
      workouts: { Row: Workout };
      workout_sets: { Row: WorkoutSet };
    };
  };
}

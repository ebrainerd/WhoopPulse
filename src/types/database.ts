/**
 * Hand-written Supabase schema types matching `supabase/migrations`.
 * Column names are snake_case to match Postgres. Mapping to camelCase domain
 * models happens in the service layer.
 */

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          timezone: string | null;
          location_lat: number | null;
          location_lng: number | null;
          location_name: string | null;
          baseline_recovery: number | null;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          timezone?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_name?: string | null;
          baseline_recovery?: number | null;
          onboarded_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      whoop_connections: {
        Row: {
          user_id: string;
          whoop_user_id: string | null;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          scopes: string | null;
          connected_at: string | null;
          last_synced_at: string | null;
        };
        Insert: {
          user_id: string;
          whoop_user_id?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          scopes?: string | null;
          connected_at?: string | null;
          last_synced_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['whoop_connections']['Insert']>;
        Relationships: [];
      };
      whoop_cycles: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          recovery_score: number | null;
          hrv_ms: number | null;
          rhr_bpm: number | null;
          skin_temp_c: number | null;
          spo2: number | null;
          resting_calories: number | null;
          day_strain: number | null;
          sleep_performance: number | null;
          sleep_duration_min: number | null;
          sleep_efficiency: number | null;
          sleep_consistency: number | null;
          respiratory_rate: number | null;
          raw: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          recovery_score?: number | null;
          hrv_ms?: number | null;
          rhr_bpm?: number | null;
          skin_temp_c?: number | null;
          spo2?: number | null;
          resting_calories?: number | null;
          day_strain?: number | null;
          sleep_performance?: number | null;
          sleep_duration_min?: number | null;
          sleep_efficiency?: number | null;
          sleep_consistency?: number | null;
          respiratory_rate?: number | null;
          raw?: Json | null;
        };
        Update: Partial<Database['public']['Tables']['whoop_cycles']['Insert']>;
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          alcohol_drinks: number;
          last_meal_time: string | null;
          fasting_hours: number | null;
          creatine: boolean;
          supplements: string[];
          energy: number;
          mood: number;
          training_type: string;
          training_intensity: number;
          training_notes: string;
          work_stress: number;
          winddown_time: string | null;
          water_liters: number | null;
          caffeine_after_2pm: boolean;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          alcohol_drinks?: number;
          last_meal_time?: string | null;
          fasting_hours?: number | null;
          creatine?: boolean;
          supplements?: string[];
          energy?: number;
          mood?: number;
          training_type?: string;
          training_intensity?: number;
          training_notes?: string;
          work_stress?: number;
          winddown_time?: string | null;
          water_liters?: number | null;
          caffeine_after_2pm?: boolean;
          notes?: string;
        };
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>;
        Relationships: [];
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          predicted_score: number;
          confidence: number;
          actual_score: number | null;
          baseline: number;
          factors: Json;
          model_version: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          predicted_score: number;
          confidence: number;
          actual_score?: number | null;
          baseline: number;
          factors: Json;
          model_version: string;
        };
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>;
        Relationships: [];
      };
      recommendations_log: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          action_key: string;
          title: string;
          impact_points: number;
          followed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          action_key: string;
          title: string;
          impact_points?: number;
          followed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['recommendations_log']['Insert']>;
        Relationships: [];
      };
      weather_daily: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          temp_min_c: number | null;
          temp_max_c: number | null;
          overnight_low_c: number | null;
          precipitation_mm: number | null;
          wind_kph: number | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          temp_min_c?: number | null;
          temp_max_c?: number | null;
          overnight_low_c?: number | null;
          precipitation_mm?: number | null;
          wind_kph?: number | null;
          description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['weather_daily']['Insert']>;
        Relationships: [];
      };
      experiments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          hypothesis: string;
          condition_key: string;
          start_date: string;
          end_date: string | null;
          target_days: number;
          status: string;
          result_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          hypothesis?: string;
          condition_key: string;
          start_date: string;
          end_date?: string | null;
          target_days?: number;
          status?: string;
          result_summary?: string | null;
        };
        Update: Partial<Database['public']['Tables']['experiments']['Insert']>;
        Relationships: [];
      };
      fasts: {
        Row: {
          id: string;
          user_id: string;
          start_at: string;
          end_at: string | null;
          target_hours: number;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_at: string;
          end_at?: string | null;
          target_hours?: number;
          note?: string;
        };
        Update: Partial<Database['public']['Tables']['fasts']['Insert']>;
        Relationships: [];
      };
      bloodwork_panels: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          markers: Json;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          markers?: Json;
          notes?: string;
        };
        Update: Partial<Database['public']['Tables']['bloodwork_panels']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

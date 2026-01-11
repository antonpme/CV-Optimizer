// Supabase type definitions for CV Optimizer
// Last updated: 2026-01-11
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_balances: {
        Row: {
          user_id: string;
          credits: number;
          stripe_customer_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          credits?: number;
          stripe_customer_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          credits?: number;
          stripe_customer_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          delta_credits: number;
          type: string;
          reference_id: string | null;
          note: string | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          delta_credits: number;
          type: string;
          reference_id?: string | null;
          note?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          delta_credits?: number;
          type?: string;
          reference_id?: string | null;
          note?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      stripe_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          processed_at: string | null;
          payload: Json | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          processed_at?: string | null;
          payload?: Json | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          processed_at?: string | null;
          payload?: Json | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          job_title: string | null;
          location: string | null;
          professional_summary: string | null;
          website_url: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          embellishment_level: number | null;
          data_retention_days: number | null;
          ai_training_consent: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          job_title?: string | null;
          location?: string | null;
          professional_summary?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          embellishment_level?: number | null;
          data_retention_days?: number | null;
          ai_training_consent?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          full_name?: string | null;
          job_title?: string | null;
          location?: string | null;
          professional_summary?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          embellishment_level?: number | null;
          data_retention_days?: number | null;
          ai_training_consent?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      cvs: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          original_filename: string | null;
          docx_path: string | null;
          text_content: string;
          is_reference: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          original_filename?: string | null;
          docx_path?: string | null;
          text_content: string;
          is_reference?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          original_filename?: string | null;
          docx_path?: string | null;
          text_content?: string;
          is_reference?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      job_descriptions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          company: string | null;
          text_content: string;
          keywords: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          company?: string | null;
          text_content: string;
          keywords?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          company?: string | null;
          text_content?: string;
          keywords?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      optimized_cvs: {
        Row: {
          id: string;
          user_id: string;
          cv_id: string;
          optimized_text: string;
          optimization_summary: Json | null;
          ai_model_used: string | null;
          confidence_score: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          cv_id: string;
          optimized_text: string;
          optimization_summary?: Json | null;
          ai_model_used?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          cv_id?: string;
          optimized_text?: string;
          optimization_summary?: Json | null;
          ai_model_used?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      generated_cvs: {
        Row: {
          id: string;
          user_id: string;
          cv_id: string;
          jd_id: string;
          tailored_text: string;
          optimization_notes: Json | null;
          match_score: number | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          cv_id: string;
          jd_id: string;
          tailored_text: string;
          optimization_notes?: Json | null;
          match_score?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          cv_id?: string;
          jd_id?: string;
          tailored_text?: string;
          optimization_notes?: Json | null;
          match_score?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      generated_cv_sections: {
        Row: {
          id: string;
          user_id: string;
          generated_cv_id: string;
          section_name: string;
          original_text: string;
          suggested_text: string;
          final_text: string | null;
          rationale: string | null;
          status: string | null;
          ordering: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_cv_id: string;
          section_name: string;
          original_text: string;
          suggested_text: string;
          final_text?: string | null;
          rationale?: string | null;
          status?: string | null;
          ordering?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_cv_id?: string;
          section_name?: string;
          original_text?: string;
          suggested_text?: string;
          final_text?: string | null;
          rationale?: string | null;
          status?: string | null;
          ordering?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      cv_exports: {
        Row: {
          id: string;
          user_id: string;
          generated_cv_id: string;
          format: string;
          status: string;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_cv_id: string;
          format: string;
          status?: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_cv_id?: string;
          format?: string;
          status?: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_entitlements: {
        Row: {
          user_id: string;
          plan: string;
          gen_rate_limit: number | null;
          gen_window_seconds: number | null;
          gen_monthly_limit: number | null;
          opt_rate_limit: number | null;
          opt_window_seconds: number | null;
          opt_monthly_limit: number | null;
          allow_export: boolean | null;
          expires_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          plan?: string;
          gen_rate_limit?: number | null;
          gen_window_seconds?: number | null;
          gen_monthly_limit?: number | null;
          opt_rate_limit?: number | null;
          opt_window_seconds?: number | null;
          opt_monthly_limit?: number | null;
          allow_export?: boolean | null;
          expires_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          plan?: string;
          gen_rate_limit?: number | null;
          gen_window_seconds?: number | null;
          gen_monthly_limit?: number | null;
          opt_rate_limit?: number | null;
          opt_window_seconds?: number | null;
          opt_monthly_limit?: number | null;
          allow_export?: boolean | null;
          expires_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      ai_runs: {
        Row: {
          id: string;
          user_id: string;
          run_type: string;
          provider: string;
          model: string;
          tokens_input: number | null;
          tokens_output: number | null;
          cost_usd: number | null;
          status: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          run_type: string;
          provider?: string;
          model: string;
          tokens_input?: number | null;
          tokens_output?: number | null;
          cost_usd?: number | null;
          status?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          run_type?: string;
          provider?: string;
          model?: string;
          tokens_input?: number | null;
          tokens_output?: number | null;
          cost_usd?: number | null;
          status?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      add_credits: {
        Args: { p_user_id: string; p_amount: number };
        Returns: number;
      };
      spend_credits: {
        Args: { p_user_id: string; p_amount: number };
        Returns: number | null;
      };
      link_stripe_customer: {
        Args: { p_user_id: string; p_stripe_customer_id: string };
        Returns: undefined;
      };
      get_user_by_stripe_customer: {
        Args: { p_stripe_customer_id: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

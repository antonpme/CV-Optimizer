// Placeholder Supabase type definitions.
// Replace with generated types once the database schema stabilises.
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

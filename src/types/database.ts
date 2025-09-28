// Simplified Supabase type definitions for Solo MVP v1.1.
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
          status: 'pending' | 'in_review' | 'approved' | 'rejected' | null;
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
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | null;
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
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
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
          status: 'pending' | 'approved' | 'rejected' | null;
          ordering: number | null;
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
          status?: 'pending' | 'approved' | 'rejected' | null;
          ordering?: number | null;
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
          status?: 'pending' | 'approved' | 'rejected' | null;
          ordering?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      cv_exports: {
        Row: {
          id: string;
          user_id: string;
          generated_cv_id: string;
          format: 'html' | 'docx';
          status: 'completed' | 'failed';
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_cv_id: string;
          format: 'html' | 'docx';
          status?: 'completed' | 'failed';
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_cv_id?: string;
          format?: 'html' | 'docx';
          status?: 'completed' | 'failed';
          notes?: string | null;
          created_at?: string | null;
        };
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
      };
      ai_runs: {
        Row: {
          id: string;
          user_id: string;
          run_type: 'optimize_cv' | 'cv_generation';
          provider: string;
          model: string;
          tokens_input: number | null;
          tokens_output: number | null;
          cost_usd: number | null;
          status: 'success' | 'failed' | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          run_type: 'optimize_cv' | 'cv_generation';
          provider?: string;
          model: string;
          tokens_input?: number | null;
          tokens_output?: number | null;
          cost_usd?: number | null;
          status?: 'success' | 'failed' | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          run_type?: 'optimize_cv' | 'cv_generation';
          provider?: string;
          model?: string;
          tokens_input?: number | null;
          tokens_output?: number | null;
          cost_usd?: number | null;
          status?: 'success' | 'failed' | null;
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

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
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

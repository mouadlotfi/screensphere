// TypeScript types have been generated from your Supabase database
// Use these types for type-safe database interactions

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number | string;
          title: string | null;
          overview: string | null;
          release_date: string;
          poster_path: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number | string;
          title?: string | null;
          overview?: string | null;
          release_date?: string;
          poster_path?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tmdb_id?: number | string;
          title?: string | null;
          overview?: string | null;
          release_date?: string;
          poster_path?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
    };
  };
}

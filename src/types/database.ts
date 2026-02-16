/**
 * Supabase 데이터베이스 타입 정의
 * supabase gen types typescript 명령으로 자동 생성 가능
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          target_user_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          target_user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          target_user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          book_name: string;
          isbn13: string | null;
          author: string | null;
          publisher: string | null;
          publication_date: string | null;
          condition: string | null;
          purchase_price: number | null;
          currency: string;
          purchase_price_sec: number | null;
          currency_sec: string | null;
          purchase_date: string | null;
          purchase_place: string | null;
          topic: string | null;
          image_url: string | null;
          duplicated: boolean;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_name: string;
          isbn13?: string | null;
          author?: string | null;
          publisher?: string | null;
          publication_date?: string | null;
          condition?: string | null;
          purchase_price?: number | null;
          currency?: string;
          purchase_price_sec?: number | null;
          currency_sec?: string | null;
          purchase_date?: string | null;
          purchase_place?: string | null;
          topic?: string | null;
          image_url?: string | null;
          duplicated?: boolean;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_name?: string;
          isbn13?: string | null;
          author?: string | null;
          publisher?: string | null;
          publication_date?: string | null;
          condition?: string | null;
          purchase_price?: number | null;
          currency?: string;
          purchase_price_sec?: number | null;
          currency_sec?: string | null;
          purchase_date?: string | null;
          purchase_place?: string | null;
          topic?: string | null;
          image_url?: string | null;
          duplicated?: boolean;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: Database['public']['Enums']['app_role'];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: Database['public']['Enums']['app_role'];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: Database['public']['Enums']['app_role'];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      book_stats_by_topic: {
        Row: {
          user_id: string | null;
          topic: string | null;
          book_count: number | null;
          total_spent: number | null;
        };
      };
      book_stats_by_place: {
        Row: {
          user_id: string | null;
          purchase_place: string | null;
          book_count: number | null;
          total_spent: number | null;
        };
      };
      book_stats_by_year: {
        Row: {
          user_id: string | null;
          year: number | null;
          book_count: number | null;
          total_spent: number | null;
        };
      };
    };
    Functions: {
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      ops_list_users: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string | null;
          created_at: string;
          last_sign_in_at: string | null;
          role: Database['public']['Enums']['app_role'];
          is_active: boolean;
          book_count: number;
        }[];
      };
      ops_set_user_role: {
        Args: {
          p_user_id: string;
          p_role: Database['public']['Enums']['app_role'];
          p_is_active?: boolean;
        };
        Returns: undefined;
      };
      ops_delete_user: {
        Args: {
          p_user_id: string;
          p_storage_deleted_count?: number;
          p_storage_cleanup_error?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: 'user' | 'admin' | 'super_admin';
    };
  };
}

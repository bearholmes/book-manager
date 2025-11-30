/**
 * Supabase 데이터베이스 타입 정의
 * supabase gen types typescript 명령으로 자동 생성 가능
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

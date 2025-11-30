import type { Database } from './database';

export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];

export type BookCondition = '신품' | '중고';

export type BookFormData = Omit<BookInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// 통계 타입
export interface BookStatsByTopic {
  topic: string;
  book_count: number;
  total_spent: number;
}

export interface BookStatsByPlace {
  purchase_place: string;
  book_count: number;
  total_spent: number;
}

export interface BookStatsByYear {
  year: number;
  book_count: number;
  total_spent: number;
}

// 필터 타입
export interface BookFilters {
  topic?: string;
  purchase_place?: string;
  condition?: BookCondition;
  search?: string;
}

// 정렬 타입
export type BookSortField = 'purchase_date' | 'book_name' | 'created_at';
export type BookSortOrder = 'asc' | 'desc';

export interface BookSort {
  field: BookSortField;
  order: BookSortOrder;
}

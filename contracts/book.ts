export interface Book {
  id: string;
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
}

export type BookInsert = Pick<Book, 'book_name'> & Partial<Omit<Book, 'book_name'>>;
export type BookUpdate = Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>;

export type BookCondition = '신품' | '중고';

export interface BookFilters {
  topic?: string;
  purchase_place?: string;
  condition?: BookCondition;
  search?: string;
}

export type BookSortField = 'purchase_date' | 'book_name' | 'created_at';
export type BookSortOrder = 'asc' | 'desc';

export interface BookSort {
  field: BookSortField;
  order: BookSortOrder;
}

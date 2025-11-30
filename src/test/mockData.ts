import type { Book } from '@/types/book';
import type { BookStatsByTopic, BookStatsByPlace, BookStatsByYear } from '@/features/books/hooks/useBookStats';

/**
 * 테스트용 목 도서 데이터
 */
export const mockBook: Book = {
  id: 'test-book-1',
  user_id: 'test-user-1',
  book_name: '클린 코드',
  isbn13: '9788966260959',
  author: '로버트 C. 마틴',
  publisher: '인사이트',
  publication_date: '2013-01-23',
  condition: '신품',
  purchase_price: 33000,
  currency: 'KRW',
  purchase_price_sec: null,
  currency_sec: null,
  purchase_date: '2024-01-15',
  purchase_place: '교보문고',
  topic: '프로그래밍',
  image_url: 'https://image.yes24.com/goods/11681152/XL',
  duplicated: false,
  comment: '코드 품질을 높이는 필독서',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockBook2: Book = {
  id: 'test-book-2',
  user_id: 'test-user-1',
  book_name: '리팩터링',
  isbn13: '9788966261246',
  author: '마틴 파울러',
  publisher: '한빛미디어',
  publication_date: '2020-04-01',
  condition: '신품',
  purchase_price: 35000,
  currency: 'KRW',
  purchase_price_sec: null,
  currency_sec: null,
  purchase_date: '2024-02-01',
  purchase_place: '예스24',
  topic: '프로그래밍',
  image_url: '',
  duplicated: false,
  comment: null,
  created_at: '2024-02-01T10:00:00Z',
  updated_at: '2024-02-01T10:00:00Z',
};

export const mockBooks: Book[] = [mockBook, mockBook2];

/**
 * 테스트용 통계 데이터
 */
export const mockTopicStats: BookStatsByTopic[] = [
  { topic: '프로그래밍', count: 45 },
  { topic: '소설', count: 32 },
  { topic: '자기계발', count: 28 },
];

export const mockPlaceStats: BookStatsByPlace[] = [
  { purchase_place: '교보문고', count: 67 },
  { purchase_place: '예스24', count: 45 },
  { purchase_place: '알라딘', count: 32 },
];

export const mockYearStats: BookStatsByYear[] = [
  { year: 2022, count: 56 },
  { year: 2023, count: 48 },
  { year: 2024, count: 35 },
];

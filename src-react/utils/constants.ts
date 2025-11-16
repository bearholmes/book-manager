/**
 * 애플리케이션 전역 상수
 */

// 주제별 색상 매핑
export const TOPIC_COLORS: Record<number, string> = {
  1: '#FFEB99',
  2: '#B3CDFF',
  3: '#8AA8E5',
  4: '#CFE4E6',
  5: '#A3CCB8',
  6: '#AF99BF',
  7: '#E6B8A1',
  8: '#FFFAE5',
  9: '#E5EEFF',
  10: '#CCDDFF',
  11: '#E4EFF0',
  12: '#CFE5DA',
  13: '#D0C3D9',
  14: '#FFEEE6',
};

// 도서 상태 옵션
export const BOOK_CONDITIONS = ['신품', '중고'] as const;

// 통화 옵션
export const CURRENCIES = ['KRW', 'USD', 'JPY', 'EUR'] as const;

// 통화 기호
export const CURRENCY_SYMBOLS: Record<string, string> = {
  KRW: '₩',
  USD: '$',
  JPY: '¥',
  EUR: '€',
};

// 차트 색상
export const CHART_COLORS = [
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#ec4899',
];

// 페이지 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN: '/admin',
  LICENSE: '/license',
} as const;

// Query Keys
export const QUERY_KEYS = {
  BOOKS: ['books'] as const,
  BOOK_STATS: ['book-stats'] as const,
  BOOK_TOPICS: ['book-topics'] as const,
  BOOK_PLACES: ['book-places'] as const,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'book-manager-theme',
  FILTER_PRESET: 'book-manager-filter-preset',
} as const;

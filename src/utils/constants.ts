/**
 * 애플리케이션 전역 상수
 */

// 주제별 색상 매핑
export const TOPIC_COLORS: Record<number, string> = {
  1: '#e5edf6',
  2: '#d9e6f4',
  3: '#e9efdf',
  4: '#f1e7d4',
  5: '#f5e1cf',
  6: '#e8f1eb',
  7: '#e6ebe2',
  8: '#f4e8e0',
  9: '#dbe8ec',
  10: '#e3dfef',
  11: '#f2ebdd',
  12: '#ece3d8',
  13: '#f6e3d5',
  14: '#e0e8f1',
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
  '#355575',
  '#4f7094',
  '#2f6b6d',
  '#4f7b57',
  '#8c6c3f',
  '#c1673f',
  '#9b4a35',
  '#5a6e8a',
  '#7a8f5f',
  '#a85d4d',
];

// 페이지 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ADMIN: '/admin',
  OPS: '/ops',
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
  MOBILE_FILTER_OPEN: 'book-manager-mobile-filter-open',
  SEARCH_HISTORY: 'book-manager-search-history',
} as const;

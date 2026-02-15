/**
 * 애플리케이션 전역 상수
 */

// 주제별 색상 매핑
export const TOPIC_COLORS: Record<number, string> = {
  1: '#e0f2fe',
  2: '#bae6fd',
  3: '#bfdbfe',
  4: '#c7d2fe',
  5: '#dbeafe',
  6: '#ccfbf1',
  7: '#d1fae5',
  8: '#dcfce7',
  9: '#fef3c7',
  10: '#fde68a',
  11: '#ffedd5',
  12: '#fde2e2',
  13: '#fce7f3',
  14: '#ede9fe',
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
  '#0284c7',
  '#0369a1',
  '#0ea5e9',
  '#14b8a6',
  '#10b981',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#7c3aed',
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

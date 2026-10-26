import { chartColors } from '@/shared/theme/data-colors';

/**
 * 애플리케이션 전역 상수
 */

export const BOOK_CONDITIONS = ['신품', '중고'] as const;

export const CURRENCIES = ['KRW', 'USD', 'JPY', 'EUR'] as const;

export const BOOK_SORT_OPTIONS = [
  { value: 'created_at:desc', label: '최신 등록순' },
  { value: 'created_at:asc', label: '오래된 등록순' },
  { value: 'purchase_date:desc', label: '최신 구매순' },
  { value: 'purchase_date:asc', label: '오래된 구매순' },
  { value: 'book_name:asc', label: '도서명 오름차순' },
  { value: 'book_name:desc', label: '도서명 내림차순' },
] as const;
export const CHART_COLORS = chartColors;

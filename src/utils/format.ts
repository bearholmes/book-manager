import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 통화 포맷팅
 */
export function formatCurrency(value: number | null | undefined, nullText = '-'): string {
  if (value === null || value === undefined) {
    return nullText;
  }

  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * 날짜 포맷팅
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString = 'yyyy-MM-dd',
): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: ko });
}

/**
 * 상대 시간 포맷팅
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(dateObj);
}

/**
 * ISBN 포맷팅
 */
export function formatISBN(isbn: string | null | undefined): string {
  if (!isbn) return '-';

  // ISBN-13 포맷: 978-89-1234-567-8
  if (isbn.length === 13) {
    return `${isbn.slice(0, 3)}-${isbn.slice(3, 5)}-${isbn.slice(5, 9)}-${isbn.slice(9, 12)}-${isbn.slice(12)}`;
  }

  return isbn;
}

/**
 * 텍스트 줄임 (ellipsis)
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

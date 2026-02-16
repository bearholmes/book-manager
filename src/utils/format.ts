import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/** 숫자를 한국어 로케일 통화 문자열 형태로 포맷합니다. */
export function formatCurrency(value: number | null | undefined, nullText = '-'): string {
  if (value === null || value === undefined) {
    return nullText;
  }

  return new Intl.NumberFormat('ko-KR').format(value);
}

/** 날짜 값을 지정한 포맷 문자열로 변환합니다. */
export function formatDate(
  date: string | Date | null | undefined,
  formatString = 'yyyy-MM-dd',
): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: ko });
}

/** ISBN 문자열을 하이픈 포함 형태로 포맷합니다. */
export function formatISBN(isbn: string | null | undefined): string {
  if (!isbn) return '-';

  // 13자리 ISBN은 시각적 구분을 위해 구간별 하이픈을 추가합니다.
  if (isbn.length === 13) {
    return `${isbn.slice(0, 3)}-${isbn.slice(3, 5)}-${isbn.slice(5, 9)}-${isbn.slice(9, 12)}-${isbn.slice(12)}`;
  }

  return isbn;
}

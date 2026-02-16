import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('숫자를 천 단위 구분자로 포맷해야 함', () => {
      expect(formatCurrency(1000)).toBe('1,000');
      expect(formatCurrency(10000)).toBe('10,000');
      expect(formatCurrency(1000000)).toBe('1,000,000');
    });

    it('0을 올바르게 포맷해야 함', () => {
      expect(formatCurrency(0)).toBe('0');
    });

    it('음수를 올바르게 포맷해야 함', () => {
      expect(formatCurrency(-1000)).toBe('-1,000');
    });

    it('소수점을 올바르게 포맷해야 함', () => {
      expect(formatCurrency(1234.56)).toBe('1,234.56');
    });
  });

  describe('formatDate', () => {
    it('날짜를 yyyy.MM.dd 형식으로 포맷해야 함', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date, 'yyyy.MM.dd');
      expect(formatted).toBe('2024.01.15');
    });

    it('날짜를 yyyy-MM-dd 형식으로 포맷해야 함', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date, 'yyyy-MM-dd');
      expect(formatted).toBe('2024-01-15');
    });

    it('null이나 undefined는 "-"를 반환해야 함', () => {
      expect(formatDate(null as any, 'yyyy.MM.dd')).toBe('-');
      expect(formatDate(undefined as any, 'yyyy.MM.dd')).toBe('-');
    });

    it('빈 문자열은 "-"를 반환해야 함', () => {
      expect(formatDate('', 'yyyy.MM.dd')).toBe('-');
    });

    it('Date 객체를 올바르게 포맷해야 함', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const formatted = formatDate(date, 'yyyy.MM.dd');
      expect(formatted).toMatch(/2024\.01\.15/);
    });
  });
});

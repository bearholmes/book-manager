import { describe, expect, it } from 'vitest';
import { assignTopicColors } from './topic-colors';

describe('topic colors', () => {
  it('keeps colors across filters, newly loaded pages and fresh calls', () => {
    const original = assignTopicColors(['개발', '소설']);
    expect(assignTopicColors(['소설']).소설).toBe(original.소설);
    expect(assignTopicColors(['가나다', '소설', '개발']).소설).toBe(original.소설);
    expect(assignTopicColors(['소설', '개발'])).toEqual(original);
  });
  it('handles property names and equivalent Unicode without inherited colors', () => {
    const colors = assignTopicColors(['constructor', '__proto__', 'é', 'e\u0301']);
    expect(colors.constructor).toEqual(expect.any(String));
    expect(colors.__proto__).toEqual(expect.any(String));
    expect(colors.é).toBe(colors['e\u0301']);
  });
});

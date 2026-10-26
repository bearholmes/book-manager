import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('로컬 오류 메시지', () => {
  it('사용자용 오류를 보존한다', () =>
    expect(getErrorMessage(new Error('서재가 잠겨 있습니다.'))).toBe('서재가 잠겨 있습니다.'));
  it('알 수 없는 내부 오류는 기본 문구로 표시한다', () =>
    expect(getErrorMessage(new Error('SQLITE_CONSTRAINT'), '저장에 실패했습니다.')).toBe(
      '저장에 실패했습니다.',
    ));
});

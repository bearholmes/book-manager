import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, logError, isNetworkError, isAuthError } from './error-helpers';

describe('error-helpers', () => {
  describe('getErrorMessage', () => {
    it('네트워크 에러 메시지를 반환해야 함', () => {
      const error = new TypeError('Failed to fetch');
      const message = getErrorMessage(error);
      expect(message).toContain('네트워크');
    });

    it('한국어 Error 메시지는 그대로 반환해야 함', () => {
      const error = new Error('이미 가입된 이메일입니다.');
      const message = getErrorMessage(error);
      expect(message).toBe('이미 가입된 이메일입니다.');
    });

    it('로그인 실패 문구를 사용자 친화적으로 변환해야 함', () => {
      const error = new Error('Invalid login credentials');
      const message = getErrorMessage(error, '로그인에 실패했습니다');
      expect(message).toBe('이메일 또는 비밀번호를 확인해주세요.');
    });

    it('요청 제한 문구를 사용자 친화적으로 변환해야 함', () => {
      const error = new Error('rate limit');
      const message = getErrorMessage(error, '요청에 실패했습니다');
      expect(message).toBe('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    });

    it('매핑되지 않은 영문 에러는 fallback 메시지를 반환해야 함', () => {
      const error = new Error('Custom error message');
      const message = getErrorMessage(error, '처리에 실패했습니다');
      expect(message).toBe('처리에 실패했습니다');
    });

    it('문자열 에러는 fallback 메시지를 반환해야 함', () => {
      const error = 'String error';
      const message = getErrorMessage(error);
      expect(message).toBe('오류가 발생했습니다');
    });

    it('알 수 없는 에러는 fallback 메시지를 반환해야 함', () => {
      const error = { unknown: 'object' };
      const message = getErrorMessage(error);
      expect(message).toBe('오류가 발생했습니다');
    });

    it('커스텀 fallback 메시지를 사용해야 함', () => {
      const error = null;
      const message = getErrorMessage(error, '커스텀 메시지');
      expect(message).toBe('커스텀 메시지');
    });
  });

  describe('isNetworkError', () => {
    it('네트워크 에러를 감지해야 함', () => {
      const error = new TypeError('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('일반 에러는 네트워크 에러가 아님', () => {
      const error = new Error('Regular error');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('Supabase 인증 에러를 감지해야 함', () => {
      const error = {
        code: 'PGRST301',
        message: 'JWT expired',
        details: '',
        hint: '',
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('JWT 메시지가 포함된 Supabase 에러를 감지해야 함', () => {
      const error = {
        code: '42000',
        message: 'JWT token is invalid',
        details: '',
        hint: '',
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('일반 에러는 인증 에러가 아님', () => {
      const error = new Error('Regular error');
      expect(isAuthError(error)).toBe(false);
    });

    it('Supabase 에러지만 인증과 무관한 에러', () => {
      const error = {
        code: '23505',
        message: 'duplicate key value',
        details: '',
        hint: '',
      };
      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('logError', () => {
    it('에러를 로깅해야 함', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      logError('테스트 컨텍스트', error);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('추가 데이터와 함께 로깅해야 함', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      const additionalData = { userId: '123', action: 'create' };

      logError('테스트 컨텍스트', error, additionalData);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

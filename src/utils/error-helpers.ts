import type { PostgrestError } from '@supabase/supabase-js';

/**
 * 에러 타입 정의
 */
export interface AppError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    );
  }
  return false;
}

/**
 * Supabase 에러인지 확인
 */
export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

/**
 * 인증 에러인지 확인
 */
export function isAuthError(error: unknown): boolean {
  if (isSupabaseError(error)) {
    return (
      error.code === 'PGRST301' || // JWT expired
      error.code === 'PGRST204' || // No rows returned (user not found)
      error.message.includes('JWT') ||
      error.message.includes('인증')
    );
  }
  return false;
}

/**
 * RLS 위반 에러인지 확인
 */
export function isRLSError(error: unknown): boolean {
  if (isSupabaseError(error)) {
    return (
      error.code === '42501' || // insufficient_privilege
      error.message.includes('policy') ||
      error.message.includes('permission')
    );
  }
  return false;
}

/**
 * 사용자 친화적인 에러 메시지 생성
 *
 * @param error - 에러 객체
 * @param fallbackMessage - 기본 메시지 (에러 타입을 특정할 수 없을 때 사용)
 * @returns 사용자에게 표시할 에러 메시지
 *
 * @example
 * ```typescript
 * try {
 *   await createBook(data);
 * } catch (error) {
 *   const message = getErrorMessage(error, '도서 추가 실패');
 *   toast.error(message);
 * }
 * ```
 */
export function getErrorMessage(error: unknown, fallbackMessage = '오류가 발생했습니다'): string {
  // 네트워크 에러
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.';
  }

  // 인증 에러
  if (isAuthError(error)) {
    return '인증이 만료되었습니다. 다시 로그인해주세요.';
  }

  // RLS 에러
  if (isRLSError(error)) {
    return '권한이 없습니다. 관리자에게 문의하세요.';
  }

  // Supabase 에러
  if (isSupabaseError(error)) {
    // 중복 키 에러
    if (error.code === '23505') {
      return '이미 존재하는 데이터입니다.';
    }

    // 외래 키 제약 위반
    if (error.code === '23503') {
      return '참조된 데이터가 존재하지 않습니다.';
    }

    // NOT NULL 제약 위반
    if (error.code === '23502') {
      return '필수 항목이 누락되었습니다.';
    }

    // Supabase 메시지가 있으면 사용
    if (error.message) {
      return error.message;
    }
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  // 알 수 없는 에러
  return fallbackMessage;
}

/**
 * 에러를 콘솔에 로깅 (개발/프로덕션 구분)
 *
 * @param context - 에러 발생 컨텍스트 (예: '도서 추가', '로그인')
 * @param error - 에러 객체
 * @param additionalData - 추가 데이터
 */
export function logError(context: string, error: unknown, additionalData?: Record<string, any>): void {
  const errorLog = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      ...(isSupabaseError(error) && {
        code: error.code,
        details: error.details,
        hint: error.hint,
      }),
    } : error,
    ...additionalData,
  };

  // 개발 환경에서는 자세한 로그
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, errorLog);
  } else {
    // 프로덕션에서는 에러 트래킹 서비스로 전송 (예: Sentry)
    console.error(`[${context}]`, errorLog.error);
    // TODO: Sentry.captureException(error, { extra: errorLog });
  }
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: unknown): boolean {
  // 네트워크 에러는 재시도 가능
  if (isNetworkError(error)) {
    return true;
  }

  // 특정 HTTP 상태 코드는 재시도 가능
  if (isSupabaseError(error)) {
    const retryableCodes = ['PGRST504', '50000', '53000', '53300'];
    return error.code ? retryableCodes.includes(error.code) : false;
  }

  return false;
}

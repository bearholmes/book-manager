import type { PostgrestError } from '@supabase/supabase-js';

/**
 * 에러 타입 정의
 */
export interface AppError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

function extractErrorMessage(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return null;
}

function mapKnownErrorMessage(message: string): string | null {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호를 확인해주세요.';
  }

  if (normalized.includes('email not confirmed')) {
    return '이메일 인증 후 로그인해주세요.';
  }

  if (normalized.includes('user already registered')) {
    return '이미 가입된 이메일입니다.';
  }

  if (normalized.includes('rate limit') || normalized.includes('for security purposes')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  if (normalized.includes('invalid token') || normalized.includes('token has expired')) {
    return '인증이 만료되었습니다. 다시 로그인해주세요.';
  }

  if (normalized.includes('new password should be different')) {
    return '새 비밀번호는 기존 비밀번호와 다르게 설정해주세요.';
  }

  if (normalized.includes('password should be at least')) {
    return '비밀번호는 최소 6자 이상이어야 합니다.';
  }

  if (normalized.includes('permission denied') || normalized.includes('not authorized')) {
    return '권한이 없습니다. 관리자에게 문의하세요.';
  }

  return null;
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  const message = extractErrorMessage(error)?.toLowerCase() || '';
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror')
  );
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
  const message = extractErrorMessage(error)?.toLowerCase() || '';

  if (isSupabaseError(error)) {
    return (
      error.code === 'PGRST301' || // JWT expired
      error.code === 'PGRST204' || // No rows returned (user not found)
      message.includes('jwt') ||
      message.includes('invalid token') ||
      message.includes('token has expired') ||
      message.includes('인증')
    );
  }
  return message.includes('jwt') || message.includes('invalid token');
}

/**
 * RLS 위반 에러인지 확인
 */
export function isRLSError(error: unknown): boolean {
  const message = extractErrorMessage(error)?.toLowerCase() || '';

  if (isSupabaseError(error)) {
    return (
      error.code === '42501' || // insufficient_privilege
      message.includes('policy') ||
      message.includes('permission')
    );
  }
  return message.includes('permission denied') || message.includes('not authorized');
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
  }

  const rawMessage = extractErrorMessage(error);
  if (rawMessage) {
    const mapped = mapKnownErrorMessage(rawMessage);
    if (mapped) {
      return mapped;
    }

    if (/[가-힣]/.test(rawMessage)) {
      return rawMessage;
    }
  }

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

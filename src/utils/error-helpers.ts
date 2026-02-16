import type { PostgrestError } from '@supabase/supabase-js';

/** unknown 에러에서 message 문자열을 안전하게 추출합니다. */
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

/** 자주 발생하는 백엔드 에러 메시지를 사용자 친화 문구로 매핑합니다. */
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

/** 네트워크 관련 에러인지 판별합니다. */
export function isNetworkError(error: unknown): boolean {
  const message = extractErrorMessage(error)?.toLowerCase() || '';
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror')
  );
}

/** Supabase(Postgrest) 에러 형태인지 확인합니다. */
export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

/** 인증/세션 만료 계열 에러인지 판별합니다. */
export function isAuthError(error: unknown): boolean {
  const message = extractErrorMessage(error)?.toLowerCase() || '';

  if (isSupabaseError(error)) {
    return (
      error.code === 'PGRST301' ||
      error.code === 'PGRST204' ||
      message.includes('jwt') ||
      message.includes('invalid token') ||
      message.includes('token has expired') ||
      message.includes('인증')
    );
  }
  return message.includes('jwt') || message.includes('invalid token');
}

/** RLS/권한 정책 위반 에러인지 판별합니다. */
export function isRLSError(error: unknown): boolean {
  const message = extractErrorMessage(error)?.toLowerCase() || '';

  if (isSupabaseError(error)) {
    return (
      error.code === '42501' ||
      message.includes('policy') ||
      message.includes('permission')
    );
  }
  return message.includes('permission denied') || message.includes('not authorized');
}

/** 에러 객체를 사용자 표시용 메시지로 변환합니다. */
export function getErrorMessage(error: unknown, fallbackMessage = '오류가 발생했습니다'): string {
  // 우선순위가 높은 범주(네트워크/인증/권한)를 먼저 처리합니다.
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.';
  }

  if (isAuthError(error)) {
    return '인증이 만료되었습니다. 다시 로그인해주세요.';
  }

  if (isRLSError(error)) {
    return '권한이 없습니다. 관리자에게 문의하세요.';
  }

  if (isSupabaseError(error)) {
    if (error.code === '23505') {
      return '이미 존재하는 데이터입니다.';
    }

    if (error.code === '23503') {
      return '참조된 데이터가 존재하지 않습니다.';
    }

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

/** 환경에 맞는 형태로 에러를 로깅합니다. */
export function logError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>,
): void {
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

  // 개발 환경에서는 디버깅에 필요한 전체 컨텍스트를 출력합니다.
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, errorLog);
  } else {
    // 프로덕션에서는 최소 정보만 출력하고 외부 트래킹 연동 지점을 남깁니다.
    console.error(`[${context}]`, errorLog.error);
    // TODO: Sentry.captureException(error, { extra: errorLog });
  }
}

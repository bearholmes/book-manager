/** 로컬 저장소 오류에서 사용자에게 표시할 문구를 추출합니다. */
export function getErrorMessage(error: unknown, fallback = '오류가 발생했습니다'): string {
  if (error instanceof Error && /[가-힣]/.test(error.message)) return error.message;
  return fallback;
}

export function logError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>,
): void {
  if (import.meta.env.DEV) console.error(`[${context}]`, error, additionalData);
}

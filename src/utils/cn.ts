import { clsx, type ClassValue } from 'clsx';

/**
 * 클래스명을 병합하는 유틸리티 함수
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

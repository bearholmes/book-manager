import { atom } from 'jotai';
import type { User } from '@supabase/supabase-js';

// 현재 로그인된 사용자
export const userAtom = atom<User | null>(null);

// 로딩 상태
export const authLoadingAtom = atom<boolean>(true);

// 인증 여부
export const isAuthenticatedAtom = atom<boolean>((get) => get(userAtom) !== null);

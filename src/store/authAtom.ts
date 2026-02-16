import { atom } from 'jotai';
import type { User } from '@supabase/supabase-js';

export const userAtom = atom<User | null>(null);

export const authLoadingAtom = atom<boolean>(true);

export const isAuthenticatedAtom = atom<boolean>((get) => get(userAtom) !== null);

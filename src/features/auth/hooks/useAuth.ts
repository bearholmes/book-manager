import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { supabase } from '@/lib/supabase';
import { authLoadingAtom, userAtom } from '@/store/authAtom';

/**
 * 인증 상태를 관리하는 훅
 */
export function useAuth() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);

  useEffect(() => {
    setAuthLoading(true);

    // 초기 세션 확인
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAuthLoading]);

  return { user };
}

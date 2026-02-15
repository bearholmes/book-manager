import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import type { LoginFormData } from '@/utils/validation';

/**
 * 로그인 훅
 */
export function useLogin() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: LoginFormData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      console.error('로그인 오류:', error);
      toast.error(error.message || '로그인에 실패했습니다');
    },
  });
}

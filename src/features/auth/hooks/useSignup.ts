import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error-helpers';
import type { SignupFormData } from '@/utils/validation';

/**
 * 회원가입 훅
 */
export function useSignup() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: SignupFormData) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user?.identities?.length === 0) {
        throw new Error('이미 가입된 이메일입니다');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
    },
    onError: (error: Error) => {
      console.error('회원가입 오류:', error);
      toast.error(getErrorMessage(error, '회원가입에 실패했습니다. 입력 내용을 확인해주세요.'));
    },
  });
}

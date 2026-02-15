import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error-helpers';
import { ROUTES } from '@/utils/constants';
import type { PasswordResetRequestFormData } from '@/utils/validation';

/**
 * 비밀번호 재설정 메일 발송 훅
 */
export function useForgotPassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ email }: PasswordResetRequestFormData) => {
      const redirectTo = `${window.location.origin}${ROUTES.RESET_PASSWORD}`;

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요.');
    },
    onError: (error: Error) => {
      console.error('비밀번호 재설정 메일 발송 오류:', error);
      toast.error(
        getErrorMessage(error, '비밀번호 재설정 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'),
      );
    },
  });
}

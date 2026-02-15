import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';

interface UpdatePasswordInput {
  password: string;
}

/**
 * 로그인 사용자의 비밀번호 변경 훅
 */
export function useUpdatePassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ password }: UpdatePasswordInput) => {
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('비밀번호가 변경되었습니다.');
    },
    onError: (error: Error) => {
      console.error('비밀번호 변경 오류:', error);
      toast.error(error.message || '비밀번호 변경에 실패했습니다');
    },
  });
}

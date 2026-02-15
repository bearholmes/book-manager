import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error-helpers';
import { ROUTES } from '@/utils/constants';

/**
 * 로그아웃 훅
 */
export function useSignout() {
  const navigate = useNavigate();
  const toast = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('로그아웃되었습니다');
      navigate(ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      console.error('로그아웃 오류:', error);
      toast.error(getErrorMessage(error, '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.'));
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage, logError } from '@/utils/error-helpers';

/** 대상 도서를 삭제하고 관련 캐시를 갱신합니다. */
export function useDeleteBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('도서 ID가 필요합니다');
      }

      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateBookQueries(queryClient);
      toast.success('도서가 삭제되었습니다');
    },
    onError: (error: Error, bookId) => {
      logError('도서 삭제', error, { bookId });
      const userMessage = getErrorMessage(error, '도서 삭제에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

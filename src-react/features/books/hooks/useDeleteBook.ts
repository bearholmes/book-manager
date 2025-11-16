import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * 도서 삭제 훅
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_TOPICS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_PLACES });
      toast.success('도서가 삭제되었습니다');
    },
    onError: (error: Error) => {
      console.error('도서 삭제 오류:', error);
      toast.error(error.message || '도서 삭제에 실패했습니다');
    },
  });
}

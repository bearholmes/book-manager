import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/utils/constants';
import type { BookUpdate } from '@/types/book';

/**
 * 도서 수정 훅
 */
export function useUpdateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BookUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_TOPICS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_PLACES });
      toast.success('도서가 수정되었습니다');
    },
    onError: (error: Error) => {
      console.error('도서 수정 오류:', error);
      toast.error(error.message || '도서 수정에 실패했습니다');
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/utils/constants';
import type { BookInsert } from '@/types/book';

/**
 * 도서 추가 훅
 */
export function useCreateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (book: Omit<BookInsert, 'user_id'>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('인증되지 않았습니다');

      const bookData: BookInsert = { ...book, user_id: user.id };
      const result = await (supabase.from('books') as any)
        .insert(bookData)
        .select()
        .single();
      const { data, error } = result;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_TOPICS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOK_PLACES });
      toast.success('도서가 추가되었습니다');
    },
    onError: (error: Error) => {
      console.error('도서 추가 오류:', error);
      toast.error(error.message || '도서 추가에 실패했습니다');
    },
  });
}

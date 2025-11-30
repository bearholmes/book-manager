import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage, logError } from '@/utils/error-helpers';

/**
 * 도서 삭제 훅
 *
 * 기존 도서를 데이터베이스에서 삭제합니다.
 * RLS 정책에 의해 본인이 추가한 도서만 삭제 가능합니다.
 *
 * @returns UseMutationResult - TanStack Query mutation 객체
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useDeleteBook();
 *
 * const handleDelete = () => {
 *   if (confirm('정말 삭제하시겠습니까?')) {
 *     mutate(bookId, {
 *       onSuccess: () => navigate('/admin'),
 *     });
 *   }
 * };
 * ```
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // ID 유효성 검사
      if (!id) {
        throw new Error('도서 ID가 필요합니다');
      }

      // Supabase delete
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      // 모든 도서 관련 쿼리 무효화
      await invalidateBookQueries(queryClient);
      toast.success('도서가 삭제되었습니다');
    },
    onError: (error: Error, bookId) => {
      // 에러 로깅
      logError('도서 삭제', error, { bookId });

      // 사용자 친화적 에러 메시지
      const userMessage = getErrorMessage(error, '도서 삭제에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

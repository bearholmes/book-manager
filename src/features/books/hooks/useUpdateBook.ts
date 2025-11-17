import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage, logError } from '@/utils/error-helpers';
import type { BookUpdate } from '@/types/book';

/**
 * 도서 수정 훅
 *
 * 기존 도서 정보를 업데이트합니다.
 * RLS 정책에 의해 본인이 추가한 도서만 수정 가능합니다.
 *
 * @returns UseMutationResult - TanStack Query mutation 객체
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useUpdateBook();
 *
 * const handleUpdate = () => {
 *   mutate(
 *     { id: book.id, book_name: '새 제목' },
 *     { onSuccess: () => closeModal() }
 *   );
 * };
 * ```
 */
export function useUpdateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BookUpdate & { id: string }) => {
      if (!id) {
        throw new Error('도서 ID가 필요합니다');
      }

      // Supabase update
      // Note: 타입 단언을 사용하여 Supabase 클라이언트 타입 추론 이슈 우회
      const { data, error } = await supabase
        .from('books')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // 모든 도서 관련 쿼리 무효화
      await invalidateBookQueries(queryClient);
      toast.success('도서가 수정되었습니다');
    },
    onError: (error: Error, variables) => {
      // 에러 로깅
      logError('도서 수정', error, { bookId: variables.id });

      // 사용자 친화적 에러 메시지
      const userMessage = getErrorMessage(error, '도서 수정에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

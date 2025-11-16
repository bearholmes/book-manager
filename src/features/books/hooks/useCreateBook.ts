import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage } from '@/utils/error-helpers';
import type { BookInsert } from '@/types/book';

/**
 * 도서 추가 훅
 *
 * 새로운 도서를 데이터베이스에 추가합니다.
 * 현재 인증된 사용자의 user_id가 자동으로 설정됩니다.
 *
 * @returns UseMutationResult - TanStack Query mutation 객체
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useCreateBook();
 *
 * const handleSubmit = (data: BookFormData) => {
 *   mutate(data, {
 *     onSuccess: () => navigate('/admin'),
 *   });
 * };
 * ```
 */
export function useCreateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (book: Omit<BookInsert, 'user_id'>) => {
      // 현재 인증된 사용자 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('인증되지 않았습니다. 로그인 후 다시 시도해주세요.');
      }

      // 사용자 ID 추가
      const bookData: BookInsert = { ...book, user_id: user.id };

      // Supabase insert (타입 이슈 우회)
      const result = await (supabase.from('books') as any)
        .insert(bookData)
        .select()
        .single();

      const { data, error } = result;

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // 모든 도서 관련 쿼리 무효화
      await invalidateBookQueries(queryClient);
      toast.success('도서가 추가되었습니다');
    },
    onError: (error: Error) => {
      // 에러 로깅 (프로덕션에서는 Sentry 등 사용)
      console.error('[Book Create Error]', {
        message: error.message,
        timestamp: new Date().toISOString(),
      });

      // 사용자 친화적 에러 메시지
      const userMessage = getErrorMessage(error, '도서 추가에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

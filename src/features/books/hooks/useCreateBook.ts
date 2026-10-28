import type { BookInsert } from '@contracts/book';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desktop } from '@/shared/api/desktop';
import { getErrorMessage } from '@/shared/lib/errors';
import { useToast } from '@/shared/notifications/hooks/useToast';
import { invalidateBookQueries } from '../api/cache';

export function useCreateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (book: BookInsert) => desktop('create', book),
    onSuccess: async () => {
      await invalidateBookQueries(queryClient);
      toast.success('도서가 추가되었습니다');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, '도서 추가에 실패했습니다')),
  });
}

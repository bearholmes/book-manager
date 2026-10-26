import { desktop } from '@/shared/api/desktop';
import { getErrorMessage } from '@/shared/lib/errors';
import { useToast } from '@/shared/notifications/hooks/useToast';
import type { BookUpdate } from '@contracts/book';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateBookQueries } from '../api/cache';

export function useUpdateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...updates }: BookUpdate & { id: string }) =>
      desktop('update', { id, updates }),
    onSuccess: async () => {
      await invalidateBookQueries(queryClient);
      toast.success('도서가 수정되었습니다');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, '도서 수정에 실패했습니다')),
  });
}

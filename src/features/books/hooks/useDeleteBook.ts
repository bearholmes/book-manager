import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desktop } from '@/shared/api/desktop';
import { getErrorMessage } from '@/shared/lib/errors';
import { useToast } from '@/shared/notifications/hooks/useToast';
import { invalidateBookQueries } from '../api/cache';

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => desktop('delete', { id }),
    onSuccess: async () => {
      await invalidateBookQueries(queryClient);
      toast.success('도서가 삭제되었습니다');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, '도서 삭제에 실패했습니다')),
  });
}

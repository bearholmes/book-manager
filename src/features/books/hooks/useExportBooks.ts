import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, logError } from '@/utils/error-helpers';
import type { Book } from '@/types/book';

/**
 * 도서 데이터 익스포트 훅
 *
 * 현재 사용자의 모든 도서 데이터를 JSON 파일로 다운로드합니다.
 * 백업이나 데이터 이전 시 사용할 수 있습니다.
 *
 * @returns UseMutationResult - TanStack Query mutation 객체
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useExportBooks();
 *
 * const handleExport = () => {
 *   mutate(undefined, {
 *     onSuccess: (books) => {
 *       console.log(`${books.length}개 도서 익스포트 완료`);
 *     },
 *   });
 * };
 * ```
 */
export function useExportBooks() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (): Promise<Book[]> => {
      // 모든 도서 조회 (최신순)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    onSuccess: (books) => {
      // 빈 데이터 체크
      if (books.length === 0) {
        toast.warning('익스포트할 도서가 없습니다.');
        return;
      }

      // JSON 파일 생성 및 다운로드
      const jsonString = JSON.stringify(books, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `books_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 메모리 정리
      URL.revokeObjectURL(url);

      toast.success(`${books.length}개의 도서를 익스포트했습니다.`);
    },
    onError: (error: Error) => {
      // 에러 로깅
      logError('도서 익스포트', error);

      // 사용자 친화적 에러 메시지
      const userMessage = getErrorMessage(error, '도서 익스포트에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, logError } from '@/utils/error-helpers';
import type { Book } from '@/types/book';

/** 현재 사용자의 도서 목록을 JSON 파일로 내보냅니다. */
export function useExportBooks() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    onSuccess: (books) => {
      if (books.length === 0) {
        toast.warning('익스포트할 도서가 없습니다.');
        return;
      }

      const jsonString = JSON.stringify(books, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `books_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success(`${books.length}개의 도서를 익스포트했습니다.`);
    },
    onError: (error: Error) => {
      logError('도서 익스포트', error);
      const userMessage = getErrorMessage(error, '도서 익스포트에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage, logError } from '@/utils/error-helpers';
import type { BookInsert } from '@/types/book';

/**
 * normalizeNullableString 값을 정규화합니다.
 */
function normalizeNullableString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * sanitizeBookInsertPayload 값의 입력 안전성을 보정합니다.
 */
function sanitizeBookInsertPayload(book: Omit<BookInsert, 'user_id'>): Omit<BookInsert, 'user_id'> {
  return {
    ...book,
    isbn13: normalizeNullableString(book.isbn13),
    author: normalizeNullableString(book.author),
    publisher: normalizeNullableString(book.publisher),
    publication_date: normalizeNullableString(book.publication_date),
    condition: normalizeNullableString(book.condition),
    currency_sec: normalizeNullableString(book.currency_sec),
    purchase_date: normalizeNullableString(book.purchase_date),
    purchase_place: normalizeNullableString(book.purchase_place),
    topic: normalizeNullableString(book.topic),
    image_url: normalizeNullableString(book.image_url),
    comment: normalizeNullableString(book.comment),
  };
}

/** 현재 로그인 사용자 기준으로 새 도서를 생성합니다. */
export function useCreateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (book: Omit<BookInsert, 'user_id'>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('인증되지 않았습니다. 로그인 후 다시 시도해주세요.');
      }

      // RLS 정책을 만족하도록 현재 사용자 ID를 payload에 주입합니다.
      const bookData: BookInsert = {
        ...sanitizeBookInsertPayload(book),
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('books')
        .insert(bookData as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await invalidateBookQueries(queryClient);
      toast.success('도서가 추가되었습니다');
    },
    onError: (error: Error) => {
      logError('도서 추가', error);
      const userMessage = getErrorMessage(error, '도서 추가에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

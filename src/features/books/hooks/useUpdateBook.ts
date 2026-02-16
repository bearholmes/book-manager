import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage, logError } from '@/utils/error-helpers';
import type { BookUpdate } from '@/types/book';

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
 * sanitizeBookUpdatePayload 값의 입력 안전성을 보정합니다.
 */
function sanitizeBookUpdatePayload(updates: BookUpdate): BookUpdate {
  return {
    ...updates,
    isbn13: normalizeNullableString(updates.isbn13),
    author: normalizeNullableString(updates.author),
    publisher: normalizeNullableString(updates.publisher),
    publication_date: normalizeNullableString(updates.publication_date),
    condition: normalizeNullableString(updates.condition),
    currency_sec: normalizeNullableString(updates.currency_sec),
    purchase_date: normalizeNullableString(updates.purchase_date),
    purchase_place: normalizeNullableString(updates.purchase_place),
    topic: normalizeNullableString(updates.topic),
    image_url: normalizeNullableString(updates.image_url),
    comment: normalizeNullableString(updates.comment),
  };
}

/** 대상 도서를 업데이트하고 관련 캐시를 갱신합니다. */
export function useUpdateBook() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BookUpdate & { id: string }) => {
      if (!id) {
        throw new Error('도서 ID가 필요합니다');
      }

      // nullable 문자열 필드를 null 기준으로 정규화해 DB 스키마와 일치시킵니다.
      const sanitizedUpdates = sanitizeBookUpdatePayload(updates);

      const { data, error } = await supabase
        .from('books')
        .update(sanitizedUpdates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await invalidateBookQueries(queryClient);
      toast.success('도서가 수정되었습니다');
    },
    onError: (error: Error, variables) => {
      logError('도서 수정', error, { bookId: variables.id });
      const userMessage = getErrorMessage(error, '도서 수정에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

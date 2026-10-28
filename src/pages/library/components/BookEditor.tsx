import { BookLookup } from '@/features/book-lookup';
import { BookForm, type BookFormData } from '@/features/books';
import { desktop } from '@/shared/api/desktop';
import { useConfirmSnackbar } from '@/shared/notifications/hooks/useConfirmSnackbar';
import { useToast } from '@/shared/notifications/hooks/useToast';
import type { Book } from '@contracts/book';
import { normalizeIsbn } from '@contracts/isbn';
import { useEffect, useRef } from 'react';

export function BookEditor({
  book,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  book?: Book;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const { confirm } = useConfirmSnackbar();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const approved = useRef(new Set<string>());
  const toast = useToast();
  async function check(isbn: string, signal?: AbortSignal) {
    const canonical = normalizeIsbn(isbn);
    if (!canonical) return true;
    const matches = await desktop('findDuplicates', { isbn: canonical, excludeId: book?.id });
    if (!mounted.current || signal?.aborted) return false;
    if (!matches.length) return true;
    const key = `${canonical}:${matches
      .map((b) => b.id)
      .sort()
      .join(',')}`;
    if (approved.current.has(key)) return true;
    const accepted = await confirm(
      `동일한 책이 이미 ${matches.length}권 존재합니다. «${matches[0]?.book_name}» 그래도 입력하시겠습니까?`,
      signal,
    );
    if (signal?.aborted) return false;
    if (accepted) approved.current.add(key);
    return accepted;
  }
  return (
    <BookForm
      book={book}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      beforeSubmit={async (data) => {
        try {
          return await check(data.isbn13 ?? '');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : '중복 확인에 실패했습니다.');
          return false;
        }
      }}
      renderIsbnHelper={(context) => <BookLookup context={context} beforeLookup={check} />}
    />
  );
}

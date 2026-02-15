import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { invalidateBookQueries } from '@/utils/query-helpers';
import { getErrorMessage, logError } from '@/utils/error-helpers';
import type { BookInsert } from '@/types/book';

const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMPORT_ITEMS = 5000;
const MAX_BOOK_NAME_LENGTH = 500;
const MAX_TEXT_LENGTH = 1000;
const MAX_URL_LENGTH = 2000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown, maxLength = MAX_TEXT_LENGTH): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeDate(value: unknown): string | null {
  const date = normalizeString(value, 10);
  if (!date) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return numeric;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeCondition(value: unknown): '신품' | '중고' | null {
  if (value === '신품' || value === '중고') return value;
  return null;
}

function toBookInsert(item: unknown, userId: string): BookInsert {
  if (!isRecord(item)) {
    throw new Error('객체 형식이 아닙니다.');
  }

  const bookName = normalizeString(item.book_name ?? item.bookName, MAX_BOOK_NAME_LENGTH);
  if (!bookName) {
    throw new Error('book_name(또는 bookName)은 필수입니다.');
  }

  return {
    user_id: userId,
    book_name: bookName,
    isbn13: normalizeString(item.isbn13, 32),
    author: normalizeString(item.author),
    publisher: normalizeString(item.publisher),
    publication_date: normalizeDate(item.publication_date ?? item.publicationDate),
    condition: normalizeCondition(item.condition),
    purchase_price: normalizeNumber(item.purchase_price ?? item.purchasePrice),
    currency: normalizeString(item.currency, 10) || 'KRW',
    purchase_price_sec: normalizeNumber(item.purchase_price_sec ?? item.purchasePriceSec),
    currency_sec: normalizeString(item.currency_sec ?? item.currencySec, 10),
    purchase_date: normalizeDate(item.purchase_date ?? item.purchaseDate),
    purchase_place: normalizeString(item.purchase_place ?? item.purchasePlace),
    topic: normalizeString(item.topic),
    image_url: normalizeString(item.image_url ?? item.imageUrl, MAX_URL_LENGTH),
    duplicated: normalizeBoolean(item.duplicated),
    comment: normalizeString(item.comment),
  };
}

/**
 * 임포트 결과 정보
 */
interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

/**
 * 도서 일괄 임포트 훅
 *
 * JSON 파일에서 도서 데이터를 읽어 일괄 등록합니다.
 * 100개씩 배치 처리하여 대량 데이터도 안정적으로 처리합니다.
 *
 * @returns UseMutationResult - TanStack Query mutation 객체
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useImportBooks();
 *
 * const handleFileSelect = (file: File) => {
 *   mutate(file, {
 *     onSuccess: (result) => {
 *       console.log(`성공: ${result.success}, 실패: ${result.failed}`);
 *     },
 *   });
 * };
 * ```
 */
export function useImportBooks() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportResult> => {
      if (!file.name.toLowerCase().endsWith('.json')) {
        throw new Error('JSON 파일만 임포트할 수 있습니다.');
      }

      if (file.size > MAX_IMPORT_FILE_SIZE) {
        throw new Error('파일이 너무 큽니다. 10MB 이하 JSON 파일만 업로드해주세요.');
      }

      // 파일 읽기
      const text = await file.text();
      let jsonData: unknown[];

      try {
        jsonData = JSON.parse(text);
      } catch (error) {
        throw new Error('유효하지 않은 JSON 파일입니다.');
      }

      if (!Array.isArray(jsonData)) {
        throw new Error('JSON 데이터는 배열 형식이어야 합니다.');
      }
      if (jsonData.length > MAX_IMPORT_ITEMS) {
        throw new Error(`한 번에 최대 ${MAX_IMPORT_ITEMS}개까지만 임포트할 수 있습니다.`);
      }

      // 현재 사용자 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const result: ImportResult = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [],
      };

      // 배치 처리 (100개씩)
      const batchSize = 100;
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        const booksToInsert = batch
          .map((item, index) => {
            try {
              return toBookInsert(item, user.id);
            } catch (error) {
              result.failed++;
              result.errors.push({
                index: i + index,
                error: error instanceof Error ? error.message : '알 수 없는 오류',
              });
              return null;
            }
          })
          .filter((book): book is BookInsert => book !== null);

        if (booksToInsert.length > 0) {
          const { error } = await supabase
            .from('books')
            .insert(booksToInsert as never);

          if (error) {
            result.failed += booksToInsert.length;
            result.errors.push({
              index: i,
              error: error.message,
            });
          } else {
            result.success += booksToInsert.length;
          }
        }
      }

      return result;
    },
    onSuccess: async (result) => {
      // 모든 도서 관련 쿼리 무효화
      await invalidateBookQueries(queryClient);

      // 결과에 따른 토스트 메시지
      if (result.failed === 0) {
        toast.success(`${result.success}개의 도서를 성공적으로 임포트했습니다.`);
      } else {
        toast.warning(
          `${result.success}개 성공, ${result.failed}개 실패. 총 ${result.total}개 중`,
        );
      }
    },
    onError: (error: Error, file) => {
      // 에러 로깅
      logError('도서 임포트', error, { fileName: file.name, fileSize: file.size });

      // 사용자 친화적 에러 메시지
      const userMessage = getErrorMessage(error, '도서 임포트에 실패했습니다');
      toast.error(userMessage);
    },
  });
}

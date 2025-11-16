import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/utils/constants';
import type { BookInsert } from '@/types/book';

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

/**
 * JSON 파일에서 도서 데이터 임포트
 */
export function useImportBooks() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportResult> => {
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
          .map((item: any, index) => {
            try {
              return {
                user_id: user.id,
                book_name: item.book_name || item.bookName,
                isbn13: item.isbn13,
                author: item.author,
                publisher: item.publisher,
                publication_date: item.publication_date || item.publicationDate,
                condition: item.condition,
                purchase_price: item.purchase_price || item.purchasePrice,
                currency: item.currency || 'KRW',
                purchase_price_sec: item.purchase_price_sec || item.purchasePriceSec,
                currency_sec: item.currency_sec || item.currencySec,
                purchase_date: item.purchase_date || item.purchaseDate,
                purchase_place: item.purchase_place || item.purchasePlace,
                topic: item.topic,
                image_url: item.image_url || item.imageUrl,
                duplicated: item.duplicated || false,
                comment: item.comment,
              } as BookInsert;
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
          const insertResult = await (supabase.from('books') as any).insert(booksToInsert);
          const { error } = insertResult;

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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKS });

      if (result.failed === 0) {
        toast.success(`${result.success}개의 도서를 성공적으로 임포트했습니다.`);
      } else {
        toast.warning(
          `${result.success}개 성공, ${result.failed}개 실패. 총 ${result.total}개 중`,
        );
      }
    },
    onError: (error: Error) => {
      toast.error(`임포트 실패: ${error.message}`);
    },
  });
}

import { useBooks } from '@/features/books/hooks/useBooks';
import { useSignout } from '@/features/auth/hooks/useSignout';
import { Spinner } from '@/components/ui/Spinner';

export function Admin() {
  const { data: books, isLoading } = useBooks();
  const { mutate: signout } = useSignout();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
          <button
            type="button"
            onClick={() => signout()}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            로그아웃
          </button>
        </div>

        <div className="mt-8">
          <p className="text-gray-600">총 {books?.length || 0}권의 도서</p>
        </div>

        {/* TODO: 도서 관리 UI 추가 */}
      </div>
    </div>
  );
}

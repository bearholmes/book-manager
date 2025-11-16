import { useBooks } from '@/features/books/hooks/useBooks';
import { Spinner } from '@/components/ui/Spinner';

export function Home() {
  const { data: books, isLoading } = useBooks();

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
        <h1 className="text-3xl font-bold text-gray-900">방구석 도서관리 📚</h1>
        <p className="mt-2 text-gray-600">총 {books?.length || 0}권의 도서</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books?.map((book) => (
            <div key={book.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900">{book.book_name}</h3>
                {book.author && <p className="mt-1 text-sm text-gray-600">{book.author}</p>}
                {book.topic && (
                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {book.topic}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

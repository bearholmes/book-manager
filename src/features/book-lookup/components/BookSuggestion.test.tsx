import { renderWithProviders, screen, userEvent, waitFor } from '@/test/test-utils';
import type { BookHelperContext, LookupCandidate } from '@contracts/book-lookup';
import { describe, expect, it, vi } from 'vitest';
import { BookSuggestion } from './BookSuggestion';

const candidate: LookupCandidate = {
  title: '추천 제목',
  author: '추천 저자',
  publisher: '추천 출판사',
  publicationDate: '2026-10-28',
  reportedIsbn: '9788966260959',
  sources: [],
  covers: [],
  notes: [],
};
function context(): BookHelperContext {
  return {
    isbn: '9788966260959',
    fields: { book_name: '', author: '내가 쓴 저자', publisher: '', publication_date: '' },
    coverVersion: 0,
    hasCover: false,
    apply: vi.fn(),
  };
}
describe('suggestions are explicitly applied editable values', () => {
  it('does not fill the form until clicked and preserves existing fields by default', async () => {
    const value = context();
    const user = userEvent.setup();
    renderWithProviders(
      <BookSuggestion
        candidate={candidate}
        candidateIndex={0}
        jobId="job"
        context={value}
        onApplied={() => {}}
      />,
    );
    expect(value.apply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '폼에 반영' }));
    expect(value.apply).toHaveBeenCalledWith(
      { book_name: '추천 제목', publisher: '추천 출판사', publication_date: '2026-10-28' },
      undefined,
    );
  });
  it('deselects a suggestion when its field is edited while results are visible', async () => {
    const value = context();
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(
      <BookSuggestion
        candidate={candidate}
        candidateIndex={0}
        jobId="job"
        context={value}
        onApplied={() => {}}
      />,
    );
    const changed = { ...value, fields: { ...value.fields, book_name: '직접 수정' } };
    rerender(
      <BookSuggestion
        candidate={candidate}
        candidateIndex={0}
        jobId="job"
        context={changed}
        onApplied={() => {}}
      />,
    );
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /도서명/ })).not.toBeChecked());
    await user.click(screen.getByRole('button', { name: '폼에 반영' }));
    expect(value.apply).toHaveBeenCalledWith(
      { publisher: '추천 출판사', publication_date: '2026-10-28' },
      undefined,
    );
  });
});

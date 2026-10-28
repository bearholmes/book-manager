import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { mockBook } from '@/test/mockData';
import { BookTable } from './BookTable';

it('uses the same topic color supplied to the cover view', () => {
  render(
    <BookTable
      books={[mockBook]}
      onSelect={vi.fn()}
      topicColors={{ [mockBook.topic]: 'rgb(var(--color-category-4))' }}
    />,
  );
  expect(screen.getByText(mockBook.topic)).toHaveAttribute(
    'style',
    expect.stringContaining('--color-category-4'),
  );
});

it('keeps legacy invalid dates from crashing the library', () => {
  render(<BookTable books={[{ ...mockBook, purchase_date: 'not-a-date' }]} onSelect={vi.fn()} />);
  expect(screen.getByRole('button', { name: mockBook.book_name })).toBeInTheDocument();
  expect(screen.getByText('-')).toBeInTheDocument();
});

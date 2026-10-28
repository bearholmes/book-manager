import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { mockBook } from '@/test/mockData';
import { BookTable } from './BookTable';

it('keeps legacy invalid dates from crashing the library', () => {
  render(<BookTable books={[{ ...mockBook, purchase_date: 'not-a-date' }]} onSelect={vi.fn()} />);
  expect(screen.getByRole('button', { name: mockBook.book_name })).toBeInTheDocument();
  expect(screen.getByText('-')).toBeInTheDocument();
});

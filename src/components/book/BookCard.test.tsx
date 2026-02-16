import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { BookCard } from './BookCard';
import { mockBook } from '@/test/mockData';

describe('BookCard', () => {
  it('도서 정보를 렌더링해야 함', () => {
    renderWithProviders(<BookCard book={mockBook} />);

    expect(screen.getByText(mockBook.book_name)).toBeInTheDocument();
    expect(screen.getByText(mockBook.author!)).toBeInTheDocument();
    expect(screen.getByText(mockBook.topic!)).toBeInTheDocument();
  });

  it('이미지를 렌더링해야 함', () => {
    renderWithProviders(<BookCard book={mockBook} />);

    const img = screen.getByAltText(mockBook.book_name);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockBook.image_url);
  });

  it('이미지가 없을 때 대체 아이콘을 표시해야 함', () => {
    const bookWithoutImage = { ...mockBook, image_url: '' };
    const { container } = renderWithProviders(<BookCard book={bookWithoutImage} />);

    // SVG 아이콘이 있는지 확인
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('중복 구매 표시를 렌더링해야 함', () => {
    const duplicatedBook = { ...mockBook, duplicated: true };
    renderWithProviders(<BookCard book={duplicatedBook} />);

    expect(screen.getByText('중복구매')).toBeInTheDocument();
  });

  it('클릭 핸들러가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(<BookCard book={mockBook} onClick={handleClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('Enter 키로 카드를 활성화할 수 있어야 함', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(<BookCard book={mockBook} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('Space 키로 카드를 활성화할 수 있어야 함', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(<BookCard book={mockBook} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('onClick이 없을 때는 버튼 역할이 없어야 함', () => {
    renderWithProviders(<BookCard book={mockBook} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('주제 색상을 적용해야 함', () => {
    const topicColor = '#ff0000';
    renderWithProviders(<BookCard book={mockBook} topicColor={topicColor} />);

    const topicElement = screen.getByText(mockBook.topic!);
    expect(topicElement).toHaveStyle({ backgroundColor: topicColor });
  });

  it('저자가 없을 때 표시하지 않아야 함', () => {
    const bookWithoutAuthor = { ...mockBook, author: null };
    renderWithProviders(<BookCard book={bookWithoutAuthor} />);

    expect(screen.queryByText(mockBook.author!)).not.toBeInTheDocument();
  });

  it('주제가 없을 때 표시하지 않아야 함', () => {
    const bookWithoutTopic = { ...mockBook, topic: null };
    renderWithProviders(<BookCard book={bookWithoutTopic} />);

    expect(screen.queryByText(mockBook.topic!)).not.toBeInTheDocument();
  });

  it('구매 정보 비노출 옵션일 때 구매가/구매일을 표시하지 않아야 함', () => {
    const handleClick = vi.fn();
    renderWithProviders(<BookCard book={mockBook} showPurchaseMeta={false} onClick={handleClick} />);

    expect(screen.queryByText(/33,?000원/)).not.toBeInTheDocument();
    expect(screen.queryByText('2024.01.15')).not.toBeInTheDocument();
    expect(screen.getByRole('button').getAttribute('aria-label')).not.toContain('가격:');
  });

  it('ARIA 레이블이 있어야 함', () => {
    const handleClick = vi.fn();
    renderWithProviders(<BookCard book={mockBook} onClick={handleClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card.getAttribute('aria-label')).toContain(mockBook.book_name);
  });
});

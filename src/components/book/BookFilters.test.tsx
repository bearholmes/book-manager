import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { BookFilters } from './BookFilters';
import type { BookFilters as BookFiltersType } from '@/types/book';

describe('BookFilters', () => {
  const mockOnChange = vi.fn();
  const mockTopics = ['프로그래밍', '과학', '소설'];
  const mockPurchasePlaces = ['교보문고', '알라딘', '예스24'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('모든 필터 컨트롤이 렌더링되어야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      expect(screen.getByPlaceholderText('도서명, 저자, 출판사로 검색')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /주제/ })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /구매처/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /필터 초기화/ })).toBeInTheDocument();
    });

    it('주제 옵션이 올바르게 렌더링되어야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={[]}
        />
      );

      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      const options = topicSelect.querySelectorAll('option');

      expect(options).toHaveLength(mockTopics.length + 1); // +1 for "전체 주제"
      expect(options[0]).toHaveTextContent('전체 주제');
      expect(options[1]).toHaveTextContent('프로그래밍');
      expect(options[2]).toHaveTextContent('과학');
      expect(options[3]).toHaveTextContent('소설');
    });

    it('구매처 옵션이 올바르게 렌더링되어야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      const placeSelect = screen.getByRole('combobox', { name: /구매처/ });
      const options = placeSelect.querySelectorAll('option');

      expect(options).toHaveLength(mockPurchasePlaces.length + 1); // +1 for "전체 구매처"
      expect(options[0]).toHaveTextContent('전체 구매처');
      expect(options[1]).toHaveTextContent('교보문고');
      expect(options[2]).toHaveTextContent('알라딘');
      expect(options[3]).toHaveTextContent('예스24');
    });

    it('현재 필터 값이 올바르게 표시되어야 함', () => {
      const filters: BookFiltersType = {
        search: '클린 코드',
        topic: '프로그래밍',
        purchase_place: '교보문고',
      };

      renderWithProviders(
        <BookFilters
          filters={filters}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      expect(screen.getByDisplayValue('클린 코드')).toBeInTheDocument();
      expect(screen.getByDisplayValue('프로그래밍')).toBeInTheDocument();
      expect(screen.getByDisplayValue('교보문고')).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('검색어 입력 시 onChange가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={[]}
        />
      );

      const searchInput = screen.getByPlaceholderText('도서명, 저자, 출판사로 검색');

      // paste를 사용하여 전체 텍스트를 한 번에 입력
      await user.click(searchInput);
      await user.paste('클린 코드');

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenLastCalledWith({ search: '클린 코드' });
    });

    it('검색어를 지우면 undefined로 설정되어야 함', async () => {
      const user = userEvent.setup();
      const filters: BookFiltersType = { search: '테스트' };

      renderWithProviders(
        <BookFilters
          filters={filters}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={[]}
        />
      );

      const searchInput = screen.getByDisplayValue('테스트');
      await user.clear(searchInput);

      expect(mockOnChange).toHaveBeenCalledWith({ search: undefined });
    });
  });

  describe('주제 필터', () => {
    it('주제 선택 시 onChange가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={[]}
        />
      );

      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      await user.selectOptions(topicSelect, '프로그래밍');

      expect(mockOnChange).toHaveBeenCalledWith({ topic: '프로그래밍' });
    });

    it('전체 주제 선택 시 topic이 undefined로 설정되어야 함', async () => {
      const user = userEvent.setup();
      const filters: BookFiltersType = { topic: '프로그래밍' };

      renderWithProviders(
        <BookFilters
          filters={filters}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={[]}
        />
      );

      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      await user.selectOptions(topicSelect, '');

      expect(mockOnChange).toHaveBeenCalledWith({ topic: undefined });
    });
  });

  describe('구매처 필터', () => {
    it('구매처 선택 시 onChange가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      const placeSelect = screen.getByRole('combobox', { name: /구매처/ });
      await user.selectOptions(placeSelect, '교보문고');

      expect(mockOnChange).toHaveBeenCalledWith({ purchase_place: '교보문고' });
    });

    it('전체 구매처 선택 시 purchase_place가 undefined로 설정되어야 함', async () => {
      const user = userEvent.setup();
      const filters: BookFiltersType = { purchase_place: '교보문고' };

      renderWithProviders(
        <BookFilters
          filters={filters}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      const placeSelect = screen.getByRole('combobox', { name: /구매처/ });
      await user.selectOptions(placeSelect, '');

      expect(mockOnChange).toHaveBeenCalledWith({ purchase_place: undefined });
    });
  });

  describe('필터 초기화', () => {
    it('필터가 없을 때 초기화 버튼이 비활성화되어야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={[]}
        />
      );

      const clearButton = screen.getByRole('button', { name: /필터 초기화/ });
      expect(clearButton).toBeDisabled();
    });

    it('필터가 있을 때 초기화 버튼이 활성화되어야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{ search: '테스트' }}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={[]}
        />
      );

      const clearButton = screen.getByRole('button', { name: /필터 초기화/ });
      expect(clearButton).not.toBeDisabled();
    });

    it('초기화 버튼 클릭 시 모든 필터가 제거되어야 함', async () => {
      const user = userEvent.setup();
      const filters: BookFiltersType = {
        search: '클린 코드',
        topic: '프로그래밍',
        purchase_place: '교보문고',
      };

      renderWithProviders(
        <BookFilters
          filters={filters}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      const clearButton = screen.getByRole('button', { name: /필터 초기화/ });
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith({});
    });
  });

  describe('복합 필터', () => {
    it('여러 필터를 동시에 적용할 수 있어야 함', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      // 검색어 입력
      const searchInput = screen.getByPlaceholderText('도서명, 저자, 출판사로 검색');
      await user.type(searchInput, '코드');

      // 주제 선택
      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      await user.selectOptions(topicSelect, '프로그래밍');

      // onChange가 각 필터마다 호출되었는지 확인
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('기존 필터를 유지하면서 새 필터를 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      const filters: BookFiltersType = { search: '클린 코드' };

      renderWithProviders(
        <BookFilters
          filters={filters}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      await user.selectOptions(topicSelect, '프로그래밍');

      // 기존 search 필터를 유지하면서 topic 추가
      expect(mockOnChange).toHaveBeenCalledWith({
        search: '클린 코드',
        topic: '프로그래밍',
      });
    });
  });

  describe('접근성', () => {
    it('모든 입력 필드에 레이블이 있어야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      // screen reader 전용 레이블 확인
      expect(screen.getByLabelText('검색')).toBeInTheDocument();
      expect(screen.getByLabelText('주제')).toBeInTheDocument();
      expect(screen.getByLabelText('구매처')).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('topics가 빈 배열일 때도 동작해야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={[]}
          purchasePlaces={mockPurchasePlaces}
        />
      );

      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      const options = topicSelect.querySelectorAll('option');

      // "전체 주제" 옵션만 존재
      expect(options).toHaveLength(1);
    });

    it('purchasePlaces가 빈 배열일 때도 동작해야 함', () => {
      renderWithProviders(
        <BookFilters
          filters={{}}
          onChange={mockOnChange}
          topics={mockTopics}
          purchasePlaces={[]}
        />
      );

      const placeSelect = screen.getByRole('combobox', { name: /구매처/ });
      const options = placeSelect.querySelectorAll('option');

      // "전체 구매처" 옵션만 존재
      expect(options).toHaveLength(1);
    });

    it('topics와 purchasePlaces가 undefined일 때 기본값 빈 배열로 동작해야 함', () => {
      renderWithProviders(<BookFilters filters={{}} onChange={mockOnChange} />);

      const topicSelect = screen.getByRole('combobox', { name: /주제/ });
      const placeSelect = screen.getByRole('combobox', { name: /구매처/ });

      expect(topicSelect.querySelectorAll('option')).toHaveLength(1);
      expect(placeSelect.querySelectorAll('option')).toHaveLength(1);
    });
  });
});

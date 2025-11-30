import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BookFilters } from '@/components/book/BookFilters';
import type { BookFilters as BookFiltersType } from '@/types/book';

const meta = {
  title: 'Components/BookFilters',
  component: BookFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTopics = ['프로그래밍', '소설', '자기계발', '역사', '과학'];
const mockPurchasePlaces = ['교보문고', '예스24', '알라딘', '온라인서점'];

function FiltersWrapper(args: Omit<React.ComponentProps<typeof BookFilters>, 'filters' | 'onChange'>) {
  const [filters, setFilters] = useState<BookFiltersType>({});

  return (
    <div className="w-full max-w-4xl">
      <BookFilters {...args} filters={filters} onChange={setFilters} />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 font-semibold text-gray-900">현재 필터:</h3>
        <pre className="text-sm text-gray-700">{JSON.stringify(filters, null, 2)}</pre>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    topics: mockTopics,
    purchasePlaces: mockPurchasePlaces,
    filters: {},
    onChange: () => {},
  },
};

export const WithManyTopics: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    topics: [
      '프로그래밍',
      '소설',
      '자기계발',
      '역사',
      '과학',
      '예술',
      '철학',
      '경제',
      '경영',
      '마케팅',
      '심리학',
      '건강',
      '요리',
      '여행',
    ],
    purchasePlaces: mockPurchasePlaces,
    filters: {},
    onChange: () => {},
  },
};

export const NoTopics: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    topics: [],
    purchasePlaces: mockPurchasePlaces,
    filters: {},
    onChange: () => {},
  },
};

export const NoPurchasePlaces: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    topics: mockTopics,
    purchasePlaces: [],
    filters: {},
    onChange: () => {},
  },
};

export const Empty: Story = {
  render: (args) => <FiltersWrapper {...args} />,
  args: {
    topics: [],
    purchasePlaces: [],
    filters: {},
    onChange: () => {},
  },
};

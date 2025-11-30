import type { Meta, StoryObj } from '@storybook/react';
import { BookForm } from '@/components/book/BookForm';
import type { Book } from '@/types/book';

const meta = {
  title: 'Components/BookForm',
  component: BookForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockBook: Book = {
  id: '1',
  user_id: 'user-1',
  book_name: '클린 코드',
  isbn13: '9788966260959',
  author: '로버트 C. 마틴',
  publisher: '인사이트',
  publication_date: '2013-01-23',
  condition: '신품',
  purchase_price: 33000,
  currency: 'KRW',
  purchase_price_sec: null,
  currency_sec: null,
  purchase_date: '2024-01-15',
  purchase_place: '교보문고',
  topic: '프로그래밍',
  image_url: 'https://image.yes24.com/goods/11681152/XL',
  duplicated: false,
  comment: '코드 품질을 높이는 필독서',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const AddMode: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    isSubmitting: false,
  },
};

export const EditMode: Story = {
  args: {
    book: mockBook,
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    isSubmitting: false,
  },
};

export const Submitting: Story = {
  args: {
    book: mockBook,
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    isSubmitting: true,
  },
};

export const EmptyEditMode: Story = {
  args: {
    book: {
      ...mockBook,
      author: null,
      publisher: null,
      isbn13: null,
      topic: null,
      purchase_place: null,
      comment: null,
    },
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    isSubmitting: false,
  },
};

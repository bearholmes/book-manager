import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookCard } from '@/components/book/BookCard';
import type { Book } from '@/types/book';

const meta = {
  title: 'Components/BookCard',
  component: BookCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof BookCard>;

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

export const Default: Story = {
  args: {
    book: mockBook,
    topicColor: '#ddd6fe',
  },
};

export const WithoutImage: Story = {
  args: {
    book: {
      ...mockBook,
      image_url: '',
    },
    topicColor: '#ddd6fe',
  },
};

export const Duplicated: Story = {
  args: {
    book: {
      ...mockBook,
      duplicated: true,
    },
    topicColor: '#ddd6fe',
  },
};

export const LongTitle: Story = {
  args: {
    book: {
      ...mockBook,
      book_name: '리팩터링: 코드 품질을 개선하는 객체지향 사고법, 2판 개정판',
    },
    topicColor: '#ddd6fe',
  },
};

export const NoAuthor: Story = {
  args: {
    book: {
      ...mockBook,
      author: null,
    },
    topicColor: '#ddd6fe',
  },
};

export const NoTopic: Story = {
  args: {
    book: {
      ...mockBook,
      topic: null,
    },
  },
};

export const Interactive: Story = {
  args: {
    book: mockBook,
    topicColor: '#ddd6fe',
    onClick: () => alert('카드 클릭!'),
  },
};

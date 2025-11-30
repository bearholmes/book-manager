import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BookDetailModal } from '@/components/book/BookDetailModal';
import type { Book } from '@/types/book';

const meta = {
  title: 'Components/BookDetailModal',
  component: BookDetailModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookDetailModal>;

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
  comment: '코드 품질을 높이는 필독서입니다. 모든 개발자가 읽어야 할 책입니다.',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

function ModalWrapper(args: Omit<React.ComponentProps<typeof BookDetailModal>, 'isOpen' | 'onClose'>) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        도서 상세 보기
      </button>
      <BookDetailModal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    book: mockBook,
    topicColor: '#ddd6fe',
    isOpen: true,
    onClose: () => {},
  },
};

export const WithoutImage: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    book: {
      ...mockBook,
      image_url: '',
    },
    topicColor: '#ddd6fe',
    isOpen: true,
    onClose: () => {},
  },
};

export const Duplicated: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    book: {
      ...mockBook,
      duplicated: true,
    },
    topicColor: '#ddd6fe',
    isOpen: true,
    onClose: () => {},
  },
};

export const MinimalInfo: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    book: {
      ...mockBook,
      author: null,
      publisher: null,
      isbn13: null,
      publication_date: null,
      purchase_place: null,
      topic: null,
      comment: null,
    },
    isOpen: true,
    onClose: () => {},
  },
};

export const LongComment: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    book: {
      ...mockBook,
      comment:
        '이 책은 정말 훌륭한 책입니다. 코드를 작성하는 모든 개발자가 반드시 읽어야 할 필독서입니다. ' +
        '클린 코드의 원칙들을 배우고 실천함으로써 더 나은 개발자가 될 수 있습니다. ' +
        '특히 변수명, 함수명 짓기, 함수 분리, 주석 작성 등에 대한 실용적인 조언들이 가득합니다. ' +
        '단순히 이론만 설명하는 것이 아니라 실제 코드 예제와 함께 설명하기 때문에 이해하기 쉽습니다.',
    },
    topicColor: '#ddd6fe',
    isOpen: true,
    onClose: () => {},
  },
};

export const UsedBook: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    book: {
      ...mockBook,
      condition: '중고',
      purchase_price: 25000,
    },
    topicColor: '#ddd6fe',
    isOpen: true,
    onClose: () => {},
  },
};

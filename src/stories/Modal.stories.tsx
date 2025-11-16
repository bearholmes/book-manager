import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper 컴포넌트로 상태 관리
function ModalWrapper(args: Omit<React.ComponentProps<typeof Modal>, 'isOpen' | 'onClose'>) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        모달 열기
      </button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '기본 모달',
    isOpen: true,
    onClose: () => {},
    children: (
      <div>
        <p className="text-gray-700">모달 콘텐츠가 여기에 표시됩니다.</p>
        <p className="mt-2 text-gray-600">ESC 키를 누르거나 배경을 클릭하면 닫힙니다.</p>
      </div>
    ),
  },
};

export const Small: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '작은 모달',
    size: 'sm',
    isOpen: true,
    onClose: () => {},
    children: <p className="text-gray-700">작은 크기의 모달입니다.</p>,
  },
};

export const Large: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '큰 모달',
    size: 'xl',
    isOpen: true,
    onClose: () => {},
    children: (
      <div>
        <p className="text-gray-700">큰 크기의 모달입니다.</p>
        <p className="mt-2 text-gray-600">
          더 많은 콘텐츠를 표시할 수 있습니다. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '폼이 있는 모달',
    size: 'md',
    isOpen: true,
    onClose: () => {},
    children: (
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            저장
          </button>
        </div>
      </form>
    ),
  },
};

export const LongContent: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '긴 콘텐츠가 있는 모달',
    size: 'lg',
    isOpen: true,
    onClose: () => {},
    children: (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i} className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>
        ))}
      </div>
    ),
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';

const meta = {
  title: 'UI/SidePanel',
  component: SidePanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function SidePanelWrapper(args: Omit<React.ComponentProps<typeof SidePanel>, 'isOpen' | 'onClose'>) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        사이드 패널 열기
      </button>
      <SidePanel {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <SidePanelWrapper {...args} />,
  args: {
    title: '사이드 패널',
    isOpen: true,
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p className="text-gray-700">사이드 패널 콘텐츠가 여기에 표시됩니다.</p>
        <p className="text-gray-600">ESC 키를 누르거나 배경을 클릭하면 닫힙니다.</p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  render: (args) => <SidePanelWrapper {...args} />,
  args: {
    title: '도서 추가',
    isOpen: true,
    onClose: () => {},
    children: (
      <form className="space-y-4">
        <div>
          <label htmlFor="book_name" className="block text-sm font-medium text-gray-700">
            도서명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="book_name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="도서명을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            저자
          </label>
          <input
            type="text"
            id="author"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
            출판사
          </label>
          <input
            type="text"
            id="publisher"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
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
  render: (args) => <SidePanelWrapper {...args} />,
  args: {
    title: '긴 콘텐츠',
    isOpen: true,
    onClose: () => {},
    children: (
      <div className="space-y-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">섹션 {i + 1}</h3>
            <p className="mt-2 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};

export const NoTitle: Story = {
  render: (args) => <SidePanelWrapper {...args} />,
  args: {
    isOpen: true,
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p className="text-gray-700">제목이 없는 사이드 패널입니다.</p>
      </div>
    ),
  },
};

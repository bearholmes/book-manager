import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '@/components/ui/Spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithText: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-gray-600">로딩 중...</p>
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button
      type="button"
      disabled
      className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-white opacity-75"
    >
      <Spinner size="sm" />
      <span>처리 중...</span>
    </button>
  ),
};

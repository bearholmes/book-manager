import { Button } from '@/shared/ui/Button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Library: Story = {
  args: {
    title: '나의 서재',
    meta: '128권',
    actions: (
      <Button>
        <Plus size={16} />
        도서 추가
      </Button>
    ),
  },
};

export const Settings: Story = {
  args: { title: '설정' },
};

export const Statistics: Story = {
  args: { title: '통계' },
};

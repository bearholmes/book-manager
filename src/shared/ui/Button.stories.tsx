import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: '도서 추가' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['regular', 'compact', 'icon'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: '내보내기' } };
export const Ghost: Story = { args: { variant: 'ghost', children: '취소' } };
export const Danger: Story = { args: { variant: 'danger', children: '삭제' } };
export const Disabled: Story = { args: { disabled: true } };
export const Compact: Story = {
  args: { variant: 'secondary', size: 'compact', children: '펼치기' },
};
export const Icon: Story = {
  args: { variant: 'ghost', size: 'icon', 'aria-label': '도서 추가', children: <Plus size={17} /> },
};

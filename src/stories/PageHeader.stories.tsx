import type { Meta, StoryObj } from '@storybook/react-vite';
import { RefreshCw, ArrowLeft, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

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

export const HomeHeader: Story = {
  args: {
    title: '나의 서재',
    subtitle: '읽고 싶은 책과 읽은 책을 한 화면에서 관리하세요',
    actions: (
      <>
        <button type="button" className="btn-primary">
          관리
        </button>
        <button type="button" className="btn-signout">
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </>
    ),
  },
};

export const OpsHeader: Story = {
  args: {
    title: '운영 콘솔',
    subtitle: '운영 관리자 전용 사용자 관리',
    actions: (
      <>
        <button type="button" className="btn-secondary">
          <RefreshCw className="h-4 w-4" />
          새로고침
        </button>
        <button type="button" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          관리 화면
        </button>
      </>
    ),
  },
};

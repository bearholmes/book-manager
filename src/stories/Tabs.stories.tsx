import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  { id: 'tab1', name: '첫 번째' },
  { id: 'tab2', name: '두 번째' },
  { id: 'tab3', name: '세 번째' },
];

function TabsWrapper(args: Omit<React.ComponentProps<typeof Tabs>, 'activeTab' | 'onChange'>) {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div className="w-full max-w-2xl">
      <Tabs {...args} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-gray-700">활성 탭: {activeTab}</p>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    tabs,
    activeTab: 'tab1',
    onChange: () => {},
  },
};

export const TwoTabs: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    tabs: [
      { id: 'list', name: '목록' },
      { id: 'stats', name: '통계' },
    ],
    activeTab: 'tab1',
    onChange: () => {},
  },
};

export const ManyTabs: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    tabs: [
      { id: 'tab1', name: '프로필' },
      { id: 'tab2', name: '설정' },
      { id: 'tab3', name: '알림' },
      { id: 'tab4', name: '보안' },
      { id: 'tab5', name: '개인정보' },
    ],
    activeTab: 'tab1',
    onChange: () => {},
  },
};

export const LongNames: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    tabs: [
      { id: 'tab1', name: '매우 긴 탭 이름 첫 번째' },
      { id: 'tab2', name: '매우 긴 탭 이름 두 번째' },
      { id: 'tab3', name: '짧음' },
    ],
    activeTab: 'tab1',
    onChange: () => {},
  },
};

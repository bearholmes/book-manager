import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, Select, Textarea } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { 'aria-label': '도서명', placeholder: '도서명을 입력하세요' },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};
export const Disabled: Story = { args: { disabled: true, value: '입력 대기 중', readOnly: true } };
export const SelectSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Select aria-label="주제">
        <option>전체 주제</option>
      </Select>
      <Select aria-label="정렬" controlSize="compact">
        <option>최신 등록순</option>
      </Select>
    </div>
  ),
};
export const Memo: Story = {
  render: () => <Textarea aria-label="메모" rows={3} placeholder="메모를 입력하세요" />,
};

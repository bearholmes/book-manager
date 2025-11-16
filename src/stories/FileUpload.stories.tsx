import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '@/components/ui/FileUpload';

const meta = {
  title: 'UI/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accept: '.json',
    onFileSelect: (file) => console.log('Selected file:', file.name),
  },
};

export const Uploading: Story = {
  args: {
    accept: '.json',
    onFileSelect: (file) => console.log('Selected file:', file.name),
    disabled: true,
  },
};

export const JSONOnly: Story = {
  args: {
    accept: '.json',
    onFileSelect: (file) => console.log('Selected file:', file.name),
  },
};

export const MultipleFileTypes: Story = {
  args: {
    accept: '.json,.csv,.xlsx',
    onFileSelect: (file) => console.log('Selected file:', file.name),
  },
};

export const AllFiles: Story = {
  args: {
    accept: '*',
    onFileSelect: (file) => console.log('Selected file:', file.name),
  },
};

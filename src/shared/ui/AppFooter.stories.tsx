import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppFooter } from './AppFooter';
import styles from './AppFooter.stories.module.css';

const meta = {
  title: 'Common/AppFooter',
  component: AppFooter,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={styles.background}>
      <AppFooter />
    </div>
  ),
};

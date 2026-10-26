import type { LibraryStats } from '@contracts/desktop';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { expect, within } from 'storybook/test';
import { QUERY_KEYS } from '../api/query-keys';
import { StatisticsCharts } from './StatisticsCharts';

interface StatsArgs {
  topicStats: LibraryStats['topics'];
  placeStats: LibraryStats['places'];
  yearStats: LibraryStats['years'];
}

function StatsPreview({ topicStats, placeStats, yearStats }: StatsArgs) {
  const client = useMemo(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } },
    });
    queryClient.setQueryData(QUERY_KEYS.BOOK_STATS, {
      total: topicStats.reduce((sum, topic) => sum + topic.count, 0),
      missingImages: 0,
      topics: topicStats,
      places: placeStats,
      years: yearStats,
    } satisfies LibraryStats);
    return queryClient;
  }, [topicStats, placeStats, yearStats]);
  return (
    <QueryClientProvider client={client}>
      <StatisticsCharts />
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Components/StatisticsCharts',
  component: StatisticsCharts,
  render: (args) => <StatsPreview {...args} />,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<StatsArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTopicStats = [
  { topic: '프로그래밍', count: 45 },
  { topic: '소설', count: 32 },
  { topic: '자기계발', count: 28 },
  { topic: '역사', count: 15 },
  { topic: '과학', count: 12 },
  { topic: '경제', count: 10 },
  { topic: '예술', count: 8 },
];

const mockPlaceStats = [
  { purchase_place: '교보문고', count: 67 },
  { purchase_place: '예스24', count: 45 },
  { purchase_place: '알라딘', count: 32 },
  { purchase_place: '온라인서점', count: 18 },
  { purchase_place: '중고서점', count: 8 },
];

const mockYearStats = [
  { year: 2020, count: 12 },
  { year: 2021, count: 34 },
  { year: 2022, count: 56 },
  { year: 2023, count: 48 },
  { year: 2024, count: 35 },
];

export const Default: Story = {
  args: {
    topicStats: mockTopicStats,
    placeStats: mockPlaceStats,
    yearStats: mockYearStats,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { name: '주제별 도서 통계' }),
    ).toBeVisible();
    await expect(within(canvasElement).queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const FewTopics: Story = {
  args: {
    topicStats: [
      { topic: '프로그래밍', count: 45 },
      { topic: '소설', count: 32 },
      { topic: '자기계발', count: 28 },
    ],
    placeStats: mockPlaceStats,
    yearStats: mockYearStats,
  },
};

export const ManyTopics: Story = {
  args: {
    topicStats: [
      { topic: '프로그래밍', count: 45 },
      { topic: '소설', count: 32 },
      { topic: '자기계발', count: 28 },
      { topic: '역사', count: 15 },
      { topic: '과학', count: 12 },
      { topic: '경제', count: 10 },
      { topic: '예술', count: 8 },
      { topic: '철학', count: 7 },
      { topic: '심리학', count: 6 },
      { topic: '건강', count: 5 },
      { topic: '요리', count: 4 },
      { topic: '여행', count: 3 },
    ],
    placeStats: mockPlaceStats,
    yearStats: mockYearStats,
  },
};

export const SingleYear: Story = {
  args: {
    topicStats: mockTopicStats,
    placeStats: mockPlaceStats,
    yearStats: [{ year: 2024, count: 150 }],
  },
};

export const LongTimeRange: Story = {
  args: {
    topicStats: mockTopicStats,
    placeStats: mockPlaceStats,
    yearStats: [
      { year: 2015, count: 5 },
      { year: 2016, count: 8 },
      { year: 2017, count: 12 },
      { year: 2018, count: 18 },
      { year: 2019, count: 25 },
      { year: 2020, count: 32 },
      { year: 2021, count: 45 },
      { year: 2022, count: 56 },
      { year: 2023, count: 48 },
      { year: 2024, count: 35 },
    ],
  },
};

export const EmptyStats: Story = {
  args: {
    topicStats: [],
    placeStats: [],
    yearStats: [],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('통계 데이터가 없습니다. 도서를 추가해주세요.'),
    ).toBeVisible();
  },
};

export const OnlyTopicStats: Story = {
  args: {
    topicStats: mockTopicStats,
    placeStats: [],
    yearStats: [],
  },
};

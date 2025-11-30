import type { Meta, StoryObj } from '@storybook/react';
import { StatisticsCharts } from '@/components/book/StatisticsCharts';

const meta = {
  title: 'Components/StatisticsCharts',
  component: StatisticsCharts,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatisticsCharts>;

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
};

export const OnlyTopicStats: Story = {
  args: {
    topicStats: mockTopicStats,
    placeStats: [],
    yearStats: [],
  },
};

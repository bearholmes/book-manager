import { StatisticsCharts } from '@/features/books';
import { PageContent } from '@/shared/ui/PageContent';
import { PageHeader } from '@/shared/ui/PageHeader';

export function Statistics() {
  return (
    <PageContent>
      <PageHeader title="서재 통계" />
      <StatisticsCharts />
    </PageContent>
  );
}

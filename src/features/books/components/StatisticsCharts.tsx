import {
  type BookStatsByPlace,
  type BookStatsByTopic,
  type BookStatsByYear,
  useBookStats,
} from '@/features/books/hooks/useBookStats';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { Surface } from '@/shared/ui/Surface';
import { Table } from '@/shared/ui/Table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from '../model/constants';
import styles from './StatisticsCharts.module.css';

interface StatsTableProps {
  labelHeader: string;
  rows: Array<{ label: string; count: number }>;
  showShare?: boolean;
}

/**
 * StatsTable 컴포넌트를 렌더링합니다.
 */
function StatsTable({ labelHeader, rows, showShare = false }: StatsTableProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const columnWidths = showShare ? ['50%', '22%', '28%'] : ['68%', '32%'];

  return (
    <div className={styles.tableScroll}>
      <Table dense className={styles.table}>
        <colgroup>
          <col style={{ width: columnWidths[0] }} />
          <col style={{ width: columnWidths[1] }} />
          {showShare && <col style={{ width: columnWidths[2] }} />}
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            <th scope="col" className="text-right">
              권수
            </th>
            {showShare && (
              <th scope="col" className="text-right">
                비중
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="text-right tabular-nums">{row.count}</td>
              {showShare && (
                <td className="text-right tabular-nums">
                  {total > 0 ? `${((row.count / total) * 100).toFixed(1)}%` : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/**
 * 통계 차트 컴포넌트
 */
export function StatisticsCharts() {
  const reducedMotion = useReducedMotion();
  const { data: stats, isLoading, isError, refetch, isFetching } = useBookStats();
  const topicStats = stats?.topics;
  const placeStats = stats?.places;
  const yearStats = stats?.years;
  const shouldShowPlaceLabels = (placeStats?.length ?? 0) <= 5;
  const topicTableRows =
    topicStats?.map((item: BookStatsByTopic) => ({ label: item.topic, count: item.count })) || [];
  const placeTableRows =
    placeStats?.map((item: BookStatsByPlace) => ({
      label: item.purchase_place,
      count: item.count,
    })) || [];
  const yearTableRows =
    yearStats?.map((item: BookStatsByYear) => ({ label: `${item.year}년`, count: item.count })) ||
    [];

  const truncateLabel = (value: string | number) => {
    const label = String(value);
    return label.length > 8 ? `${label.slice(0, 7)}…` : label;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-copy-secondary">
          <Spinner size="sm" />
          <span>통계 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  const errorNotice = isError ? (
    <Surface className="space-y-3 p-6">
      <p role="alert">
        {stats
          ? '통계를 갱신하지 못했습니다. 이전 조회 결과를 표시합니다.'
          : '통계를 불러오지 못했습니다.'}
      </p>
      <Button variant="secondary" disabled={isFetching} onClick={() => void refetch()}>
        다시 시도
      </Button>
    </Surface>
  ) : null;
  if (isError && !stats) return errorNotice;

  return (
    <div className={styles.charts}>
      {errorNotice}
      {/* 주제별 통계 */}
      {topicStats && topicStats.length > 0 && (
        <section className={styles.section}>
          <h3 className="mb-6 text-sm font-semibold leading-6 text-copy-emphasis">
            주제별 도서 통계
          </h3>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="-mx-1 overflow-x-auto">
              <div className={styles.plot}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgb(var(--color-chart-grid))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="topic"
                      tick={{ fill: 'rgb(var(--color-chart-1))', fontSize: 12 }}
                      tickFormatter={truncateLabel}
                      minTickGap={16}
                    />
                    <YAxis tick={{ fill: 'rgb(var(--color-chart-1))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 'var(--radius-tooltip)',
                        border: '1px solid rgb(var(--color-border))',
                        backgroundColor: 'rgb(var(--color-surface-muted))',
                      }}
                      labelStyle={{ color: 'rgb(var(--color-text-heading))', fontWeight: 600 }}
                    />
                    <Legend />
                    <Bar
                      isAnimationActive={!reducedMotion}
                      dataKey="count"
                      fill={CHART_COLORS[0]}
                      radius={[8, 8, 0, 0]}
                      name="도서 수"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <StatsTable labelHeader="주제" rows={topicTableRows} />
          </div>
        </section>
      )}

      {/* 구매처별 통계 */}
      {placeStats && placeStats.length > 0 && (
        <section className={styles.section}>
          <h3 className="mb-6 text-sm font-semibold leading-6 text-copy-emphasis">
            구매처별 도서 통계
          </h3>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="-mx-1 overflow-x-auto">
              <div className={styles.plot}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      isAnimationActive={!reducedMotion}
                      data={placeStats}
                      dataKey="count"
                      nameKey="purchase_place"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={
                        shouldShowPlaceLabels
                          ? ({
                              purchase_place,
                              count,
                            }: { purchase_place: string; count: number }) =>
                              `${truncateLabel(purchase_place)}: ${count}`
                          : false
                      }
                      labelLine={shouldShowPlaceLabels}
                    >
                      {placeStats.map((place, index) => (
                        <Cell
                          key={place.purchase_place}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 'var(--radius-tooltip)',
                        border: '1px solid rgb(var(--color-border))',
                        backgroundColor: 'rgb(var(--color-surface-muted))',
                      }}
                      labelStyle={{ color: 'rgb(var(--color-text-heading))', fontWeight: 600 }}
                    />
                    <Legend formatter={(value) => truncateLabel(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <StatsTable labelHeader="구매처" rows={placeTableRows} showShare />
          </div>
        </section>
      )}

      {/* 연도별 통계 */}
      {yearStats && yearStats.length > 0 && (
        <section className={styles.section}>
          <h3 className="mb-6 text-sm font-semibold leading-6 text-copy-emphasis">
            연도별 도서 통계
          </h3>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="-mx-1 overflow-x-auto">
              <div className={styles.plot}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgb(var(--color-chart-grid))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: 'rgb(var(--color-chart-1))', fontSize: 12 }}
                      minTickGap={16}
                    />
                    <YAxis tick={{ fill: 'rgb(var(--color-chart-1))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 'var(--radius-tooltip)',
                        border: '1px solid rgb(var(--color-border))',
                        backgroundColor: 'rgb(var(--color-surface-muted))',
                      }}
                      labelStyle={{ color: 'rgb(var(--color-text-heading))', fontWeight: 600 }}
                    />
                    <Legend />
                    <Bar
                      isAnimationActive={!reducedMotion}
                      dataKey="count"
                      fill={CHART_COLORS[3]}
                      radius={[8, 8, 0, 0]}
                      name="도서 수"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <StatsTable labelHeader="연도" rows={yearTableRows} />
          </div>
        </section>
      )}

      {/* 데이터가 없는 경우 */}
      {(!topicStats || topicStats.length === 0) &&
        (!placeStats || placeStats.length === 0) &&
        (!yearStats || yearStats.length === 0) && (
          <Surface className="p-12 text-center">
            <p className="text-copy-secondary">통계 데이터가 없습니다. 도서를 추가해주세요.</p>
          </Surface>
        )}
    </div>
  );
}

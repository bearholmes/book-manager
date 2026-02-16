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
import {
  type BookStatsByPlace,
  type BookStatsByTopic,
  type BookStatsByYear,
  useBookStatsByTopic,
  useBookStatsByPlace,
  useBookStatsByYear,
} from '@/features/books/hooks/useBookStats';
import { Spinner } from '@/components/ui/Spinner';
import { CHART_COLORS } from '@/utils/constants';

interface StatsTableProps {
  labelHeader: string;
  rows: Array<{ label: string; count: number }>;
  showShare?: boolean;
}

function StatsTable({ labelHeader, rows, showShare = false }: StatsTableProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const columnWidths = showShare ? ['50%', '22%', '28%'] : ['68%', '32%'];

  return (
    <div className="overflow-hidden rounded-xl border border-primary-100/90 bg-white/90">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col style={{ width: columnWidths[0] }} />
          <col style={{ width: columnWidths[1] }} />
          {showShare && <col style={{ width: columnWidths[2] }} />}
        </colgroup>
        <thead className="bg-primary-50 text-xs uppercase tracking-wide text-primary-600">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">
              {labelHeader}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              권수
            </th>
            {showShare && (
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                비중
              </th>
            )}
          </tr>
        </thead>
      </table>
      <div className="h-[300px] overflow-y-auto">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: columnWidths[0] }} />
            <col style={{ width: columnWidths[1] }} />
            {showShare && <col style={{ width: columnWidths[2] }} />}
          </colgroup>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.label}-${index}`} className="border-t border-primary-100/70">
                <td className="px-3 py-2 font-medium text-primary-800">{row.label}</td>
                <td className="px-3 py-2 text-right font-semibold text-primary-900">{row.count}</td>
                {showShare && (
                  <td className="px-3 py-2 text-right text-primary-700">
                    {total > 0 ? `${((row.count / total) * 100).toFixed(1)}%` : '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 통계 차트 컴포넌트
 * Vue 버전의 StatBlock 포팅
 */
export function StatisticsCharts() {
  const { data: topicStats, isLoading: topicLoading } = useBookStatsByTopic();
  const { data: placeStats, isLoading: placeLoading } = useBookStatsByPlace();
  const { data: yearStats, isLoading: yearLoading } = useBookStatsByYear();
  const shouldShowPlaceLabels = (placeStats?.length ?? 0) <= 5;
  const topicTableRows =
    topicStats?.map((item: BookStatsByTopic) => ({ label: item.topic, count: item.count })) || [];
  const placeTableRows =
    placeStats?.map((item: BookStatsByPlace) => ({ label: item.purchase_place, count: item.count })) ||
    [];
  const yearTableRows =
    yearStats?.map((item: BookStatsByYear) => ({ label: `${item.year}년`, count: item.count })) || [];

  const truncateLabel = (value: string | number) => {
    const label = String(value);
    return label.length > 8 ? `${label.slice(0, 7)}…` : label;
  };

  if (topicLoading || placeLoading || yearLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-primary-700">
          <Spinner size="sm" />
          <span>통계 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 주제별 통계 */}
      {topicStats && topicStats.length > 0 && (
        <section className="surface-card p-6">
          <h3 className="mb-4 text-xl font-semibold text-primary-900">주제별 도서 통계</h3>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="-mx-1 overflow-x-auto">
              <div className="h-[300px] min-w-[560px] px-1 sm:min-w-0 sm:px-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6c9b2" opacity={0.5} />
                    <XAxis
                      dataKey="topic"
                      tick={{ fill: '#355575', fontSize: 12 }}
                      tickFormatter={truncateLabel}
                      minTickGap={16}
                    />
                    <YAxis tick={{ fill: '#355575', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border: '1px solid #bfd1e5',
                        backgroundColor: '#fcfaf4',
                      }}
                      labelStyle={{ color: '#172a3c', fontWeight: 600 }}
                    />
                    <Legend />
                    <Bar
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
        <section className="surface-card p-6">
          <h3 className="mb-4 text-xl font-semibold text-primary-900">구매처별 도서 통계</h3>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="-mx-1 overflow-x-auto">
              <div className="h-[300px] min-w-[560px] px-1 sm:min-w-0 sm:px-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={placeStats}
                      dataKey="count"
                      nameKey="purchase_place"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={
                        shouldShowPlaceLabels
                          ? ({ purchase_place, count }: { purchase_place: string; count: number }) =>
                              `${truncateLabel(purchase_place)}: ${count}`
                          : false
                      }
                      labelLine={shouldShowPlaceLabels}
                    >
                      {placeStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border: '1px solid #bfd1e5',
                        backgroundColor: '#fcfaf4',
                      }}
                      labelStyle={{ color: '#172a3c', fontWeight: 600 }}
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
        <section className="surface-card p-6">
          <h3 className="mb-4 text-xl font-semibold text-primary-900">연도별 도서 통계</h3>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="-mx-1 overflow-x-auto">
              <div className="h-[300px] min-w-[560px] px-1 sm:min-w-0 sm:px-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6c9b2" opacity={0.5} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#355575', fontSize: 12 }}
                      minTickGap={16}
                    />
                    <YAxis tick={{ fill: '#355575', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border: '1px solid #bfd1e5',
                        backgroundColor: '#fcfaf4',
                      }}
                      labelStyle={{ color: '#172a3c', fontWeight: 600 }}
                    />
                    <Legend />
                    <Bar
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
          <div className="surface-card p-12 text-center">
            <p className="text-primary-700">통계 데이터가 없습니다. 도서를 추가해주세요.</p>
          </div>
        )}
    </div>
  );
}

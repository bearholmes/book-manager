import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBookStatsByTopic, useBookStatsByPlace, useBookStatsByYear } from '@/features/books/hooks/useBookStats';
import { CHART_COLORS } from '@/utils/constants';

/**
 * 통계 차트 컴포넌트
 * Vue 버전의 StatBlock 포팅
 */
export function StatisticsCharts() {
  const { data: topicStats, isLoading: topicLoading } = useBookStatsByTopic();
  const { data: placeStats, isLoading: placeLoading } = useBookStatsByPlace();
  const { data: yearStats, isLoading: yearLoading } = useBookStatsByYear();

  if (topicLoading || placeLoading || yearLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">통계 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 주제별 통계 */}
      {topicStats && topicStats.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">주제별 도서 통계</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="도서 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 구매처별 통계 */}
      {placeStats && placeStats.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">구매처별 도서 통계</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={placeStats}
                dataKey="count"
                nameKey="purchase_place"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ purchase_place, count }) => `${purchase_place}: ${count}`}
              >
                {placeStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 연도별 통계 */}
      {yearStats && yearStats.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">연도별 도서 통계</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="도서 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 데이터가 없는 경우 */}
      {(!topicStats || topicStats.length === 0) &&
        (!placeStats || placeStats.length === 0) &&
        (!yearStats || yearStats.length === 0) && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">통계 데이터가 없습니다. 도서를 추가해주세요.</p>
          </div>
        )}
    </div>
  );
}

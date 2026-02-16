import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

/**
 * NotFound 컴포넌트를 렌더링합니다.
 */
export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
      <Link
        to={ROUTES.HOME}
        className="mt-8 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

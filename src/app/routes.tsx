import { Route, Routes } from 'react-router-dom';
import { Library } from '@/pages/library/Library';
import { NotFound } from '@/pages/not-found/NotFound';
import { Settings } from '@/pages/settings/Settings';
import { Statistics } from '@/pages/statistics/Statistics';
import { ROUTES } from '@/shared/config/routes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Library />} />
      <Route path={ROUTES.STATS} element={<Statistics />} />
      <Route path={ROUTES.SETTINGS} element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

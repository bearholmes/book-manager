import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/common/RoleProtectedRoute';
import { AppFooter } from '@/components/common/AppFooter';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { Admin } from '@/pages/Admin';
import { Ops } from '@/pages/Ops';
import { NotFound } from '@/pages/NotFound';

function App() {
  useAuth(); // 인증 상태 초기화

  return (
    <>
      <div className="pb-12">
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN}
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.OPS}
            element={
              <RoleProtectedRoute requiredRole="super_admin">
                <Ops />
              </RoleProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <AppFooter />
      <ToastContainer />
    </>
  );
}

export default App;

import { Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authLoadingAtom, isAuthenticatedAtom } from '@/store/authAtom';
import { useCurrentUserRole, type UserRole } from '@/features/auth/hooks/useCurrentUserRole';
import { ROUTES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

const roleRank: Record<UserRole, number> = {
  user: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * hasRequiredRole 로직을 처리합니다.
 */
function hasRequiredRole(currentRole: UserRole, requiredRole: UserRole) {
  return roleRank[currentRole] >= roleRank[requiredRole];
}

/**
 * RoleProtectedRoute 컴포넌트를 렌더링합니다.
 */
export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const { data: role = 'user', isLoading: roleLoading } = useCurrentUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!hasRequiredRole(role, requiredRole)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}


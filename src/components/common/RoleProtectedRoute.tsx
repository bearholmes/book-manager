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

function hasRequiredRole(currentRole: UserRole, requiredRole: UserRole) {
  return roleRank[currentRole] >= roleRank[requiredRole];
}

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


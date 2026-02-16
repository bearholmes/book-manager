import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { supabase } from '@/lib/supabase';
import { userAtom } from '@/store/authAtom';

export type UserRole = 'user' | 'admin' | 'super_admin';

/**
 * normalizeRole 값을 정규화합니다.
 */
function normalizeRole(role: string | null | undefined): UserRole {
  if (role === 'admin' || role === 'super_admin') {
    return role;
  }
  return 'user';
}

/**
 * useCurrentUserRole 훅을 제공합니다.
 */
export function useCurrentUserRole() {
  const user = useAtomValue(userAtom);

  return useQuery({
    queryKey: ['user-role', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<UserRole> => {
      if (!user) return 'user';

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // PGRST116: no rows found, 42P01/PGRST205: 테이블 미적용 상태
      if (error && !['PGRST116', '42P01', 'PGRST205'].includes(error.code || '')) {
        throw error;
      }

      const resolvedRole = (data as { role?: string } | null)?.role;
      return normalizeRole(resolvedRole);
    },
    staleTime: 60 * 1000,
  });
}

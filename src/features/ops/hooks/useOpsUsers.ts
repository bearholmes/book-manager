import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import type { UserRole } from '@/features/auth/hooks/useCurrentUserRole';

const OPS_USERS_QUERY_KEY = ['ops-users'];
const OPS_AUDIT_LOGS_QUERY_KEY = ['ops-audit-logs'];

interface OpsUserRow {
  user_id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  role: UserRole | null;
  is_active: boolean | null;
  book_count: number | null;
}

export interface OpsUser {
  user_id: string;
  email: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  role: UserRole;
  is_active: boolean;
  book_count: number;
}

interface AuditLogRow {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface OpsAuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function normalizeRole(role: string | null | undefined): UserRole {
  if (role === 'admin' || role === 'super_admin') {
    return role;
  }
  return 'user';
}

export function useOpsUsers() {
  return useQuery({
    queryKey: OPS_USERS_QUERY_KEY,
    queryFn: async (): Promise<OpsUser[]> => {
      const { data, error } = await (supabase as any).rpc('ops_list_users');
      if (error) throw error;

      const rows = (data || []) as OpsUserRow[];
      return rows.map((row) => ({
        user_id: row.user_id,
        email: row.email || '(이메일 없음)',
        created_at: row.created_at,
        last_sign_in_at: row.last_sign_in_at,
        role: normalizeRole(row.role),
        is_active: row.is_active !== false,
        book_count: Number(row.book_count || 0),
      }));
    },
  });
}

interface SetUserRoleInput {
  userId: string;
  role: UserRole;
  isActive?: boolean;
}

export function useOpsSetUserRole() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ userId, role, isActive = true }: SetUserRoleInput) => {
      const { error } = await (supabase as any).rpc('ops_set_user_role', {
        p_user_id: userId,
        p_role: role,
        p_is_active: isActive,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OPS_USERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: OPS_AUDIT_LOGS_QUERY_KEY });
      toast.success('권한이 변경되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '권한 변경에 실패했습니다.');
    },
  });
}

export function useOpsDeleteUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any).rpc('ops_delete_user', {
        p_user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OPS_USERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: OPS_AUDIT_LOGS_QUERY_KEY });
      toast.success('사용자가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message || '사용자 삭제에 실패했습니다.');
    },
  });
}

export function useOpsAuditLogs(limit = 80) {
  return useQuery({
    queryKey: [...OPS_AUDIT_LOGS_QUERY_KEY, limit],
    queryFn: async (): Promise<OpsAuditLog[]> => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      const rows = (data || []) as AuditLogRow[];
      return rows.map((row) => ({
        id: row.id,
        actor_user_id: row.actor_user_id,
        action: row.action,
        target_user_id: row.target_user_id,
        metadata: row.metadata || null,
        created_at: row.created_at,
      }));
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import type { UserRole } from '@/features/auth/hooks/useCurrentUserRole';
import { getErrorMessage } from '@/utils/error-helpers';

const OPS_USERS_QUERY_KEY = ['ops-users'];
const OPS_AUDIT_LOGS_QUERY_KEY = ['ops-audit-logs'];
const BOOK_COVERS_BUCKET = 'book-covers';
const STORAGE_BATCH_SIZE = 100;

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
 * useOpsUsers 훅을 제공합니다.
 */
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

interface StorageCleanupResult {
  deletedCount: number;
  cleanupError: string | null;
}

interface StorageListEntry {
  name: string;
  id: string | null;
}

function extractRawErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return getErrorMessage(error, 'Storage API 정리 중 오류가 발생했습니다.');
}

async function listStoragePathsRecursively(basePath: string): Promise<string[]> {
  const queue: string[] = [basePath];
  const paths: string[] = [];

  while (queue.length > 0) {
    const currentPath = queue.shift();
    if (!currentPath) continue;

    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase.storage.from(BOOK_COVERS_BUCKET).list(currentPath, {
        limit: STORAGE_BATCH_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) throw error;

      const entries = (data || []) as StorageListEntry[];
      for (const entry of entries) {
        if (!entry.name) continue;

        const fullPath = `${currentPath}/${entry.name}`;
        if (entry.id === null) {
          queue.push(fullPath);
          continue;
        }

        paths.push(fullPath);
      }

      hasMore = entries.length === STORAGE_BATCH_SIZE;
      offset += STORAGE_BATCH_SIZE;
    }
  }

  return paths;
}

async function cleanupUserStorage(userId: string): Promise<StorageCleanupResult> {
  try {
    const paths = await listStoragePathsRecursively(userId);
    if (paths.length === 0) {
      return { deletedCount: 0, cleanupError: null };
    }

    let deletedCount = 0;
    for (let i = 0; i < paths.length; i += STORAGE_BATCH_SIZE) {
      const chunk = paths.slice(i, i + STORAGE_BATCH_SIZE);
      const { error } = await supabase.storage.from(BOOK_COVERS_BUCKET).remove(chunk);
      if (error) throw error;
      deletedCount += chunk.length;
    }

    return { deletedCount, cleanupError: null };
  } catch (error) {
    return {
      deletedCount: 0,
      cleanupError: extractRawErrorMessage(error),
    };
  }
}

/**
 * useOpsSetUserRole 훅을 제공합니다.
 */
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
      toast.error(getErrorMessage(error, '권한 변경에 실패했습니다.'));
    },
  });
}

/**
 * useOpsDeleteUser 훅을 제공합니다.
 */
export function useOpsDeleteUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (userId: string): Promise<StorageCleanupResult> => {
      const cleanupResult = await cleanupUserStorage(userId);
      const { error } = await (supabase as any).rpc('ops_delete_user', {
        p_user_id: userId,
        p_storage_deleted_count: cleanupResult.deletedCount,
        p_storage_cleanup_error: cleanupResult.cleanupError,
      });
      if (error) throw error;
      return cleanupResult;
    },
    onSuccess: async (cleanupResult) => {
      await queryClient.invalidateQueries({ queryKey: OPS_USERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: OPS_AUDIT_LOGS_QUERY_KEY });
      if (cleanupResult.cleanupError) {
        toast.warning('사용자는 삭제되었지만 스토리지 정리에 실패했습니다. 감사 로그를 확인해주세요.');
        return;
      }
      toast.success('사용자가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error, '사용자 삭제에 실패했습니다.'));
    },
  });
}

/**
 * useOpsAuditLogs 훅을 제공합니다.
 */
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

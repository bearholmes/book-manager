import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  Users,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Search,
  Shield,
  CheckCircle2,
  BookOpen,
  History,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { ROUTES } from '@/utils/constants';
import { userAtom } from '@/store/authAtom';
import { Spinner } from '@/components/ui/Spinner';
import { getErrorMessage } from '@/utils/error-helpers';
import {
  useOpsAuditLogs,
  useOpsDeleteUser,
  useOpsSetUserRole,
  useOpsUsers,
} from '@/features/ops/hooks/useOpsUsers';
import type { UserRole } from '@/features/auth/hooks/useCurrentUserRole';

/**
 * formatDate 값을 포맷합니다.
 */
function formatDate(date: string | null) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('ko-KR');
  } catch {
    return date;
  }
}

/**
 * actionLabel 로직을 처리합니다.
 */
function actionLabel(action: string) {
  if (action === 'set_user_role') return '권한 변경';
  if (action === 'delete_user') return '사용자 삭제';
  return action;
}

/**
 * actionPillClass 로직을 처리합니다.
 */
function actionPillClass(action: string) {
  if (action === 'delete_user') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  if (action === 'set_user_role') {
    return 'border-primary-200 bg-primary-50 text-primary-700';
  }
  return 'border-primary-100 bg-paper-100 text-primary-700';
}

/**
 * Ops 컴포넌트를 렌더링합니다.
 */
export function Ops() {
  const navigate = useNavigate();
  const me = useAtomValue(userAtom);

  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: users = [], isLoading, isFetching, error, refetch } = useOpsUsers();
  const {
    data: auditLogs = [],
    isLoading: auditLoading,
    isFetching: auditFetching,
    error: auditError,
    refetch: refetchAudit,
  } = useOpsAuditLogs(60);

  const { mutate: setUserRole, isPending: isSettingRole } = useOpsSetUserRole();
  const { mutate: deleteUser, isPending: isDeletingUser } = useOpsDeleteUser();
  const usersErrorMessage = error
    ? getErrorMessage(error, '사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    : null;
  const auditErrorMessage = auditError
    ? getErrorMessage(auditError, '감사 로그를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    : null;

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.is_active).length;
    const privilegedUsers = users.filter((user) => user.role !== 'user').length;
    const totalBooks = users.reduce((sum, user) => sum + user.book_count, 0);

    return {
      totalUsers: users.length,
      activeUsers,
      privilegedUsers,
      totalBooks,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const roleMatched = roleFilter === 'all' || user.role === roleFilter;
      const activeMatched =
        activeFilter === 'all' || (activeFilter === 'active' ? user.is_active : !user.is_active);
      const queryMatched =
        !q || user.email.toLowerCase().includes(q) || user.user_id.toLowerCase().includes(q);

      return roleMatched && activeMatched && queryMatched;
    });
  }, [activeFilter, query, roleFilter, users]);

  const userEmailMap = useMemo(() => {
    return new Map(users.map((user) => [user.user_id, user.email]));
  }, [users]);

  const resolveEmail = (userId: string | null) => {
    if (!userId) return '-';
    return userEmailMap.get(userId) || userId;
  };

  const metadataSummary = (metadata: Record<string, unknown> | null) => {
    if (!metadata) return '-';
    if (typeof metadata.role === 'string') {
      const roleText =
        metadata.role === 'super_admin'
          ? '운영 관리자'
          : metadata.role === 'admin'
            ? '관리자'
            : '일반 사용자';
      const active = metadata.is_active === false ? '비활성' : '활성';
      return `권한: ${roleText} / 상태: ${active}`;
    }
    if (typeof metadata.storage_deleted_count === 'number') {
      const storageInfo = `스토리지 ${metadata.storage_deleted_count}건 정리`;
      const hasError = typeof metadata.storage_cleanup_error === 'string';
      return hasError ? `${storageInfo} (오류 있음)` : storageInfo;
    }
    try {
      return JSON.stringify(metadata);
    } catch {
      return '-';
    }
  };

  const handleRoleChange = (userId: string, role: UserRole, isActive: boolean) => {
    setUserRole({ userId, role, isActive });
  };

  const handleToggleActive = (userId: string, role: UserRole, currentActive: boolean) => {
    setUserRole({ userId, role, isActive: !currentActive });
  };

  const handleDeleteUser = (userId: string, email: string) => {
    const confirmed = window.confirm(
      `${email} 사용자를 삭제할까요?\n관련 도서 및 Storage 파일이 함께 삭제됩니다.`,
    );
    if (!confirmed) return;
    deleteUser(userId);
  };

  const handleRefresh = () => {
    void refetch();
    void refetchAudit();
  };

  const tabs = [
    { id: 'users', name: '사용자 관리' },
    { id: 'logs', name: '감사 로그' },
  ];

  return (
    <div className="min-h-screen bg-app">
      <PageHeader
        title="운영 콘솔"
        subtitle="운영 관리자 전용 사용자 관리"
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              className="btn-secondary whitespace-nowrap"
              disabled={isFetching || auditFetching}
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN)}
              className="btn-secondary whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              관리 화면
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">전체 사용자</p>
              <Users className="h-4 w-4 text-primary-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary-900">{stats.totalUsers}명</p>
          </article>

          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">활성 사용자</p>
              <CheckCircle2 className="h-4 w-4 text-primary-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary-900">{stats.activeUsers}명</p>
          </article>

          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">운영/관리 권한</p>
              <Shield className="h-4 w-4 text-accent-700" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary-900">
              {stats.privilegedUsers}명
            </p>
          </article>

          <article className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-600">전체 도서 수</p>
              <BookOpen className="h-4 w-4 text-primary-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary-900">{stats.totalBooks}권</p>
          </article>
        </section>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'users' | 'logs')}
          className="max-w-sm"
        />

        <section className="surface-card p-4 sm:p-6">
          {activeTab === 'users' ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-700" />
                <h2 className="text-lg font-semibold text-primary-900">사용자 관리</h2>
              </div>

              <div className="mb-4 grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(160px,1fr)_minmax(160px,1fr)]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="field-base pl-9"
                    placeholder="이메일 또는 사용자 ID 검색"
                  />
                </label>

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value as 'all' | UserRole)}
                  className="select-base"
                >
                  <option value="all">전체 역할</option>
                  <option value="user">일반 사용자</option>
                  <option value="admin">관리자</option>
                  <option value="super_admin">운영 관리자</option>
                </select>

                <select
                  value={activeFilter}
                  onChange={(event) =>
                    setActiveFilter(event.target.value as 'all' | 'active' | 'inactive')
                  }
                  className="select-base"
                >
                  <option value="all">전체 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <div className="surface-muted p-4 text-sm text-red-700">{usersErrorMessage}</div>
              ) : (
                <>
                  <p className="mb-3 text-xs font-medium text-primary-600">
                    검색 결과 {filteredUsers.length}명 / 전체 {users.length}명
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-primary-100">
                    <table className="w-full min-w-[980px] table-fixed text-left text-sm">
                      <colgroup>
                        <col className="w-[30%]" />
                        <col className="w-[18%]" />
                        <col className="w-[10%]" />
                        <col className="w-[8%]" />
                        <col className="w-[24%]" />
                        <col className="w-[10%]" />
                      </colgroup>
                      <thead className="bg-primary-50 text-xs uppercase tracking-wide text-primary-600">
                        <tr>
                          <th className="px-3 py-3">이메일</th>
                          <th className="px-3 py-3">권한</th>
                          <th className="px-3 py-3">상태</th>
                          <th className="px-3 py-3">도서 수</th>
                          <th className="px-3 py-3">활동</th>
                          <th className="px-3 py-3 text-right">액션</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((target) => {
                          const isMe = me?.id === target.user_id;
                          return (
                            <tr
                              key={target.user_id}
                              className="border-t border-primary-100/70 bg-white/70 align-top"
                            >
                              <td className="px-3 py-3">
                                <p className="font-medium text-primary-900">{target.email}</p>
                                <p className="mt-1 text-xs text-primary-500">{target.user_id}</p>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <select
                                  value={target.role}
                                  onChange={(event) =>
                                    handleRoleChange(
                                      target.user_id,
                                      event.target.value as UserRole,
                                      target.is_active,
                                    )
                                  }
                                  className="select-base w-40"
                                  disabled={
                                    isSettingRole ||
                                    isDeletingUser ||
                                    (isMe && target.role === 'super_admin')
                                  }
                                >
                                  <option value="user">일반 사용자</option>
                                  <option value="admin">관리자</option>
                                  <option value="super_admin">운영 관리자</option>
                                </select>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  className={
                                    target.is_active
                                      ? 'btn-secondary whitespace-nowrap'
                                      : 'btn-ghost whitespace-nowrap'
                                  }
                                  onClick={() =>
                                    handleToggleActive(
                                      target.user_id,
                                      target.role,
                                      target.is_active,
                                    )
                                  }
                                  disabled={isSettingRole || isDeletingUser || isMe}
                                >
                                  {target.is_active ? '활성' : '비활성'}
                                </button>
                              </td>
                              <td className="px-3 py-3 text-primary-800 whitespace-nowrap">
                                {target.book_count}
                              </td>
                              <td className="px-3 py-3 text-primary-700 whitespace-nowrap">
                                <p className="text-xs text-primary-500">가입</p>
                                <p>{formatDate(target.created_at)}</p>
                                <p className="mt-2 text-xs text-primary-500">최근 로그인</p>
                                <p>{formatDate(target.last_sign_in_at)}</p>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(target.user_id, target.email)}
                                  className="btn-danger ml-auto whitespace-nowrap"
                                  disabled={isDeletingUser || isSettingRole || isMe}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  삭제
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                      <div className="p-6 text-center text-sm text-primary-600">
                        조건에 맞는 사용자가 없습니다.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary-700" />
                  <h2 className="text-lg font-semibold text-primary-900">감사 로그</h2>
                </div>
                <p className="text-xs text-primary-600">최근 {auditLogs.length}건</p>
              </div>

              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : auditError ? (
                <div className="surface-muted p-4 text-sm text-red-700">{auditErrorMessage}</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-primary-100">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-primary-50 text-xs uppercase tracking-wide text-primary-600">
                      <tr>
                        <th className="px-3 py-3">시간</th>
                        <th className="px-3 py-3">액션</th>
                        <th className="px-3 py-3">실행자</th>
                        <th className="px-3 py-3">대상</th>
                        <th className="px-3 py-3">상세</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-t border-primary-100/70 bg-white/70">
                          <td className="px-3 py-3 text-primary-700 whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${actionPillClass(log.action)}`}
                            >
                              {actionLabel(log.action)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-primary-700 whitespace-nowrap">
                            {resolveEmail(log.actor_user_id)}
                          </td>
                          <td className="px-3 py-3 text-primary-700 whitespace-nowrap">
                            {resolveEmail(log.target_user_id)}
                          </td>
                          <td className="px-3 py-3 text-primary-700">
                            {metadataSummary(log.metadata)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {auditLogs.length === 0 && (
                    <div className="p-6 text-center text-sm text-primary-600">
                      감사 로그가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <aside
          className="surface-muted border-l-4 border-l-accent-400 p-5"
          aria-label="운영 도움말"
        >
          <div className="flex items-start gap-2">
            <CircleHelp className="mt-0.5 h-5 w-5 text-accent-700" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
                Guide
              </p>
              <h2 className="mt-1 text-base font-semibold text-primary-900">운영 체크리스트</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-primary-700">
                <li>삭제 전, 대상 이메일과 사용자 ID를 먼저 확인하세요.</li>
                <li>권한 변경은 즉시 적용되며, 새로고침 후 결과를 확인하세요.</li>
                <li>본인 계정은 삭제하거나 권한을 내릴 수 없습니다.</li>
                <li>작업 이력은 감사 로그 탭에서 시간순으로 확인할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

# 운영 관리자 콘솔 사용 가이드

## 1) 목적
`/ops`는 운영 관리자(`super_admin`) 전용 운영 영역입니다.  
일반 사용자 도서 관리(`/admin`)와 분리된 운영 정책/권한 체계를 사용합니다.

## 2) 적용 방식
### 신규 DB (처음 세팅)
1. Supabase SQL Editor에서 `supabase/schema.sql` 실행
2. 아래 "운영 관리자 지정" SQL 실행

### 기존 운영 DB (이미 서비스 중)
1. `supabase/migrations/20260216_add_ops_role_foundation.sql` 실행
2. `supabase/migrations/20260216_secure_stats_views.sql` 실행
3. `supabase/migrations/20260216_ops_console_actions.sql` 실행
4. `supabase/migrations/20260216_ops_storage_cleanup.sql` 실행
5. 아래 "운영 관리자 지정" SQL 실행

## 3) 운영 관리자 지정
`<YOUR_AUTH_USER_ID>`를 실제 auth.users.id로 바꿔 실행하세요.

```sql
insert into public.user_roles (user_id, role, is_active)
values ('<YOUR_AUTH_USER_ID>', 'super_admin', true)
on conflict (user_id)
do update set role = excluded.role, is_active = true, updated_at = now();
```

확인:
```sql
select user_id, role, is_active, updated_at
from public.user_roles
order by updated_at desc;
```

## 4) 접근 방법
1. 앱 로그인
2. `/admin` 진입
3. 상단 `운영 콘솔` 버튼 클릭 (super_admin일 때만 노출)
4. 또는 URL 직접 접근: `/ops`

권한이 없으면 `/`로 리다이렉트됩니다.

## 5) 역할 운영 예시 SQL
### 관리자 권한 부여
```sql
insert into public.user_roles (user_id, role, is_active)
values ('<USER_ID>', 'admin', true)
on conflict (user_id)
do update set role = excluded.role, is_active = true, updated_at = now();
```

### 일반 사용자로 변경
```sql
update public.user_roles
set role = 'user', is_active = true, updated_at = now()
where user_id = '<USER_ID>';
```

### 역할 비활성화
```sql
update public.user_roles
set is_active = false, updated_at = now()
where user_id = '<USER_ID>';
```

## 6) 현재 구현 범위
- 구현됨:
  - `user_roles`, `audit_logs` 테이블/정책
  - `super_admin` 전용 라우트 가드(`/ops`)
  - 사용자 목록 조회 / 역할 변경 / 사용자 삭제
  - 감사 로그 조회 화면
  - 사용자 삭제 시 Storage(`book-covers/{userId}/...`) 자동 정리
- 미구현:
  - Storage 삭제 실패 건 재시도/배치 정리 화면

## 7) 문제 해결
### `/ops`가 안 열림
1. 로그인 계정이 맞는지 확인
2. `public.user_roles`에 해당 user_id가 `super_admin` + `is_active=true`인지 확인
3. 마이그레이션 SQL이 실제 DB에 실행됐는지 확인

### Security Advisor 경고가 계속 뜸
`20260216_secure_stats_views.sql`를 다시 실행하고 Advisor를 새로고침하세요.

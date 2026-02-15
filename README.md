# 방구석 도서관리 2.0 📚

React + Supabase 기반 개인 도서 관리 웹 애플리케이션입니다.

## 핵심 기능
- 사용자 인증: 로그인, 회원가입, 로그아웃, 비밀번호 찾기(재설정 메일), 새 비밀번호 설정
- 사용자 화면(`/`): 내 도서 조회, 검색/필터, 도서 상세 확인
- 도서 관리 화면(`/admin`): 도서 추가/수정/삭제, JSON 임포트/익스포트, 통계 탭
- 운영 콘솔(`/ops`): 운영 관리자(`super_admin`) 전용 사용자 관리, 권한 변경, 감사 로그 조회
- 보안: Supabase RLS + 역할 기반 접근 제어(`user`, `admin`, `super_admin`)

## 기술 스택
- Frontend: React 19, TypeScript, React Router, Tailwind CSS
- State/Data: Jotai, TanStack Query
- Form/Validation: React Hook Form, Zod
- Backend: Supabase (PostgreSQL, Auth, RLS)
- Tooling: Vite, Biome, Vitest, Playwright, Storybook

## 빠른 시작

### 1) 요구사항
- Node.js >= 20
- pnpm >= 8
- Supabase 프로젝트

### 2) 설치
```bash
pnpm install
cp .env.example .env
```

### 3) DB 스키마 적용
Supabase SQL Editor에서 `supabase/schema.sql`을 실행하세요.

### 4) 운영 관리자 계정 지정(선택)
`/ops` 화면 접근을 위해 최소 1명의 `super_admin`이 필요합니다.

```sql
insert into public.user_roles (user_id, role, is_active)
values ('<YOUR_AUTH_USER_ID>', 'super_admin', true)
on conflict (user_id)
do update
set role = excluded.role,
    is_active = true,
    updated_at = now();
```

### 5) 개발 서버 실행
```bash
pnpm dev
```

기본 개발 주소: `http://localhost:3000`

## 비밀번호 찾기 설정
비밀번호 재설정 메일 링크가 정상 동작하려면 Supabase Auth URL 설정이 필요합니다.

1. Supabase Dashboard -> Authentication -> URL Configuration
2. Site URL에 개발/운영 도메인 설정
3. Redirect URLs에 다음 경로 추가
- `http://localhost:3000/reset-password`
- `https://<your-production-domain>/reset-password`

## 라우트
- `/login`: 로그인
- `/signup`: 회원가입
- `/forgot-password`: 비밀번호 재설정 메일 요청
- `/reset-password`: 새 비밀번호 설정
- `/`: 사용자 화면
- `/admin`: 도서 관리 화면 (로그인 필요)
- `/ops`: 운영 콘솔 (`super_admin` 필요)
- `/license`: 라이선스 안내

## 환경 변수

| 변수명 | 필수 | 설명 |
|---|---|---|
| `VITE_SUPABASE_URL` | 예 | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | 예 | Supabase anon key |
| `SUPABASE_URL` | 마이그레이션 시 예 | 서비스 키용 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 마이그레이션 시 예 | 서비스 키 (절대 클라이언트 노출 금지) |
| `MIGRATION_USER_ID` | 선택 | 마이그레이션 데이터 소유자 `auth.users.id` |
| `MIGRATION_SOURCE_FILE` | 선택 | 마이그레이션 기본 JSON 경로 |
| `VITE_APP_NAME` | 선택 | 앱 이름 |
| `VITE_APP_VERSION` | 선택 | 앱 버전 |
| `VITE_APP_ENV` | 선택 | 실행 환경 (`development` 등) |

## 마이그레이션(JSON -> Supabase)
```bash
pnpm migrate -- --file ./data/books.json --user-id <AUTH_USER_UUID>
```

대화형 모드:
```bash
pnpm migrate
```

도움말:
```bash
pnpm migrate -- --help
```

## 스크립트
```bash
pnpm dev                # 개발 서버
pnpm build              # 타입체크 + 프로덕션 빌드
pnpm preview            # 빌드 결과 미리보기
pnpm lint               # Biome 검사
pnpm lint:fix           # Biome 자동 수정
pnpm format             # 코드 포맷팅
pnpm type-check         # TypeScript 타입 검사
pnpm test               # Vitest watch
pnpm test:run           # Vitest 1회 실행
pnpm test:coverage      # Vitest 커버리지
pnpm test:e2e           # Playwright E2E
pnpm storybook          # Storybook 실행
pnpm build-storybook    # Storybook 빌드
pnpm migrate            # JSON 마이그레이션 스크립트
```

## 프로젝트 구조
```text
src/
  components/           # 공통/도메인 UI 컴포넌트
  features/             # 기능별 훅/로직 (auth, books, ops)
  hooks/                # 공용 커스텀 훅
  lib/                  # Supabase, QueryClient 등 인프라
  pages/                # 라우트 페이지
  store/                # Jotai atom
  styles/               # 전역 스타일
  test/                 # 테스트 설정/헬퍼
  types/                # 타입 정의
  utils/                # 상수/유틸/검증
e2e/                    # Playwright 테스트
scripts/                # 일회성 유틸리티 (마이그레이션 등)
supabase/schema.sql     # DB 스키마/정책/RPC
```

## 문서
- `.doc/SETUP_GUIDE.md`
- `.doc/OPS_GUIDE.md`
- `.doc/MIGRATION_PLAN.md`
- `.doc/AI_PROJECT_GUIDE.md`
- `AGENTS.md`

## 라이선스
앱 내 `/license` 경로에서 확인할 수 있습니다.

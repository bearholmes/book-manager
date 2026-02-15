# React 리뉴얼 버전 설정 가이드

## 📋 개요

이 가이드는 Nuxt.js + Vue 3 기반의 기존 프로젝트를 React 19 + Supabase 기반으로 마이그레이션하는 방법을 설명합니다.

---

## 🚀 빠른 시작

### 1단계: Supabase 프로젝트 설정

#### 1.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: book-manager (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: 가까운 지역 선택 (예: Northeast Asia (Seoul))

#### 1.2 데이터베이스 스키마 생성

1. Supabase 대시보드에서 `SQL Editor` 메뉴 선택
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 성공 메시지 확인

#### 1.3 Storage 버킷 생성

1. Supabase 대시보드에서 `Storage` 메뉴 선택
2. "Create a new bucket" 클릭
3. 버킷 정보 입력:
   - **Name**: book-covers
   - **Public**: OFF (비공개)
4. 생성 확인

#### 1.4 환경 변수 확인

1. Supabase 대시보드에서 `Settings` > `API` 메뉴 선택
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key
   - **service_role** key (마이그레이션용, 절대 공개 금지!)

---

### 2단계: 로컬 환경 설정

#### 2.1 Node.js 및 pnpm 설치

```bash
# Node.js 20.x 설치 확인
node --version  # v20.0.0 이상

# pnpm 설치 (없는 경우)
npm install -g pnpm@latest

# pnpm 버전 확인
pnpm --version  # 8.0.0 이상
```

#### 2.2 환경 변수 파일 생성

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일을 열고 Supabase 정보 입력:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (마이그레이션용)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Migration User
MIGRATION_USER_EMAIL=admin@example.com
MIGRATION_USER_PASSWORD=your-secure-password

# App Configuration
VITE_APP_NAME=방구석 도서관리
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development
```

**⚠️ 중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

#### 2.3 의존성 설치

기존 프로젝트와 분리하기 위해 새로운 패키지를 설치합니다:

```bash
# package-react.json을 package.json으로 복사
cp package-react.json package-new.json

# React 프로젝트 의존성 설치
pnpm install
```

---

### 3단계: 데이터 마이그레이션

#### 3.1 기존 JSON 데이터를 Supabase로 마이그레이션

```bash
# 마이그레이션 스크립트 실행
node scripts/migrate-json-to-supabase.js
```

**예상 결과**:
```
🚀 JSON → Supabase 마이그레이션 시작
📂 JSON 파일 읽기: /path/to/demoData.json
✅ 163개의 도서 데이터를 로드했습니다.
👤 사용자 확인 중: admin@example.com
✅ 사용자 생성 완료: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
🔄 데이터 변환 중...
✅ 163개 도서 데이터 변환 완료
💾 Supabase에 데이터 삽입 중...
✅ 배치 1: 100개 삽입 완료
✅ 배치 2: 63개 삽입 완료
==================================================
📊 마이그레이션 완료 요약
==================================================
✅ 성공: 163개
❌ 실패: 0개
📁 전체: 163개
==================================================
🔍 Supabase에 저장된 도서 수: 163개
🎉 마이그레이션 완료!
```

#### 3.2 Supabase 대시보드에서 확인

1. Supabase 대시보드에서 `Table Editor` 메뉴 선택
2. `books` 테이블 선택
3. 데이터가 올바르게 임포트되었는지 확인

---

### 4단계: 개발 서버 실행

#### 4.1 Vite 설정 확인

`vite.config.ts` 파일이 올바르게 설정되어 있는지 확인:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-react'),
    },
  },
  // ...
});
```

#### 4.2 개발 서버 시작

```bash
# Vite 개발 서버 실행
pnpm dev
```

브라우저가 자동으로 열리고 `http://localhost:3000`에 접속됩니다.

#### 4.3 로그인

마이그레이션 시 생성한 계정으로 로그인:
- **이메일**: `admin@example.com` (또는 설정한 이메일)
- **비밀번호**: `.env` 파일에 설정한 비밀번호

---

## 🔧 프로젝트 구조

### 주요 디렉토리

```
book-manager/
├── src-react/                  # React 소스 코드
│   ├── components/
│   │   ├── ui/                 # 기본 UI 컴포넌트
│   │   └── common/             # 공통 컴포넌트
│   ├── features/
│   │   ├── auth/               # 인증 기능
│   │   └── books/              # 도서 관리 기능
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 라이브러리 설정
│   ├── pages/                  # 페이지 컴포넌트
│   ├── store/                  # Jotai atoms
│   ├── styles/                 # 스타일
│   ├── types/                  # TypeScript 타입
│   ├── utils/                  # 유틸리티 함수
│   ├── App.tsx                 # 루트 컴포넌트
│   └── main.tsx                # 진입점
├── supabase/
│   └── schema.sql              # 데이터베이스 스키마
├── scripts/
│   └── migrate-json-to-supabase.js  # 마이그레이션 스크립트
├── index.html                  # HTML 엔트리
├── vite.config.ts             # Vite 설정
├── tsconfig-react.json        # TypeScript 설정
├── biome.json                 # Biome 린터 설정
├── tailwind-react.config.js   # Tailwind 설정
└── .env                       # 환경 변수 (gitignore)
```

---

## 📝 주요 기능

### 인증

- **로그인**: Supabase Auth를 사용한 이메일/비밀번호 인증
- **회원가입**: 새 계정 생성 및 이메일 확인
- **로그아웃**: 세션 종료
- **Protected Routes**: 인증된 사용자만 접근 가능

### 도서 관리

- **목록 조회**: 필터링, 정렬, 검색 기능
- **추가**: 새 도서 등록
- **수정**: 도서 정보 업데이트
- **삭제**: 도서 삭제
- **통계**: 주제별, 구매처별, 연도별 통계

### 상태 관리

- **Jotai**: 전역 상태 관리 (인증, UI)
- **TanStack Query**: 서버 상태 관리 (도서 데이터)
- **React Hook Form + Zod**: 폼 관리 및 유효성 검증

---

## 🛠 개발 가이드

### 코드 린팅 및 포맷팅

```bash
# 린팅 검사
pnpm lint

# 자동 수정
pnpm lint:fix

# 포맷팅
pnpm format

# 타입 체크
pnpm type-check
```

### 새 도서 필드 추가

#### 1. 데이터베이스 스키마 수정

```sql
ALTER TABLE books ADD COLUMN new_field TEXT;
```

#### 2. TypeScript 타입 업데이트

`src-react/types/database.ts`:
```typescript
export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          // ...
          new_field: string | null;
        };
        Insert: {
          // ...
          new_field?: string | null;
        };
        Update: {
          // ...
          new_field?: string | null;
        };
      };
    };
  };
}
```

#### 3. 폼 스키마 업데이트

`src-react/utils/validation.ts`:
```typescript
export const bookSchema = z.object({
  // ...
  new_field: z.string().optional(),
});
```

### 새 페이지 추가

#### 1. 페이지 컴포넌트 생성

`src-react/pages/NewPage.tsx`:
```typescript
export function NewPage() {
  return <div>New Page</div>;
}
```

#### 2. 라우트 추가

`src-react/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

#### 3. 상수 추가 (선택)

`src-react/utils/constants.ts`:
```typescript
export const ROUTES = {
  // ...
  NEW_PAGE: '/new-page',
} as const;
```

---

## 🚢 배포

### Netlify 배포

#### 1. 빌드 설정

Netlify 대시보드에서:
- **Build command**: `pnpm build`
- **Publish directory**: `dist`
- **Node version**: `20`

#### 2. 환경 변수 설정

Netlify 대시보드 > Site settings > Environment variables:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=방구석 도서관리
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=production
```

#### 3. 배포

```bash
pnpm build
# dist 폴더가 생성됨
# Netlify에 자동 배포 또는 수동 업로드
```

### Vercel 배포

#### 1. vercel.json 생성

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install"
}
```

#### 2. 환경 변수 설정

Vercel 대시보드에서 동일하게 설정

#### 3. 배포

```bash
vercel --prod
```

---

## 🔐 보안 고려사항

### 1. 환경 변수 보호

- `.env` 파일은 절대 Git에 커밋하지 않기
- `VITE_` 접두사가 붙은 변수만 클라이언트에 노출됨
- Service Role Key는 절대 클라이언트에서 사용 금지

### 2. Row Level Security (RLS)

- Supabase RLS 정책으로 데이터 보호
- 각 사용자는 자신의 데이터만 접근 가능
- SQL 인젝션 자동 방지

### 3. 인증 토큰

- Supabase가 JWT 토큰 자동 관리
- 토큰 자동 갱신
- 안전한 세션 저장

---

## 🐛 문제 해결

### 빌드 오류

#### 문제: `Cannot find module '@/...'`

**해결**:
```bash
# tsconfig-react.json 확인
# vite.config.ts의 alias 설정 확인
```

#### 문제: `Module not found: Can't resolve 'react'`

**해결**:
```bash
# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Supabase 연결 오류

#### 문제: `Missing environment variables`

**해결**:
- `.env` 파일 존재 확인
- 환경 변수명이 올바른지 확인 (`VITE_` 접두사)
- 개발 서버 재시작

#### 문제: `Row Level Security policy violation`

**해결**:
- Supabase 대시보드에서 RLS 정책 확인
- 로그인 상태 확인
- 사용자 ID가 올바른지 확인

### 마이그레이션 오류

#### 문제: `User creation failed`

**해결**:
- Service Role Key가 올바른지 확인
- 이메일 형식 확인
- Supabase Auth 설정 확인

---

## 📚 참고 문서

- [React 19 Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Jotai Documentation](https://jotai.org)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Biome](https://biomejs.dev)

---

## 💡 다음 단계

1. ✅ 기본 인증 및 도서 CRUD 완료
2. 🚧 고급 UI 컴포넌트 구현
3. 🚧 통계 차트 (Recharts)
4. 🚧 이미지 업로드 기능
5. 🚧 필터 및 정렬 UI
6. 🚧 반응형 디자인 개선
7. 🚧 다크 모드 지원
8. 🚧 PWA 지원

---

**작성일**: 2025-11-16
**작성자**: AI Assistant
**버전**: 1.0.0

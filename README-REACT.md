# 방구석 도서관리 2.0 📚

React 19 + Supabase 기반 개인 도서 관리 웹 애플리케이션

## ✨ 주요 변경사항 (v2.0)

### 기술 스택 마이그레이션

| 항목 | v1.0 (Legacy) | v2.0 (New) |
|------|---------------|------------|
| 프레임워크 | Nuxt.js 3 + Vue 3 | React 19 |
| 상태 관리 | Pinia | Jotai |
| 데이터 저장 | JSON 파일 | Supabase PostgreSQL |
| API | - | TanStack Query + ofetch |
| 폼 관리 | - | React Hook Form + Zod |
| 빌드 도구 | Nuxt 내장 | Vite |
| 린터 | ESLint + Prettier | Biome |
| 인증 | - | Supabase Auth |

### 새로운 기능

- ✅ 사용자 인증 (로그인/회원가입)
- ✅ 클라우드 기반 데이터 저장 (Supabase)
- ✅ 실시간 데이터 동기화
- ✅ Row Level Security (사용자별 데이터 격리)
- ✅ 서버리스 아키텍처
- ✅ TypeScript 기반 타입 안정성

---

## 🚀 빠른 시작

### 필수 요구사항

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Supabase 계정

### 설치 및 실행

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 Supabase 정보 입력

# 3. Supabase 스키마 생성
# Supabase 대시보드에서 supabase/schema.sql 실행

# 4. 데이터 마이그레이션 (선택)
node scripts/migrate-json-to-supabase.js

# 5. 개발 서버 실행
pnpm dev
```

자세한 설정 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참조하세요.

---

## 📁 프로젝트 구조

```
src-react/
├── components/        # React 컴포넌트
├── features/          # 기능별 모듈 (auth, books)
├── hooks/             # 커스텀 훅
├── lib/               # 라이브러리 설정
├── pages/             # 페이지 컴포넌트
├── store/             # Jotai 전역 상태
├── styles/            # 스타일
├── types/             # TypeScript 타입
└── utils/             # 유틸리티 함수
```

---

## 🔐 환경 변수

```env
# Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# App
VITE_APP_NAME=방구석 도서관리
VITE_APP_VERSION=2.0.0
```

---

## 📝 사용 가능한 스크립트

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm preview      # 빌드 미리보기
pnpm lint         # 린팅 검사
pnpm lint:fix     # 린팅 자동 수정
pnpm format       # 코드 포맷팅
pnpm type-check   # 타입 체크
pnpm migrate      # JSON to Supabase 마이그레이션
```

---

## 🏗 아키텍처

### 데이터 흐름

```
User → React Component → TanStack Query → Supabase API → PostgreSQL
                       ↓
                    Jotai (UI State)
```

### 인증 플로우

```
Login/Signup → Supabase Auth → JWT Token → RLS Policy → Database Access
```

---

## 📚 문서

- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - 마이그레이션 계획 및 설계
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 상세 설정 가이드
- [AI_PROJECT_GUIDE.md](./AI_PROJECT_GUIDE.md) - AI 개발자용 가이드 (Legacy)

---

## 🛠 개발 가이드

### 새 기능 추가

1. **hooks 작성**: `features/[feature]/hooks/`
2. **컴포넌트 작성**: `features/[feature]/components/`
3. **페이지 연결**: `pages/`

### 코드 스타일

- Biome를 사용한 자동 포맷팅
- JSDoc 주석 (복잡한 로직에 한함)
- TypeScript strict mode

---

## 🌐 배포

### Netlify

```bash
pnpm build
# dist 폴더를 Netlify에 업로드
```

### Vercel

```bash
vercel --prod
```

환경 변수를 배포 플랫폼에 설정하는 것을 잊지 마세요!

---

## 🤝 기여

이 프로젝트는 개인 학습 목적으로 시작되었습니다. 기여를 환영합니다!

---

## 📄 라이선스

자세한 내용은 `/open-license` 페이지를 참조하세요.

---

**버전**: 2.0.0
**작성일**: 2025-11-16
**기술 스택**: React 19 · Supabase · TanStack Query · Jotai · TypeScript · Vite · Tailwind CSS

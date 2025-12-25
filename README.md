<div align="center">

# 📚 방구석 도서관리

**개인 장서를 스마트하게 관리하는 현대적인 웹 애플리케이션**

[![Netlify Status](https://api.netlify.com/api/v1/badges/8b487474-1c9f-4335-a977-3fde0cbe4d85/deploy-status)](https://app.netlify.com/sites/book-management-demo/deploys)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[데모 보기](#-demo) • [주요 기능](#-주요-기능) • [시작하기](#-시작하기) • [기술 스택](#-기술-스택) • [기여하기](#-기여하기)

</div>

---

## 🎯 프로젝트 소개

집에 쌓여가는 책들을 체계적으로 관리하고 싶으신가요?
**방구석 도서관리**는 개인 장서를 손쉽게 기록하고 관리할 수 있는 웹 애플리케이션입니다.

### 📖 프로젝트 배경

- 집에 굴러다니는 책들을 체계적으로 관리하기 위해 시작
- 매달 1-2권씩 구매하는 책들의 정보를 간편하게 기록
- Vue 3 → React 19로 마이그레이션하여 현대적인 기술 스택 적용
- Supabase를 활용한 클라우드 데이터베이스 및 인증 시스템

---

## ✨ 주요 기능

### 📚 도서 관리
- ✅ **도서 추가/수정/삭제** - 직관적인 폼으로 도서 정보 입력
- 🔍 **검색 및 필터링** - 주제, 구매처, 상태별 필터링 지원
- 🏷️ **주제별 분류** - 자동 색상 할당으로 시각적 구분

### 📊 통계 및 분석
- 📈 **구매 통계** - 연도별, 주제별, 구매처별 통계
- 💰 **지출 분석** - 총 지출 금액 및 평균 도서 가격
- 📉 **시각화** - Recharts를 활용한 인터랙티브 차트

### 🔐 인증 및 보안
- 🔒 **Supabase Authentication** - 이메일 기반 회원가입/로그인
- 🛡️ **Row Level Security (RLS)** - 사용자별 데이터 격리
- 🚪 **Protected Routes** - 인증이 필요한 페이지 보호

### 📱 사용자 경험
- 🎨 **반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- ♿ **접근성** - ARIA 레이블, 키보드 네비게이션 지원
- 🌙 **다크 모드 준비** - Tailwind CSS 기반 테마 시스템
- ⚡ **빠른 로딩** - Vite + React 19로 최적화된 성능

---

## 🚀 Demo

### 🌐 라이브 데모
- **사용자 페이지**: https://book-management-demo.netlify.app/
- **관리자 페이지**: https://book-management-demo.netlify.app/admin

### 📸 스크린샷

<div align="center">
<table>
  <tr>
    <td align="center"><b>📚 도서 목록</b></td>
    <td align="center"><b>📊 통계 대시보드</b></td>
  </tr>
  <tr>
    <td><i>반응형 그리드 레이아웃으로 도서 카드 표시</i></td>
    <td><i>Recharts 기반 인터랙티브 차트</i></td>
  </tr>
</table>
</div>

---

## 🛠️ 기술 스택

### Frontend
- **React 19** - 최신 React 버전 (use 훅, 자동 배칭)
- **TypeScript 5.7** - 타입 안전성 및 개발 생산성
- **Vite 6.0** - 빠른 개발 서버 및 빌드
- **TailwindCSS 3.4** - 유틸리티 기반 CSS 프레임워크

### State & Data
- **TanStack Query 5** - 서버 상태 관리 및 캐싱
- **Jotai 2** - 간단하고 확장 가능한 전역 상태 관리
- **React Hook Form 7** - 성능 최적화된 폼 관리
- **Zod 3** - 타입 안전한 스키마 검증

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스 + 인증
- **Row Level Security** - 데이터베이스 레벨 보안 정책

### UI Components
- **Recharts 2** - 반응형 차트 라이브러리
- **Lucide React** - 아이콘 세트
- **HeadlessUI** - 접근성 있는 UI 컴포넌트

### Development Tools
- **Biome** - 빠른 린터 및 포매터 (ESLint + Prettier 대체)
- **Storybook 8** - 컴포넌트 개발 및 문서화
- **Vitest 4** - 빠른 단위 테스트 러너
- **Playwright** - E2E 테스트 프레임워크
- **Testing Library** - 사용자 중심 컴포넌트 테스트

---

## 📦 시작하기

### 요구사항

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0 (권장) 또는 npm

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/book-manager.git
cd book-manager

# 의존성 설치
pnpm install  # 또는 npm install
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 Supabase 정보를 입력합니다:

```bash
cp .env.example .env
```

```.env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 개발 서버 실행

```bash
# 개발 서버 시작 (http://localhost:3000)
pnpm dev

# Storybook 실행 (http://localhost:6006)
pnpm storybook
```

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

---

## 🧪 테스트

```bash
# 단위 테스트 실행
pnpm test

# 테스트 UI 실행
pnpm test:ui

# 테스트 커버리지
pnpm test:coverage

# E2E 테스트
pnpm test:e2e

# E2E 테스트 UI 모드
pnpm test:e2e:ui
```

---

## 📁 프로젝트 구조

```
book-manager/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── book/           # 도서 관련 컴포넌트
│   │   ├── ui/             # UI 기본 컴포넌트
│   │   └── common/         # 공통 컴포넌트
│   ├── features/           # 기능별 모듈 (Feature-First)
│   │   ├── auth/           # 인증 관련 (hooks, types)
│   │   └── books/          # 도서 관련 (hooks, types)
│   ├── hooks/              # 커스텀 훅
│   ├── lib/                # 외부 라이브러리 래퍼
│   ├── pages/              # 라우트 페이지 컴포넌트
│   ├── store/              # 전역 상태 (Jotai atoms)
│   ├── stories/            # Storybook 스토리
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   └── main.tsx            # 앱 진입점
├── e2e/                    # E2E 테스트
├── public/                 # 정적 파일
└── scripts/                # 스크립트 (마이그레이션 등)
```

---

## 🎨 코드 품질

### 린트 및 포맷

```bash
# Biome 린트 실행
pnpm lint

# 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format

# 타입 체크
pnpm type-check
```

---

## 🗺️ 로드맵

### v2.0 (완료)
- [x] Vue 3 → React 19 마이그레이션
- [x] Storybook 컴포넌트 문서화
- [x] Vitest + Testing Library 단위 테스트
- [x] Playwright E2E 테스트 설정
- [x] 테스트 커버리지 75% 달성

---

## 🤝 기여하기

기여를 환영합니다! 다음 가이드라인을 따라주세요:

### 1. Fork & Clone

```bash
# 저장소 Fork 후 클론
git clone https://github.com/your-username/book-manager.git
cd book-manager
```

### 2. 브랜치 생성

```bash
# 기능 브랜치 생성
git checkout -b feature/amazing-feature

# 버그 수정 브랜치
git checkout -b fix/bug-description
```

### 3. 커밋

```bash
# Conventional Commits 형식 사용
git commit -m "feat: add amazing feature"
git commit -m "fix: resolve issue with book filter"
git commit -m "docs: update README"
```

### 4. Pull Request

- 의미있는 PR 제목과 설명 작성
- 테스트 코드 포함
- 코드 리뷰 준비

### 커밋 컨벤션

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드/설정 변경

---

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

---

## 👨‍💻 개발자

**bearholmes**

- GitHub: [@bearholmes](https://github.com/bearholmes)
- Email: your.email@example.com

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들 덕분에 가능했습니다:

- [React](https://react.dev/) - UI 라이브러리
- [Supabase](https://supabase.com/) - Backend as a Service
- [TailwindCSS](https://tailwindcss.com/) - CSS 프레임워크
- [TanStack Query](https://tanstack.com/query) - 데이터 페칭
- [Vite](https://vitejs.dev/) - 빌드 도구

---

## 📮 문의 및 지원

- **이슈**: [GitHub Issues](https://github.com/bearholmes/book-manager/issues)
- **토론**: [GitHub Discussions](https://github.com/bearholmes/book-manager/discussions)
- **이메일**: support@example.com

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**

Made with ❤️ by bearholmes

</div>

# 방구석 도서관리 - React 리뉴얼 마이그레이션 계획

## 📋 개요

Nuxt.js + Vue 3 + JSON 기반 프로젝트를 **React 19 + Supabase** 기반 서버리스 CSR 프로젝트로 전환

---

## 🎯 마이그레이션 목표

### AS-IS (현재)
- **프레임워크**: Nuxt.js 3 + Vue 3
- **상태 관리**: Pinia
- **데이터**: JSON 파일 (로컬 업로드)
- **스타일링**: Tailwind CSS
- **빌드**: Nuxt 내장
- **런타임**: Node.js 16.x

### TO-BE (목표)
- **프레임워크**: React 19 (CSR)
- **상태 관리**: Jotai
- **데이터**: Supabase PostgreSQL
- **API 통신**: TanStack Query + ofetch
- **스타일링**: Tailwind CSS + TailwindPlus
- **빌드**: Vite
- **언어**: TypeScript
- **린터**: Biome
- **폼 관리**: React Hook Form + zod
- **날짜**: date-fns
- **인증**: Supabase Auth
- **런타임**: Node.js 20+, pnpm 8+

---

## 🗄️ Supabase 데이터베이스 스키마

### 1. books 테이블

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  book_name TEXT NOT NULL,
  isbn13 TEXT,
  author TEXT,
  publisher TEXT,
  publication_date DATE,

  -- 구매 정보
  condition TEXT CHECK (condition IN ('신품', '중고')),
  purchase_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'KRW',
  purchase_price_sec NUMERIC(10, 2),
  currency_sec TEXT,
  purchase_date DATE,
  purchase_place TEXT,

  -- 분류 및 메타데이터
  topic TEXT,
  image_url TEXT,
  duplicated BOOLEAN DEFAULT FALSE,
  comment TEXT,

  -- 시스템 필드
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 인덱스
  CONSTRAINT books_pkey PRIMARY KEY (id)
);

-- 인덱스 생성
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_topic ON books(topic);
CREATE INDEX idx_books_purchase_date ON books(purchase_date);
CREATE INDEX idx_books_isbn13 ON books(isbn13);

-- RLS (Row Level Security) 정책
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 책만 조회
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 책만 추가
CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 책만 수정
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 책만 삭제
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. updated_at 트리거

```sql
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- books 테이블에 트리거 적용
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Storage 버킷 (도서 표지 이미지)

```sql
-- Storage 버킷 생성 (Supabase 대시보드에서 생성)
-- 버킷 이름: book-covers
-- Public 설정: false (인증된 사용자만 접근)

-- Storage 정책
CREATE POLICY "Users can upload own book covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can view own book covers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own book covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );
```

---

## 📁 새로운 프로젝트 구조

```
book-manager-react/
├── public/                      # 정적 파일
│   └── favicon.ico
├── src/
│   ├── main.tsx                 # 앱 진입점
│   ├── App.tsx                  # 루트 컴포넌트
│   ├── vite-env.d.ts           # Vite 타입 정의
│   │
│   ├── components/              # 재사용 가능한 컴포넌트
│   │   ├── ui/                  # 기본 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/              # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── book/                # 도서 관련 컴포넌트
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookList.tsx
│   │   │   ├── BookDetail.tsx
│   │   │   ├── BookForm.tsx
│   │   │   └── BookFilter.tsx
│   │   └── chart/               # 차트 컴포넌트
│   │       └── StatChart.tsx
│   │
│   ├── pages/                   # 페이지 컴포넌트
│   │   ├── Home.tsx             # 사용자 도서 목록
│   │   ├── Admin.tsx            # 관리자 페이지
│   │   ├── Login.tsx            # 로그인
│   │   ├── Signup.tsx           # 회원가입
│   │   └── NotFound.tsx         # 404
│   │
│   ├── features/                # 기능별 모듈
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSignout.ts
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   └── types.ts
│   │   └── books/
│   │       ├── hooks/
│   │       │   ├── useBooks.ts
│   │       │   ├── useCreateBook.ts
│   │       │   ├── useUpdateBook.ts
│   │       │   ├── useDeleteBook.ts
│   │       │   └── useBookStats.ts
│   │       ├── components/
│   │       │   ├── AddBookModal.tsx
│   │       │   └── EditBookModal.tsx
│   │       └── types.ts
│   │
│   ├── lib/                     # 라이브러리 설정
│   │   ├── supabase.ts          # Supabase 클라이언트
│   │   ├── queryClient.ts       # TanStack Query 설정
│   │   └── api.ts               # API 유틸리티
│   │
│   ├── store/                   # Jotai atoms
│   │   ├── authAtom.ts          # 인증 상태
│   │   ├── bookAtom.ts          # 도서 관련 상태
│   │   └── uiAtom.ts            # UI 상태 (토스트, 모달 등)
│   │
│   ├── hooks/                   # 공통 커스텀 훅
│   │   ├── useToast.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   ├── format.ts            # 포맷팅 (날짜, 통화 등)
│   │   ├── validation.ts        # zod 스키마
│   │   └── constants.ts         # 상수
│   │
│   ├── types/                   # 타입 정의
│   │   ├── book.ts
│   │   ├── user.ts
│   │   └── common.ts
│   │
│   └── styles/                  # 스타일
│       └── globals.css          # Tailwind CSS + 전역 스타일
│
├── .env.example                 # 환경 변수 예제
├── .env.local                   # 환경 변수 (gitignore)
├── .gitignore
├── index.html                   # HTML 엔트리
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                # TypeScript 설정
├── tsconfig.node.json
├── vite.config.ts               # Vite 설정
├── biome.json                   # Biome 설정
├── tailwind.config.js           # Tailwind 설정
├── postcss.config.js            # PostCSS 설정
└── README.md
```

---

## 📦 package.json

```json
{
  "name": "book-manager-react",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.0",
    "@supabase/supabase-js": "^2.48.0",
    "jotai": "^2.10.3",
    "@tanstack/react-query": "^5.62.3",
    "ofetch": "^1.4.1",
    "react-hook-form": "^7.54.0",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.1",
    "date-fns": "^4.1.0",
    "recharts": "^2.13.3",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@vitejs/plugin-react-swc": "^3.7.2",
    "vite": "^6.0.1",
    "typescript": "^5.7.2",
    "@biomejs/biome": "^1.9.4",
    "tailwindcss": "^3.4.15",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

## ⚙️ 설정 파일

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": ["node_modules", "dist", "build", ".next"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  },
  "organizeImports": {
    "enabled": true
  }
}
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Apple SD Gothic Neo', 'NotoSans', 'sans-serif'],
      },
      colors: {
        // 기존 주제별 색상 유지
        topic: {
          1: '#FFEB99',
          2: '#B3CDFF',
          3: '#8AA8E5',
          4: '#CFE4E6',
          5: '#A3CCB8',
          6: '#AF99BF',
          7: '#E6B8A1',
          8: '#FFFAE5',
          9: '#E5EEFF',
          10: '#CCDDFF',
          11: '#E4EFF0',
          12: '#CFE5DA',
          13: '#D0C3D9',
          14: '#FFEEE6',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### .env.example

```bash
# Supabase
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App
VITE_APP_NAME=방구석 도서관리
VITE_APP_VERSION=2.0.0
```

---

## 🔑 핵심 코드 예시

### lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### features/books/hooks/useBooks.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Book } from '@/types/book';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      return data as Book[];
    },
  });
};
```

### features/books/hooks/useCreateBook.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BookInsert } from '@/types/book';

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (book: BookInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('books')
        .insert({ ...book, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
```

### utils/validation.ts

```typescript
import { z } from 'zod';

export const bookSchema = z.object({
  book_name: z.string().min(1, '도서명을 입력해주세요'),
  isbn13: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  publication_date: z.string().optional(),
  condition: z.enum(['신품', '중고']).optional(),
  purchase_price: z.number().optional(),
  currency: z.string().default('KRW'),
  purchase_date: z.string().optional(),
  purchase_place: z.string().optional(),
  topic: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  duplicated: z.boolean().default(false),
  comment: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookSchema>;
```

---

## 🚀 마이그레이션 단계

### Phase 1: 환경 준비 (1-2일)
1. ✅ Supabase 프로젝트 생성
2. ✅ 데이터베이스 스키마 및 RLS 설정
3. ✅ Storage 버킷 생성
4. ✅ 새 프로젝트 초기화 (pnpm create vite)
5. ✅ 의존성 설치 및 설정 파일 구성

### Phase 2: 기본 인프라 구축 (2-3일)
1. ✅ 라우팅 설정 (React Router)
2. ✅ Supabase 클라이언트 설정
3. ✅ TanStack Query 설정
4. ✅ Jotai atoms 설정
5. ✅ 인증 플로우 구현 (로그인/회원가입)

### Phase 3: 핵심 기능 마이그레이션 (3-5일)
1. ✅ Book 모델 및 타입 정의
2. ✅ CRUD hooks 구현
3. ✅ UI 컴포넌트 마이그레이션
4. ✅ 도서 목록 페이지 (사용자)
5. ✅ 도서 관리 페이지 (관리자)

### Phase 4: 고급 기능 (2-3일)
1. ✅ 통계 차트 (Recharts)
2. ✅ 이미지 업로드 (Supabase Storage)
3. ✅ 필터링 및 정렬
4. ✅ 토스트 알림 시스템

### Phase 5: 데이터 마이그레이션 (1일)
1. ✅ JSON 데이터 → Supabase 마이그레이션 스크립트 작성
2. ✅ 기존 demoData.json을 Supabase에 임포트

### Phase 6: 테스트 및 배포 (2-3일)
1. ✅ 기능 테스트
2. ✅ 반응형 디자인 검증
3. ✅ Netlify/Vercel 배포 설정
4. ✅ 환경 변수 설정
5. ✅ 프로덕션 배포

**예상 총 소요 시간**: 11-17일

---

## 📊 기능 매핑

| Vue 3 컴포넌트 | React 19 컴포넌트 | 상태 관리 |
|---------------|------------------|----------|
| src/pages/index.vue | src/pages/Home.tsx | useBooks hook |
| src/pages/admin/index.vue | src/pages/Admin.tsx | useBooks + useBookStats |
| src/components/admin/FileSelect.vue | 제거 (Supabase 사용) | - |
| src/components/common/BookItem.vue | src/components/book/BookCard.tsx | - |
| src/components/admin/MainBlock.vue | src/components/book/BookList.tsx | - |
| src/components/admin/StatBlock.vue | src/components/chart/StatChart.tsx | - |
| src/store/toast.js (Pinia) | src/store/uiAtom.ts (Jotai) | useToast hook |
| src/models/book.js | src/types/book.ts | - |

---

## 🔐 보안 고려사항

1. **Row Level Security (RLS)**
   - 각 사용자는 자신의 데이터만 접근 가능
   - Supabase RLS 정책으로 DB 레벨에서 보호

2. **환경 변수**
   - `.env.local`은 gitignore에 추가
   - Supabase 키는 절대 커밋하지 않음
   - 배포 환경에서 환경 변수 설정

3. **인증**
   - Supabase Auth 사용
   - JWT 토큰 자동 관리
   - Protected Routes 구현

---

## 📝 주의사항

1. **데이터 백업**: 마이그레이션 전 기존 JSON 데이터 백업 필수
2. **점진적 마이그레이션**: 기능별로 단계적 마이그레이션
3. **기존 URL 유지**: 가능한 기존 라우팅 구조 유지
4. **사용자 경험**: 기존 기능을 모두 유지하면서 개선

---

## 📅 다음 단계

1. ✅ Supabase 프로젝트 생성 및 데이터베이스 스키마 실행
2. ✅ 새 React 프로젝트 초기화
3. ✅ 기본 설정 파일 및 폴더 구조 생성
4. ✅ 인증 기능 구현
5. ✅ 도서 CRUD 기능 구현

---

**작성일**: 2025-11-16
**작성자**: AI Assistant
**버전**: 1.0.0

# 방구석 도서관리 - AI 프로젝트 기초 가이드

## 📋 프로젝트 개요

**프로젝트 명**: 방구석 도서관리 (Book Management in the Corner of the Room)

**목적**: 개인이 소장한 도서를 체계적으로 관리하기 위한 웹 애플리케이션. 데이터베이스 대신 JSON 파일을 사용하여 간편하게 책 정보를 저장하고 관리합니다.

**배포 환경**: Netlify (정적 사이트 호스팅)
- User: https://book-management-demo.netlify.app/
- Admin: https://book-management-demo.netlify.app/admin

**개발 배경**:
- 집에 있는 책을 관리하기 위해 시작한 개인 프로젝트
- Nuxt.js 3.0 RC 출시에 맞춰 학습 목적으로 선택
- 퇴근 후와 주말 시간을 활용한 사이드 프로젝트

---

## 🛠 기술 스택

### 프레임워크 & 라이브러리
- **Nuxt.js 3.0 RC**: Vue 3 기반 프레임워크, SSR 비활성화 (SPA 모드)
- **Vue 3.2.33**: 프로그레시브 JavaScript 프레임워크
- **Pinia 2.0.13**: Vue 3용 상태 관리 라이브러리

### UI & 스타일링
- **Tailwind CSS 5.0.4**: 유틸리티 우선 CSS 프레임워크
- **@headlessui/vue**: 접근성 높은 UI 컴포넌트
- **@heroicons/vue**: SVG 아이콘 라이브러리
- **@tailwindcss/forms**: 폼 스타일링 플러그인
- **@tailwindcss/aspect-ratio**: 비율 유지 플러그인

### 데이터 시각화 & 유틸리티
- **Chart.js 3.7.1**: 차트 라이브러리
- **chartjs-plugin-datalabels**: 차트 데이터 레이블 플러그인
- **Day.js 1.11.1**: 경량 날짜 처리 라이브러리
- **Lodash 4.17.21**: JavaScript 유틸리티 라이브러리
- **@vuepic/vue-datepicker**: Vue 3 날짜 선택 컴포넌트

### 개발 도구
- **TypeScript**: 타입 안정성
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Sass**: CSS 전처리기

### 런타임 요구사항
- **Node.js**: 16.x
- **npm**: 8.x

---

## 📁 프로젝트 구조

```
book-manager/
├── src/
│   ├── app.vue                 # 루트 앱 컴포넌트
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── index.vue          # 사용자 페이지 (도서 목록 보기)
│   │   ├── admin/
│   │   │   └── index.vue      # 관리자 페이지 (도서 관리 & 통계)
│   │   ├── open-license.vue   # 오픈소스 라이선스
│   │   └── [...slug].vue      # 404 페이지
│   ├── components/             # Vue 컴포넌트
│   │   ├── admin/             # 관리자 전용 컴포넌트
│   │   │   ├── MainBlock.vue  # 메인 도서 목록 블록
│   │   │   ├── StatBlock.vue  # 통계 블록
│   │   │   ├── TabBlock.vue   # 탭 네비게이션
│   │   │   ├── FileSelect.vue # 파일 선택 컴포넌트
│   │   │   ├── NewItem.vue    # 신규 도서 추가
│   │   │   ├── SidePopNew.vue # 추가 사이드 팝업
│   │   │   ├── SidePopEdit.vue# 수정 사이드 팝업
│   │   │   ├── StatusList.vue # 상태 목록
│   │   │   └── StatusListItem.vue
│   │   ├── user/              # 사용자 전용 컴포넌트
│   │   │   ├── MainBlock.vue  # 사용자 메인 블록
│   │   │   └── ContentModal.vue
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Container.vue  # 레이아웃 컨테이너
│   │   │   ├── Chart.vue      # 차트 컴포넌트
│   │   │   ├── BookItem.vue   # 도서 아이템
│   │   │   ├── Spinner.vue    # 로딩 스피너
│   │   │   └── Select.vue     # 선택 컴포넌트
│   │   ├── layouts/           # 레이아웃 컴포넌트
│   │   │   ├── HeaderDefault.vue
│   │   │   ├── HeaderAdmin.vue
│   │   │   └── Footer.vue
│   │   ├── popup/             # 팝업 관련
│   │   │   ├── Alert.vue
│   │   │   ├── ToastList.vue
│   │   │   └── ToastItem.vue
│   │   ├── datepicker/        # 날짜 선택
│   │   │   ├── DatePicker.vue
│   │   │   └── block/MonthYear.vue
│   │   └── icons/             # 아이콘
│   │       └── PicturePlus.vue
│   ├── layouts/               # 페이지 레이아웃
│   │   ├── default.vue        # 기본 레이아웃
│   │   └── admin.vue          # 관리자 레이아웃
│   ├── models/                # 데이터 모델
│   │   └── book.js            # Book 클래스 정의
│   ├── store/                 # Pinia 스토어
│   │   └── toast.js           # 토스트 알림 상태 관리
│   ├── utils/                 # 유틸리티 함수
│   │   └── common.js          # 공통 유틸리티 (debounce, 색상, 통화 포맷 등)
│   ├── assets/                # 정적 자산
│   │   ├── demoData.json      # 데모 데이터
│   │   ├── css/               # CSS 파일
│   │   ├── fonts/             # 폰트
│   │   └── images/            # 이미지
│   └── public/
│       └── images/            # 공개 이미지 (도서 표지)
├── nuxt.config.ts             # Nuxt 설정
├── tailwind.config.js         # Tailwind CSS 설정
├── tsconfig.json              # TypeScript 설정
├── postcss.config.js          # PostCSS 설정
├── .eslintrc.js               # ESLint 설정
├── .prettierrc                # Prettier 설정
├── netlify.toml               # Netlify 배포 설정
├── package.json               # 프로젝트 의존성
└── README.md                  # 프로젝트 문서
```

---

## 🗄 데이터 모델

### Book 클래스 (src/models/book.js)

도서 정보를 표현하는 핵심 데이터 모델입니다.

```javascript
class Book {
  bookName: string;           // 도서명
  ISBN13: string;             // ISBN 13자리 코드
  condition: string;          // 상태 (신품/중고)
  purchasePrice: string;      // 구매 가격
  currency: string;           // 통화 (기본값: KRW)
  purchasePriceSec: string;   // 2차 구매 가격
  currencySec: string;        // 2차 통화
  purchaseDate: string;       // 구매일 (YYYY-MM-DD)
  purchasePlace: string;      // 구매처
  publicationDate: string;    // 출판일
  author: string;             // 저자
  topic: string;              // 주제/카테고리
  publisher: string;          // 출판사
  imageUrl: string;           // 표지 이미지 URL
  duplicated: boolean;        // 중복 구매 여부
  comment: string;            // 메모
}
```

### 데이터 저장 방식
- JSON 파일로 도서 목록 저장
- 클라이언트 측에서 파일 업로드 후 메모리에 로드
- LocalStorage나 DB 없이 순수 파일 기반 관리

---

## 🎯 주요 기능

### 1. 사용자 페이지 (`/`)
- **JSON 파일 업로드**: 로컬에서 도서 데이터 JSON 파일 업로드
- **데모 모드**: demoData.json을 사용한 샘플 데이터 로드
- **도서 목록 표시**: 주제별 색상 구분
- **도서 상세 보기**: 모달로 도서 정보 표시

### 2. 관리자 페이지 (`/admin`)
- **도서 관리 탭**:
  - JSON 파일 업로드/다운로드
  - 도서 추가, 수정, 삭제
  - 주제별 필터링
  - 구매처별 필터링
  - 이미지 없는 도서 카운트
- **통계 탭**:
  - Chart.js를 활용한 시각화
  - 주제별 도서 수 차트
  - 구매처별 도서 수 차트
  - 연도별 구매 통계

### 3. 공통 기능
- **토스트 알림**: Pinia 스토어를 통한 알림 관리
- **반응형 디자인**: Tailwind CSS 기반 모바일/데스크톱 지원
- **다크 모드 지원**: (선택 사항)

---

## 🔧 핵심 유틸리티 함수

### src/utils/common.js

```javascript
// 디바운스 함수
debounce(func, wait, immediate)

// 랜덤 ID 생성
getRandomId()

// 통화 포맷팅
currency(value, nullTxt = '-')

// 랜덤 색상 생성
getRandomHtmlColor(min, max)
getRandomIntInclusive(min, max)

// HTML 색상 변환
convHtmlColorToInt(txt)

// 색상 큐 (주제별 색상 자동 할당)
class ColorQueue {
  enqueue(item)
  dequeue()
}
```

---

## 🚀 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
개발 서버가 http://localhost:3000 에서 실행됩니다.

### 3. 프로덕션 빌드
```bash
npm run build
npm run preview
```

### 4. 코드 린팅
```bash
npm run lint
```

---

## 📝 Nuxt 설정 (nuxt.config.ts)

```typescript
{
  ssr: false,                    // SSR 비활성화 (SPA 모드)
  debug: process.env.NODE_ENV !== 'production',
  srcDir: 'src/',                // 소스 디렉토리
  css: [
    '@vuepic/vue-datepicker/dist/main.css',
    '@/assets/css/main.css',
  ],
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  app: {
    head: {
      title: '방구석 도서관리',
      htmlAttrs: { lang: 'ko' }
    }
  }
}
```

---

## 🎨 스타일링 가이드

### Tailwind CSS 설정
- **폰트**: Apple SD Gothic Neo, NotoSans
- **플러그인**: @tailwindcss/aspect-ratio, @tailwindcss/forms

### 주제별 색상 시스템
`ColorQueue` 클래스를 사용하여 각 주제에 자동으로 색상 할당:
```javascript
const DEFAULT_COLOR = [
  '#FFEB99', '#B3CDFF', '#8AA8E5', '#CFE4E6',
  '#A3CCB8', '#AF99BF', '#E6B8A1', '#FFFAE5',
  '#E5EEFF', '#CCDDFF', '#E4EFF0', '#CFE5DA',
  '#D0C3D9', '#FFEEE6'
];
```

---

## 📊 상태 관리 (Pinia)

### Toast Store (src/store/toast.js)

알림 메시지를 관리하는 Pinia 스토어:

**State**:
- `toast.list`: 현재 표시 중인 토스트 목록
- `toast.keys`: 토스트 식별 키 목록
- `toast.listener`: 타이머 리스너

**Actions**:
- `OPEN_TOAST(payload)`: 토스트 표시
- `REMOVE_TOAST_ITEM(key)`: 토스트 제거
- `STOP_TOAST()`: 모든 토스트 제거

**사용 예시**:
```javascript
const store = useStore();
store.OPEN_TOAST({
  msg: '저장되었습니다.',
  timer: 3000,
  class: 'success'
});
```

---

## 🔄 데이터 흐름

### 1. 파일 업로드 흐름
```
사용자 파일 선택
  → FileSelect 컴포넌트
  → FileReader API로 JSON 파싱
  → Book 모델 인스턴스 생성
  → bookList reactive 배열에 저장
  → 화면 렌더링
```

### 2. 주제별 색상 할당
```
bookList 변경 감지 (watch)
  → 모든 도서의 주제 추출
  → 중복 제거 및 정렬
  → ColorQueue에서 색상 할당
  → topicColor 객체 업데이트
```

### 3. 통계 생성
```
bookList 데이터
  → 주제별/구매처별 그룹화
  → Chart.js 데이터 포맷 변환
  → StatBlock 컴포넌트에서 차트 렌더링
```

---

## 🐛 디버깅 팁

### 개발 모드 콘솔 로그
- `bookList` 변경 시 'changed' 로그 출력
- Nuxt DevTools 활성화 (debug: true)

### 일반적인 문제 해결
1. **JSON 파일 업로드 실패**: 파일 타입이 `application/json`인지 확인
2. **이미지 표시 안 됨**: `imageUrl` 경로가 올바른지 확인
3. **차트 렌더링 오류**: Chart.js 플러그인 등록 확인

---

## 📅 향후 개발 계획 (TODO)

현재 README.md에 명시된 계획:

### 우선순위 높음
- [ ] 추가 시 유효성 검사 및 필수 항목 표시
- [ ] 정렬 시 해당 값 목록에 표시
- [ ] 표지 이미지 에러 처리

### 향후 계획
- [ ] 복사 기능 (중복 구매 방지)
- [ ] 라우터 가드 (접근 권한 관리)

---

## 🤖 AI 개발자를 위한 가이드

### 코드 수정 시 주의사항

1. **상태 관리**:
   - Pinia 스토어 사용 시 actions를 통해서만 상태 변경
   - Reactive 데이터는 `.value`로 접근

2. **컴포넌트 통신**:
   - Props는 읽기 전용
   - Emit 또는 v-model로 부모-자식 통신

3. **파일 구조**:
   - 새 컴포넌트는 용도에 맞는 폴더에 배치
   - 공통 로직은 utils로 분리

4. **스타일링**:
   - Tailwind 유틸리티 클래스 우선 사용
   - 커스텀 CSS는 scoped style로 작성

### 새로운 기능 추가 가이드

#### 1. 새 도서 필드 추가
```javascript
// 1. src/models/book.js 수정
export class Book {
  newField = '';  // 추가

  constructor(item) {
    this.newField = item.newField || '';  // 추가
  }
}

// 2. 컴포넌트에서 사용
// src/components/admin/NewItem.vue 등에서 폼 필드 추가
```

#### 2. 새로운 통계 차트 추가
```javascript
// src/components/admin/StatBlock.vue
// Chart.js 데이터셋 추가
const chartData = {
  labels: [...],
  datasets: [{
    label: '새 통계',
    data: [...],
    backgroundColor: [...]
  }]
};
```

#### 3. 새로운 페이지 추가
```bash
# src/pages/new-page.vue 생성
# 라우팅은 Nuxt가 자동 처리
```

### 권장 개발 워크플로우

1. **기능 분석**: 요구사항 명확히 파악
2. **파일 탐색**: 관련 컴포넌트/유틸리티 확인
3. **모델 수정**: 필요시 Book 클래스 업데이트
4. **컴포넌트 구현**: UI 및 로직 작성
5. **상태 관리**: Pinia 스토어 업데이트
6. **테스트**: 데모 데이터로 동작 확인
7. **린팅**: `npm run lint` 실행

---

## 📚 참고 문서

- [Nuxt 3 Documentation](https://v3.nuxtjs.org)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Chart.js](https://www.chartjs.org/docs/latest/)
- [Netlify Deployment](https://v3.nuxtjs.org/docs/deployment)

---

## 💡 프로젝트 철학

이 프로젝트는 다음 원칙을 따릅니다:

1. **단순성**: 복잡한 백엔드 없이 JSON 파일로 관리
2. **실용성**: 실제 사용 가능한 개인 도서 관리
3. **학습**: Nuxt 3와 Vue 3 최신 기술 습득
4. **점진적 개선**: 틈틈이 기능 추가

---

## 🔐 라이선스

프로젝트의 라이선스 정보는 `/open-license` 페이지에서 확인할 수 있습니다.

---

**작성일**: 2025-11-16
**작성자**: AI Assistant
**버전**: 1.0.0

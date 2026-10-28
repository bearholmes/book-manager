# 디자인 토큰과 CSS 구성

Tailwind Plus·Catalyst의 작업 화면 구성과 간격, Slite의 색상 스타일을 참고한다.
기존 React 컴포넌트, CSS 변수, Tailwind, CSS Modules를 사용하며 새 헤드리스 UI 의존성은 없다.
공용 `PageHeader`, `SettingsSection`, `Table`, `Field`가 서재·통계·설정·입력 폼에 같은 규칙을 제공한다.

- [Catalyst UI Kit](https://tailwindcss.com/plus/ui-kit): 좁은 사이드바, 밝은 작업 영역, 제목·주요 행동·도구·목록의 위계
- [Tailwind Plus Ecommerce](https://tailwindcss.com/plus/ui-blocks/ecommerce): 표지와 정보를 분리한 상품 목록 구성
- [Slite](https://slite.com/): 밝은 아이보리 `#fdf9f4`, 본문 `#3f434a`, 주요 행동 `#2d2f34`, 코랄 `#f67748`

서재는 제목과 단일 추가 버튼, 한 줄 검색·필터·정렬 도구, 얇은 구분선의 표 순서로 구성한다.
중복 권수·설명, 저장 위치 배지, 사이드바 버전, 큰 빈 상태 카드와 중복 추가 버튼을 제거했다.
평문 JSON 기능은 화면·훅·명령·저장소 구현에서 제거했다. 백업·복원·초기화는 설정에서 제공한다.

## 적용 기준과 출처

이 앱은 공식 UI Kit 소스를 복사하거나 설치한 제품이 아니다. 공개된 Catalyst 데모와 문서의 실제
레이아웃·치수·상태 규칙을 확인해 공용 React 컴포넌트와 CSS 토큰에 적용한다.
앞선 수정은 색상과 일부 배치만 바꾼 상태였으며, 디자인 시스템 전체를 반영했다고 설명한 것은 부정확했다.

2026-10-26 데스크탑 브라우저에서 측정한 기준:

| 항목 | 공식 레퍼런스 | 앱 구현 위치 |
| --- | --- | --- |
| 셸 | 사이드바 256px, 바깥 여백 8px, 본문 여백 40px, 본문 모서리 8px | `DesktopLayout`, `PageContent`, 레이아웃 토큰 |
| 페이지 제목 | 20px / 32px, 굵기 600 | 모든 페이지의 `PageHeader` |
| 버튼·입력·선택 | 글자 14px / 24px, 높이 36px, 안쪽 5px / 11px, 모서리 8px | `Button`, `Input`, `Select`, `Textarea` |
| 탐색 항목 | 14px / 20px, 안쪽 8px, 아이콘 간격 12px, 높이 36px | `DesktopLayout` |
| 표 | 글자 14px / 24px, 제목 행 위아래 8px, 도서 행 위아래 16px, 셀 좌우 16px | 서재·통계 공용 `Table`; 통계는 dense 변형 |
| 설정 섹션 | 제목 14px / 24px, 설명과 입력 두 열, 열 간격 32px·행 간격 24px | `SettingsSection` |
| 필드 | 라벨 14px / 24px, 굵기 500, 입력 간격과 오류 영역의 일관성 | `Field`, `BookForm`, `PinSettings`, `PasswordField` |

측정 출처는 [Orders 데모](https://catalyst-demo.tailwindui.com/orders),
[Settings 데모](https://catalyst-demo.tailwindui.com/settings),
[Input 문서](https://catalyst.tailwindui.com/docs/input),
[Fieldset 문서](https://catalyst.tailwindui.com/docs/fieldset)다.

앱에 맞춘 차이는 Slite 계열 색상, 사용자 지정 마루부리, 검색 도구 모음, 도서 입력 옆 패널,
900px 이하의 176px 사이드바와 640px 이하 상단 탐색이다. 설정 영역은 컨테이너 폭이 768px 미만이면
한 열로 전환한다. 가상 표지 그리드의 컨테이너 측정과 JS 열 계산은 유지한다.

공용 규칙은 기본·호버·눌림·포커스·비활성 상태를 포함한다. 폼 오류는 `aria-invalid`, 오류 텍스트와
`aria-describedby`를 연결해 테두리와 안내를 함께 표시한다. 개별 화면에서 별도 치수를 덮어쓰지 않는다.

## 원본과 소유권

| 위치 | 책임 |
| --- | --- |
| `src/shared/theme/tokens.css` | 팔레트, 의미 색상, 폰트 스택, 모서리, 컨트롤 치수, 그림자, 레이어, 모션, 셸 레이아웃 토큰 |
| `src/shared/theme/fonts.css` | 번들 마루부리 400/600/700 등록 |
| `src/shared/theme/base.css` | 문서 기본 높이·배경·글자·제목 스타일 |
| `src/shared/theme/motion.css` | 공용 진입 키프레임과 모션 감소 설정 |
| `src/app/styles/globals.css` | 위 파일을 가져오고 Tailwind를 생성하는 진입점 |
| `tooling/config/tailwind.config.js` | CSS 토큰을 Tailwind 색상·그림자·모서리·포커스·모션 값에 연결 |
| 각 컴포넌트 옆 `*.module.css` | 해당 화면/컴포넌트만 사용하는 스타일 |

색상 원본은 CSS의 RGB 채널이다. 예를 들어 `--color-surface`는 `--palette-white`를 참조하고,
Tailwind의 `bg-surface/90`는 이 토큰을 90% 불투명도로 사용한다. 같은 값을 TS/설정 파일에 복제하지 않는다.

주요 의미 토큰은 다음과 같다.

- 배경: `surface`, `surface-muted`, `surface-subtle`, `surface-selected`
- 글자: `copy`, `copy-heading`, `copy-emphasis`, `copy-secondary`, `copy-muted`, `copy-subtle`, `copy-faint`, `on-solid`
- 경계/행동: `line`, `line-subtle`, `line-hover`, `action`, `action-hover`, `focus`
- 위험 상태: `danger`, `danger-hover`, `danger-text`, `danger-indicator`

`primary`, `accent`, `paper`는 원시 팔레트다. 일반 UI는 역할이 맞는 의미 토큰을 우선 사용한다.
주제 배경 14색과 차트 10색은 범주 구분용 팔레트로 별도 유지한다.
`shared/theme/data-colors.ts`는 CSS 변수 참조 문자열만 제공하며 실제 RGB 값은 `tokens.css`에만 둔다.
SVG의 fill/stroke, 주제 배경과 차트 툴팁도 같은 토큰을 사용한다.

## 공용 컴포넌트

- `Button`: `variant="primary|secondary|ghost|danger"`, `size="regular|compact|icon"`. 기본 type은 button이며 폼 제출은 `type="submit"`으로 명시한다. 아이콘만 있는 버튼은 접근성 이름을 제공한다.
- `Input`, `Select`, `Textarea`: 같은 기본 스타일을 사용하고 HTML props/ref를 전달한다. `controlSize="compact"`로 조밀한 선택 상자를 만들고, 검색 입력은 `withLeadingIcon`으로 왼쪽 여백을 확보한다.
- `FieldGroup`: 체크박스처럼 입력창 테두리 영역 안에서 묶어 보여주는 내용에 사용한다.
- `Surface`: `tone="card|muted"`와 `as="div|section"`으로 공용 표면을 구성한다.
- `PageContent`: 반응형 페이지 여백을 적용한다.
- `SettingsSection`: 설정 화면의 구분선·간격을 적용한다.
- `Spinner`: inline/sm/md/lg 크기를 제공한다. 기본 md는 32px, 테두리는 3px이다.

`!p-2`, `!py-1.5`로 공용 스타일을 덮어쓰지 않고 크기 API를 사용한다.
`className`은 배치나 기능 전용 보완에 사용한다. 모션 감소 설정의 `!important`는 사용자 선호를 우선하기 위한 예외다. 폼 플러그인의 `[type=...]` 선택자가 파일 로딩 순서에 따라
입력창 모서리·색을 덮어쓰지 않도록 Input의 기본 선택자는 두 클래스의 명시적인 우선순위를 갖는다.

Storybook의 `UI/Button`, `UI/Input`, 기존 Spinner/Modal/SidePanel 스토리에서 상태를 확인할 수 있다.

## 레이아웃과 모션

앱 셸은 `DesktopLayout.module.css`, 공용 표는 `Table.module.css`, 서재 전용 보완은 `BookTable.module.css`, 빈 서재는 `Library.module.css`,
잠금 화면은 `LockProvider.module.css`에 둔다. 공유 설정 구분선과 페이지 여백은 공용 UI가 소유한다.

사이드바는 256px, 페이지 안쪽 여백은 40px, 셸의 바깥 여백은 8px다.
기본 컨트롤은 높이 36px·안쪽 여백 5px/11px, 명시적인 compact 변형은 32px, 모서리는 8px다.
사이드바 폭과 본문 왼쪽 여백은 `--layout-sidebar-width`를 함께 사용한다.
창 너비 900px 이하에서는 기존 176px 사이드바를, 640px 이하에서는 상단 배치를 유지한다.
페이지 여백도 같은 레이아웃 토큰에서 조정한다. 기본 Tailwind 간격 체계는 그대로 사용하며 모든 숫자를 새 토큰으로 감싸지 않는다.

가상 도서 그리드는 창 너비가 아닌 컨테이너 폭으로 열 수를 계산한다. 기존 JS 계산과 행 측정값은 유지한다.
이를 CSS auto-fit으로만 바꾸면 가상화된 행과 실제 열 수가 달라질 수 있으므로 함께 검토해야 한다.

모달·사이드 패널과 토스트는 각각 overlay/toast 레이어 토큰을 사용한다.
모달·사이드 패널은 body 포털에 렌더링하고 공통 훅이 포커스·배경 inert·스크롤 잠금을 관리한다.
전역 알림은 활성 대화상자 안으로 포털을 옮겨 오류 안내가 배경과 함께 비활성화되지 않게 한다.
제목 ID는 인스턴스마다 생성한다. 주제 색상은 문자열에 따라 결정되므로 필터나 페이지 추가로 바뀌지 않는다.
모션 감소 설정에서는 CSS 진입/호버/스피너 애니메이션과 전환을 최소화한다.
Recharts처럼 JS로 움직이는 차트는 `useReducedMotion`으로 OS 설정 변경을 구독해 애니메이션을 끈다.

마루부리 Regular/SemiBold/Bold WOFF2를 공식 Naver 웹폰트 배포본 그대로 포함한다.
`--font-body`와 `--font-heading`은 동일한 MaruBuri 계열을 사용한다. 외부 CDN 요청은 필요 없다.
출처·저작권 안내·SIL OFL 1.1 전문은 `src/shared/assets/fonts/maru-buri/LICENSE.txt`에 보관하며
네이티브 앱에도 `views/main/licenses/MaruBuri.txt`로 포함한다.

## 검증

```sh
pnpm check
pnpm test --run
pnpm test:desktop
pnpm test:e2e
pnpm exec storybook build --config-dir tooling/storybook --output-dir build/storybook
pnpm build
```

기존 CRUD·검색·PIN·백업/복원/초기화 시나리오에 스타일 E2E를 추가했다.
스피너의 실제 테두리, 의미 토큰 변경 반영, 컨트롤 치수·검색 포커스, 작은 창 배치,
범주/SVG 색상과 모션 감소를 계산된 브라우저 스타일로 검증한다.
E2E는 시나리오와 재시도마다 별도 프로세스·키·임시 저장소를 사용하고 한 워커에서 순서대로 실행한다.

스크린샷·테스트 데이터는 Git에 포함하지 않는다. 글꼴 로드와 동일 출처 요청도 E2E에서 검사한다.

2026-10-26: 린트·타입·구조 검사, 프런트엔드 99개·데스크탑 23개·E2E 5개,
개발·stable·Storybook 빌드가 통과했다. 별도 임시 서재에서 입력·목록·표지를 확인하고,
실제 macOS 앱을 새 빌드로 다시 열어 서재·설정의 두 열 배치와 글꼴을 확인했다.

### 상세 화면과 표지 목록 보완

도서 상세에 남아 있던 항목별 배경 카드와 30px 제목을 제거했다. 제목은 공용 모달의
16px/24px 위계로 표시하고, 서지·구매 정보는 `dl`의 라벨/값 행과 얇은 구분선으로 묶는다.
본문은 14px/24px, 섹션 간격은 32px, 모달 안쪽은 32px(작은 창 24px)다.
삭제는 왼쪽 보조 행동, 수정은 오른쪽 주요 행동으로 배치한다.

표지 목록은 Product Lists의 이미지/텍스트 분리와 간격을 따라 열 24px·행 40px,
이미지 아래 16px로 조정했다. 도서 표지가 잘리지 않도록 `object-fit: contain`을 사용한다.
가상 그리드의 컨테이너 열 계산과 실제 행 높이 측정은 유지했다.

이 보완은 상세·표지 목록·공용 모달에 한정한다. 브라우저 임시 서재에서 상세와 표지 보기를
확인했으며, 이 기록 자체가 전체 디자인의 완성이나 사용자 승인을 의미하지 않는다.


### 레퍼런스 대조 기록

| 확인한 원본 | 관찰한 규칙 | 반영 위치 |
| --- | --- | --- |
| [Catalyst Events](https://catalyst-demo.tailwindui.com/events) | 제목 아래 도구 간격 16px, 도구 사이 16px, 주요 행동 하단 정렬 | PageHeader의 tools 슬롯과 Library |
| 같은 페이지의 셸 | 본문 최대 1152px, 가운데 정렬, 탐색 항목 간격 2px, 아이콘 20px, 선택 표시 2px | PageContent, DesktopLayout |
| [Description list](https://catalyst.tailwindui.com/docs/description-list) | 라벨 열 min(50%, 320px), 행 상하 12px, 본문 14px/24px | BookDetailModal |
| [Dialog](https://catalyst.tailwindui.com/docs/dialog) | 패널 여백 32px, 모서리 16px, 제목 16px/24px | Modal |

서재의 주제·구매처 필터와 보기 전환은 앱에 필요한 추가 요소이며 Events 원본에 있는 요소라고
주장하지 않는다. 표 형태는 Orders 레퍼런스를 유지한다. Slite 색상과 마루부리도 사용자 지정이다.
이 표의 치수는 해당 페이지 DOM과 계산된 스타일을 직접 확인한 값이다.

### 테마

설정의 테마 선택은 시스템(기본값)·다크·라이트를 제공한다. 선택은 로컬에 저장하며,
시스템 선택 시 OS의 색상 모드 변경을 즉시 따른다. 도서 데이터 초기화·복원은 테마 선택을 유지한다.
`shared/theme/theme.ts`가 React 렌더링 전에 `html[data-theme]`을 설정하고 시스템 변경을 구독한다.
`tokens.css`의 다크 의미 토큰은 배경·글자·테두리·포커스·위험 안내·주제·차트 색상을 함께 바꾸며,
`color-scheme`으로 기본 폼 컨트롤과 스크롤바도 맞춘다.

### Tailwind 4 빌드

Tailwind는 `@tailwindcss/vite`로 처리한다. 전역 진입점은 `@import "tailwindcss"`와
기존 JS 설정을 연결하며, `@apply`를 사용하는 CSS Modules는 `@reference`로 전역 테마를 참조한다.
기본 스타일인 `base.css`는 전역 진입점으로 다시 참조하지 않아 순환을 피한다.
가로세로 비율은 기본 `aspect-*` 유틸리티를 사용하고 별도 플러그인은 설치하지 않는다.

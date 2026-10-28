---
version: alpha
name: 방구석 도서관리
description: 조용한 개인 서재 — 책의 온기와 데스크톱 도구의 명료함을 결합한 승인 전 디자인 제안.
colors:
  primary: "#365C48"
  light-canvas: "#F6F3ED"
  light-chrome: "#ECE8DF"
  light-surface: "#FBF9F5"
  light-raised: "#FFFEFA"
  light-hover: "#EEEAE2"
  light-selected: "#E3EBE3"
  light-nav-selected: "#5B6B53"
  light-nav-selected-hover: "#52624A"
  light-nav-on-selected: "#FBF9F5"
  light-nav-hover: "#E3DFD5"
  light-ink: "#292C28"
  light-secondary: "#565B53"
  light-muted: "#64695F"
  light-rule: "#D7D5CB"
  light-control: "#82867A"
  light-action: "#365C48"
  light-action-hover: "#294B39"
  light-action-pressed: "#203D2E"
  light-on-action: "#FFFFFF"
  light-focus: "#365C48"
  light-danger: "#A53E36"
  light-danger-hover: "#8C302A"
  light-danger-subtle: "#F7E8E4"
  light-danger-solid: "#A53E36"
  light-on-danger: "#FFFFFF"
  light-success: "#356147"
  light-success-subtle: "#E5EEE4"
  light-warning: "#79551C"
  light-warning-subtle: "#F5ECD7"
  light-info: "#3D5E75"
  light-info-subtle: "#E6EDF1"
  light-disabled: "#E4E1DA"
  light-on-disabled: "#5C6157"
  light-overlay: "#171C18"
  light-chart-1: "#365C48"
  light-chart-2: "#466880"
  light-chart-3: "#8C5A42"
  light-chart-4: "#76613D"
  light-chart-5: "#735775"
  light-chart-6: "#4C7070"
  light-category-ink: "#292C28"
  light-category-1: "#E5EDF6"
  light-category-2: "#D9E6F4"
  light-category-3: "#E9EFDF"
  light-category-4: "#F1E7D4"
  light-category-5: "#F5E1CF"
  light-category-6: "#E8F1EB"
  light-category-7: "#E6EBE2"
  light-category-8: "#F4E8E0"
  light-category-9: "#DBE8EC"
  light-category-10: "#E3DFEF"
  light-category-11: "#F2EBDD"
  light-category-12: "#ECE3D8"
  light-category-13: "#F6E3D5"
  light-category-14: "#E0E8F1"
  dark-canvas: "#20231F"
  dark-chrome: "#1B1E1B"
  dark-surface: "#272B26"
  dark-raised: "#30362F"
  dark-hover: "#343B32"
  dark-selected: "#364C3E"
  dark-nav-selected: "#364C3E"
  dark-nav-selected-hover: "#364C3E"
  dark-nav-on-selected: "#EEEDE5"
  dark-nav-hover: "#343B32"
  dark-ink: "#EEEDE5"
  dark-secondary: "#C5C9BE"
  dark-muted: "#B1BAAA"
  dark-rule: "#474E43"
  dark-control: "#7C8974"
  dark-action: "#B1CBB4"
  dark-action-hover: "#C4DAC5"
  dark-action-pressed: "#9FBDA4"
  dark-on-action: "#1C3023"
  dark-focus: "#C0D9B9"
  dark-danger: "#F0AAA2"
  dark-danger-hover: "#F8C0B9"
  dark-danger-subtle: "#492F2C"
  dark-danger-solid: "#963F37"
  dark-on-danger: "#FFFFFF"
  dark-success: "#B1CCAF"
  dark-success-subtle: "#2C4030"
  dark-warning: "#E4C589"
  dark-warning-subtle: "#433B29"
  dark-info: "#AEC9DF"
  dark-info-subtle: "#2C3D49"
  dark-disabled: "#373D33"
  dark-on-disabled: "#ABB3A3"
  dark-overlay: "#101510"
  dark-chart-1: "#B1CBB4"
  dark-chart-2: "#A2BED5"
  dark-chart-3: "#D4AA8E"
  dark-chart-4: "#CBB984"
  dark-chart-5: "#C2A9C6"
  dark-chart-6: "#98C4C0"
  dark-category-ink: "#EEEDE5"
  dark-category-1: "#2D3949"
  dark-category-2: "#283A4F"
  dark-category-3: "#303C2A"
  dark-category-4: "#443927"
  dark-category-5: "#493324"
  dark-category-6: "#263C31"
  dark-category-7: "#2E392B"
  dark-category-8: "#46332B"
  dark-category-9: "#233B41"
  dark-category-10: "#372F47"
  dark-category-11: "#413B2B"
  dark-category-12: "#3E352B"
  dark-category-13: "#4A3124"
  dark-category-14: "#2A3749"
typography:
  h1:
    fontFamily: MaruBuri
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  book-title:
    fontFamily: MaruBuri
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
  body-md:
    fontFamily: Pretendard Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5714
  ui:
    fontFamily: Pretendard Variable
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5385
  caption:
    fontFamily: Pretendard Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  memo:
    fontFamily: MaruBuri
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.8
rounded:
  sm: 4px
  md: 6px
  lg: 10px
spacing:
  micro: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  section: 40px
components:
  button-primary:
    backgroundColor: "{colors.light-action}"
    textColor: "{colors.light-on-action}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.light-action-hover}"
    textColor: "{colors.light-on-action}"
  button-primary-pressed:
    backgroundColor: "{colors.light-action-pressed}"
    textColor: "{colors.light-on-action}"
  button-primary-dark:
    backgroundColor: "{colors.dark-action}"
    textColor: "{colors.dark-on-action}"
  button-primary-dark-hover:
    backgroundColor: "{colors.dark-action-hover}"
    textColor: "{colors.dark-on-action}"
  button-primary-dark-pressed:
    backgroundColor: "{colors.dark-action-pressed}"
    textColor: "{colors.dark-on-action}"
  input:
    backgroundColor: "{colors.light-raised}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.md}"
    height: 36px
  input-dark:
    backgroundColor: "{colors.dark-raised}"
    textColor: "{colors.dark-ink}"
  selected:
    backgroundColor: "{colors.light-selected}"
    textColor: "{colors.light-action}"
  selected-dark:
    backgroundColor: "{colors.dark-selected}"
    textColor: "{colors.dark-ink}"
  disabled:
    backgroundColor: "{colors.light-disabled}"
    textColor: "{colors.light-on-disabled}"
  disabled-dark:
    backgroundColor: "{colors.dark-disabled}"
    textColor: "{colors.dark-on-disabled}"
  danger:
    backgroundColor: "{colors.light-danger-solid}"
    textColor: "{colors.light-on-danger}"
  danger-dark:
    backgroundColor: "{colors.dark-danger-solid}"
    textColor: "{colors.dark-on-danger}"
  navigation-selected:
    backgroundColor: "{colors.light-nav-selected}"
    textColor: "{colors.light-nav-on-selected}"
  navigation-selected-hover:
    backgroundColor: "{colors.light-nav-selected-hover}"
    textColor: "{colors.light-nav-on-selected}"
  navigation-hover:
    backgroundColor: "{colors.light-nav-hover}"
    textColor: "{colors.light-secondary}"
  navigation-selected-dark:
    backgroundColor: "{colors.dark-nav-selected}"
    textColor: "{colors.dark-nav-on-selected}"
  navigation-selected-dark-hover:
    backgroundColor: "{colors.dark-nav-selected-hover}"
    textColor: "{colors.dark-nav-on-selected}"
  navigation-dark-hover:
    backgroundColor: "{colors.dark-nav-hover}"
    textColor: "{colors.dark-secondary}"
---

## Overview

# 방구석 도서관리 — 디자인 방향 제안

**상태: B 방향을 실제 앱에 적용 중. 제품명 변경 없음. 전체 입력 화면과 네이티브 외관은 별도 디자인 검토 대상이다.**

이 문서는 이 독립 프로젝트에만 적용한다. 다른 서비스의 공통 브랜드/색상 시스템이 아니다.
내부 컨셉명은 **조용한 개인 서재(Reading Room)**. 제품의 이름은 언제나 **방구석 도서관리**다.

**책은 따뜻하게, 조작은 명료하게.** 종이의 감각을 낡은 질감이나 나무 선반으로 재현하지 않는다.
미색의 표면, 먹빛 글자, 제본 천을 연상시키는 녹색과 한국어 세리프의 조합으로 표현한다.

- 주 표면 유형: **Explore** — 소장 도서 검색·분류·재발견. 보조 유형은 Configure(설정·입력).
- 대상: 개인 소장 도서와 구매 이력을 로컬에서 관리하는 사용자. 별도 독서 상태·SNS·추천 기능은 추가하지 않는다.
- 기본 구성: 좁은 탐색부 + 넓은 도서 영역. 제목 → 검색/필터 → 결과. 장식용 통계와 마케팅 히어로는 없다.
- 현재 근거: `README.md`, `docs/design-system.md`, `src/shared/theme/`, 실제 브라우저의 빈 서재 라이트/다크 화면.
- 시안 데이터: `src/test/mockData.ts`의 두 도서만 사용. 실사용자 데이터나 검증된 서지 데이터가 아니다.

### 비교한 세 가지 방향

| 방향 | 구성·타이포그래피 | 장점 | 포기하는 것 |
| --- | --- | --- | --- |
| A. 정갈한 소장목록 | 조밀한 표, 중립색 조작부, 도서명만 세리프 | 검색·기록 속도, 낮은 이전 비용 | 종이의 감각과 독자적 인상은 약함 |
| **B. 조용한 개인 서재 — 추천** | 따뜻한 중립색 셸, 세리프 제목/도서명, 녹색 선택, 표와 표지 동등 지원 | 책의 정체성과 데스크톱 효율의 균형 | 전면 세리프와 강한 질감은 사용하지 않음 |
| C. 편집자의 서가 | 큰 세리프·표지 중심, 넓은 행간, 상단 탐색 | 소장품을 감상하는 인상이 강함 | 한 화면 정보량·빠른 반복 입력에 불리함 |

세 안의 차이는 색상만이 아니라 정보 밀도·탐색 위치·타이포그래피 비중이다. B만 상세 토큰화한다.
A/C의 축소 보드는 취향 경계를 비교하는 용도이며 완성된 대안 제품이 아니다.

### 조사한 사례와 채택 범위

- [Bear 공식 Mac 화면](https://bear.app/): 탐색·목록·본문을 역할로 구분. 차용: 조용한 조작부와 콘텐츠 중심 위계. 미채택: 검은 사이드바, 빨간 선택 장식, 3열 구조의 직접 복제.
- [Things macOS 26 공식 화면](https://culturedcode.com/things/blog/2025/09/things-for-os-26/): 반복 항목의 정렬, 선택과 그룹의 절제. 차용: 의미 단위 간격과 즉각적 조작. 미채택: Liquid Glass·Magic Plus 효과.
- [getdesign.md / Oura](https://getdesign.md/oura/design-md): 종이색·에디토리얼 세리프와 조용한 산세리프의 역할 분리. 독립적인 제3자 분석이며 공식 Oura 디자인 시스템이 아님. 마케팅 레이아웃은 이 앱에 이식하지 않는다.
- [getdesign.md / Notion](https://getdesign.md/notion/design-md), [Claude](https://getdesign.md/claude/design-md): 토큰·역할·금지 규칙을 함께 명세하는 방식 참고. 각 브랜드의 파랑·코랄·히어로·알약 CTA는 채택하지 않음. 사이트의 템플릿 예시 수치·데이터도 가져오지 않음.
- [21st.dev](https://21st.dev/): 공개 인터랙티브 UI 카탈로그를 살펴봄. 이 단계에서는 특정 컴포넌트 소스/패키지를 복사·설치하지 않음. 검색·선택·패널 전환만 자체 CSS로 시연. 도입하려면 개별 라이선스·키보드·모션 감소를 먼저 검토한다.
- [Apple HIG / Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography): 의미색과 양 모드 검증, 작은 글자의 가독성. 네이티브 준수/인증을 의미하지 않는다.

## Colors

YAML의 `light-*` / `dark-*`가 **제안 색상 원본**이다. `primary`는 스키마 호환용 `light-action`의 별칭이다.
`docs/design/reading-room.tokens.json`(DTCG)과 `reading-room.tokens.css`는 생성물이다.
런타임 색상 원본은 `src/shared/theme/tokens.css`다. 시안 생성물은 앱에서 import하지 않는다.
제안과 실제 적용의 차이 및 미검증 항목은 구현 결과와 디자인 리뷰에서 별도로 확인한다.

색상 검사기는 YAML↔DTCG의 키 집합과 HEX를 양방향 비교하고, 실패 시 기존 CSS/보고서를 갱신하지 않는다.
**비색상 기준은 이 문서의 YAML 및 본문 표다.** CSS의 반경·입력/UI 글자 크기는 DTCG에서 읽지만,
OS별 확장 서체 스택·모션 별칭 및 HTML의 나머지 간격/행높이는 수동 관리한다.
CLI 0.4.0 DTCG export에는 현재 숫자 lineHeight가 포함되지 않으므로 export를 전체 서체 명세로 간주하지 않는다.
검사기의 통과는 비색상 토큰 전체 동기화 보증이 아니다. 변경 시 명세↔시안 수동 리뷰를 함께 수행한다.

| 역할 | 라이트 | 다크 | 적용 |
| --- | --- | --- | --- |
| canvas | `#F6F3ED` | `#20231F` | 작업 영역 바탕 |
| chrome | `#ECE8DF` | `#1B1E1B` | 사이드바·유틸리티 |
| surface | `#FBF9F5` | `#272B26` | 도서 목록·설정 표면 |
| raised | `#FFFEFA` | `#30362F` | 입력·메뉴·대화상자 |
| ink | `#292C28` | `#EEEDE5` | 제목·본문 |
| secondary | `#565B53` | `#C5C9BE` | 저자·라벨 |
| muted | `#64695F` | `#B1BAAA` | 메타·플레이스홀더, 정보에는 opacity 금지 |
| action | `#365C48` | `#B1CBB4` | 주요 행동·링크 |
| on-action | `#FFFFFF` | `#1C3023` | 주요 버튼 글자 — 모드별 분리 필수 |
| selected | `#E3EBE3` | `#364C3E` | 보기 전환·일반 선택 |
| nav-selected | `#5B6B53` | `#364C3E` | LNB 현재 위치 전용 |
| nav-on-selected | `#FBF9F5` | `#EEEDE5` | 선택 LNB의 아이콘·글자 |
| nav-hover | `#E3DFD5` | `#343B32` | 비선택 탐색 항목의 호버 |
| rule | `#D7D5CB` | `#474E43` | 장식적 구분선만 |
| control | `#82867A` | `#7C8974` | 입력 경계·비선택 컨트롤 식별 |
| focus | `#365C48` | `#C0D9B9` | 2px 외곽선·2px 간격 |

- 라이트는 노란 세피아가 아닌 저채도 종이색. 다크는 푸른 차콜이 아닌 녹색 기운의 먹색. 단순 반전 금지.
- 다크 주요 버튼은 밝은 제본 녹색 + 짙은 글자. 라이트의 흰 글자를 그대로 재사용하지 않는다.
- `rule`은 3:1의 기능적 경계를 의도하지 않음. 입력창·체크박스·구분 필수 컨트롤에는 `control`을 사용한다.
- `danger`는 경고 텍스트/아웃라인, `danger-solid`는 최종 삭제 확인의 채움색. `on-danger`는 별도 역할이다.
- 오류·성공·주의·정보는 색과 문구/아이콘을 함께 표시. 주의와 중복구매를 즉시 삭제와 같은 강도로 칠하지 않는다.
- **주제 칩의 다양한 색상은 보존한다.** 기존 `src/shared/theme/tokens.css`의 14색 및 라이트/다크 대응을 같은 순서로 재사용하고, 글자는 `category-ink`를 사용한다. 주제→색상 인덱스는 기존 `topic-colors.ts`의 NFC 정규화·FNV-1a·mod 14 규칙을 유지한다. 같은 주제는 목록/표지·필터·정렬·추가 페이지에서도 같은 색이다. 유한 팔레트이므로 서로 다른 주제의 색이 겹칠 수 있으며, 색만으로 주제를 전달하지 않고 이름을 항상 표시한다. 통일할 대상은 칩의 높이·안쪽 여백·모서리·서체 규격이지 분류 색상이 아니다. 도서 카드 전체에 색 배경을 넓히지는 않는다.
- 차트는 제공한 `chart-1..6`을 범주 구분용으로만 사용. 범주가 더 많으면 별도 승인 후 확장하고, ‘기타’ 집계는 제품 결정이 필요하다. 현재 10색/14색 토큰을 무조건 6개로 치환하지 않는다.
- 차트에는 직접 라벨·범례·데이터 표를 제공하고, 인접 색 구분은 선 패턴/점 모양을 병행한다. 팔레트 대비 검사는 인접 색 간 판별 검증이 아니다.
- 책 표지는 원색·비율 유지, `object-fit: contain`. 다크 모드에서도 필터·반전·일괄 어둡게 하기 금지.
- 전체 표면에 노이즈 이미지를 덮지 않는다. 종이감은 색·타이포·얇은 선으로 표현한다.

## Typography

**‘책의 언어’는 마루부리, ‘도구의 언어’는 번들 Pretendard.** 세리프 삭제가 아니라 사용 위치의 재정의다.

| 용도 | 서체 | 크기/행높이 | 굵기 |
| --- | --- | --- | --- |
| 화면 제목 | 번들 MaruBuri | 24/36px | 600 |
| 도서명(표) | MaruBuri | 16/24px | 600 |
| 상세 도서명 | MaruBuri | 22/33px | 600 |
| 도서 메모 | MaruBuri | 15/27px | 400 |
| 본문·입력 값 | Pretendard Variable | 14/22px | 400 |
| 탐색·도구·버튼 | Pretendard Variable | 13/20px | 500–600 |
| 날짜·ISBN·설명 | Pretendard Variable | 12/18px | 400 |

- 산세리프 스택: `'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif`. Pretendard 1.3.9 variable은 로컬 번들이며 오프라인에서 사용한다.
- 시스템 폰트는 번들 글꼴을 사용할 수 없을 때의 폴백이다. 다른 OS에서 글꼴·폭은 다시 검증한다.
- 기존 번들 마루부리 400/600/700과 SIL OFL 고지를 재사용. 새 CDN/유료 글꼴 의존성 없음.
- 날짜·가격·권수는 `font-variant-numeric: tabular-nums`. ISBN에 불필요한 자간 장식 금지.
- 한글 제목 음수 자간은 최대 -0.02em, 작은 UI는 0. 긴 제목은 표에서 자연 줄바꿈, 표지에서는 2줄 말줄임 + 전체 제목 접근성 이름 제공.

## Layout

### 데스크톱 셸

- 기준: 기존 네이티브 기본 창 1360×900. 웹 페이지를 둥근 카드 안에 넣는 외곽 8px 프레임은 제거하는 제안.
- 네이티브 타이틀바·창 버튼은 OS가 소유. HTML로 신호등/가짜 드래그 바를 그리지 않는다. 통합 타이틀바는 별도 네이티브 검증 후 결정한다.
- 사이드바 208px, 좌우 12px, 탐색 높이 36px. 브랜드명은 13px로 한 줄 유지.
- 작업 영역 좌우 32px, 상하 28px. 제목/도구 영역 24px 간격, 도구 아래 20px.
- 제목 왼쪽·검색 왼쪽·표 첫 열 왼쪽을 같은 축에 정렬. 주요 행동은 제목 행 우측, 보기 전환은 결과 도구 우측.
- 표는 전체 가용 폭 사용; 설정은 읽기 폭 880px 이내, 폼은 560px 이내. 모든 화면에 하나의 중앙 마케팅 max-width를 강요하지 않는다.
- 도서 행은 기본 72px(최소), 제목 24px + ISBN 18px, 좌우 12px·상하 14px. 긴 제목/확대 시 행 높이 증가 허용. 의미 없는 행별 카드/그림자 없음.
- 공통 간격: 4 / 8 / 12 / 16 / 24 / 32 / 40px. 같은 그룹은 8–12px, 다른 그룹 24–32px, 섹션 40px.
- 표지 그리드는 **기존 컨테이너 측정·열 계산·가상 행 높이 측정 유지**. CSS auto-fit 단독 대체 금지. 이 컨셉 시안의 정적 2권 그리드는 가상화 구현 검증이 아니다.

### 창 크기와 확대

| 폭 | 동작 |
| --- | --- |
| ≥1100px | 208px 사이드바, 32px 본문 여백, 검색·필터 한 줄(여유 없으면 줄바꿈) |
| 761–1099px | 사이드바 176px, 여백 24px, 검색 전체 줄 + 나머지 도구 다음 줄 |
| ≤760px | 상단 브랜드·3개 탐색으로 재배치, 여백 16px, 도구 줄바꿈, 모달 폭은 창−32px |
| ≤480px 또는 coarse pointer | 컨트롤 44px 이상. 표는 ‘도서/저자’ 우선 2열; 구매 정보는 상세에서 접근 |

창 폭 기준은 제품 코드에 적용하기 전 승인 대상이다. 웹 안전망 360px/200% 확대를 함께 확인한다.
창 높이가 작으면 내용 영역과 대화상자가 스크롤되며 닫기/취소/저장은 화면 밖으로 사라지지 않아야 한다.

## Elevation & Depth

- 기본 셸·표: 그림자 없음. 표면의 명도와 1px 구분선으로 충분하다.
- 메뉴: raised + rule, `0 6px 20px rgb(20 28 21 / 0.12)`.
- 모달/사이드 패널: raised + rule, `0 16px 48px rgb(12 20 14 / 0.20)`; 다크 0.40.
- 스크림: overlay 42%(라이트)/60%(다크). 반투명 표면/배경 블러 없음.
- 다크는 위로 뜨는 표면일수록 조금 밝아진다. 모달을 더 검게 만드는 반전식 계층 금지.

## Shapes

컨트롤 6px, 태그 4px, 대화상자 10px. 도서 표지는 원본 모서리를 존중한다.
페이지 전체를 16–24px 둥근 카드로 감싸지 않는다. 알약 버튼은 기본 형태가 아니다.

## Components

- **버튼**: 36px, 좌우 12px, 13/20px·600, 아이콘 16px·간격 6px. compact는 32px. 화면의 주 행동은 하나. hover/pressed는 명시 토큰, 밝기 필터로 전체 글자까지 변형하지 않는다.
- **비활성**: disabled/on-disabled 조합. 전체 opacity로 경계·글자 대비를 함께 무너뜨리지 않는다. loading은 폭 유지·문구 + 14px 스피너, 중복 제출 차단.
- **입력**: 높이 36px, raised, control 경계. label 영구 표시, placeholder로 라벨 대체 금지. focus는 2px/2px. 오류는 aria-invalid + 연결된 안내 문구. 오류 위에도 focus 식별 유지.
- **탐색**: 현재 위치는 `nav-selected`/`nav-on-selected` + 600 굵기 + `aria-current`로 표현한다. 라이트는 저채도 올리브 채움과 미색 아이콘·글자, 비선택 호버는 따뜻한 회색이다. 현재 항목에 호버해도 선택색을 유지하며 `nav-selected-hover`로만 약하게 어두워진다. 다크의 기존 외관은 유지한다. 그림자·외곽선·왼쪽 장식 띠는 쓰지 않는다. 포커스는 별도의 2px 외곽선/2px 간격으로 표시한다. 일반 보기 전환의 연한 `selected`와 LNB의 현재 위치를 같은 토큰으로 묶지 않는다. 설정/통계도 같은 상태 규칙. 현재 기능이 없는 탐색 카테고리는 추가하지 않는다.
- **아이콘**: Lucide 유지 권장. OS 네이티브 아이콘과 임의 혼합 금지. 16px UI/18px 탐색, stroke 1.75, round cap/join. 이름만으로 불명확한 추상 아이콘 교체보다 텍스트 라벨을 우선한다. 선택은 크기/아이콘 모양 변경 없이 배경과 글자색으로 표시.
- **브랜드 아이콘**: 기존 앱 로고 유지. 시안에서는 기존 로고를 보존해 평가한다. 새 심볼/앱 아이콘은 별도 승인 없이는 제작·교체하지 않는다. 제품명 변경 금지.
- **도서 상세**: 기존 모달 경로 유지. 서지/구매/메모를 dl + 구분선으로 구성. 덩어리별 카드 중첩 금지. 상세를 상시 3열 inspector로 바꾸는 것은 별도 UX 변경이다.
- **도서 추가/수정**: 기존 SidePanel을 재사용. 섹션 제목은 14px 산세리프, 메모 값은 세리프. 입력창은 한 줄 정렬; 취소·저장 하단 유지. ISBN 보조 입력은 시각적 주 행동을 도서 저장과 경쟁시키지 않는다.
- **설정**: 24px 세리프 화면 제목 + 14px 산세리프 섹션 제목, 설명/컨트롤 2열. 컨테이너 640px 미만이면 1열. PIN·백업·복원·초기화는 기존 동작 보존.
- **빈 상태**: 빈 서재와 검색 결과 없음 구분. 과한 일러스트 없음. 빈 서재는 ‘아직 등록된 도서가 없습니다. 도서 추가로 첫 책을 기록하세요.’, 검색 실패는 ‘일치하는 도서가 없습니다.’ + 검색 초기화. 기존 상단 도서 추가 버튼과 중복한 주요 버튼을 늘리지 않는다.
- **알림**: 성공은 짧게 role=status, 오류는 role=alert와 재시도. 사실 확인 없이 ‘안전하게 저장됨’ 등 신뢰 문구를 장식으로 넣지 않는다.

### 인터랙션·모션

| 상황 | 제안 | 감소 모션 |
| --- | --- | --- |
| 버튼/행 hover | 100ms 색 전환; 위치 이동 없음 | 즉시 색 변경 |
| 목록↔표지 | 120ms 이하 불투명도; 레이아웃을 기다리게 하지 않음 | 즉시 전환 |
| 패널 열기 | 기존 overlay 수명주기 내 160ms·8px 이내 | 이동·페이드 없음 |
| 모달 | 140ms 불투명도; scale/bounce 없음 | 즉시 표시 |
| 검색 | 기존 디바운스 유지, 지연되면 ‘검색 중’ 상태 | 동일, 의미 전달에 애니메이션 의존 금지 |

자동 재생 장식·마우스 추적 광택·shimmer CTA·3D 책 기울기·스크롤 패럴랙스는 기본 UI에서 제외한다.
포커스 trap/복원·배경 inert·Escape는 기존 overlay 훅을 재사용. 테마 전환에는 전역 색 애니메이션 없음.
시스템/라이트/다크의 기존 설정과 로컬 저장 정책 유지(시스템 기본). HIG의 시스템 외관 우선 원칙을 존중하되 기존 명시 선택 기능을 임의 삭제하지 않는다.

## Do's and Don'ts

- DO: 제품명 보존, 번들 세리프 활용, 공통 토큰·Button/Input/Surface API 재사용, 원색 표지 보존, 키보드로 모든 기능 접근.
- DON'T: 공통 서비스 브랜드 차용, 코랄·청회색·녹색을 동등한 주색으로 혼용, 직접 HEX/원시 팔레트로 개별 화면 덮어쓰기, 기능 없는 장식 수치.
- DON'T: 미승인 콘셉트를 기존 승인 디자인으로 기록하거나 앱 전체 접근성/네이티브 검증을 선언.

### 개발 인계·수용 기준

1. 승인 후 `tokens.css`에 RGB 채널 형태로 통합. 기존 `surface-muted→chrome`, `surface-subtle→hover`, `text→ink`, `text-muted/subtle→muted`, `border→control`, `border-subtle→rule`, `action/on-solid→action/on-action`로 역할별 검토. `text-faint`는 정보성 내용에 유지하지 않는다.
2. `--font-body`는 UI 산세리프, `--font-heading`/새 `--font-book`은 MaruBuri로 역할 분리. BookTable 제목·BookCard 제목·메모는 명시 적용. 기존 전역 font-serif만 바꿔 끝내지 않는다.
3. DesktopLayout → PageHeader/Filters → Table/Card → Settings/Form/Overlays → Statistics/Lock/Notifications 순으로 적용. 라이브러리·CRUD·PIN·백업/복원·ISBN 보조 입력 동작은 변경하지 않는다.
4. 1360×900, 1024×768, 800×600, 640×700, 360×780, 200% 확대에서 잘림·도구 충돌 없음. 긴 도서명/표지 없음/대량 도서 가상화 별도 확인.
5. 실제 사용 텍스트 4.5:1 이상, 기능적 경계/포커스 3:1 이상. 구분선·disabled 예외와 인접 차트 색 판별은 별도 보고. hover/pressed/selected/error/loading까지 양 테마 확인.
6. 시스템 모드 변경·첫 프레임 테마·키보드 순서·모달 Escape/복원·스크린리더·OS 모션 감소·고대비를 확인한다. 프로토타입 검증을 제품의 WCAG 적합성으로 간주하지 않는다.
7. `pnpm check`, 관련 Vitest/E2E, 네이티브 빌드 및 패키지 renderer 일치 확인. 실제 macOS 앱에서 별도 스크린샷 리뷰 후 완료 판정.

### 승인 필요 사항

이번 승인 대상은 **컨셉·색상·서체 역할·서재 셸 방향**이다. 입력 시연은 두 필드의 상태 확인용이며
전체 BookForm/편집 플로우의 밀도·고정 취소/저장 동작에 대한 승인을 포함하지 않는다.
해당 화면은 실제 기능 전체를 배치한 후 별도 네이티브 리뷰를 받는다.

- B 방향 선택 여부. A/C는 취향 비교용이다.
- 조작부 산세리프 / 도서·제목 세리프 역할 분리 동의 여부.
- 셸 외곽 카드 제거와 208px 사이드바. 현재 사용자 작업 습관에 영향이 있으면 기존 구조 유지로 조정.
- 녹색 제본색의 온도/채도. 밝은 다크 모드 주요 버튼의 강도.

검증 범위와 결과는 `docs/design/REVIEW.md` 및 생성된 `contrast-report.md`에서 분리해 기록한다.

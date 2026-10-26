# 방구석 도서관리

Electrobun 2.0.4 + React 19 + SQLite 기반의 단일 사용자 데스크탑 앱입니다.
도서는 이 컴퓨터에 저장하며 계정·로그인·Supabase 연결 없이 사용합니다.

## 실행

Node.js 26.12.1(26.x)과 pnpm 10.29.2를 사용합니다. `.nvmrc`와 `.node-version`에 버전을 고정했고,
`.npmrc`의 `engine-strict`로 이전 Node에서의 pnpm 실행을 차단합니다. Bun 1.4.4는 프로젝트 개발 의존성으로 설치됩니다.

```sh
nvm install
nvm use
pnpm install
pnpm desktop:prepare
pnpm desktop:build
pnpm desktop:start
```

`desktop:prepare`는 공식 Electrobun 런타임·SDK를 내려받아 `.hutch/devkit`을 만듭니다.
첫 준비 시 인터넷 연결이 필요합니다. `pnpm desktop:build`는 현재 플랫폼의 개발 앱을
`build/desktop/`에 만들며, `pnpm desktop:release`는 같은 위치에 stable 앱과 `build/releases/`에 배포 파일을 만듭니다.
배포 서명·공증·자동 업데이트는 이번 PoC 범위에 포함하지 않습니다.

현재 검증 대상은 macOS ARM64입니다. OS의 기본 WebView를 사용하고 CEF는 포함하지 않습니다.
다른 플랫폼의 패키징과 동작은 별도로 확인해야 합니다.

## 런타임 보안 업데이트

2026-10-26 기준 최신 정식 Node.js 26.12.1을 사용합니다. 이 버전에는
[CVE-2026-111497 수정](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)이 포함되어 있습니다.
Node의 Brotli 버전 문자열은 패치 후에도 1.2.0으로 표시될 수 있으므로 해당 문자열만으로 수정 여부를 판단하지 않습니다.

데스크탑 앱은 Node가 아닌 Bun으로 실행됩니다. Electrobun 2.0.4의 기본 패키징 런타임은 Bun 1.4.0이며,
npm의 Bun 의존성만 갱신해도 앱 안의 런타임은 바뀌지 않습니다. [Bun 1.4.4 보안 공지](https://bun.com/blog/bun-v1.4.4#security)를
기준으로 프로젝트 Bun을 정확히 1.4.4에 고정했습니다. 공식 `postBuild`/`postWrap` 훅에서 패키징할 런타임을 교체하고
실행 버전과 `build.json` 메타데이터를 확인합니다. release 교체는 압축·서명 전에 이뤄집니다.
Electrobun이 내부 빌드 도구로 관리하는 Bun 1.4.0 캐시는 유지되며, 이 보완은 배포 앱의 실행 바이너리에 적용됩니다.

버전 확인:

```sh
node --version
pnpm exec bun --version
"build/desktop/dev-macos-arm64/Reading Desk-dev.app/Contents/MacOS/bun" --version
```

Vitest 4와 Node 25+의 Web Storage 충돌을 피하려고 테스트 워커에만 `--no-webstorage`를 적용합니다.
브라우저 테스트는 jsdom의 격리된 Storage를 사용합니다. 앱의 저장소 동작은 바꾸지 않습니다.

## 사용

- 서재에서 도서를 등록·검색·수정·삭제하고 목록/표지 보기로 전환합니다.
- ISBN, 도서명, 저자, 출판사로 검색할 수 있습니다. 통계는 SQLite에서 집계합니다.
- `⌘/Ctrl + N`은 도서 추가, `⌘/Ctrl + F`는 서재 검색으로 이동합니다.
- 설정에서 4자리 PIN을 선택적으로 켜거나 변경·해제합니다. 초기값은 사용 안 함입니다.
- PIN을 켜면 앱 시작 시 잠기고 사이드바에서 수동으로 잠글 수 있습니다.
  PIN 변경·해제에는 현재 PIN이 필요합니다. 5회 실패 시 30초 동안 입력을 제한합니다.
- PIN은 솔트와 scrypt 해시로 저장합니다. 앱 화면 잠금 기능이며, 저장소 암호화는 PIN 사용 여부와 무관하게 항상 적용됩니다.
  PIN 분실 시 앱 내 초기화 기능은 제공하지 않습니다.
- 도서는 macOS에서 `~/Library/Application Support/ReadingDesk/books.vault`에 암호화해 저장됩니다.
  실제 경로는 설정 화면에 표시합니다. 개발 앱과 stable 앱은 같은 저장소를 사용합니다.
  테스트용 실행은 `BOOK_MANAGER_DATA_DIR=/절대/테스트폴더 pnpm desktop:start`로 별도 저장소를 지정할 수 있습니다.
- 구매일·출판일은 실제 존재하는 `YYYY-MM-DD` 형식이어야 하며 잘못된 날짜는 저장하지 않습니다.
- 표지는 기존 URL을 표시하므로 인터넷 연결이 필요할 수 있습니다.

서재에는 JSON 가져오기·평문 내보내기를 제공하지 않습니다. 암호화 백업은 설정에서 관리합니다.
기존 데이터 마이그레이션과 v1 JSON 변환은 후속 범위입니다.
바코드 리더의 ISBN 입력 및 구독형 CLI/API AI를 통한 도서 자동 입력도 후속 작업입니다.
현재 앱에는 AI 실행이나 공급자 연동을 포함하지 않습니다.

## 암호화·백업·복원·초기화

데이터는 메모리의 SQLite에서 처리하고, 저장 시 SQLite 이미지 전체를 AES-256-GCM으로 암호화해
`books.vault`에 저장합니다. SQLCipher 파일 형식은 아닙니다. 쓰기마다 새 nonce를 사용하며,
인증 태그로 파일 변조와 잘못된 키를 확인합니다. 평문 SQLite 임시 파일과 WAL은 만들지 않습니다.
파일 교체가 실패하면 메모리 변경도 취소하고 이전 저장 파일을 유지합니다. 별도 `.guard` SQLite 파일은
도서·PIN·키 없이 운영체제 잠금만 유지해 여러 앱 프로세스가 저장소를 덮어쓰는 것을 막습니다.

무작위 256비트 데이터 키는 macOS Keychain, Windows Credential Manager, Linux Secret Service에
보관합니다. 보안 저장소에 접근하지 못하면 평문 파일이나 키 파일로 우회하지 않습니다.
이 방식은 동일 OS 사용자로 실행되는 다른 프로그램이나 실행 중 메모리까지 차단하는 기능은 아닙니다.
개인 서재 PoC에 맞춰 매번 전체 이미지를 저장하므로 대규모 도서 데이터의 메모리·쓰기 비용은 별도 검증이 필요합니다.

앞선 PoC의 로컬 `books.sqlite`가 있으면 내용이 같은지 확인한 뒤 암호화 저장소로 옮기고
평문 원본과 WAL/SHM을 제거합니다. 검증·암호화 저장에 실패하면 원본을 보존합니다.
외부 Supabase 데이터 이전과 v1 JSON 변환은 여전히 범위 밖입니다.
검색어는 저장하지 않으며 이전 버전의 평문 검색 캐시는 앱 시작 시 제거합니다.

설정의 데이터 관리 기능:

- **암호화 백업 내보내기**: 12자 이상 별도 비밀번호로 `.rdbackup` 파일을 만듭니다.
  scrypt(N=32768,r=8,p=1), 무작위 salt와 AES-256-GCM을 사용합니다.
  도서 전체와 ID·등록일·수정일을 보존하며 기기 키와 PIN 설정은 포함하지 않습니다.
  백업은 최대 32MiB까지 지원합니다. 비밀번호 분실 시 복원할 수 없습니다.
- **백업 복원**: 파일·비밀번호를 검증해 현재/백업 도서 수와 백업 시각을 먼저 표시합니다.
  `복원` 확인 문구와, PIN 사용 중이면 현재 PIN을 입력한 뒤 도서 전체를 덮어씁니다.
  현재 PIN은 유지합니다. 오류·변조·중복 ID·잘못된 비밀번호는 기존 도서를 바꾸지 않습니다.
  미리보기 후 서재가 변경되거나 5분이 지나면 파일을 다시 확인해야 합니다.
- **데이터 초기화**: `초기화` 확인 문구와 현재 PIN으로 도서·PIN 설정·화면 캐시를 삭제합니다.
  외부 백업 파일과 운영체제 보안 저장소의 데이터 키는 유지합니다. 잠긴 상태에서는 실행할 수 없습니다.

다른 컴퓨터에서는 앱을 새로 설치한 뒤 `.rdbackup`과 백업 비밀번호로 복원할 수 있습니다.
기기 키를 잃으면 기존 `books.vault`만으로는 열 수 없습니다. 해당 파일을 보존한 채
`BOOK_MANAGER_DATA_DIR=/새로운/빈폴더 pnpm desktop:start`로 새 저장소를 열고 백업을 복원하세요.


## 브라우저 개발 및 검증

```sh
pnpm dev
pnpm type-check
pnpm check:architecture
pnpm test:run
pnpm test:desktop
pnpm test:e2e
pnpm lint
```

`pnpm dev`는 `http://127.0.0.1:3000`에 Vite를, 3101 포트에 개발 전용 Bun SQLite 브리지를 띄웁니다.
개발 데이터는 `.local-data/books.vault`에 별도로 암호화해 저장합니다. 브리지는 루프백 주소에만 바인딩하고
실행마다 생성되는 토큰과 Origin을 확인합니다. 패키징된 앱은 이 서버를 실행하지 않고 Electrobun RPC만 사용합니다.
포트 충돌 시 `BOOK_MANAGER_DEV_PORT=4320 BOOK_MANAGER_API_PORT=4321 pnpm dev`처럼 변경할 수 있습니다.

E2E는 4310/4311 포트와 임시 암호화 저장소를 사용하며 종료 후 테스트 데이터를 지웁니다.
테스트 브리지에만 일회성 키를 주입하고, 네이티브 앱은 항상 운영체제 보안 저장소를 사용합니다.
처음 실행할 때 `pnpm exec playwright install chromium`이 필요할 수 있습니다.
`pnpm build`는 모듈 경계·타입 검사 후 렌더러만 빌드합니다.
데이터 기능 확인에는 `pnpm dev` 또는 실제 데스크탑 앱을 사용하세요.
테스트 UI·디버그·개별 파일 실행은 `pnpm test --ui`, `pnpm test:e2e --debug`,
`pnpm test:e2e tests/e2e/workflow.spec.ts --headed`처럼 기본 명령에 옵션을 붙입니다.

테스트 코드와 가상 데이터는 Git으로 관리합니다. 테스트 보고서·스크린샷·빌드 결과·로컬 저장소·백업,
`.env*`와 인증서/키 파일, 로컬 AI 작업 설정은 `.gitignore`로 제외합니다.
개인 JSON 자료는 `data/`, 내보낸 파일은 `exports/`, 백업은 `backups/`에 보관하세요.
기존 개인 자료는 `data/demoData.json`으로 옮겨 보존하며 앱에서는 사용하지 않습니다.

## 구조

하나의 데스크탑 앱을 같은 버전으로 빌드·배포하므로 현재는 모노레포 대신 단일 패키지의 모듈 구조를 사용합니다.
상세 판단과 의존 규칙은 [구조 문서](docs/architecture.md)를 참고하세요.

- `contracts/`: 화면/Bun 공통 도서·명령 타입
- `src/app/`: 실행, Provider, 라우팅, 앱 셸, 전역 스타일
- `src/pages/`: 서재·설정·통계 화면과 화면 전용 상태/컴포넌트
- `src/features/`: 도서, PIN 잠금, 백업/복원 기능의 컴포넌트·훅·모델
- `src/shared/`: 공용 UI, 알림 상태, 요청 어댑터, 범용 훅/도구
- `desktop/`: application, library, backup, security, storage, platform 모듈
- 테스트·스토리는 해당 모듈 옆에, 통합 시나리오는 `desktop/tests/`와 `tests/e2e/`에 배치합니다.
- 개발 설정·보조 스크립트·Storybook 설정은 `tooling/`에 모읍니다.
- 생성물은 `build/renderer`, `build/desktop`, `build/releases`, `build/storybook`, `build/reports`에 모읍니다.
  `build/` 전체는 Git에서 제외합니다.

`pnpm check:architecture`로 역방향 참조, 기능 내부 직접 참조, 실행 환경 혼합과 순환 참조를 검사합니다.

SQLite는 Bun 프로세스에서만 접근합니다. 화면에서 임의 SQL·파일 경로·명령을 실행하는 인터페이스는 제공하지 않습니다.
향후 AI 도입 시에도 별도 Bun 작업에서 조회 결과를 검증한 뒤 도서 폼에 채우는 흐름을 권장합니다.

## 디자인 토큰과 스타일

Tailwind Plus·Catalyst의 작업 화면 구성과 간격을 참고하고 Slite의 밝은 바탕·짙은 회색·코랄 색상을 적용했습니다.
마루부리 Regular/SemiBold/Bold를 번들해 오프라인에서도 같은 글꼴을 사용합니다.
기존 React 컴포넌트와 CSS 변수·Tailwind·CSS Modules를 사용하며 새 헤드리스 UI 의존성은 추가하지 않았습니다.
`src/shared/theme/tokens.css`가 팔레트·역할 색상·폰트·치수·모션의 원본이며 Tailwind와 차트가 함께 참조합니다.
공용 Button/Input/Surface와 화면별 스타일 경계, 사용법은 [디자인 시스템 문서](docs/design-system.md)에 정리했습니다.
모션 감소 설정은 CSS와 JS 차트 모두 반영합니다. SCSS·ESLint·Prettier 의존성은 추가하지 않았습니다.

## PoC 검증 범위

2026-10-26 macOS ARM64에서 개발 앱 빌드와 네이티브 창을 확인했습니다.
임시 저장소로 실제 도서 입력, Keychain 키 생성·재사용, 암호화 파일에서 평문 미노출, 앱 종료·재실행 후 복호화와 데이터 유지를 검증했습니다. 당시의 평문 JSON 기능은 이후 제거했습니다.
Node 26.12.1에서 개발·stable 빌드, 테스트를 통과했고, stable 설치 프로그램 안의 Bun 바이너리가
고정한 1.4.4 패키지와 같은지 SHA-256으로 대조했습니다. 새 터미널 기본 Node도 26.12.1입니다.
현재 개발 앱 번들은 약 95MiB이며 런타임 메모리와 Electron 대비 성능은 측정하지 않았습니다.

리뷰 수정 후 타입 검사, 프런트엔드 테스트 99개(건너뜀 없음), 저장소·암호화·키·백업/PIN·초기화 수명 테스트 23개,
기존 작업 흐름·스타일 및 키보드/통계 오류 회귀 E2E 총 5개가 통과했습니다.
각 E2E 시나리오는 별도 프로세스·키·임시 저장소를 사용합니다. 리뷰 결과와 수정 내역은
[코드 리뷰 문서](docs/code-review-2026-10-26.md)에 기록했습니다.
모듈 재구성 후 전체 `pnpm lint`, 타입 검사, 의존 경계·순환 참조 검사와 Storybook 빌드가 통과했습니다.
네이티브 임시 저장소에서 등록·재실행·설정/통계 전환을 확인했습니다. 네이티브 WebView는 메모리 라우팅을,
브라우저 개발 환경은 해시 라우팅을 사용합니다.

공식 참고: [Electrobun 빌드 설정](https://framework.blackboard.sh/electrobun/apis/cli/build-configuration/),
[Bun SQLite](https://bun.com/docs/runtime/sqlite), [Bun 운영체제 보안 저장소](https://bun.com/docs/runtime/secrets).

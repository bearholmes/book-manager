# 개발 가이드

[문서 목록](README.md) · [제품 소개](../README.md)

## 환경

- Node.js: `.nvmrc`에 고정된 버전. nvm을 사용한다면 `nvm use`로 선택합니다.
- pnpm: `package.json`의 `packageManager` 버전.
- Bun: 프로젝트 의존성으로 설치됩니다.

## 빌드 대상과 검증 환경

- 빌드 대상: macOS, Windows, Linux. 각 운영체제에서 해당 환경용 앱을 빌드합니다.
- 로컬 검증 환경: macOS Apple Silicon. Windows·Linux 실행 검증은 별도로 필요합니다.

## 소스에서 빌드하고 실행하기

Node.js와 pnpm을 준비한 뒤 다음 명령을 실행합니다. 최초 준비 시 데스크탑 런타임을 다운로드합니다.

```sh
git clone https://github.com/bearholmes/book-manager.git
cd book-manager
pnpm install
pnpm desktop:prepare
pnpm desktop:build
pnpm desktop:start
```

## 개발과 빌드

| 명령 | 용도 |
| --- | --- |
| `pnpm dev` | 브라우저 개발 서버 (`http://127.0.0.1:3000`) |
| `pnpm storybook` | 컴포넌트 미리보기 (`http://localhost:6006`) |
| `pnpm build` | 라이선스 갱신·구조 검사·타입 검사 후 렌더러 빌드 |
| `pnpm desktop:build` | 개발용 데스크탑 앱 빌드 |
| `pnpm desktop:start` | 빌드한 데스크탑 앱 실행 |
| `pnpm desktop:release` | stable 앱과 배포 파일 생성 |

데스크탑 앱은 `build/desktop/`, 배포 파일은 `build/releases/`에 생성됩니다.
서명·공증·자동 업데이트는 현재 구성되어 있지 않습니다.

브라우저 개발 데이터는 `.local-data/`에 저장됩니다. 개발 서버는 화면용 3000번 포트와
로컬 데이터 연결용 3101번 포트를 사용합니다. 포트가 겹치면 다음처럼 지정합니다.

```sh
BOOK_MANAGER_DEV_PORT=4320 BOOK_MANAGER_API_PORT=4321 pnpm dev
```

## 검사

```sh
pnpm lint
pnpm type-check
pnpm check:architecture
pnpm test:run
pnpm test:desktop
pnpm test:e2e
```

E2E를 처음 실행하기 전에는 `pnpm exec playwright install chromium`으로 브라우저를 설치합니다.
E2E는 테스트마다 임시 서재를 만들고 종료할 때 정리합니다.
`pnpm test:e2e --debug`처럼 기존 명령에 옵션을 붙여 실행할 수 있습니다.

## 변경 제출

1. [모듈 경계](architecture.md)와 [디자인 시스템](design-system.md)을 확인합니다.
2. 변경 범위에 맞는 검사를 실행합니다. PR 전에는 린트·타입·구조 검사를 통과해야 합니다.
3. PR에 변경 이유와 확인 결과를 적습니다. UI 변경에는 화면이나 Storybook 확인 내용을 첨부합니다.

커밋 메시지는 `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` 접두사를 사용합니다.
생성물, 개인 도서 데이터, 백업 파일, 인증 정보는 커밋하지 않습니다.

## 런타임과 라이선스 유지보수

패키징된 Bun 버전은 [런타임 빌드 훅](../tooling/scripts/patch-bun-runtime.mjs)에서 확인합니다.
Bun을 갱신할 때는 패키지 버전과 이 훅, `desktop/assets/licenses/`의 해당 버전 안내를 함께 갱신합니다.

`pnpm licenses:generate`는 설치된 의존성과 원문 파일에서 저작권 패널의 자료를 생성합니다.
`pnpm build`에도 이 단계가 포함됩니다. 의존성을 변경하면 생성된 안내 자료도 함께 검토합니다.

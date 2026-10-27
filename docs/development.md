# 개발 가이드

[문서 목록](README.md)

## 환경

Node.js는 `.nvmrc`, pnpm은 `package.json`의 `packageManager` 버전을 사용합니다.
빌드 대상은 macOS·Windows·Linux이며 각 운영체제에서 해당 앱을 빌드합니다.
현재 로컬 네이티브 검증 환경은 macOS Apple Silicon입니다.

## 소스에서 실행

```sh
git clone https://github.com/bearholmes/book-manager.git
cd book-manager
pnpm install
pnpm exec electrobun prepare
pnpm dev
```

`pnpm dev`는 실제 데스크톱 앱을 빌드한 뒤 실행합니다. 앱 실행 중에는 빌드 잠금이 유지되므로,
다시 빌드하기 전에 실행 중인 앱을 종료합니다.

## 명령

| 명령 | 용도 |
| --- | --- |
| `pnpm dev` | 네이티브 앱 빌드 및 실행 |
| `pnpm build` | 코드 검사, 렌더러 빌드, 네이티브 개발 앱 패키징 |
| `pnpm build --env=stable` | stable 앱과 배포 파일 생성 |
| `pnpm check` | 린트·타입·모듈 경계·순환 참조 검사 |
| `pnpm format` | 코드 형식 정리 |
| `pnpm test --run` | 프런트엔드 테스트 1회 실행 |
| `pnpm test --coverage` | 프런트엔드 커버리지 확인 |
| `pnpm test:desktop` | 저장소·암호화·백업·PIN 테스트 |
| `pnpm test:e2e` | 브라우저 사용자 흐름 테스트 |
| `pnpm storybook` | 컴포넌트 미리보기 |

앱은 `build/desktop/`, 배포 파일은 `build/releases/`에 생성됩니다.
빌드 훅은 패키징된 렌더러가 `build/renderer`와 동일한지, Bun 버전이 고정 버전과 일치하는지 검사합니다.

## 테스트와 보조 도구

E2E 최초 실행 전 `pnpm exec playwright install chromium`으로 브라우저를 설치합니다.
시나리오 지정이나 디버깅은 `pnpm test:e2e tests/e2e/workflow.spec.ts --debug`처럼 옵션을 사용합니다.
브라우저 검사 외에 실제 네이티브 앱의 실행과 변경 화면을 확인합니다.

브라우저 개발이 필요한 경우 `pnpm exec node tooling/dev/browser.mjs`를 실행합니다.
화면은 `http://127.0.0.1:3000`, 개발 데이터는 `.local-data/`를 사용합니다.
Storybook 정적 빌드는 `pnpm exec storybook build --config-dir tooling/storybook --output-dir build/storybook`으로 실행합니다.

## 구조와 유지보수

- `src/features/licenses/`: 저작권 모달과 라이선스 표시 UI
- `tooling/packaging/`: 네이티브 빌드, 실제 번들 모듈의 저작권 수집, 런타임 검증
- `tooling/checks/`: 모듈 경계 검사
- `tooling/dev/`: 선택적으로 실행하는 브라우저 개발 도구

저작권 정보는 빌드 결과에 남은 모듈에서 생성합니다. 설치 목록이나 타입 패키지를 일괄 포함하지 않습니다.
Bun 버전 변경 시 `package.json`, `tooling/packaging/patch-runtime.mjs`, 해당 버전의 라이선스 안내를 함께 갱신합니다.
PR에는 변경 이유와 `pnpm check` 및 관련 테스트 결과를 적습니다.

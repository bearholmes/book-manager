<div align="center">
  <img src="desktop/assets/app-icon.png" width="112" height="112" alt="책 위에서 잠든 고양이 로고" />
  <h1>방구석 도서관리</h1>
  <p><strong>내 책을 정리하는, 나만의 서재.</strong></p>
  <p>책을 등록하고, 찾아보고, 보관하세요. 도서 데이터는 내 컴퓨터에 저장합니다.</p>
  <p>
    <a href="#기능">기능</a> ·
    <a href="#시작하기">시작하기</a> ·
    <a href="docs/README.md">문서</a> ·
    <a href="https://github.com/bearholmes/book-manager/issues">문제 제보</a>
  </p>
  <sub>macOS Apple Silicon · Electrobun · React · SQLite</sub>
</div>

## 기능

- **나의 서재** — 도서 정보·표지·주제·구매처를 관리하고 목록과 표지 보기로 전환합니다.
- **검색과 필터** — ISBN·도서명·저자·출판사로 검색하고 주제·구매처로 좁혀 봅니다.
- **서재 통계** — 전체 권수와 주제·구매처·구매 연도별 분포를 확인합니다.
- **데이터 보호** — 로컬 암호화 저장, 4자리 PIN 잠금, 비밀번호로 보호하는 백업·복원을 제공합니다.

## 시작하기

현재 macOS Apple Silicon에서 검증한 소스 빌드 기준입니다. **Node.js 26.12.1**과 **pnpm 10.29.2**가 필요합니다.

```sh
git clone https://github.com/bearholmes/book-manager.git
cd book-manager
nvm install
nvm use
pnpm install
pnpm desktop:prepare
pnpm desktop:build
pnpm desktop:start
```

최초 준비 시 데스크탑 런타임을 다운로드합니다. 브라우저에서 개발하려면 `pnpm dev`를 실행하세요.

## 문서

[개발 가이드](docs/development.md) · [데이터와 백업](docs/data-and-backups.md) · [전체 문서](docs/README.md)

## 라이선스

글꼴과 라이브러리의 저작권·라이선스는 앱의 **설정 → 오픈소스 저작권 정보**에서 확인할 수 있습니다.
마루 부리는 [SIL OFL 1.1](src/shared/assets/fonts/maru-buri/LICENSE.txt)로 배포됩니다.
프로젝트 소스코드의 라이선스는 아직 지정되지 않았습니다.

# Repository Guidelines

## Project Structure & Module Organization
This is a single-package Electrobun app; see `docs/architecture.md` for the monorepo decision and dependency rules.
- `contracts/`: runtime-independent book and desktop command types
- `src/app/`: entry point, providers, routes, desktop layout, global styles
- `src/pages/`: route composition and page-local hooks/components
- `src/features/`: self-contained `books`, `lock`, `data-management`, and `licenses` modules with public `index.ts` APIs
- `src/shared/`: reusable UI, notifications (components/hooks/store), generic hooks, API adapter, config, theme tokens, and utilities
- `src/test/`: test setup, synthetic fixtures, and helpers
- Tests and Storybook stories are colocated with their modules; Storybook introduction lives in `docs/storybook/`
- `desktop/application/`: command queue, validation/routing, library initialization
- `desktop/library/`, `desktop/backup/`, `desktop/security/`, `desktop/storage/`: native domain and persistence modules
- `desktop/platform/`: Electrobun menu/export adapters; `desktop/index.ts` and `desktop/dev-server.ts` compose the app
- `tests/e2e/`: end-to-end tests and isolated process fixtures
- `tooling/config/`: Vite, Vitest, Playwright, and Tailwind configuration
- `tooling/packaging/`, `tooling/checks/`, `tooling/dev/`: native builds and notices, architecture checks, optional browser development
- `tooling/storybook/`: component playground configuration
- `build/`: generated renderer/desktop packages, releases, Storybook, and reports (ignored)

Keep dependencies flowing `app -> pages -> features -> shared`, with `contracts` available to both runtimes.
Features do not import other features. Pages compose them through public entry points.
Renderer code never imports `desktop/`; desktop code never imports `src/`.
Use relative imports inside a feature and `@/` or `@contracts/` across renderer module boundaries.
Put feature-specific hooks, state, helpers, and assets inside their owning module; avoid global catch-all folders.
Create asset directories only when there are actual files to store.

## Build, Test, and Development Commands
Use `pnpm` (Node `>=26.12.1 <27`, pnpm `>=8`). Run `nvm use` to select the pinned Node version.
- `pnpm dev`: build and launch the native Electrobun app
- `pnpm build`: check code, build the renderer and licenses, then package the native development app
- `pnpm build --env=stable`: build a stable native app and release artifacts
- `pnpm check`: Biome, TypeScript, module boundaries, import resolution and cycle checks
- `pnpm format`: format code with Biome
- `pnpm test`: Vitest; use `--run`, `--coverage`, or `--ui` as needed
- `pnpm test:e2e`: Playwright E2E suite
- `pnpm test:desktop`: Bun storage, encryption, backup, and PIN tests
- `pnpm storybook`: local component playground

Initial desktop setup: `pnpm exec electrobun prepare`.
Optional browser development: `pnpm exec node tooling/dev/browser.mjs`.
Do not report browser-only verification as native app verification.
Native build completion includes checking that the packaged renderer matches the generated renderer.
Pass flags and scenario paths to existing commands instead of adding aliases for them.

## Coding Style & Naming Conventions
TypeScript + React with 2-space indentation, single quotes, semicolons, trailing commas, and 100-char line width (Biome).
- Components/pages: `PascalCase.tsx` (for example, `BookForm.tsx`)
- Hooks/utilities: `camelCase.ts` with `use*` for hooks
- Tests: colocated as `*.test.ts` or `*.test.tsx`
- Prefer `@/` alias for imports from `src/`

Use `src/shared/theme/tokens.css` as the design token source; see `docs/design-system.md`.
Keep component/page CSS in adjacent `*.module.css` files. Reuse Button/Input/Surface and their size/variant APIs rather than global style classes or `!important` overrides.
Preserve the book grid's JS/container measurements when editing layout. Respect reduced motion in both CSS and JS-driven animation.

Run `pnpm check` before opening a PR.

## Testing Guidelines
Unit/integration tests use Vitest + Testing Library (`jsdom` environment, `src/test/setup.ts`). Coverage reports are generated via V8 (`text`, `json`, `html`).

E2E uses Playwright in `tests/e2e/*.spec.ts` with automatic dev server startup and isolated temporary data. Keep scenarios user-focused (books, PIN locking, backup/restore/reset) and add regression tests for bug fixes.

Keep test code and synthetic fixtures in Git. Exclude generated reports, screenshots, local libraries, imported/exported data, credentials, and local agent settings with `.gitignore`.

## Commit & Pull Request Guidelines
Recent history favors concise, prefix-based commits (for example: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `chore: ...`). Keep each commit scoped to one change.

PRs should include:
- clear summary and rationale
- linked issue/task when applicable
- test evidence (`pnpm test --run`, `pnpm test:e2e` as needed)
- screenshots or Storybook notes for UI changes

# Repository Guidelines

## Project Structure & Module Organization
Core app code lives in `src/`.
- `src/components/`: reusable UI and domain components (`book/`, `ui/`, `common/`)
- `src/features/`: feature-first hooks and logic (`auth`, `books`)
- `src/pages/`: route-level screens (`Home`, `Login`, `Signup`, `Admin`)
- `src/lib/`, `src/store/`, `src/utils/`, `src/types/`: shared infrastructure
- `src/test/`: test setup, fixtures, and helpers
- `src/stories/`: Storybook stories

End-to-end tests are in `e2e/`, Supabase SQL is in `supabase/schema.sql`, and one-off migration utilities are in `scripts/`.

## Build, Test, and Development Commands
Use `pnpm` (Node `>=20`, pnpm `>=8`).
- `pnpm dev`: run Vite dev server on `http://localhost:3000`
- `pnpm build`: type-check then production build
- `pnpm preview`: serve the built app locally
- `pnpm lint` / `pnpm lint:fix`: Biome checks and autofixes
- `pnpm format`: format code with Biome
- `pnpm type-check`: run TypeScript checks only
- `pnpm test`, `pnpm test:run`, `pnpm test:coverage`: Vitest workflows
- `pnpm test:e2e`: Playwright E2E suite
- `pnpm storybook`: local component playground

## Coding Style & Naming Conventions
TypeScript + React with 2-space indentation, single quotes, semicolons, trailing commas, and 100-char line width (Biome).
- Components/pages: `PascalCase.tsx` (for example, `BookForm.tsx`)
- Hooks/utilities: `camelCase.ts` with `use*` for hooks
- Tests: colocated as `*.test.ts` or `*.test.tsx`
- Prefer `@/` alias for imports from `src/`

Run `pnpm lint` and `pnpm type-check` before opening a PR.

## Testing Guidelines
Unit/integration tests use Vitest + Testing Library (`jsdom` environment, `src/test/setup.ts`). Coverage reports are generated via V8 (`text`, `json`, `html`).

E2E uses Playwright in `e2e/*.spec.ts` with automatic dev server startup. Keep scenarios user-focused (auth, filtering, list flows) and add regression tests for bug fixes.

## Commit & Pull Request Guidelines
Recent history favors concise, prefix-based commits (for example: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `chore: ...`). Keep each commit scoped to one change.

PRs should include:
- clear summary and rationale
- linked issue/task when applicable
- test evidence (`pnpm test:run`, `pnpm test:e2e` as needed)
- screenshots or Storybook notes for UI changes

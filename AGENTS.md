# AGENTS.md — Amazon Ad Console

## Stack

- **Framework**: Next.js 16, React 19, TypeScript ~5.8
- **State**: Zustand 5
- **Database**: Prisma 7 (SQLite dev)
- **Auth**: NextAuth 5 (beta)
- **Testing**: Vitest 4, Playwright 1.61
- **Styling**: Tailwind CSS

## Build & Test

```bash
npm install
npm run build          # Next.js build
npm run test           # Vitest unit/integration tests
npm run test:e2e       # Playwright end-to-end
npm run lint           # ESLint
npm run type-check     # tsc --noEmit
```

## Project Structure

```
src/
├── engine/ad-console/    # Core simulation engine (well-tested, 312+ tests)
│   ├── core/             # Domain types, simulation, slices
│   ├── features/         # Feature slices (bulk, drills, reports, etc.)
│   └── store.ts          # Composed Zustand store
├── app/                  # Next.js App Router pages
└── components/           # React UI components
```

## Review Norms

- Engine layer (`src/engine/`) is stable — changes need tests
- Component layer has known SOLID violations — refactor incrementally, not all at once
- One fix per loop run — no drive-by refactors
- Always run `npm run test` before proposing changes
- Never edit `.env`, `prisma/`, or auth configs without human approval

## Loop Integration

- State tracked in `STATE.md`
- Budget enforced via `loop-budget.md`
- Constraints in `loop-constraints.md`
- Run history in `loop-run-log.md`

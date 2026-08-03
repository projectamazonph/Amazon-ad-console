# AGENTS.md — Amazon Ad Console

## Stack

- **Framework**: Next.js 16, React 19, TypeScript ~5.8
- **State**: Zustand 5
- **Database**: Prisma 7 + Postgres (via `@prisma/adapter-neon`)
- **Auth**: NextAuth 5 (beta)
- **Testing**: Vitest 4, Playwright 1.61
- **Styling**: `@astryxdesign/core` components + CSS custom-property tokens (no Tailwind compiler wired up despite the name appearing in some older docs)

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

<!-- ASTRYX:START -->
Astryx v0.1.8 · 153 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav.
- Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE writing content (`astryx docs layout`).
- Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard widgets, galleries, settings groups only.
- Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent via `astryx theme` — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   153 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

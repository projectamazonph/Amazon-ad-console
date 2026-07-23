# Loop Configuration — Amazon Ad Console

## Active Loops

| Pattern | Cadence | Status | Command |
|---------|---------|--------|---------|
| Daily Triage | 1d | L1 report-only | See README |

## Human Gates

- No auto-fix until L2 checklist complete
- All high-risk paths (prisma, auth, env): human review required
- Component refactors: human approval before merge

## Budget

- Max sub-agent spawns per run: 0 (L1) / 2 (L2)
- Max tokens/day: 100k (see `loop-budget.md`)
- Append each run to `loop-run-log.md`; use `loop-budget` skill at start/end
- Kill switch: `loop-pause-all` — pause schedulers and notify human

## Scope

- Focus on: engine improvements, test coverage, component refactors
- Out of scope: infrastructure changes, deployment config, auth modifications

## Links

- State: `STATE.md`
- Constraints: `loop-constraints.md`
- Budget: `loop-budget.md`
- Run log: `loop-run-log.md`

## Worktree Isolation

- Use `git worktree add ../amazon-ad-console-fix-<topic> <branch>` for unattended experiments
- Never work on main directly — always branch from a worktree
- Clean up worktrees after merge: `git worktree remove <path>`
- Each worktree gets its own `node_modules` — run `npm install` after creating

## Skills

Installed in `skills/` directory:
- `loop-triage` — triages CI, issues, and recent changes
- `loop-verifier` — validates fixes before merging
- `loop-budget` — enforces token/spawn limits at runtime
- `loop-constraints` — reads and enforces safety constraints
- `minimal-fix` — produces smallest possible fix for scoped issues

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

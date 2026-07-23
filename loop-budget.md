# Loop Budget — Amazon Ad Console

## Daily limits

| Loop | Max runs/day | Max tokens/day | Max sub-agent spawns/run |
|------|--------------|----------------|--------------------------|
| Daily Triage | 2 | 100k | 0 (L1) / 2 (L2) |
| CI Sweeper | 96 | 1M | 3 |
| Dependency Sweeper | 4 | 500k | 3 |

## On budget exceed

1. Pause all schedulers
2. Append event to `loop-run-log.md`
3. Notify human (Slack / issue / STATE.md High Priority)

## Kill switch

- Command or issue label: `loop-pause-all`
- Resume only after human clears the flag in STATE.md

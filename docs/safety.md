# Safety Policy — Loop Operations

## Denylist (never edit without human approval)

- `.env`, `.env.*` — environment secrets
- `prisma/` — database schema and migrations
- `auth/` — authentication configuration
- `next.config.ts` — build configuration
- Any file containing secrets, API keys, or credentials

## Auto-merge policy

- Only markdown files (`docs/**`, `**/*.md`) may be auto-merged
- All other changes require human review via draft PR

## Escalation

- After 3 failed fix attempts, escalate to human
- If loop detects sensitive path changes, pause and notify
- Use `loop-pause-all` to halt all automated operations

## Tool scopes

- Skills may only use tools documented in their SKILL.md frontmatter
- No external API calls without explicit human approval

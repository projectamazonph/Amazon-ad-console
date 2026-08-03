---
name: api-route-bugfix-with-test
description: Workflow command scaffold for api-route-bugfix-with-test in Amazon-ad-console.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /api-route-bugfix-with-test

Use this workflow when working on **api-route-bugfix-with-test** in `Amazon-ad-console`.

## Goal

Fixes a bug in an API route handler and adds or updates a test to verify the fix.

## Common Files

- `src/app/api/*/route.ts`
- `src/app/api/*/__tests__/route.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Fix the bug in the relevant API route file (e.g., /api/*/route.ts).
- Add or update a test in the corresponding __tests__ directory for that route.
- Commit both the route and its test together.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.
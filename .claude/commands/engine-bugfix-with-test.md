---
name: engine-bugfix-with-test
description: Workflow command scaffold for engine-bugfix-with-test in Amazon-ad-console.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /engine-bugfix-with-test

Use this workflow when working on **engine-bugfix-with-test** in `Amazon-ad-console`.

## Goal

Fixes a bug in a core engine or feature logic file and adds or updates a corresponding test to cover the fixed behavior.

## Common Files

- `src/engine/ad-console/core/engine/*.ts`
- `src/engine/ad-console/features/*/engine.ts`
- `src/engine/ad-console/features/*/store.ts`
- `src/engine/ad-console/core/slices/*.ts`
- `src/engine/ad-console/core/__tests__/*.test.ts`
- `src/engine/ad-console/features/*/__tests__/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify and fix the bug in the relevant engine or feature file (e.g., core/engine/*.ts, features/*/engine.ts, features/*/store.ts).
- Add or update a test in the corresponding __tests__ directory to cover the fixed behavior.
- Commit both the implementation and the test together.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.
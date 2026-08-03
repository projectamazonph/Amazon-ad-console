```markdown
# Amazon-ad-console Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and workflows used in the `Amazon-ad-console` TypeScript codebase. You'll learn how to follow the repository's conventions for file naming, imports/exports, commit messages, and testing. You'll also get step-by-step guidance for common bugfix workflows, including how to ensure all fixes are properly tested and committed.

## Coding Conventions

### File Naming

- **Files:** Use `camelCase` for file names.
  - Example: `adEngine.ts`, `adConsoleStore.ts`

### Import Style

- **Mixed imports:** Both default and named imports are used as appropriate.
  - Example:
    ```typescript
    import React from 'react';
    import { fetchAds, updateAd } from './adEngine';
    ```

### Export Style

- **Named exports** are preferred.
  - Example:
    ```typescript
    // adEngine.ts
    export function fetchAds() { /* ... */ }
    export function updateAd() { /* ... */ }
    ```

### Commit Messages

- **Conventional commits** are used.
- Prefixes like `fix` are common.
- Messages are concise (~63 characters on average).
  - Example: `fix: correct ad targeting logic in engine`

## Workflows

### Engine Bugfix with Test

**Trigger:** When you discover a bug in the core logic or feature engine and want to fix it and ensure it doesn't regress.  
**Command:** `/engine-bugfix`

1. **Identify and fix the bug** in the relevant engine or feature file:
    - `src/engine/ad-console/core/engine/*.ts`
    - `src/engine/ad-console/features/*/engine.ts`
    - `src/engine/ad-console/features/*/store.ts`
    - `src/engine/ad-console/core/slices/*.ts`
2. **Add or update a test** in the corresponding `__tests__` directory to cover the fixed behavior:
    - `src/engine/ad-console/core/__tests__/*.test.ts`
    - `src/engine/ad-console/features/*/__tests__/*.test.ts`
3. **Commit both the implementation and the test together.**
    - Example commit message: `fix: handle edge case in ad budget calculation`

**Example:**
```typescript
// src/engine/ad-console/core/engine/adBudget.ts
export function calculateBudget(ad) {
  // fixed logic here
}

// src/engine/ad-console/core/__tests__/adBudget.test.ts
import { calculateBudget } from '../engine/adBudget';
import { describe, it, expect } from 'vitest';

describe('calculateBudget', () => {
  it('handles zero budget', () => {
    expect(calculateBudget({ budget: 0 })).toBe(0);
  });
});
```

---

### API Route Bugfix with Test

**Trigger:** When you need to fix a bug in an API endpoint's logic and ensure correct behavior with a test.  
**Command:** `/api-bugfix`

1. **Fix the bug** in the relevant API route file:
    - `src/app/api/*/route.ts`
2. **Add or update a test** in the corresponding `__tests__` directory for that route:
    - `src/app/api/*/__tests__/route.test.ts`
3. **Commit both the route and its test together.**
    - Example commit message: `fix: correct response for ad stats API`

**Example:**
```typescript
// src/app/api/stats/route.ts
export function getAdStats(req, res) {
  // fixed API logic here
}

// src/app/api/stats/__tests__/route.test.ts
import { getAdStats } from '../route';
import { describe, it, expect } from 'vitest';

describe('getAdStats', () => {
  it('returns correct stats for valid ad', () => {
    // test logic here
  });
});
```

## Testing Patterns

- **Framework:** [vitest](https://vitest.dev/)
- **Test files:** Use the pattern `*.test.ts` and are located in `__tests__` directories adjacent to the code.
- **Test structure:** Use `describe`, `it`, and `expect` for organizing and writing tests.

**Example:**
```typescript
// src/engine/ad-console/core/__tests__/adEngine.test.ts
import { someFunction } from '../engine/adEngine';
import { describe, it, expect } from 'vitest';

describe('someFunction', () => {
  it('returns expected result', () => {
    expect(someFunction()).toBe('expected');
  });
});
```

## Commands

| Command         | Purpose                                               |
|-----------------|-------------------------------------------------------|
| /engine-bugfix  | Fix a bug in engine/feature logic and add a test      |
| /api-bugfix     | Fix a bug in an API route and add a test              |
```

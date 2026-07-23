```markdown
# Amazon-ad-console Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development conventions and workflows used in the `Amazon-ad-console` TypeScript codebase. You'll learn about file naming, import/export styles, commit message patterns, and how to write and run tests. This guide is designed to help new contributors quickly get up to speed and maintain consistency across the project.

## Coding Conventions

### File Naming
- **Pattern:** kebab-case
- **Example:**  
  ```
  ad-manager.ts
  campaign-list.test.ts
  ```

### Import Style
- **Pattern:** Relative imports
- **Example:**
  ```typescript
  import { Campaign } from './campaign';
  import { getAdStats } from '../utils/ad-stats';
  ```

### Export Style
- **Pattern:** Named exports
- **Example:**
  ```typescript
  // ad-manager.ts
  export function createAd() { ... }
  export const AD_STATUS = { ... };
  ```

### Commit Messages
- **Pattern:** Conventional commits
- **Prefix:** `feat`
- **Example:**
  ```
  feat: add campaign filtering by status
  ```

## Workflows

### Creating a New Feature
**Trigger:** When adding new functionality  
**Command:** `/new-feature`

1. Create a new TypeScript file using kebab-case (e.g., `new-feature.ts`).
2. Use relative imports to bring in dependencies.
3. Export your functions or constants using named exports.
4. Write or update corresponding test files (`*.test.ts`).
5. Commit your changes using the `feat:` prefix and a concise description.

### Writing and Running Tests
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Create test files with the `.test.ts` suffix (e.g., `ad-manager.test.ts`).
2. Write tests using the project's preferred (undetected) testing framework.
3. Run the tests using the project's test runner (see project documentation if available).

## Testing Patterns

- **Test File Naming:**  
  Test files are named with the `.test.ts` suffix and follow kebab-case.
  ```
  campaign-list.test.ts
  ```
- **Test Location:**  
  Tests are typically placed alongside the files they test or in a dedicated test directory.
- **Framework:**  
  The specific testing framework is unknown; refer to project documentation or existing tests for guidance.

## Commands
| Command       | Purpose                                      |
|---------------|----------------------------------------------|
| /new-feature  | Scaffold a new feature with proper conventions|
| /run-tests    | Run all test files in the codebase           |
```

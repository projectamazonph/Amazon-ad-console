# Ponytail Cleanup Plan

## Summary

This plan documents the ponytail (lazy senior dev) cleanup pass applied to the codebase.
The goal was to remove over-engineering and simplify patterns that don't earn their complexity.

## Changes Made

### 1. Barrel File Collapse
- Deleted `src/engine/ad-console/engine.ts` and `src/engine/ad-console/core/engine.ts`
- Updated 12 component imports from `@/engine/ad-console/engine` to `@/engine/ad-console/core/engine`
- Reduces import indirection from 3 layers to 1

### 2. Slice Boilerplate DRY
- Created `src/engine/ad-console/core/slices/helpers.ts` with `campaignMutator` and `campaignMutatorObj`
- Refactored 4 slice files (adgroup, budget, target, negative) to use the helpers
- Each slice method is now a one-liner instead of a 2-3 line wrapper

### 3. Deduplicate makeDraft
- Removed duplicate `makeDraft()` from `core.ts`
- Now imports from `draft.ts` which exports it
- Removed duplicate `toggleCampaignStatus`, `archiveCampaign`, `duplicateCampaign` from core.ts

### 4. Replace mobileMenuReducer
- Replaced 4-state reducer with `mobileMenuOpen: boolean`
- Simplified MobileNav component — removed animation state tracking
- Removed `mobileMenuReducer`, `MobileMenuState`, `MobileMenuAction` from engine

### 5. Simplify search-term-generator
- Replaced 3 Strategy Pattern classes with flat functions
- Removed `SearchTermGenerator` type and registry
- Rewrote tests to use function API

### 6. Clean Root Directory
- Moved 22 legacy files to `legacy/` directory
- Deleted `dev.db` and added `*.db` to `.gitignore`

## Verification

All 470 tests pass, tsc clean (only pre-existing .next/ cache error).

# Amazon PPC Training Simulator V3.4 QA Report

## Version tested

3.4

## Test date

2026-07-14

## Files tested

- ./amazon_ppc_simulator.html
- ./amazon_ppc_simulator_v3_3_qa.js
- ./amazon_ppc_simulator_e2e.py

## QA status

Passed

## Summary

The V3.4 build passed static syntax checks, VM render mock checks, guided drill paths, and comprehensive browser E2E tests run under a live headless Chromium instance.

## Commands run

```bash
# Node.js VM testing
node amazon_ppc_simulator_v3_3_qa.js

# Playwright Browser E2E testing
python amazon_ppc_simulator_e2e.py
```

## Static VM test results

Pass count: 23
Failure count: 0

### Checks passed:
1. Version checks
2. Guided drills rendering and completion paths
3. Profile switcher dropdown element rendering
4. Trainer dashboard administration card rendering
5. Profile creation logic
6. Profile workspace isolation logic (budgets and logs are separate)
7. Profile deletion logic and index safety

## Browser E2E test results

Status: Passed
Steps passed:
- **Step 1:** Verifying Initial Simulator Dashboard Render (Default Trainee 1 is active).
- **Step 2:** Testing Profile Switcher Dropdown Quick-Create (E2E Tester is created).
- **Step 3:** Testing Trainer Dashboard Profiles Admin Panel (Table rows update, Trainer Admin is created).
- **Step 4:** Testing State Isolation between Profiles (Changing search query in profile A does not corrupt profile B).
- **Step 5:** Testing Wrong-Click Blocking Bypass during Guided Drills (Profile interactions do not trigger mistakes during navigation drills).
- **Step 6:** Testing Profile Deletion (Trainer Admin can be successfully deleted, leaving 2 active profiles).

# Amazon PPC Training Simulator V3.3 QA Report

## Version tested

3.3

## Test date

2026-06-25

## Files tested

- /mnt/data/amazon_ppc_simulator.html
- /mnt/data/amazon_ppc_simulator_check.js
- /mnt/data/amazon_ppc_simulator_v3_3_qa.js

## QA status

Passed

## Summary

The V3.3 build passed syntax, static, VM render, guided drill, completion path, skip path, and export execution checks.

## Commands run

```bash
node --check /mnt/data/amazon_ppc_simulator_check.js
node /mnt/data/v33_runtime_smoke.js
node /mnt/data/amazon_ppc_simulator_v3_3_qa.js
```

## QA result JSON

```json
{
  "status": "passed",
  "version": "3.3",
  "passCount": 18,
  "failureCount": 0
}
```

## Checks passed

1. Version is 3.3
2. V3.3 layer appears exactly once
3. Sidebar has Guided drills
4. Navigation drill result state exists
5. Wrong-click documentation exists
6. Drill definitions exist
7. Initial render works
8. Initial navigation render includes Guided drills
9. Guided drills page renders
10. SP negative drill card renders
11. SD audience drill card renders
12. Active drill rail renders
13. First drill step renders
14. SP drill completes through the expected operations
15. SP drill scores 100 percent on a clean path
16. Skip path completes a drill
17. Skip count appears after skipped drill
18. Trainer log and documentation export functions run

## Manual review notes

The V3.3 implementation uses a final hardening layer inserted after the V3.2 final layer. This matches the app’s existing override architecture and avoids risky rewrites of the full single-file app.

The implementation adds new UI and state without changing the campaign relationship model. Existing campaign, ad group, target, negative, search term, creative, report, bulk, and trainer objects remain intact.

## Limitations of QA

The QA uses a Node VM with DOM stubs. It validates syntax, function execution, rendered HTML strings, and guided drill logic. It does not replace a full browser visual matrix.

Recommended future QA:

- Chromium or Playwright click simulation
- Mobile viewport visual check
- LocalStorage import and export roundtrip test
- Drill wrong-click simulation with real DOM events
- Accessibility keyboard navigation test

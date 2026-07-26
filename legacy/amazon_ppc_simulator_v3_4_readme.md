# Amazon PPC Training Simulator V3.4

Open `amazon_ppc_simulator.html` in a browser.

This is a static sandbox app. It does not connect to Amazon Ads, Seller Central, or live accounts.

## What is new in V3.4

- **Multi-User Trainee Profiles:** Create independent practice workspaces for multiple VAs on the same computer.
- **Header Profile Switcher:** A dropdown switcher embedded in the top menu bar for switching accounts on the fly.
- **Trainee Profiles Management:** A master admin panel on the Trainer Dashboard showing registration dates, activity metrics, and controls to Switch, Rename, or Delete trainees.
- **Drill Compatibility Bypasses:** Swapping profiles or opening dropdown menus is fully excluded from guided drill wrong-click penalties.
- **Playwright Browser E2E Tests:** Comprehensive browser automation test suite using headless Chromium.

## Best first test

1. Open the app.
2. Click the trainee name in the top menu bar to open the Switch User Profile dropdown.
3. Quick-create a new profile and watch the workspace reset instantly to clean baseline settings.
4. Open the Trainer Dashboard and inspect the master Profiles Management console.
5. Execute the browser E2E test script:
   ```bash
   python amazon_ppc_simulator_e2e.py
   ```

## QA

Run:

```bash
node amazon_ppc_simulator_v3_3_qa.js
python amazon_ppc_simulator_e2e.py
```

Expected result:

Both static VM checks (23/23) and browser E2E assertions (6/6) pass successfully.

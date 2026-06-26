# Amazon PPC Training Simulator V3.3

Open `amazon_ppc_simulator.html` in a browser.

This is a static sandbox app. It does not connect to Amazon Ads, Seller Central, or live accounts.

## What is new in V3.3

- Guided drills page
- Click-by-click navigation training
- Highlighted next click target
- Wrong-click blocking
- Mistake scoring
- Step skipping
- Trainer drill results
- Trainer log export with drill results
- Updated in-app and external documentation

## Best first test

1. Open the app.
2. Click Guided drills in the left sidebar.
3. Start Find and block waste from Search terms.
4. Follow the highlighted target.
5. Complete the route with no wrong clicks.
6. Open Trainer dashboard and confirm the drill result.

## QA

Run:

```bash
node --check amazon_ppc_simulator_check.js
node amazon_ppc_simulator_v3_3_qa.js
```

Expected result:

```json
{
  "status": "passed",
  "version": "3.3",
  "passCount": 18,
  "failureCount": 0
}
```

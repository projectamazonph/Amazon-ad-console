# Amazon-ad-console

**Amazon PPC Training Simulator — a safe, offline sandbox for training virtual assistants on Amazon advertising operations.**

Built by [Ryan Roland Dabao](https://linkedin.com/in/ryan-roland-dabao-55416187) — Amazon PPC Lead Manager with 10+ years of remote eCommerce experience and $500K+/month in managed ad spend.

---

## Overview

This repository is a single-file, offline HTML training simulator that recreates Amazon Ads Console workflows for practice — **without** connecting to Seller Central, the Amazon Ads console, or any live account. It lets Filipino VAs and eCommerce teams learn navigation, campaign setup, management, reporting, and safe optimization decisions in a risk-free environment.

Everything runs in the browser. There is no build step, no server, and no external dependencies. Progress is stored in browser LocalStorage.

## Quick Start

```bash
git clone https://github.com/projectamazonph/Amazon-ad-console.git
cd Amazon-ad-console
# Open the simulator in your browser:
#   - macOS:   open amazon_ppc_simulator.html
#   - Linux:   xdg-open amazon_ppc_simulator.html
#   - Windows: start amazon_ppc_simulator.html
```

No installation, package manager, or environment variables are required.

## Features

- **Console-inspired navigation** — campaign manager, campaign detail tabs, reports, creative, and product pages
- **Sponsored Products, Sponsored Brands, Sponsored Display** — creation wizards and management flows for all three ad types
- **Guided drills (v3.3)** — click-by-click navigation training with target highlighting, wrong-click blocking, mistake scoring, and skip tracking
- **Search-term mining & negatives** — harvest search terms and add negative exact/phrase targeting
- **Bid, budget & placement controls** — bid changes, budget changes, budget rules, and placement adjustments
- **Reports** — simulated performance reporting with CSV export
- **Guided missions** — scored, scenario-based training tasks
- **Trainer dashboard** — action logs, drill results, trainer notes, and log export for review
- **Progress import/export** — save and restore trainee state via LocalStorage-backed JSON

## Guided Drills (v3.3)

Five route-based drills reinforce click-by-click confidence:

1. SP search-term waste control
2. SP placement controls
3. SB creative review path
4. Report request and copy workflow
5. SD audience targeting path

A clean route scores 100%. Wrong clicks and skips apply penalties, and results are recorded to the Trainer dashboard. See `amazon_ppc_simulator_v3_3_documentation.md` for the full breakdown.

## Repository Layout

| File | Purpose |
|------|---------|
| `amazon_ppc_simulator.html` | The complete single-file simulator app |
| `amazon_ppc_simulator_check.js` | Extracted app script used for syntax checking |
| `amazon_ppc_simulator_v3_3_qa.js` | Node-based QA harness (VM render + logic checks) |
| `amazon_ppc_simulator_v3_3_qa_results.json` | Latest QA results output |
| `amazon_ppc_simulator_plan.md` | Build plan and roadmap |
| `amazon_ppc_simulator_v3_3_documentation.md` | Full v3.3 feature documentation |
| `amazon_ppc_simulator_v3_3_changelog.md` | v3.3 changelog |
| `amazon_ppc_simulator_v3_3_qa_report.md` | v3.3 QA report |
| `amazon_ppc_simulator_v3_3_release_manifest.json` | v3.3 release manifest |

## QA

The simulator ships with a Node-based QA harness (Node.js required):

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

The QA harness loads the app script in a Node VM with DOM stubs to validate syntax, rendering, guided-drill logic, and export functions. It does not replace full cross-browser visual testing.

## Limitations

- No live Amazon Ads or Seller Central connection
- No real bulk upload and no multi-user backend
- Browser LocalStorage only
- Metrics are simulated for training, not forecasting
- UI is inspired by Amazon Ads Console workflows, not an exact clone

---

Built by [ProjectAmazonPH](https://github.com/projectamazonph) — training Filipino virtual assistants to become Amazon advertising specialists.

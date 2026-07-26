# Amazon PPC Training Simulator V3.4 Documentation

## Purpose

The simulator trains virtual assistants on Amazon PPC navigation, campaign setup, campaign management, reporting, bulk operations, and safe optimization decisions without giving access to Seller Central or Amazon Ads.

V3.4 introduces **Multi-User Trainee Profiles & Workspace State Isolation**. The simulator now allows trainers and trainees to maintain multiple completely isolated student accounts in the same browser, with their own campaigns, action logs, metrics, training missions, and guided drill scores. It also adds a comprehensive browser End-to-End (E2E) automation test suite using Playwright.

## Release summary

Version: 3.4
Release date: 2026-07-14
Build type: Static single-file HTML app
Storage: Browser LocalStorage (Multi-profile keys)
Live account access: None
External dependencies: None

## Major V3.4 additions

### 1. Multi-User Trainee Profiles
Trainees can now create unique profiles to manage separate practice workspaces.
* **Workspace Isolation:** Each profile holds its own unique campaigns, ad groups, budget rules, history logs, completed drills, action logs, feedback logs, etc.
* **Trainee Dropdown Switcher:** A dropdown switcher is embedded directly into the header bar. Trainees can instantly switch accounts, quick-create a profile, or delete other profiles.
* **Dropdown open/close:** Supported by dropdown state and click-outside automatic dismissal.

### 2. Trainer Profiles Administration Dashboard
The Trainer Dashboard now includes a dedicated **Trainee Profiles Management** panel.
* Displays a summary table of all offline profiles.
* Shows profile metadata: creation date, last active timestamp, and current status.
* Provides full administrator actions to **Switch**, **Rename**, or **Delete** individual profiles.

### 3. Drill Bypass Integration
* Interacting with the profile switcher or creating profiles is excluded from the wrong-click gate during active guided drills. Trainees can adjust their user settings or switch profiles mid-drill without triggering mistake counters or score penalties.

### 4. Playwright Browser E2E Test Suite
* Added `amazon_ppc_simulator_e2e.py`—a true browser E2E test suite that runs a headless Chromium browser using Playwright.
* Automatically verifies initial dashboard renders, profile creation, header switcher behavior, state isolation, drill bypass, and deletion safety.

## Guided drill coverage

### Drill 1: SP search-term waste control
Route: Campaign manager -> SP Auto campaign -> Search terms -> Negative exact -> Negative targeting verification.

### Drill 2: SP placement controls
Route: Campaign manager -> Manual SP campaign -> Placements -> Save -> Change history.

### Drill 3: SB creative review path
Route: Creative assets -> SB Video campaign -> Overview -> Targeting.

### Drill 4: Report request and copy workflow
Route: Reports -> Request report -> Copy report rows.

### Drill 5: SD audience targeting path
Route: Campaign manager -> SD Views Remarketing -> Targeting -> Reports.

## State storage schema in V3.4

* `amazonPpcSimulator.profilesIndex`: Array of `{ id, name, createdAt, lastActiveAt }`.
* `amazonPpcSimulator.activeProfileId`: String ID of the active profile (e.g. `p-default`).
* `amazonPpcSimulator.profile.<id>`: Individual JSON string representing the full state model of that profile.

## Existing V3.3 systems retained

V3.4 retains all legacy validation and simulation work:
* Relationship-safe campaign model
* Campaign-to-adgroup-to-target constraints
* Target to search term mapping
* Budget rules, placements, and creative approval states
* Integrity Center self-heal checks
* Entity-based bulk operations
* Reports requested queue

## QA commands run

```bash
# Core static VM validation tests (23 checks)
node amazon_ppc_simulator_v3_3_qa.js

# Real browser E2E test suite (6 steps)
python amazon_ppc_simulator_e2e.py
```

## Known limits

* No live Amazon Ads or Seller Central connection.
* Static single-file page utilizing browser LocalStorage.
* Metrics are simulated for training, not forecasting.

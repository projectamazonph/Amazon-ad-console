# Amazon PPC Training Simulator V3.4 Changelog

## Version

3.4

## Release date

2026-07-14

## Headline

Added Multi-User Trainee Profiles, Workspace State Isolation, Header Profile Dropdown Selector, and Trainer Dashboard Administration panel with Playwright Browser E2E automation testing.

## Added

- Multi-User Profile system with transparent backward-compatibility migration.
- Header Profile Dropdown Selector featuring a list of trainees, quick profile creator, and direct link to the Trainer Dashboard.
- Profiles Administration Panel on the Trainer Dashboard showing profile creation dates, active states, status, and administration controls (Switch, Rename, Delete).
- Playwright E2E browser automation test suite in Python (`amazon_ppc_simulator_e2e.py`).
- Automatic close-on-click-outside and click gate bypasses for user profile interactions during active navigation drills.
- Assertions in static QA checks and browser E2E tests validating profile isolation, switching, creation, and deletion.

## Changed

- Updated app title to V3.4 Sandbox.
- Updated documentation block inside the app and settings build version indicators to cover V3.4 additions.
- Hardened static QA check script with relative paths for local development runs.

## Preserved from V3.3

- 5 Guided navigation drills with highlighted targets and mistaken-click penalties.
- Integrity Center self-heal checks and object-map export.
- Bulk operations template downloads and CSV parsing logic.
- Scenario generation modes (Beginner, Intermediate, Advanced).
- Core SP, SB, and SD relationship-safe campaign architectures.

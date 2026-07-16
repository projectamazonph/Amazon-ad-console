# Amazon PPC Training Simulator V3.3 Changelog

## Version

3.3

## Release date

2026-06-25

## Headline

Added guided click-by-click navigation drills with target highlighting, wrong-click blocking, scoring, and trainer results.

## Added

- Guided drills sidebar item
- Guided navigation drills page
- Five route-based drills:
  - SP search-term waste control
  - SP placement controls
  - SB creative review path
  - Report request and copy workflow
  - SD audience targeting path
- Active drill card in the right rail
- Current-step instruction panel
- Coach hint per navigation step
- Highlighted current click target
- Wrong-click blocking during active drills
- Mistake count
- Skip count
- Completion score
- Navigation drill result log
- Navigation drill results in Trainer dashboard
- Trainer log export section for navigation drill results
- V3.3 in-app documentation
- V3.3 external documentation
- V3.3 QA script and QA results JSON

## Changed

- Updated app title to V3.3
- Updated APP_VERSION to 3.3
- Updated simulator settings copy
- Updated Navigation map with Guided drills CTA
- Updated dashboard navigation alert copy
- Updated Trainer dashboard output
- Updated documentation export filename and content
- Updated trainer log export filename and content

## Preserved from V3.2

- Relationship-safe campaign object model
- Integrity Center checks and self-heal
- Entity-based bulk operations
- Report request queue
- Randomized scenario generator
- Trainer notes
- Progress export and import
- Action grading
- Structured history
- SP, SB, and SD coverage

## Fixed during V3.3 build

- Fixed trainer log export reference so it uses the existing CSV utility instead of an undefined helper.
- Prevented duplicate V3.3 layer insertion in the final app file.
- Confirmed the final file contains exactly one V3.3 guided drill layer.

## QA commands run

```bash
node --check amazon_ppc_simulator_check.js
node amazon_ppc_simulator_v3_3_qa.js
```

## QA result

Status: passed
Pass count: 18
Failure count: 0

## Remaining improvement candidates

- Add a true browser automation test with click simulation through Chromium or Playwright.
- Add custom trainer-authored drill creation inside the UI.
- Add drill categories by trainee level.
- Add a certification page that combines missions, guided drills, and trainer checklist scores.
- Add keyboard navigation support for accessibility drills.

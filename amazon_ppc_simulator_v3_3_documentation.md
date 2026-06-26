# Amazon PPC Training Simulator V3.3 Documentation

## Purpose

The simulator trains virtual assistants on Amazon PPC navigation, campaign setup, campaign management, reporting, bulk operations, and safe optimization decisions without giving access to Seller Central or Amazon Ads.

V3.3 focuses on click-by-click navigation confidence. The simulator now highlights the correct next UI target, blocks wrong clicks during guided drills, records mistakes, scores the route, and writes results to the trainer dashboard.

## Release summary

Version: 3.3
Release date: 2026-06-25
Build type: Static single-file HTML app
Storage: Browser LocalStorage
Live account access: None
External dependencies: None

## Major V3.3 additions

### 1. Guided drills module

A new sidebar item, Guided drills, opens a dedicated drill page.

The page includes five guided route drills:

1. SP search-term waste control
2. SP placement controls
3. SB creative review path
4. Report request and copy workflow
5. SD audience targeting path

Each drill has:

- Ad type or workflow type
- Difficulty level
- Estimated minutes
- Route summary
- Ordered step list
- Start and restart controls
- Active progress display
- Mistake count
- Skip count
- Completion score

### 2. Active drill right rail

When a drill starts, the right rail shows:

- Active drill name
- Current progress
- Current click instruction
- Coach hint
- Skip step button
- Stop button
- Completion summary after finish

This keeps the trainee focused while they move through Campaign manager, campaign detail tabs, reports, or creative pages.

### 3. Target highlighting

The simulator highlights the exact next UI element with a visible orange outline.

Examples:

- Campaign manager sidebar item
- Campaign row link
- Search terms tab
- Negative exact action button
- Placement save button
- Reports page button

The highlighted element changes as the trainee completes each step.

### 4. Wrong-click blocking

During an active guided drill, the simulator blocks clicks outside the expected target.

When a trainee clicks the wrong element, the simulator:

- Prevents the wrong navigation
- Shows a warning toast
- Adds one mistake
- Logs the missed step
- Adds a trainer feedback entry

Allowed exceptions:

- Stop drill
- Skip step
- Restart drill
- Open Guided drills
- Current step target
- Explicitly allowed input fields for placement drills

### 5. Scoring

Navigation score starts at 100.

Penalties:

- Wrong click: minus 12 points
- Skipped step: minus 8 points

A clean route scores 100 percent. A completed route with mistakes still records completion but needs trainer review.

### 6. Trainer dashboard integration

The Trainer dashboard now includes a Navigation drill results section.

Each completed drill stores:

- Trainee name
- Drill title
- Completion date
- Score
- Mistakes
- Skips

The trainer log export now includes action logs plus navigation drill results.

## Guided drill coverage

### Drill 1: SP search-term waste control

Route:

1. Campaign manager
2. SP Auto discovery campaign
3. Search terms tab
4. Negative exact for paper coffee filters bulk
5. Negative targeting verification

Training goal:

The trainee learns where search terms live, how waste is blocked, and why negative targeting needs verification.

### Drill 2: SP placement controls

Route:

1. Campaign manager
2. Manual SP campaign
3. Placements tab
4. Save placement settings
5. Change history

Training goal:

The trainee learns where placement multipliers live and confirms changes through history.

### Drill 3: SB creative review path

Route:

1. Creative assets
2. SB Video campaign
3. Overview tab
4. Targeting tab

Training goal:

The trainee learns SB work requires creative review before targeting review.

### Drill 4: Report request and copy workflow

Route:

1. Reports
2. Request report
3. Copy report rows

Training goal:

The trainee learns the report center workflow before working in spreadsheets.

### Drill 5: SD audience targeting path

Route:

1. Campaign manager
2. SD Views Remarketing campaign
3. Targeting tab
4. Reports

Training goal:

The trainee learns SD is audience and contextual targeting, not search-term harvesting.

## State fields added in V3.3

The following LocalStorage-backed fields were added:

- activeNavigationDrillId
- navigationDrillStep
- navigationDrillMistakes
- navigationDrillSkips
- navigationDrillLog
- navigationDrillResults
- navigationDrillStartedAt
- navigationDrillCompleted

These fields persist with normal progress export and import.

## Existing V3.2 systems retained

V3.3 keeps all V3.2 hardening work:

- Campaign to ad group relationships
- Campaign to product ad relationships
- Campaign to target relationships
- Target to search term relationships
- Campaign and ad group to negative relationships
- Campaign to budget rule relationships
- Campaign to creative relationships
- Structured change history
- Integrity Center self-heal
- Entity-based bulk validation
- Randomized scenario generator
- Trainer notes and action logs
- Progress import and export

## Recommended training path

Day 1:

- Guided drills
- Navigation map
- Glossary
- Product readiness
- Campaign filters

Day 2:

- SP Auto setup
- SP Manual Keyword setup
- SP Product Targeting setup

Day 3:

- Search term harvesting
- Negative exact
- Negative phrase
- Bid reviews

Day 4:

- SB Product Collection
- SB Store Spotlight
- SB Video
- Creative approval review

Day 5:

- SD contextual targeting
- SD views remarketing
- SD purchases remarketing
- SD reporting differences

Day 6:

- Reports
- Bulk operations
- Integrity Center
- Trainer dashboard
- Certification review

## Trainer usage notes

Use guided drills before giving trainees freeform missions.

Recommended trainer prompts:

- What page are you on?
- What object are you editing?
- Is this campaign-level, ad group-level, target-level, or report-level?
- What would happen if you clicked the wrong action in a live account?
- What would you check before making this change for a real client?

## Known limits

- No live Amazon Ads connection
- No Seller Central connection
- No real bulk upload
- No multi-user backend
- Browser LocalStorage only
- Metrics are simulated for training, not forecasting
- UI is inspired by Amazon Ads Console workflows, not an exact clone

## QA summary

V3.3 passed:

- JavaScript syntax check
- VM render smoke test
- Guided drills page render test
- Active drill rail render test
- Clean SP guided drill completion path
- Skip path completion test
- Trainer log export execution test
- Documentation export execution test

Full cross-browser visual testing was not run in this environment.

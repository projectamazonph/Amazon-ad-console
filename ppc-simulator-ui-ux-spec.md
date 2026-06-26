# Amazon PPC Console Simulator — UI/UX Specification
**Purpose of this document:** This is build context for an AI coding agent (or human dev) implementing the simulator described in `ppc-simulator-schema.prisma`. It describes every screen, every interaction, every state, in enough detail that a coder should not need to guess at behavior. Where a behavior mirrors the real Amazon Ads Console, that's called out explicitly — fidelity to the real console is the core success metric of this product, since the goal is training transfer, not aesthetic novelty.

---

## 0. Design principles (read this before building anything)

1. **Functional fidelity over visual fidelity.** Don't pixel-clone Amazon's exact CSS — that's a moving target and not the point. Match the *information architecture*: what's on each screen, what's clickable, what order decisions happen in, what feedback appears after an action. A trainee who's used this simulator should not be confused by the real console's layout.
2. **Every state must be visible, not implied.** Loading, empty, error, pending-review, eligible/ineligible — all need an explicit UI state, because troubleshooting these states *is* the training content.
3. **Nothing is ever a black box.** If something is disabled or hidden, show why (tooltip/inline note), don't just omit it.
4. **Dense, not spacious.** The real console is a data-management tool, not a marketing site. Tables are dense, fonts are small-but-legible (13–14px body), and whitespace is functional, not decorative.
5. **State lives in the database, scoring lives on top of it.** Every UI action should map to a clear mutation on the schema entities — the scenario validator checks resulting rows, not pixels.

---

## 1. Global design tokens

| Token | Value | Notes |
|---|---|---|
| Primary accent | `#007185` (Amazon link teal) | Used for primary buttons, active tab underline, links |
| Primary button | `#FFA41C` → hover `#FA8900` | Amazon "orange" CTA convention — use for "Create campaign," "Launch," "Save" |
| Background | `#FFFFFF` page bg, `#F7F8FA` panel/table bg | Tables sit on the lighter grey, cards on white |
| Border | `#D5D9D9` | 1px, used on table rows, input fields, card edges |
| Text primary | `#0F1111` | Text secondary `#565959` |
| Status green (Enabled/Ready) | `#007600` bg `#F0F8EC` |
| Status amber (Pending/Limited) | `#B12704` is too red — use `#C7511F` bg `#FDF4EC` |
| Status red (Rejected/Error) | `#C40000` bg `#FDECEC` |
| Status grey (Paused/Archived) | `#565959` bg `#F0F2F2` |
| Font | System stack fallback: `-apple-system, "Amazon Ember", "Helvetica Neue", Arial, sans-serif` |
| Body text size | 13px (table cells), 14px (form labels/inputs), 12px (helper/caption text) |
| Table row height | 44px |
| Border radius | 4px (inputs, buttons, cards) — Amazon's console is not heavily rounded |

**Component library:** shadcn/ui (Table, Tabs, Dialog, Dropdown, Sheet for drawers, Tooltip, Badge, Switch for status toggles) on Tailwind. Charts via Recharts. Use `Sheet` (slide-over) for the keyword/target detail drawer, not a modal — real console behavior is a side panel, not a centered dialog.

---

## 2. Global shell (present on every authenticated screen)

### 2.1 Top bar (fixed, 56px height)
Left to right:
- **Account/marketplace switcher** (leftmost, ~220px wide): dropdown button showing `[Seller Account Name] · Amazon.com ▾`. Clicking opens a list of the trainee's seeded `MockSellerAccount` rows. Switching accounts is a hard context switch — show a brief toast: *"Switched to [Account Name]"* and reset all table filters. This interaction itself should occasionally appear in scenario tasks ("the trainee edited the wrong account's budget" is a real, common VA mistake worth training against).
- **Global search** (center-left, flexible width): placeholder *"Search campaigns, ad groups, or ASINs"*. Typing filters a dropdown of matches across entity types, each row showing entity type as a small badge (Campaign / Ad Group / Product).
- **Date range picker** (right of search): button showing current range, e.g. `Last 30 days ▾`. Opens a calendar dropdown with presets (Today, Yesterday, Last 7 days, Last 30 days, Last 90 days, Custom). This range scopes every metric on the current page — changing it should visibly re-render numbers, not just sit inert.
- **Notifications bell** (icon button): red dot badge when unread items exist. Opens a dropdown list, each item with an icon + one-line text + timestamp, e.g. *"⚠ Campaign 'Summer Sale SP' is out of budget"*, *"✓ SB creative 'Holiday Collection' approved"*. Clicking an item navigates to the relevant entity.
- **Help/scenario indicator** (rightmost, only visible in Scenario Mode — see §11): a persistent pill button, e.g. `Task 2 of 5 ▾`, opening the current task panel.

### 2.2 Left sidebar (fixed, 220px wide, collapsible to icon-only 56px)
Vertical list of nav items, each with icon + label. Active item gets a left-border accent (3px, primary teal) and light background tint.

```
📊 Campaign Manager       (home — default landing)
📁 Portfolios
📦 Products
🎯 Targeting              (account-wide, cross-campaign)
💰 Budgets
📤 Bulk Operations
💡 Recommendations
📈 Measurement & Reporting
🏬 Brand Store            (only shown if hasBrandStore OR isBrandRegistered)
⚙️ Settings
```
At the very bottom of the sidebar, a small fixed footer: trainee avatar + name, and (in scenario mode) a progress ring showing % of current scenario's checks passed — this gives constant low-key feedback without needing a separate page.

### 2.3 Breadcrumb row (appears below top bar on any non-home page)
`Campaign Manager  ›  Summer Sale SP  ›  Ad Group: Broad Match Set`
Each segment is clickable and navigates back up the hierarchy. This single element is doing a lot of pedagogical work — it's the constant visual reminder of the Portfolio > Campaign > Ad Group hierarchy from the schema.

---

## 3. Campaign Manager (home / landing page)

### 3.1 KPI summary strip
A row of 6 cards (not a table), each: metric label (small, grey, uppercase, 11px) over a large number (24px bold), with a tiny sparkline beneath showing the trend across the selected date range. Cards: **Spend, Sales, ACOS, ROAS, Impressions, Clicks**. This row should re-fetch/re-render whenever date range or account changes — never stale.

### 3.2 Filter row
Below the KPI strip, a horizontal bar:
- Campaign type filter: segmented control — `All | SP | SB | SD`
- Status filter: dropdown — All / Enabled / Paused / Archived / Pending Review
- Portfolio filter: dropdown populated from the account's portfolios
- Campaign name search box (right-aligned)
- **"Create campaign"** primary button (rightmost, orange, always visible — never buried)

### 3.3 Campaign table
Columns, in order: checkbox · Status (toggle switch, not just a badge — clicking it pauses/enables immediately, no confirmation needed for pause, but a confirmation modal for archive) · Name (clickable, navigates to campaign detail) · Type (small colored badge: SP blue / SB purple / SD green) · Subtype (secondary text under the type badge, e.g. "Manual · Keyword" or "Store Spotlight") · Portfolio · Budget · Impressions · Clicks · CTR · Spend · Sales · ACOS · ROAS.

- **Column customization:** a "Columns" button above the top-right of the table opens a checklist dropdown (per the real console pattern) — trainees can add/remove/reorder columns. Persist this preference per trainee in local state (not the schema — it's a UI preference, not training data).
- **Row hover:** background tints to `#F7F8FA`, and a small "⋯" overflow menu appears on the right with: Edit budget, Duplicate, Archive.
- **Bulk select:** checking 2+ rows triggers a contextual action bar that **slides down from the top of the table** (not a floating toolbar) with: Pause, Enable, Archive, Edit budget (opens a small inline batch-edit popover, not a full page).
- **Empty state:** if no campaigns exist yet (fresh seeded account), show a centered illustration-free message: *"No campaigns yet. Create your first Sponsored Products, Brands, or Display campaign."* with the Create button repeated centrally.
- **Loading state:** skeleton rows (grey animated bars), not a spinner — matches real console behavior and avoids a jarring layout shift.

---

## 4. Create Campaign — type selection (step 0 of every wizard)

Full-page view (not a modal — wizards in this product are always their own route, e.g. `/campaigns/new`). Three large cards side by side:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ SP icon      │  │ SB icon     │  │ SD icon     │
│ Sponsored    │  │ Sponsored   │  │ Sponsored   │
│ Products     │  │ Brands      │  │ Display     │
│ "Promote     │  │ "Build      │  │ "Reach      │
│ individual   │  │ brand       │  │ audiences   │
│ listings in  │  │ awareness   │  │ on and off  │
│ search"      │  │ with logo + │  │ Amazon"     │
│              │  │ headline"   │  │             │
│ [Select]     │  │ [Select]    │  │ [Select]    │
└─────────────┘  └─────────────┘  └─────────────┘
```
If the active `MockSellerAccount.isBrandRegistered` is `false`, the SB and SD cards render with 50% opacity, the button reads "Requires Brand Registry," and is disabled. Hovering shows a tooltip: *"This account isn't enrolled in Brand Registry yet."* — never silently hide the option.

Selecting a card navigates to that type's wizard route and begins a **stepper UI**: a horizontal progress indicator at the top showing step labels (e.g. `Settings → Targeting → Ad Group → Negatives → Review`), current step highlighted, completed steps checked. Back/Next buttons are fixed at the bottom of the viewport, always visible without scrolling.

---

## 5. Sponsored Products wizard — step by step

**Step 1 — Settings**
Form fields, top to bottom, each with a label above and helper text below in 12px grey:
- Campaign name (text input, required, helper: *"Not visible to shoppers"*)
- Portfolio (dropdown, optional, default "No portfolio")
- Start date (date picker, default = today, cannot be in the past)
- End date (date picker, optional — toggle switch "Set an end date" reveals the field, off by default to mirror "run continuously" being the common real choice)
- Budget type (segmented control: Daily / Lifetime)
- Daily budget (currency input, $ prefix, helper: *"We recommend at least $10/day to ensure consistent delivery"* — pull this from real guidance)

**Step 2 — Targeting type**
Two large radio cards: **Automatic targeting** (helper: *"Amazon matches your ads to relevant search terms and products automatically"*) vs **Manual targeting** (helper: *"You choose specific keywords or products"*). Selecting Manual reveals a second-level radio pair beneath it, indented and connected with a small vertical line to show it's a sub-choice: Keyword targeting / Product targeting.

**Step 3 — Bidding strategy**
Three radio cards in a row, each with a small static diagram (a simple line showing how the bid behaves): Dynamic bids – down only / Dynamic bids – up and down / Fixed bids. Selecting "up and down" reveals an inline note: *"Amazon may raise your bid by up to 100% for top-of-search placements when a conversion is more likely."*

**Step 4 — Ad group**
- Ad group name input + default bid currency input, side by side
- Below: a product search box (searches the seeded `MockProduct` catalog by ASIN/title). Selecting products adds them to a list below, each row showing: thumbnail (60x60px), title (truncated to 2 lines), ASIN, price, and an **eligibility badge**:
  - 🟢 `Ready` — green
  - 🟡 `Not Ready — Out of Stock` — amber, with a tooltip: *"This product must be in stock to serve ads."*
  - 🟡 `Not Ready — No Buy Box` — amber
  - 🔴 `Not Ready — Suppressed Listing` — red
  This is one of the highest-value teaching moments in the wizard — don't let it be a passive label; make the badge clickable to expand a one-line explanation of the fix.

**Step 5 — Keywords/targets** (only shown if Manual was chosen in Step 2)
- A large textarea with placeholder *"Enter one keyword per line"* and a match-type dropdown (Broad/Phrase/Exact) applied to all pasted lines by default, individually overridable per row once parsed into the table below.
- Below the textarea, once keywords are entered, they render as an editable table: Keyword text · Match type (dropdown) · Bid (currency input) · **Suggested bid range** (greyed text, e.g. `$0.75–$1.40`, non-editable, just informational) · Remove (✕ icon).
- A secondary tab within this step: **"Suggested keywords"** — a pre-populated checklist of Amazon-generated suggestions (mock data), each with a checkbox, the keyword text, match type dropdown, and suggested bid — checking adds it to the table above.

**Step 6 — Negative keywords**
Same textarea-to-table pattern as Step 5, but with a Negative Match Type dropdown (Negative Exact / Negative Phrase) instead of the three standard match types, and no bid field (negatives don't have bids).

**Step 7 — Review**
A read-only summary card reproducing every choice made above, grouped under mini-headers matching the step names, each with a small "Edit" link that jumps back to that step without losing other progress. Bottom: a final **"Launch campaign"** primary button. On click: optimistic UI (button shows a spinner + "Launching...") then redirect to the new campaign's detail page with a success toast: *"Campaign launched. It may take a few minutes before it starts serving."*

---

## 6. Sponsored Brands wizard — step by step

**Step 1 — Settings** — same fields as SP Step 1, no bidding-strategy step (SB doesn't expose that choice the same way).

**Step 2 — Ad format** (the critical fork)
Three cards, each rendering a **live mock preview** of the ad as it'll actually look in search results — not just an icon and label:
- **Product Collection** preview: a horizontal card showing logo placeholder + headline placeholder text + 3 product thumbnails in a row
- **Store Spotlight** preview: logo + headline + 3 labeled "sub-page" tiles
- **Video** preview: a single product thumbnail with a play-button overlay

If `hasBrandStore` is false or `storeSubpageCount < 3`, the Store Spotlight card is disabled with the tooltip: *"Requires a Brand Store with at least 3 sub-pages. You have [N]."* — surfacing the exact current count, not just a generic block.

**Step 3 — Landing page** (skipped entirely for Video, which is hard-locked to the product detail page)
Radio choice: Brand Store / Custom landing page (Product Collection only) / Store sub-page picker (Store Spotlight only — shows a grid of up to 3 selectable sub-pages with thumbnails, drag-to-reorder).

**Step 4 — Targeting**
Same Keyword/Product targeting choice and table pattern as SP steps 5–6, reused as a shared component (`<TargetingEditor type="keyword|product" />`) since the underlying interaction is identical.

**Step 5 — Creative**
- Logo upload (drag-and-drop box, 400x400px recommended dimensions shown as helper text)
- Headline text input with a **live character counter**: `24/50` that turns amber at 45 and won't submit past 50
- Product/sub-page selector (format-dependent, reusing the picker from Step 2's preview)
- A live preview panel on the right half of the screen, updating in real time as fields are filled — this mirrors the real console's side-by-side editor/preview pattern and is worth the implementation cost since it's the main feedback loop for this step.

**Step 6 — Review & submit**
Same pattern as SP, but the final button reads **"Submit for review"** not "Launch" — and the success state explicitly shows the campaign landing in `PENDING_REVIEW` status with a mock countdown: *"Under review — typically completed within 72 hours."* Implement this as a real elapsed-time mock (e.g., compress to a few minutes of real time, or let the trainee manually advance simulated time) so the status actually transitions instead of staying permanently pending.

---

## 7. Sponsored Display wizard — step by step

**Step 1 — Settings** — same as SP, plus a **Bid optimization goal** dropdown: Page visits / Conversions / Brand awareness (visible/reach).

**Step 2 — Targeting tactic** (the fork)
Two cards: **Contextual targeting** vs **Audiences**.

*If Contextual:* sub-choice radio (Product targeting / Category targeting). Product targeting opens an ASIN search identical to the SP product picker. Category targeting opens a category tree (expandable nested list) plus refinement checkboxes/sliders: Price range (min/max sliders), Brand (multi-select), Star rating (minimum, star-icon selector), Prime shipping only (toggle).

*If Audiences:* a segment browser laid out as two labeled sections:
- **Remarketing** — Views remarketing / Purchases remarketing, each as a card that, when selected, reveals a lookback window dropdown (7/14/30/60/90 days) and an "exclude products" multi-select (relevant for cross-sell campaigns per the schema's `excludedProductIds`).
- **Prospecting** — In-market / Lifestyle / Competitor viewers, each a simple selectable card with a one-line description and a mock "estimated segment size" badge (e.g. *"~480K shoppers"*) — this number matters to real PPC managers when judging if a segment is even worth bidding on, so don't omit it as a detail.

**Step 3 — Ad group + creative**
Product picker (same component as SP), then a creative section: toggle between "Automated creative" (Amazon auto-generates from the product listing — show a live preview pulling the mock product's title/image/price/rating) and "Custom creative" (logo + headline + lifestyle image upload fields, same pattern as SB).

**Step 4 — Review & launch** — same pattern as SP.

---

## 8. Campaign detail page

Tabs vary by campaign type (this is a critical implementation detail — don't render a generic tab set and hide irrelevant ones; literally compute the tab list from `campaign.campaignType`):

| Tab | SP | SB | SD |
|---|---|---|---|
| Ad groups | ✓ | ✓ | ✓ |
| Targeting | ✓ | ✓ | ✓ |
| Negative targeting | ✓ | ✓ | ✓ |
| Search terms | ✓ | ✓ | — |
| Placements | ✓ | — | — |
| Creative | — | ✓ | — |
| Settings | ✓ | ✓ | ✓ |

KPI strip at the top is type-specific per the metrics breakdown from the prior message (SP: standard set; SB: adds NTB Orders/Sales; SD: adds Viewability/DPV rate). Implement this as a config object keyed by campaign type that defines which metric cards render, rather than conditional JSX scattered through the component — keeps it maintainable as more types/metrics get added later.

### 8.1 Ad groups tab
Table: Name · Status (toggle) · Default bid (inline-editable on click — click the number, it becomes a text input with a checkmark/✕ to confirm/cancel) · Impressions · Clicks · CTR · CPC · Spend · Sales (7/14-day label per type) · ACOS · ROAS · Orders · Units · CVR.

### 8.2 Targeting tab
Same row pattern, but the leftmost column adapts to what's being targeted: keyword text (SP/SB), ASIN/category chip (SD contextual), or segment name (SD audiences). Bid is always inline-editable. A small "Suggested bid: $X–$Y" appears as greyed secondary text directly under the bid value, not in a separate column — keeps the eye on one place.

### 8.3 Negative targeting tab
Two sections on one page (not sub-tabs): "Campaign-level negatives" and "Ad-group-level negatives," each its own small table with an "Add negative" button opening the same textarea-input pattern used in the wizard.

### 8.4 Search terms tab (SP/SB only)
Table: Search term (the actual customer query text) · Matched keyword (which of your keywords triggered it) · Impressions · Clicks · Spend · Orders · Sales · ACOS. **On row hover**, two small icon buttons fade in on the right: `+ Add as keyword` and `– Add as negative`. Clicking `+` opens a small inline popover (not a full drawer) pre-filled with the search term text and a match-type dropdown, confirm button "Add." Clicking `–` opens a similar tiny popover for negative match type. After confirming either, the row gets a small badge replacing the icons: `Added as keyword ✓` or `Added as negative ✓`, and is visually de-emphasized (lighter text) but stays in the table rather than disappearing — trainees should be able to see what they've already acted on.

### 8.5 Placements tab (SP only)
Three rows, dead simple: Top of search / Product pages / Rest of search, each with a single percentage input (e.g. `+150%`) and a small descriptive caption under each row name explaining what the placement means.

### 8.6 Creative tab (SB only)
Renders the actual ad preview (reusing the live-preview component from the wizard) plus a status section: `Status: Pending review` / `Live` / `Rejected — [reason]`, and an "Edit creative" button that reopens the wizard's creative step in an edit context.

---

## 9. Keyword/target detail (slide-over drawer)

Clicking any row in a Targeting table opens a **right-side Sheet** (480px wide, not full-screen) — never a separate page for this level, since it's a quick-glance/quick-edit interaction in real usage.

Contents top to bottom:
1. Header: the keyword/target text, large, with the match type as a badge next to it, and a status toggle
2. Bid section: current bid (editable), suggested range, a "match closest suggestion" small text-button
3. A trend chart (line chart, Recharts) — Impressions/Clicks/Spend toggleable as separate lines via a small legend, x-axis = the active date range
4. A metrics table below the chart: the full metric row (same columns as the parent table) repeated as labeled key-value pairs for easy scanning
5. Footer: "Pause" / "Archive" buttons, and a close (✕) in the top-right corner of the sheet

---

## 10. Other major pages (brief specs — lower build priority than 3–9 above)

**Products page** — table of all `MockProduct` rows tied to ads, columns: thumbnail/title/ASIN, Impressions, Clicks, ROAS, listing-health badge. Row selection → "Add to campaign" bulk action opens a small modal: pick existing campaign + ad group, or "create new campaign" shortcut into the wizard with the product pre-selected.

**Budgets page** — table of campaigns with: % of time in-budget (progress bar, red under 80%), estimated missed impressions/clicks/sales (range, e.g. `120–340`), recommended budget (with a one-click "Apply" button that pre-fills the new budget value into an inline editor).

**Bulk Operations page** — two big buttons up top: "Download template" / "Download current account data," then a drag-and-drop upload zone below. After upload, show a **processing log panel**: row-by-row validation results (✓ success / ✗ error with the specific reason, e.g. *"Row 14: Default Bid contains invalid character '$'"*) — this error log is the actual teaching surface, so make it detailed and specific, not a generic "upload failed."

**Recommendations page** — card feed, each card: recommendation text, affected entity (linked), Accept/Dismiss buttons, and a small "Why am I seeing this?" expandable explaining the underlying signal (e.g. "This keyword's impression share dropped below 30% in the last 7 days").

**Measurement & Reporting page** — a "Create report" button opens a form: Ad product dropdown, Report type dropdown (Search term / Placement / Targeting / Search Term Impression Share / Category Benchmark — SB), time unit, date range → "Run report" generates a downloadable/viewable table matching the schema's `SearchTermReportRow` and `PerformanceMetric` shapes.

**Brand Store builder** — simplified: a sub-page tree on the left (add/rename/reorder), a basic block-based content area in the center (image block, text block, product-grid block), live preview toggle. This only needs to be functional enough to let trainees see *why* Store Spotlight eligibility exists — it doesn't need real design tooling depth.

**Settings page** — tabs: Billing (mock payment method card, invoice list), User access (table of trainee/team rows with role dropdowns), Notifications preferences (toggle list).

---

## 11. Scenario Mode UI (the training layer)

This sits on top of every screen above, not as a separate app.

- **Task panel** (the `Task N of M` pill from §2.1, expandable): shows the current `ScenarioTask` description, e.g. *"Launch a Sponsored Products manual campaign targeting these 5 keywords with a $50 daily budget and a 150% Top of Search bid adjustment."* Below the description, a live checklist mirroring `ScenarioCheck` rows — each line greys out with a ✓ the moment its underlying condition becomes true in the database, computed via a polling/subscription check after every mutation, **not** by the trainee manually clicking "I'm done."
- **Mistake-injection scenarios** start with a seeded account state that's deliberately broken (e.g., a product already out of stock, or a Store with only 2 sub-pages) — no special UI is needed for this; the existing eligibility badges and disabled states from §5–7 are themselves the puzzle.
- **Completion state**: when all checks pass, a non-blocking toast banner slides in from the top: *"Task complete — 4/4 checks passed."* with a "Next task" button. If the trainee tries to "submit" early with checks failing, show which specific checks are unmet rather than a generic failure message — specificity here is the entire pedagogical value.
- **Sandbox mode** (no active `ScenarioRun`) simply hides the task panel entirely — same UI, zero scoring overhead.

---

## 12. Interaction conventions (apply everywhere, not just one screen)

- **Inline edit pattern:** any editable numeric field (bid, budget, percentage) is click-to-edit: displayed as plain text until clicked, then becomes a bordered input with a small ✓/✕ pair, Enter confirms, Escape cancels.
- **Status toggles:** always a Switch component, never a dropdown — pausing/enabling is a one-click action, with a brief inline loading spinner on the switch itself (not a page-level spinner) while the mutation completes.
- **Destructive actions** (archive, delete negative target): always a confirmation `Dialog`, never instant.
- **Bulk actions:** always the slide-down contextual bar pattern from §3.3, reused identically on every table in the app (Ad groups, Targeting, Products, Search terms) — one shared component.
- **Toasts** for success/info, inline banners for warnings tied to a specific entity (e.g., budget-limited flag), never a blocking modal for non-destructive feedback.
- **Empty and loading states** must exist for every table in the app before it's considered done — skeleton rows for loading, a one-line message + relevant CTA for empty.

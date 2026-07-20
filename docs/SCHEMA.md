# Data Schema Reference

All types are defined in `src/engine/ad-console/core/types.ts` (core) and `src/engine/ad-console/features/*/types.ts` (features).

---

## Core Types (`core/types.ts`)

### Enums / Literal Unions

```ts
type CampaignType    = 'SP' | 'SB' | 'SD';
type CampaignStatus  = 'Enabled' | 'Paused' | 'Archived' | 'Draft';
type CampaignGoal    = 'Awareness' | 'Consideration' | 'Conversions';
type TargetingMode   = 'Automatic' | 'Manual keyword' | 'Manual product' | 'Keyword' | 'Product' | 'Category' | 'Contextual' | 'Audiences - views remarketing' | 'Audiences - purchases remarketing' | 'Categories';
type BidStrategy     = 'Dynamic bids - down only' | 'Dynamic bids - up and down' | 'Fixed bids' | 'Cost per click' | 'Cost per thousand impressions';
type MatchType       = 'Exact' | 'Phrase' | 'Broad';
type NegativeType    = 'Negative exact' | 'Negative phrase' | 'Negative ASIN' | 'Negative category';
type NegativeStatus  = 'Enabled' | 'Paused';   // a Paused negative is kept but stops filtering
type AdFormat        = 'Standard' | 'Video' | 'Product collection' | 'Store spotlight' | 'Auto generated' | 'Custom image' | 'Video creative';
type ConsoleView     = 'dashboard' | 'campaigns' | 'create' | 'detail' | 'portfolio'
                     | 'drills' | 'reports' | 'bulk' | 'trainer' | 'integrity' | 'missions';

// SP automatic-targeting groups (Step 4 of the wizard)
interface AutoTargetGroup    { enabled: boolean; bid: number }
interface AutoTargetSettings {
  closeMatch: AutoTargetGroup; looseMatch: AutoTargetGroup;
  substitutes: AutoTargetGroup; complements: AutoTargetGroup;
}
```

### Metrics

```ts
interface Metrics {
  impressions: number;  // Total ad impressions
  clicks: number;       // Total ad clicks
  spend: number;        // Total ad spend in dollars
  sales: number;        // Total attributed sales in dollars
  orders: number;       // Total attributed orders
}

interface DerivedMetrics {
  ctr: number;   // Click-through rate (0–100%)
  cpc: number;   // Cost per click in dollars
  acos: number;  // Advertising cost of sales (0–100%)
  roas: number;  // Return on ad spend (multiplier)
  cvr: number;   // Conversion rate (0–100%)
}
```

### Campaign

```ts
interface Campaign {
  id: string;                          // Unique ID (e.g., "C-SP-AUTO-001")
  type: CampaignType;                  // SP, SB, or SD
  name: string;                        // Human-readable name
  portfolio: PortfolioType;            // Portfolio grouping name
  portfolioId?: string;                // API portfolio id (optional)
  status: CampaignStatus;              // Enabled, Paused, Archived, Draft
  dailyBudget: number;                 // Daily budget in dollars
  defaultBid: number;                  // Default CPC bid in dollars (clamped 0.02–999.99)
  startDate: string;                   // ISO date string (YYYY-MM-DD)
  endDate: string | null;              // Optional end date
  targetingMode: TargetingMode;        // How ads are targeted
  adFormat: AdFormat;                  // Creative format
  campaignGoal?: CampaignGoal;         // Awareness / Consideration / Conversions (SD)
  bidStrategy: BidStrategy;            // Bid optimization strategy
  placements: {                        // Placement bid adjustments (%)
    top: number;     // Top of Search
    product: number; // Product pages
    rest: number;    // Rest of Search
  };
  products: string[];                  // ASINs in this campaign
  creative: Creative | null;           // SB/SD creative (null for SP)
  creativeStatus?: string;             // Approved, Pending, Rejected
  creativeIssue?: string;              // Rejection reason text
  metrics: Metrics;                    // Campaign-level metrics
  adGroups: AdGroup[];                 // Child ad groups
  targets: Target[];                   // Keyword/product/auto/audience targets
  searchTerms: SearchTerm[];           // Customer search term data
  negatives: Negative[];               // Negative keywords/targets
  budgetRules: BudgetRule[];           // Budget rule automation
  productAds: ProductAd[];             // SP/SB advertised products
  ads: Ad[];                           // SB/SD creative variations
  history: string[];                   // Change history log
  createdBySimulator?: boolean;        // Flag for simulator-created campaigns
}
```

These fields (`portfolioId`, `campaignGoal`, `productAds`, `ads`,
`creativeStatus`, `creativeIssue`, `createdBySimulator`) all round-trip through
the database — see the `Campaign` columns in `prisma/schema.prisma`.

### Ad Group

```ts
interface AdGroup {
  id: string;              // Unique ID (e.g., "AG-SP-001")
  campaignId: string;      // Parent campaign ID
  name: string;            // Ad group name
  status: CampaignStatus;  // Enabled, Paused, etc.
  defaultBid: number;      // Default CPC for this ad group
  metrics: Metrics;        // Ad group-level metrics
}
```

### Target (Keyword / Product Target)

```ts
interface Target {
  id: string;              // Unique ID (e.g., "T-SP-001")
  campaignId: string;      // Parent campaign ID
  adGroupId: string;       // Parent ad group ID
  type: string;            // 'Keyword' | 'Auto' | 'ASIN' | 'Category' | 'Audience'
  value: string;           // The keyword text or auto-target label
  match: MatchType | string; // Exact, Phrase, Broad, or '' for non-keywords
  bid: number;             // CPC bid in dollars (clamped 0.02–999.99)
  status: CampaignStatus;  // Enabled, Paused, Archived
  refinements?: {          // product/category targeting refinements
    brand?: string; minPrice?: number; maxPrice?: number;
    minRating?: number; primeEligible?: boolean;
  };
  impressions: number;     // Target-level impressions
  clicks: number;          // Target-level clicks
  spend: number;           // Target-level spend
  sales: number;           // Target-level sales
  orders: number;          // Target-level orders
}
```

### Search Term

```ts
interface SearchTerm {
  id: string;              // Unique ID (e.g., "ST-A-001")
  campaignId: string;      // Parent campaign ID
  adGroupId: string;       // Parent ad group ID
  term: string;            // Customer's search query
  targetId: string;        // ID of the target that matched
  targetValue: string;     // Value of that target
  targetType: string;      // Type of that target (e.g. 'Keyword')
  matchType: MatchType | string; // Match type of the matched keyword
  target?: string;         // Legacy alias for targetValue (back-compat)
  recommendation?: string; // 'Add as exact keyword' | 'Negate' | 'Review'
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
}
```

### Negative Keyword

```ts
interface Negative {
  id: string;              // Unique ID (e.g., "NEG-M-001")
  campaignId: string;
  adGroupId: string | null;    // null = campaign-level, string = ad-group level
  type: NegativeType;      // Negative exact | phrase | ASIN | category
  value: string;           // The negative keyword / ASIN / category text
  status?: NegativeStatus; // Enabled (filtering) or Paused (kept, inactive); default Enabled
  sourceSearchTermId?: string; // Original search term that prompted negation
}
```

### Budget Rule

```ts
interface BudgetRule {
  id: string;
  campaignId: string;
  name: string;            // Rule name (e.g., "Weekend boost")
  type: 'Schedule' | 'Performance';
  increase: number;        // Budget multiplier (e.g., 1.5 = +50%)
  condition: string;       // Condition description
  // Schedule-specific
  startDate?: string;
  endDate?: string;
  scheduleType?: 'One-time' | 'Daily' | 'Weekly' | 'Monthly';
  daysOfWeek?: number[];   // 0=Sun … 6=Sat
}
```

### Product Ad / Ad

```ts
interface ProductAd {      // SP/SB advertised ASIN
  id: string; campaignId: string; adGroupId: string;
  asin: string; status: CampaignStatus; metrics: Metrics;
}

interface Ad {             // SB/SD creative variation
  id: string; campaignId: string; adGroupId: string;
  adFormat: AdFormat; status: CampaignStatus;
  creative: Creative; metrics: Metrics;
}
```

### Creative

```ts
interface Creative {
  brandName: string;       // Brand display name
  logo: string;            // Logo identifier
  headline: string;        // Ad headline text
  destination: string;     // 'Product detail page' | 'Brand Store'
  video: string;           // Video asset reference
  image: string;           // Image asset reference
}
```

### Product Catalog

```ts
interface Product {
  asin: string;            // Amazon Standard Identification Number
  title: string;           // Product title
  price: number;           // Price in dollars
  category: string;        // Product category
  status: string;          // 'In stock' | 'Low Inventory' | etc.
  rating: number;          // Star rating (1-5)
  reviews: number;         // Review count
  image: string;           // Emoji or image reference
}
```

### Campaign Draft (Wizard)

```ts
interface CampaignDraft {
  type: CampaignType;
  name: string;
  portfolio: string;
  status: CampaignStatus;
  dailyBudget: number;
  defaultBid: number;
  startDate: string;
  endDate: string;
  targetingMode: TargetingMode;
  adFormat: AdFormat;
  bidStrategy: BidStrategy;
  placements: { top: number; product: number; rest: number };
  campaignGoal?: CampaignGoal;
  products: string[];
  creative: Partial<Creative>;
  keywords: string;          // One-per-line keyword text input
  keywordMatchTypes: MatchType[]; // Match types each keyword is added under
  asinTargets: string;
  categoryTargets: string;
  audienceTargets: string;
  audienceLookback: string;  // SB/SD remarketing lookback window (days)
  autoTargets: AutoTargetSettings; // SP automatic-targeting group bids
}
```

### Application State

```ts
interface FilterState {
  type: 'All' | CampaignType;
  status: 'All' | CampaignStatus;
  portfolio: 'All' | string;
  search: string;
}

interface AdConsoleState {
  version: string;
  campaigns: Campaign[];
  filter: FilterState;
  selectedCampaignId: string | null;
  selectedTab: string;
  simulationDays: number;
  actionLog: ActionLogEntry[];
  portfolios: string[];              // Known portfolio names (excluding 'All')
}

interface ActionLogEntry {
  timestamp: string;
  type: string;
  message: string;
  tone: 'good' | 'bad' | 'warn';
}

### Mobile Menu State

```ts
type MenuStatus = 'closed' | 'open' | 'closing';

interface MobileMenuState {
  status: MenuStatus;
}
```

### Hook

```ts
function useBreakpoint(): {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}
```
```

---

## Feature Types

### Drills (`features/drills/types.ts`)

```ts
type DrillId =
  | 'nav-sp-search-term-negative'
  | 'nav-sp-placement-controls'
  | 'nav-sb-creative-review'
  | 'nav-report-request'
  | 'nav-sd-audience-path';

interface DrillStep {
  instruction: string;
  targetAction: string;
  hint?: string;
  skippable?: boolean;
}

interface DrillDefinition {
  id: DrillId;
  title: string;
  description: string;
  adType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  actions: string[];
  steps: DrillStep[];
}

interface DrillResult {
  drillId: DrillId;
  traineeName: string;
  completedAt: string;
  score: number;        // 0-100
  mistakes: number;
  skips: number;
  totalSteps: number;
}

interface DrillSession {
  drillId: DrillId | null;
  currentStep: number;
  mistakes: number;
  skips: number;
  startedAt: string | null;
  completed: boolean;
  log: string[];
}
```

### Profiles (`features/profiles/types.ts`)

```ts
interface TraineeProfile {
  id: string;
  name: string;
  createdAt: string;
  lastActiveAt: string;
}

interface ProfileState {
  activeProfileId: string;
  profiles: TraineeProfile[];
}
```

### Trainer (`features/trainer/types.ts`)

```ts
interface TrainerNote {
  id: string;
  timestamp: string;
  text: string;
}

interface ActionGrade {
  timestamp: string;
  type: string;
  message: string;
  tone: 'good' | 'bad' | 'warn';
}

interface CertificationItem {
  id: string;
  label: string;
  checked: boolean;
}

interface TrainerState {
  notes: TrainerNote[];
  certificationChecklist: CertificationItem[];
}
```

### Bulk (`features/bulk/types.ts`)

```ts
interface BulkRow {
  entity: string;       // 'campaign' | 'adGroup' | 'target' | 'negative' | 'budgetRule'
  operation: string;    // 'update' | 'pause' | 'enable' | 'archive' | 'delete' | 'create'
  id?: string;
  name?: string;
  campaignName?: string;
  campaignId?: string;
  adGroupId?: string;
  field?: string;
  value?: string;
  [key: string]: string | undefined;  // Extensible for additional fields
}

interface BulkValidationError {
  row: number;
  field: string;
  message: string;
}

interface BulkPreview {
  rows: BulkRow[];
  valid: boolean;
  errors: BulkValidationError[];
  summary: string;
}
```

### Reports (`features/reports/types.ts`)

```ts
type ReportType = 'campaign' | 'adGroup' | 'target' | 'searchTerm' | 'placement';

interface ReportRequest {
  id: string;
  type: ReportType;
  status: 'pending' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
}

interface ReportRow {
  [key: string]: string | number;
}

interface Report {
  id: string;
  type: ReportType;
  rows: ReportRow[];
  generatedAt: string;
}
```

### Missions (`features/missions/types.ts`)

```ts
interface Mission {
  id: string;
  title: string;
  description: string;
  adType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: MissionStep[];
}

interface MissionStep {
  instruction: string;
  expectedAction: string;
  hint: string;
}

interface MissionSession {
  missionId: string | null;
  currentStep: number;
  score: number;        // Starts at 100, -10 per hint
  startedAt: string | null;
  completed: boolean;
  hintsUsed: number;
}

interface ScenarioDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  setup: {
    campaignId: string;
    targetAcos: number;
  };
}
```

### Integrity (`features/integrity/types.ts`)

```ts
interface IntegrityIssue {
  id: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  entityId: string;
  entityType: string;
  recommendation: string;
}

interface IntegrityReport {
  score: number;         // 0-100, passes at ≥70
  issues: IntegrityIssue[];
  passed: boolean;
  lastRun: string | null;
}
```

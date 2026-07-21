/**
 * Amazon Ad Console — domain types.
 *
 * Pure TypeScript, zero dependencies. Designed to be portable
 * across projects (amph-v2, standalone, etc.).
 *
 * Entity hierarchy mirrors Amazon Ads API:
 * Account → Portfolio → Campaign → AdGroup → (Target/Keyword | ProductAd | Ad)
 *                              → SearchTerm (report, linked to Target)
 *                              → Negative (campaign or ad group level)
 *                              → BudgetRule (campaign level)
 */

// ---------------------------------------------------------------------------
// Enums / Literal unions
// ---------------------------------------------------------------------------

export type CampaignType = 'SP' | 'SB' | 'SD';
export type CampaignStatus = 'Enabled' | 'Paused' | 'Archived' | 'Draft';

/** Campaign targeting mode (SP only: Automatic vs Manual keyword/product) */
export type TargetingMode =
  | 'Automatic'
  | 'Manual keyword'
  | 'Manual product'
  | 'Keyword'
  | 'Product'
  | 'Category'
  | 'Contextual'
  | 'Audiences - views remarketing'
  | 'Audiences - purchases remarketing'
  | 'Categories';

/** Bid strategy at campaign level */
export type BidStrategy =
  | 'Dynamic bids - down only'
  | 'Dynamic bids - up and down'
  | 'Fixed bids'
  | 'Cost per click'
  | 'Cost per thousand impressions';

/** Keyword match types */
export type MatchType = 'Exact' | 'Phrase' | 'Broad';

/** Ad formats by campaign type */
export type AdFormat =
  | 'Standard'
  | 'Video'
  | 'Product collection'
  | 'Store spotlight'
  | 'Auto generated'
  | 'Custom image'
  | 'Video creative';

/** Portfolio is free-text name in simulator; API uses portfolioId */
export type PortfolioType = string;
export type CampaignGoal = 'Awareness' | 'Consideration' | 'Conversions';

/** Target types across campaign types */
export type TargetType =
  | 'Keyword'
  | 'Auto - close match'
  | 'Auto - loose match'
  | 'Auto - substitutes'
  | 'Auto - complements'
  | 'ASIN'
  | 'Category'
  | 'Audience - views remarketing'
  | 'Audience - purchases remarketing'
  | 'Audience - in-market'
  | 'Audience - lifestyle'
  | 'Audience - interests'
  | 'Audience - life events'
  | 'Contextual';

/** Negative keyword/target types */
export type NegativeType =
  | 'Negative exact'
  | 'Negative phrase'
  | 'Negative ASIN'
  | 'Negative category';

/** Budget rule types */
export type BudgetRuleType = 'Schedule' | 'Performance';

/** Schedule types for budget rules */
export type ScheduleType = 'One-time' | 'Daily' | 'Weekly' | 'Monthly';

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export interface Metrics {
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
}

export interface DerivedMetrics {
  ctr: number;  // 0-100
  cpc: number;
  acos: number; // 0-100
  roas: number;
  cvr: number;  // 0-100
}

// ---------------------------------------------------------------------------
// Campaign entities (mirror Amazon Ads Console data shapes)
// ---------------------------------------------------------------------------

/** Target/Keyword at ad group level */
export interface Target {
  id: string;
  campaignId: string;
  adGroupId: string;
  type: TargetType;
  value: string;           // keyword text, ASIN, category path, audience name
  match: MatchType | string; // MatchType for keywords, empty for others
  bid: number;             // individual bid (overrides ad group defaultBid)
  status: CampaignStatus;
  // Refinements for product/category targeting
  refinements?: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    primeEligible?: boolean;
  };
  // Performance
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
}

/** Search term report row — linked to the target it matched */
export interface SearchTerm {
  id: string;
  campaignId: string;
  adGroupId: string;
  term: string;           // actual shopper search query
  targetId: string;       // ID of the target/keyword that matched
  targetValue: string;    // value of that target
  targetType: TargetType; // type of that target
  matchType: MatchType | string; // match type of the target (for keywords)
  // Legacy field for backward compat during migration
  target?: string;
  // Performance
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  recommendation?: string; // 'Add as exact' | 'Add as negative' | 'Review'
}

/** Negative keyword or target at campaign or ad group level */
export interface Negative {
  id: string;
  campaignId: string;
  adGroupId: string | null;      // null = campaign-level, string = ad group level
  type: NegativeType;
  value: string;          // keyword text, ASIN, or category path
  sourceSearchTermId?: string; // if created from search term harvesting
}

/** Budget rule at campaign level */
export interface BudgetRule {
  id: string;
  campaignId: string;
  name: string;
  type: BudgetRuleType;
  increase: number;       // multiplier (e.g., 1.5 = 50% increase)
  condition: string;      // 'ACOS < 20%' or schedule description
  // Schedule-specific fields
  startDate?: string;
  endDate?: string;
  scheduleType?: ScheduleType;
  daysOfWeek?: number[];  // 0=Sun ... 6=Sat
}

/** Creative for SB/SD campaigns */
export interface Creative {
  brandName: string;
  logo: string;
  headline: string;
  destination: string;
  video: string;
  image: string;
}

/** Ad group — contains targets/keywords and product ads */
export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  defaultBid: number;     // default bid for targets in this ad group
  metrics: Metrics;
}

/** Product ad (Sponsored Products / Sponsored Brands) — the ASIN being advertised */
export interface ProductAd {
  id: string;
  campaignId: string;
  adGroupId: string;
  asin: string;
  status: CampaignStatus;
  metrics: Metrics;
}

/** Ad (Sponsored Brands / Sponsored Display) — creative variation */
export interface Ad {
  id: string;
  campaignId: string;
  adGroupId: string;
  adFormat: AdFormat;
  status: CampaignStatus;
  creative: Creative;
  metrics: Metrics;
}

/** Campaign — top-level container with budget, strategy, and child entities */
export interface Campaign {
  id: string;
  type: CampaignType;
  name: string;
  portfolio: PortfolioType;
  portfolioId?: string;   // API portfolio ID
  status: CampaignStatus;
  dailyBudget: number;
  defaultBid: number;     // fallback bid if ad group doesn't override
  startDate: string;
  endDate: string | null;
  targetingMode: TargetingMode;
  adFormat: AdFormat;
  campaignGoal?: CampaignGoal;
  bidStrategy: BidStrategy;
  placements: { top: number; product: number; rest: number };
  products: string[];     // ASINs advertised
  creative: Creative | null;
  creativeStatus?: string;
  creativeIssue?: string;
  metrics: Metrics;
  adGroups: AdGroup[];
  targets: Target[];
  searchTerms: SearchTerm[];
  negatives: Negative[];
  budgetRules: BudgetRule[];
  productAds: ProductAd[]; // SP/SB: the advertised products
  ads: Ad[];               // SB/SD: creative variations
  history: string[];
  createdBySimulator?: boolean;
}

// ---------------------------------------------------------------------------
// Product catalog (for campaign creation)
// ---------------------------------------------------------------------------

export interface Product {
  asin: string;
  title: string;
  price: number;
  category: string;
  status: string;
  rating: number;
  reviews: number;
  image: string;
}

// ---------------------------------------------------------------------------
// Campaign creation wizard
// ---------------------------------------------------------------------------

export interface CampaignDraft {
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
  campaignGoal?: CampaignGoal;
  bidStrategy: BidStrategy;
  placements: { top: number; product: number; rest: number };
  products: string[];
  creative: Partial<Creative>;
  exactKeywords: string;       // One-per-line text input
  phraseKeywords: string;      // One-per-line text input
  broadKeywords: string;       // One-per-line text input
  asinTargets: string;
  categoryTargets: string;
  audienceTargets: string;
  audienceLookback: string;
}

// ---------------------------------------------------------------------------
// Simulator state (stored in session)
// ---------------------------------------------------------------------------

export interface FilterState {
  type: 'All' | CampaignType;
  status: 'All' | CampaignStatus;
  portfolio: 'All' | string;
  search: string;
}

export interface AdConsoleState {
  version: string;
  campaigns: Campaign[];
  filter: FilterState;
  selectedCampaignId: string | null;
  selectedTab: string;
  simulationDays: number;
  actionLog: ActionLogEntry[];
  portfolios: string[];
}

export interface ActionLogEntry {
  timestamp: string;
  type: string;
  message: string;
  tone: 'good' | 'bad' | 'warn';
}

// ---------------------------------------------------------------------------
// View types
// ---------------------------------------------------------------------------

export type ConsoleView =
  | 'dashboard'
  | 'campaigns'
  | 'create'
  | 'detail'
  | 'portfolio';
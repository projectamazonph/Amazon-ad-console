/**
 * Amazon Ad Console — domain types.
 *
 * Pure TypeScript, zero dependencies. Designed to be portable
 * across projects (amph-v2, standalone, etc.).
 */

// ---------------------------------------------------------------------------
// Enums / Literal unions
// ---------------------------------------------------------------------------

export type CampaignType = 'SP' | 'SB' | 'SD';
export type CampaignStatus = 'Enabled' | 'Paused' | 'Archived' | 'Draft';
export type TargetingMode =
  | 'Automatic'
  | 'Manual keyword'
  | 'Manual product'
  | 'Keyword'
  | 'Product'
  | 'Category'
  | 'Contextual'
  | 'Audiences - views remarketing'
  | 'Audiences - purchases remarketing';
export type BidStrategy =
  | 'Dynamic bids - down only'
  | 'Dynamic bids - up and down'
  | 'Fixed bids'
  | 'Cost per click'
  | 'Cost per thousand impressions';
export type MatchType = 'Exact' | 'Phrase' | 'Broad';
export type AdFormat =
  | 'Standard'
  | 'Video'
  | 'Product collection'
  | 'Store spotlight'
  | 'Auto generated'
  | 'Custom image'
  | 'Video creative';
export type PortfolioType = string; // Free-text portfolio name

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
// Campaign objects (mirror Amazon Ads Console data shapes)
// ---------------------------------------------------------------------------

export interface Target {
  id: string;
  campaignId: string;
  adGroupId: string;
  type: string;          // 'Keyword' | 'Auto' | 'ASIN' | 'Category'
  value: string;
  match: MatchType | string;
  bid: number;
  status: CampaignStatus;
  // Performance
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
}

export interface SearchTerm {
  id: string;
  campaignId: string;
  adGroupId: string;
  term: string;
  target: string;       // Matched target value
  targetId?: string;
  recommendation?: string;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
}

export interface Negative {
  id: string;
  campaignId: string;
  adGroupId: string;
  type: string;          // 'Negative exact' | 'Negative phrase'
  value: string;
  sourceSearchTermId?: string;
}

export interface BudgetRule {
  id: string;
  campaignId: string;
  name: string;
  type: string;          // 'Schedule' | 'Performance'
  increase: number;      // Multiplier
  condition: string;
}

export interface Creative {
  brandName: string;
  logo: string;
  headline: string;
  destination: string;
  video: string;
  image: string;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  defaultBid: number;
  metrics: Metrics;
}

export interface Campaign {
  id: string;
  type: CampaignType;
  name: string;
  portfolio: PortfolioType;
  status: CampaignStatus;
  dailyBudget: number;
  defaultBid: number;
  startDate: string;
  endDate: string | null;
  targetingMode: TargetingMode;
  adFormat: AdFormat;
  bidStrategy: BidStrategy;
  placements: { top: number; product: number; rest: number };
  products: string[];
  creative: Creative | null;
  creativeStatus?: string;
  creativeIssue?: string;
  metrics: Metrics;
  adGroups: AdGroup[];
  targets: Target[];
  searchTerms: SearchTerm[];
  negatives: Negative[];
  budgetRules: BudgetRule[];
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
  bidStrategy: BidStrategy;
  placements: { top: number; product: number; rest: number };
  products: string[];
  creative: Partial<Creative>;
  keywords: string;            // One-per-line text input
  asinTargets: string;
  categoryTargets: string;
  audienceTargets: string;
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

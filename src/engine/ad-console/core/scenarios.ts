/**
 * Amazon Ad Console — training scenarios.
 *
 * Each scenario defines initial campaign/ad group/target/search term state
 * for a training session. Matches the structure used in the HTML simulator.
 */

import type { Campaign, Product } from './types';

// ---------------------------------------------------------------------------
// Product catalog
// ---------------------------------------------------------------------------

export const PRODUCTS: Product[] = [
  { asin: 'B0TRAIN001', title: 'Premium Coffee Filter (6-Cup)', price: 24.99, category: 'Coffee & Espresso', status: 'In stock', rating: 4.5, reviews: 2347, image: '☕' },
  { asin: 'B0TRAIN002', title: 'Eco-Friendly French Press', price: 39.99, category: 'Coffee & Espresso', status: 'In stock', rating: 4.3, reviews: 1843, image: '☕' },
  { asin: 'B0TRAIN003', title: 'Reusable K-Cup Pods (4-Pack)', price: 14.99, category: 'Coffee & Espresso', status: 'In stock', rating: 4.1, reviews: 3210, image: '☕' },
  { asin: 'B0TRAIN004', title: 'Stainless Steel Travel Mug', price: 29.99, category: 'Drinkware', status: 'Low Inventory', rating: 4.6, reviews: 1567, image: '🫗' },
  { asin: 'B0TRAIN005', title: 'Electric Milk Frother Wand', price: 19.99, category: 'Coffee & Espresso', status: 'In stock', rating: 4.2, reviews: 892, image: '🥛' },
];

export const DEFAULT_ASINS = ['B0TRAIN001'];

// Mock brand registry for SB/SD creative
export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export const BRANDS: Brand[] = [
  { id: 'BR-BREWCO', name: 'BrewCo', logo: 'BC' },
  { id: 'BR-TRAINING', name: 'Training Labs', logo: 'TL' },
  { id: 'BR-COFFEE', name: 'Premium Coffee Co.', logo: 'PC' },
];

// ---------------------------------------------------------------------------
// Default / initial campaigns for a fresh training session
// ---------------------------------------------------------------------------

export function defaultCampaigns(): Campaign[] {
  return [
    // SP - Auto Discovery
    {
      id: 'C-SP-AUTO-001', type: 'SP', name: 'SP | Auto | Coffee Filter | Discovery',
      portfolio: 'Coffee Accessories', status: 'Enabled', dailyBudget: 35, defaultBid: 0.72,
      startDate: '2026-06-01', endDate: null,
      targetingMode: 'Automatic', adFormat: 'Standard',
      bidStrategy: 'Dynamic bids - down only',
      placements: { top: 0, product: 0, rest: 0 },
      products: ['B0TRAIN001'],
      creative: null,
      metrics: { impressions: 43800, clicks: 285, spend: 205.20, sales: 684.00, orders: 28 },
      adGroups: [{ id: 'AG-SP-001', campaignId: 'C-SP-AUTO-001', name: 'SP Auto ad group', status: 'Enabled', defaultBid: 0.72, metrics: { impressions: 43800, clicks: 285, spend: 205.20, sales: 684.00, orders: 28 } }],
      targets: [
        { id: 'T-SP-001', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', type: 'Auto', value: 'Close match', match: 'Auto', bid: 0.72, status: 'Enabled', impressions: 16200, clicks: 105, spend: 75.60, sales: 302.40, orders: 12 },
        { id: 'T-SP-002', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', type: 'Auto', value: 'Loose match', match: 'Auto', bid: 0.72, status: 'Enabled', impressions: 13800, clicks: 90, spend: 64.80, sales: 129.60, orders: 5 },
        { id: 'T-SP-003', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', type: 'Auto', value: 'Substitutes', match: 'Auto', bid: 0.72, status: 'Enabled', impressions: 7600, clicks: 50, spend: 36.00, sales: 144.00, orders: 6 },
        { id: 'T-SP-004', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', type: 'Auto', value: 'Complements', match: 'Auto', bid: 0.72, status: 'Enabled', impressions: 6200, clicks: 40, spend: 28.80, sales: 108.00, orders: 5 },
      ],
      searchTerms: [
        { id: 'ST-A-001', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', term: 'paper coffee filters bulk', target: 'Loose match', targetId: 'T-SP-002', recommendation: 'Add as exact keyword' as const, clicks: 38, spend: 27.36, sales: 109.44, orders: 4 },
        { id: 'ST-A-002', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', term: 'coffee filter reusable', target: 'Close match', targetId: 'T-SP-001', recommendation: 'Review' as const, clicks: 42, spend: 30.24, sales: 151.20, orders: 6 },
        { id: 'ST-A-003', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', term: 'plastic cone coffee filter', target: 'Loose match', targetId: 'T-SP-002', recommendation: 'Negate' as const, clicks: 18, spend: 12.96, sales: 0, orders: 0 },
        { id: 'ST-A-004', campaignId: 'C-SP-AUTO-001', adGroupId: 'AG-SP-001', term: 'cheap paper plates', target: 'Loose match', targetId: 'T-SP-002', recommendation: 'Negate' as const, clicks: 8, spend: 5.76, sales: 0, orders: 0 },
      ],
      negatives: [],
      budgetRules: [],
      history: ['Campaign launched in simulator', '7-day simulation run added performance data'],
    },
    // SP - Manual Exact
    {
      id: 'C-SP-MAN-002', type: 'SP', name: 'SP | Manual | Coffee Filter | Exact Winners',
      portfolio: 'Coffee Accessories', status: 'Enabled', dailyBudget: 55, defaultBid: 0.96,
      startDate: '2026-06-03', endDate: null,
      targetingMode: 'Manual keyword', adFormat: 'Standard',
      bidStrategy: 'Dynamic bids - up and down',
      placements: { top: 20, product: 0, rest: 0 },
      products: ['B0TRAIN001'],
      creative: null,
      metrics: { impressions: 31800, clicks: 410, spend: 393.60, sales: 1574.40, orders: 63 },
      adGroups: [{ id: 'AG-SP-002', campaignId: 'C-SP-MAN-002', name: 'SP Manual ad group', status: 'Enabled', defaultBid: 0.96, metrics: { impressions: 31800, clicks: 410, spend: 393.60, sales: 1574.40, orders: 63 } }],
      targets: [
        { id: 'T-SP-005', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', type: 'Keyword', value: 'coffee filter cone', match: 'Exact', bid: 1.10, status: 'Enabled', impressions: 6200, clicks: 85, spend: 93.50, sales: 467.50, orders: 18 },
        { id: 'T-SP-006', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', type: 'Keyword', value: 'coffee filter paper', match: 'Exact', bid: 0.95, status: 'Enabled', impressions: 8400, clicks: 110, spend: 104.50, sales: 418.00, orders: 17 },
        { id: 'T-SP-007', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', type: 'Keyword', value: 'paper coffee filter', match: 'Phrase', bid: 0.85, status: 'Enabled', impressions: 7200, clicks: 95, spend: 80.75, sales: 323.00, orders: 13 },
        { id: 'T-SP-008', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', type: 'Keyword', value: 'coffee filter', match: 'Broad', bid: 0.75, status: 'Paused', impressions: 10000, clicks: 120, spend: 114.85, sales: 365.90, orders: 15 },
      ],
      searchTerms: [
        { id: 'ST-M-001', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', term: 'coffee cone filter size 4', target: 'coffee filter cone', targetId: 'T-SP-005', recommendation: 'Review', clicks: 28, spend: 30.80, sales: 154.00, orders: 6 },
        { id: 'ST-M-002', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', term: 'melitta coffee filters', target: 'coffee filter paper', targetId: 'T-SP-006', recommendation: 'Add as exact keyword', clicks: 15, spend: 14.25, sales: 57.00, orders: 2 },
        { id: 'ST-M-003', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', term: 'coffee filter size 6', target: 'coffee filter', targetId: 'T-SP-008', recommendation: 'Negate', clicks: 22, spend: 20.90, sales: 0, orders: 0 },
      ],
      negatives: [
        { id: 'NEG-M-001', campaignId: 'C-SP-MAN-002', adGroupId: 'AG-SP-002', type: 'Negative exact', value: 'plastic cone coffee filter' },
      ],
      budgetRules: [
        { id: 'BR-SP-001', campaignId: 'C-SP-MAN-002', name: 'Weekend boost', type: 'Schedule', increase: 1.5, condition: 'Saturday through Sunday' },
      ],
      history: ['Campaign launched in simulator', '7-day simulation added performance data'],
    },
    // SB - Video
    {
      id: 'C-SB-VID-003', type: 'SB', name: 'SB | Video | Coffee Brand Awareness',
      portfolio: 'Brand Campaigns', status: 'Enabled', dailyBudget: 80, defaultBid: 1.20,
      startDate: '2026-06-05', endDate: null,
      targetingMode: 'Keyword', adFormat: 'Video',
      bidStrategy: 'Cost per click',
      placements: { top: 0, product: 0, rest: 0 },
      products: ['B0TRAIN001', 'B0TRAIN005'],
      creative: { brandName: 'BrewCo', logo: 'BC', headline: 'Perfect coffee, every morning', destination: 'Brand Store', video: 'BrewCo brand video', image: '' },
      creativeStatus: 'Rejected',
      creativeIssue: 'Headline contains unsubstantiated claim "perfect". Revise to compliant language.',
      metrics: { impressions: 22400, clicks: 168, spend: 201.60, sales: 504.00, orders: 17 },
      adGroups: [{ id: 'AG-SB-003', campaignId: 'C-SB-VID-003', name: 'SB Video ad group', status: 'Enabled', defaultBid: 1.20, metrics: { impressions: 22400, clicks: 168, spend: 201.60, sales: 504.00, orders: 17 } }],
      targets: [
        { id: 'T-SB-001', campaignId: 'C-SB-VID-003', adGroupId: 'AG-SB-003', type: 'Keyword', value: 'coffee maker', match: 'Exact', bid: 1.20, status: 'Enabled', impressions: 8400, clicks: 72, spend: 86.40, sales: 216.00, orders: 8 },
        { id: 'T-SB-002', campaignId: 'C-SB-VID-003', adGroupId: 'AG-SB-003', type: 'Keyword', value: 'best coffee brand', match: 'Phrase', bid: 1.10, status: 'Enabled', impressions: 14000, clicks: 96, spend: 115.20, sales: 288.00, orders: 9 },
      ],
      searchTerms: [
        { id: 'ST-SB-001', campaignId: 'C-SB-VID-003', adGroupId: 'AG-SB-003', term: 'best coffee maker 2026', target: 'best coffee brand', targetId: 'T-SB-002', recommendation: 'Review', clicks: 12, spend: 14.40, sales: 36.00, orders: 1 },
      ],
      negatives: [],
      budgetRules: [],
      history: ['Campaign launched in simulator', 'SB creative flagged for review'],
    },
    // SD - Views Remarketing
    {
      id: 'C-SD-AUD-004', type: 'SD', name: 'SD | Views Remarketing | 30 Day',
      portfolio: 'Defensive and Remarketing', status: 'Enabled', dailyBudget: 70, defaultBid: 0.78,
      startDate: '2026-06-06', endDate: null,
      targetingMode: 'Audiences - views remarketing', adFormat: 'Auto generated',
      bidStrategy: 'Cost per click',
      placements: { top: 0, product: 0, rest: 0 },
      products: ['B0TRAIN001', 'B0TRAIN002', 'B0TRAIN005'],
      creative: { brandName: 'Training Labs', logo: 'TL', headline: 'Still comparing coffee upgrades?', destination: 'Product detail page', video: '', image: 'Auto generated' },
      metrics: { impressions: 18600, clicks: 142, spend: 110.76, sales: 553.80, orders: 24 },
      adGroups: [{ id: 'AG-SD-004', campaignId: 'C-SD-AUD-004', name: 'SD Remarketing ad group', status: 'Enabled', defaultBid: 0.78, metrics: { impressions: 18600, clicks: 142, spend: 110.76, sales: 553.80, orders: 24 } }],
      targets: [
        { id: 'T-SD-001', campaignId: 'C-SD-AUD-004', adGroupId: 'AG-SD-004', type: 'Audience', value: 'Viewed advertised products 30 days', match: 'Audience', bid: 0.78, status: 'Enabled', impressions: 18600, clicks: 142, spend: 110.76, sales: 553.80, orders: 24 },
      ],
      searchTerms: [],
      negatives: [],
      budgetRules: [],
      history: ['Campaign launched in simulator', '7-day simulation run added performance data'],
    },

    // SB - Product Collection (added by handoff implementation)
    {
      id: 'C-SB-PROD-005', type: 'SB', name: 'SB | Product Collection | Coffee Variety',
      portfolio: 'Brand Campaigns', status: 'Paused', dailyBudget: 50, defaultBid: 0.95,
      startDate: '2026-06-15', endDate: null,
      targetingMode: 'Product', adFormat: 'Product collection',
      bidStrategy: 'Cost per click',
      placements: { top: 0, product: 0, rest: 0 },
      products: ['B0TRAIN001', 'B0TRAIN002', 'B0TRAIN003'],
      creative: { brandName: 'BrewCo', logo: 'BC', headline: 'Discover your perfect brew', destination: 'Brand Store', video: '', image: 'Auto generated' },
      creativeStatus: 'Approved',
      metrics: { impressions: 12500, clicks: 98, spend: 93.10, sales: 279.30, orders: 11 },
      adGroups: [{ id: 'AG-SB-005', campaignId: 'C-SB-PROD-005', name: 'SB Product Collection ad group', status: 'Enabled', defaultBid: 0.95, metrics: { impressions: 12500, clicks: 98, spend: 93.10, sales: 279.30, orders: 11 } }],
      targets: [
        { id: 'T-SB-003', campaignId: 'C-SB-PROD-005', adGroupId: 'AG-SB-005', type: 'Product', value: 'Coffee Filters', match: 'Product', bid: 0.95, status: 'Enabled', impressions: 12500, clicks: 98, spend: 93.10, sales: 279.30, orders: 11 },
      ],
      searchTerms: [],
      negatives: [
        { id: 'NEG-SB-001', campaignId: 'C-SB-PROD-005', adGroupId: 'AG-SB-005', type: 'Negative phrase', value: 'plastic' },
      ],
      budgetRules: [],
      history: ['Campaign created', 'Negative added for "plastic"'],
    },
    // SD - Contextual (added by handoff implementation)
    {
      id: 'C-SD-CTX-006', type: 'SD', name: 'SD | Contextual | Coffee Accessories',
      portfolio: 'Defensive and Remarketing', status: 'Enabled', dailyBudget: 35, defaultBid: 0.55,
      startDate: '2026-06-10', endDate: null,
      targetingMode: 'Contextual', adFormat: 'Auto generated',
      bidStrategy: 'Cost per click',
      placements: { top: 0, product: 0, rest: 0 },
      products: ['B0TRAIN001'],
      creative: { brandName: 'Training Labs', logo: 'TL', headline: 'Perfect coffee starts here', destination: 'Product detail page', video: '', image: 'Auto generated' },
      metrics: { impressions: 8900, clicks: 45, spend: 24.75, sales: 99.00, orders: 4 },
      adGroups: [{ id: 'AG-SD-006', campaignId: 'C-SD-CTX-006', name: 'SD Contextual ad group', status: 'Enabled', defaultBid: 0.55, metrics: { impressions: 8900, clicks: 45, spend: 24.75, sales: 99.00, orders: 4 } }],
      targets: [
        { id: 'T-SD-003', campaignId: 'C-SD-CTX-006', adGroupId: 'AG-SD-006', type: 'Contextual', value: 'Coffee & Espresso Accessories', match: 'Contextual', bid: 0.55, status: 'Enabled', impressions: 8900, clicks: 45, spend: 24.75, sales: 99.00, orders: 4 },
      ],
      searchTerms: [],
      negatives: [],
      budgetRules: [],
      history: ['Campaign launched in simulator'],
    },
  ];
}

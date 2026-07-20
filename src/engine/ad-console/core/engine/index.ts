/**
 * Engine barrel — re-exports all focused modules.
 */
export { generateId, resetIdCounter } from './id';
export { calc, totalMetrics, metricDefaults, formatMoney, formatWhole, formatBid, formatPercent, formatRoas, acosClass } from './metrics';
export { normalizeCampaign, toggleCampaignStatus, archiveCampaign, duplicateCampaign, updateCampaignSettings, savePlacements } from './campaign';
export { addTarget, addKeyword, addAutoTarget, addAsinTarget, addCategoryTarget, removeTarget, setTargetBid, adjustTargetBid, pauseTarget, setTargetStatus } from './target';
export { addAdGroup, addProductAd, addAd, renameAdGroup, setAdGroupStatus, setAdGroupDefaultBid, removeAdGroup } from './adgroup';
export { isFilteredByNegative, addNegative, addNegativeKeyword, addNegativeAsin, addNegativeCategory, harvestTerm, getHarvestCandidates, getNegativeCandidates } from './negative';
export { addBudgetRule, removeBudgetRule, updateBudgetRule } from './budget';
export { createPortfolio, renamePortfolio, deletePortfolio, assignCampaignToPortfolio, campaignById, filteredCampaigns, portfolioNames } from './portfolio';
export { selectProduct, removeProduct, parseKeywords, validateStoreUrl, type ValidationResult } from './draft';
export { resolveBreakpoint, mobileMenuReducer, isTouchViewport } from './responsive';
export type { Breakpoint, MenuStatus, MobileMenuState, MobileMenuAction } from './responsive';
export { simulateDays } from '../simulation';
export type { Campaign, CampaignStatus, MatchType, TargetType, NegativeType } from '../types';
export type { CampaignType, BidStrategy, TargetingMode, AdFormat, CampaignGoal, PortfolioType } from '../types';
export type { BudgetRuleType, ScheduleType } from '../types';
export type { ProductAd, Ad, SearchTerm, Negative, BudgetRule, Creative, Product } from '../types';
export type { SearchTermGenerator } from './search-term-generator';
/**
 * Engine barrel — re-exports all focused modules.
 */
export { generateId, resetIdCounter } from './id';
export { calc, totalMetrics, metricDefaults, formatMoney, formatWhole, formatBid, formatPercent, formatRoas, acosClass } from './metrics';
export { normalizeCampaign, toggleCampaignStatus, archiveCampaign, duplicateCampaign, updateCampaignSettings, savePlacements } from './campaign';
export { addTarget, removeTarget, setTargetBid, adjustTargetBid, pauseTarget } from './target';
export { addAdGroup, renameAdGroup, setAdGroupStatus, setAdGroupDefaultBid, removeAdGroup } from './adgroup';
export { isFilteredByNegative, addNegative, harvestTerm } from './negative';
export { addBudgetRule, removeBudgetRule, updateBudgetRule } from './budget';
export { createPortfolio, renamePortfolio, deletePortfolio, assignCampaignToPortfolio, campaignById, filteredCampaigns, portfolioNames } from './portfolio';
export { selectProduct, removeProduct, parseKeywords, validateStoreUrl, type ValidationResult } from './draft';
export { resolveBreakpoint, mobileMenuReducer, isTouchViewport } from './responsive';
export type { Breakpoint, MenuStatus, MobileMenuState, MobileMenuAction } from './responsive';
export { simulateDays } from '../simulation';

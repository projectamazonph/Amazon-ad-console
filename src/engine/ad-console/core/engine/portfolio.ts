/**
 * Portfolio operations and campaign querying.
 */
import type { Campaign, AdConsoleState } from '../types';
import { assertNonEmpty, ValidationError } from '../../../../lib/validation';

export function createPortfolio(portfolios: string[], name: string): string[] {
  assertNonEmpty('portfolio name', name);
  const trimmed = name.trim();
  if (portfolios.includes(trimmed)) return portfolios;
  return [...portfolios, trimmed];
}

export function renamePortfolio(
  portfolios: string[],
  campaigns: Campaign[],
  oldName: string,
  newName: string,
): { portfolios: string[]; campaigns: Campaign[] } {
  assertNonEmpty('old portfolio name', oldName);
  assertNonEmpty('new portfolio name', newName);
  const trimmedOld = oldName.trim();
  const trimmedNew = newName.trim();
  if (!portfolios.includes(trimmedOld)) {
    throw new ValidationError(`Unknown portfolio: ${trimmedOld}`);
  }
  return {
    portfolios: portfolios.map((p) => (p === trimmedOld ? trimmedNew : p)),
    campaigns: campaigns.map((c) =>
      c.portfolio === trimmedOld ? { ...c, portfolio: trimmedNew } : c,
    ),
  };
}

export function deletePortfolio(
  portfolios: string[],
  campaigns: Campaign[],
  name: string,
): { portfolios: string[]; campaigns: Campaign[] } {
  assertNonEmpty('portfolio name', name);
  const trimmed = name.trim();
  if (!portfolios.includes(trimmed)) {
    throw new ValidationError(`Unknown portfolio: ${trimmed}`);
  }
  if (portfolios.length <= 1) {
    throw new ValidationError('Cannot delete the last portfolio');
  }
  return {
    portfolios: portfolios.filter((p) => p !== trimmed),
    campaigns: campaigns.map((c) =>
      c.portfolio === trimmed ? { ...c, portfolio: '' } : c,
    ),
  };
}

export function assignCampaignToPortfolio(
  campaigns: Campaign[],
  campaignId: string,
  portfolioName: string,
): Campaign[] {
  assertNonEmpty('portfolio name', portfolioName);
  const trimmed = portfolioName.trim();
  const idx = campaigns.findIndex((c) => c.id === campaignId);
  if (idx === -1) {
    throw new ValidationError(`Unknown campaign: ${campaignId}`);
  }
  return campaigns.map((c, i) =>
    i === idx ? { ...c, portfolio: trimmed, history: [...c.history, `Portfolio assigned to "${trimmed}"`] } : c,
  );
}

export function campaignById(state: AdConsoleState, id: string): Campaign | undefined {
  return state.campaigns.find((c) => c.id === id);
}

export function filteredCampaigns(state: AdConsoleState): Campaign[] {
  return state.campaigns.filter((c) => {
    const typeOk = state.filter.type === 'All' || c.type === state.filter.type;
    const statusOk = state.filter.status === 'All' || c.status === state.filter.status;
    const portfolioOk = state.filter.portfolio === 'All' || c.portfolio === state.filter.portfolio;
    const q = state.filter.search.toLowerCase();
    const text = `${c.name} ${c.type} ${c.targetingMode} ${c.portfolio} ${c.adFormat}`.toLowerCase();
    return typeOk && statusOk && portfolioOk && (!q || text.includes(q));
  });
}

export function portfolioNames(campaigns: Campaign[]): string[] {
  const names = new Set(campaigns.map((c) => c.portfolio).filter(Boolean));
  return ['All', ...Array.from(names).sort()];
}

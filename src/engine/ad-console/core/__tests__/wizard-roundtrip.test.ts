/**
 * Audit H-01: campaign creation wizard does not round-trip the form.
 *
 * The previous `launchCampaign` only passed a subset of the draft through
 * to the created campaign. Custom dates, placement adjustments, headlines,
 * ASIN/category/audience targets, and creative details were silently
 * dropped. The trainee entered the values, the wizard said "Campaign
 * launched", and the resulting campaign held none of them.
 *
 * These tests pin the round-trip for each missing field, plus a couple of
 * regression guards so the existing keyword-target behavior keeps working.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAdConsoleStore } from '../../store';
import type { Campaign } from '../types';

function getStore() { return useAdConsoleStore.getState(); }
function reset() { useAdConsoleStore.getState().resetAll(); }
function getFirstCampaign(): Campaign {
  return getStore().state.campaigns[0]!;
}

describe('Wizard Round-Trip (H-01)', () => {
  beforeEach(reset);

  it('preserves custom start and end dates from the draft', () => {
    const store = getStore();
    store.updateDraft('name', 'Date Test');
    store.updateDraft('startDate', '2026-08-01');
    store.updateDraft('endDate', '2026-12-31');

    store.launchCampaign();
    const c = getFirstCampaign();

    expect(c.startDate).toBe('2026-08-01');
    expect(c.endDate).toBe('2026-12-31');
  });

  it('preserves an empty end date as null (open-ended campaign)', () => {
    const store = getStore();
    store.updateDraft('name', 'Open Ended');
    store.updateDraft('endDate', '');

    store.launchCampaign();
    expect(getFirstCampaign().endDate).toBeNull();
  });

  it('preserves placement adjustments from the draft', () => {
    const store = getStore();
    store.updateDraft('name', 'Placements Test');
    store.updateDraft('placements', { top: 45, product: 25, rest: 30 });

    store.launchCampaign();
    expect(getFirstCampaign().placements).toEqual({ top: 45, product: 25, rest: 30 });
  });

  it('preserves the ad format chosen in step 1', () => {
    const store = getStore();
    store.updateDraft('type', 'SB');
    store.updateDraft('name', 'Format Test');
    store.updateDraft('adFormat', 'Store spotlight');

    store.launchCampaign();
    const c = getFirstCampaign();
    expect(c.type).toBe('SB');
    expect(c.adFormat).toBe('Store spotlight');
  });

  it('builds ASIN targets from one-per-line draft input', () => {
    const store = getStore();
    store.updateDraft('name', 'ASIN Targets Test');
    store.updateDraft('targetingMode', 'Manual product');
    store.updateDraft('asinTargets', 'B0AUDIT001\nB0AUDIT002\n  \nB0AUDIT003');

    store.launchCampaign();
    const c = getFirstCampaign();
    const asins = c.targets.filter((t) => t.type === 'ASIN').map((t) => t.value);

    expect(asins).toEqual(['B0AUDIT001', 'B0AUDIT002', 'B0AUDIT003']);
  });

  it('builds category targets from one-per-line draft input', () => {
    const store = getStore();
    store.updateDraft('name', 'Category Targets Test');
    store.updateDraft('categoryTargets', 'Coffee & Espresso\nDrinkware');

    store.launchCampaign();
    const c = getFirstCampaign();
    const cats = c.targets.filter((t) => t.type === 'Category').map((t) => t.value);
    expect(cats).toEqual(['Coffee & Espresso', 'Drinkware']);
  });

  it('builds audience targets (views remarketing) from one-per-line draft input', () => {
    const store = getStore();
    store.updateDraft('name', 'Audience Test');
    store.updateDraft('audienceTargets', 'Lookalike - converters\nIn-market - coffee');

    store.launchCampaign();
    const c = getFirstCampaign();
    const aud = c.targets.filter((t) => t.type === 'Audience - views remarketing').map((t) => t.value);
    expect(aud).toEqual(['Lookalike - converters', 'In-market - coffee']);
  });

  it('preserves SB creative fields (headline, brand, destination) when type is SB', () => {
    const store = getStore();
    store.updateDraft('type', 'SB');
    store.updateDraft('name', 'SB Creative Test');
    store.updateDraft('creative', {
      brandName: 'Audit Brand',
      logo: 'https://example.com/logo.png',
      headline: 'Audit Headline Here',
      destination: 'https://example.com/store',
      image: 'https://example.com/image.png',
    });

    store.launchCampaign();
    const c = getFirstCampaign();
    expect(c.creative).toMatchObject({
      brandName: 'Audit Brand',
      logo: 'https://example.com/logo.png',
      headline: 'Audit Headline Here',
      destination: 'https://example.com/store',
    });
  });

  it('keeps existing keyword-target behavior for exact/phrase/broad inputs', () => {
    const store = getStore();
    store.updateDraft('name', 'Keywords Test');
    store.updateDraft('exactKeywords', 'organic coffee\nbest beans');
    store.updateDraft('phraseKeywords', 'coffee blend');
    store.updateDraft('broadKeywords', 'coffee accessories');

    store.launchCampaign();
    const c = getFirstCampaign();
    const exact = c.targets.filter((t) => t.type === 'Keyword' && t.match === 'Exact').map((t) => t.value);
    const phrase = c.targets.filter((t) => t.type === 'Keyword' && t.match === 'Phrase').map((t) => t.value);
    const broad = c.targets.filter((t) => t.type === 'Keyword' && t.match === 'Broad').map((t) => t.value);

    expect(exact).toEqual(['organic coffee', 'best beans']);
    expect(phrase).toEqual(['coffee blend']);
    expect(broad).toEqual(['coffee accessories']);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAdConsoleStore } from '../store';
import { makeDraft } from '../store';

describe('Store actions', () => {
  beforeEach(() => {
    // Reset store completely - clear all state including localStorage mock
    useAdConsoleStore.getState().resetAll();
    // Clear localStorage mock calls
    vi.clearAllMocks();
  });

  describe('launchCampaign', () => {
    it('creates a new campaign with keyword targets from draft', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Test Campaign');
      store.updateDraft('exactKeywords', 'coffee filter');
      store.updateDraft('phraseKeywords', 'coffee maker');
      store.updateDraft('broadKeywords', 'coffee');
      store.launchCampaign();

      const state = useAdConsoleStore.getState().state;
      const campaign = state.campaigns.find(c => c.name === 'Test Campaign');
      expect(campaign).toBeDefined();
      expect(campaign?.targets).toHaveLength(3);
      expect(campaign?.targets.map(t => t.match)).toEqual(['Exact', 'Phrase', 'Broad']);
    });

    it('does not create campaign if name is empty', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', '');
      const before = useAdConsoleStore.getState().state.campaigns.length;
      store.launchCampaign();
      const after = useAdConsoleStore.getState().state.campaigns.length;
      expect(after).toBe(before);
    });

    it('sets SD searchTerms to empty array explicitly', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('type', 'SD');
      store.updateDraft('name', 'SD Test');
      store.launchCampaign();

      const campaign = useAdConsoleStore.getState().state.campaigns.find(c => c.name === 'SD Test');
      expect(campaign?.searchTerms).toEqual([]);
    });

    it('resets draft after launch', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Test');
      store.launchCampaign();
      const freshState = useAdConsoleStore.getState();
      expect(freshState.draft.name).toBe('');
      // wizardStep is not in draft, it's a top-level store property
      expect(freshState.wizardStep).toBe(1);
    });
  });

  describe('addNegative', () => {
    it('adds negative to selected campaign', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Test');
      store.launchCampaign();

      const campaignId = useAdConsoleStore.getState().state.campaigns[0].id;
      store.addNegative(campaignId, 'free', 'Negative exact');

      const campaign = useAdConsoleStore.getState().state.campaigns.find(c => c.id === campaignId);
      expect(campaign?.negatives).toHaveLength(1);
      expect(campaign?.negatives[0].value).toBe('free');
      expect(campaign?.negatives[0].type).toBe('Negative exact');
    });

    it('does not duplicate identical negative', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Test2');
      store.launchCampaign();

      const campaignId = useAdConsoleStore.getState().state.campaigns[0].id;
      store.addNegative(campaignId, 'free', 'Negative exact');
      store.addNegative(campaignId, 'free', 'Negative exact');

      const campaign = useAdConsoleStore.getState().state.campaigns.find(c => c.id === campaignId);
      expect(campaign?.negatives).toHaveLength(1);
    });
  });

  describe('runSimulation', () => {
    it('updates campaign metrics', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Sim Test');
      store.launchCampaign();

      const before = useAdConsoleStore.getState().state.campaigns[0].metrics;
      store.runSimulation(7);
      const after = useAdConsoleStore.getState().state.campaigns[0].metrics;

      expect(after.impressions).toBeGreaterThanOrEqual(before.impressions);
      expect(after.clicks).toBeGreaterThanOrEqual(before.clicks);
      expect(after.spend).toBeGreaterThanOrEqual(before.spend);
    });

    it('filters search terms by negatives', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Neg Test');
      store.updateDraft('exactKeywords', 'plastic');
      store.launchCampaign();

      const campaignId = useAdConsoleStore.getState().state.campaigns[0].id;
      // Use negative phrase to filter all terms containing the word
      store.addNegative(campaignId, 'plastic', 'Negative phrase');
      store.runSimulation(7);

      const campaign = useAdConsoleStore.getState().state.campaigns.find(c => c.id === campaignId);
      const allFiltered = campaign?.searchTerms.every(st => !st.term.includes('plastic')) ?? true;
      expect(allFiltered).toBe(true);
    });
  });

  describe('addCampaignProduct / removeCampaignProduct', () => {
    it('adds product to existing campaign', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Prod Test');
      store.launchCampaign();

      const campaignId = useAdConsoleStore.getState().state.campaigns[0].id;
      store.addCampaignProduct(campaignId, 'B0TRAIN002');

      const campaign = useAdConsoleStore.getState().state.campaigns.find(c => c.id === campaignId);
      expect(campaign?.products).toContain('B0TRAIN002');
    });

    it('removes product from existing campaign', () => {
      const store = useAdConsoleStore.getState();
      store.updateDraft('name', 'Prod Test2');
      store.updateDraft('products', ['B0TRAIN001', 'B0TRAIN002']);
      store.launchCampaign();

      const campaignId = useAdConsoleStore.getState().state.campaigns[0].id;
      store.removeCampaignProduct(campaignId, 'B0TRAIN001');

      const campaign = useAdConsoleStore.getState().state.campaigns.find(c => c.id === campaignId);
      expect(campaign?.products).not.toContain('B0TRAIN001');
      expect(campaign?.products).toContain('B0TRAIN002');
    });
  });

  describe('selectProduct / removeProduct (draft)', () => {
    it('adds ASIN to draft products', () => {
      const store = useAdConsoleStore.getState();
      store.resetDraft();
      store.updateDraft('products', []);
      store.selectProduct('B0TRAIN002');
      const freshState = useAdConsoleStore.getState();
      expect(freshState.draft.products).toContain('B0TRAIN002');
    });

    it('does not duplicate ASIN', () => {
      const store = useAdConsoleStore.getState();
      store.resetDraft();
      store.updateDraft('products', ['B0TRAIN001']);
      store.selectProduct('B0TRAIN001');
      store.selectProduct('B0TRAIN001');
      const freshState = useAdConsoleStore.getState();
      expect(freshState.draft.products.filter(p => p === 'B0TRAIN001')).toHaveLength(1);
    });

    it('removes ASIN from draft products', () => {
      const store = useAdConsoleStore.getState();
      store.resetDraft();
      store.updateDraft('products', ['B0TRAIN001', 'B0TRAIN002']);
      // Force re-read from store
      store.removeProduct('B0TRAIN001');
      const freshState = useAdConsoleStore.getState();
      expect(freshState.draft.products).not.toContain('B0TRAIN001');
      expect(freshState.draft.products).toContain('B0TRAIN002');
    });

    it('throws when removing last product', () => {
      const store = useAdConsoleStore.getState();
      store.resetDraft();
      store.updateDraft('products', ['B0TRAIN001']);
      expect(() => store.removeProduct('B0TRAIN001')).toThrow();
    });
  });
});

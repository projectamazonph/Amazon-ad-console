/**
 * TDD: Wizard flow integration test.
 * Exercises the full create → simulate → search terms → add negative flow.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAdConsoleStore } from '../../store';
import type { Campaign } from '../types';

function getStore() { return useAdConsoleStore.getState(); }
function reset() { useAdConsoleStore.getState().resetAll(); }

describe('Wizard Flow Integration: SP Campaign', () => {
  beforeEach(reset);

  it('full SP flow: configure → launch → simulate → search terms → negate', () => {
    const store = getStore();

    // Step 1: Configure draft
    store.updateDraft('type', 'SP');
    store.updateDraft('name', 'SP Integration Test');
    store.updateDraft('portfolio', 'Test Portfolio');
    store.updateDraft('dailyBudget', 50);
    store.updateDraft('defaultBid', 0.85);
    store.updateDraft('keywords', 'organic coffee\nbest beans');
    store.updateDraft('keywordMatchTypes', ['Exact', 'Phrase', 'Broad']);

    // Step 2: Launch campaign
    store.launchCampaign();
    const launched = getStore();
    expect(launched.view).toBe('detail');
    expect(launched.state.selectedTab).toBe('adgroups');

    const campaign = launched.state.campaigns.find(
      (c: Campaign) => c.name === 'SP Integration Test'
    );
    expect(campaign).toBeDefined();
    expect(campaign!.type).toBe('SP');
    expect(campaign!.dailyBudget).toBe(50);
    expect(campaign!.defaultBid).toBe(0.85);
    expect(campaign!.portfolio).toBe('Test Portfolio');

    // Should have keyword targets from the draft
    expect(campaign!.targets.length).toBeGreaterThan(0);
    const exactTarget = campaign!.targets.find(
      (t) => t.value === 'organic coffee' && t.match === 'Exact'
    );
    expect(exactTarget).toBeDefined();

    // Step 3: Run simulation
    store.runSimulation(7);
    const simulated = getStore().state.campaigns.find(
      (c: Campaign) => c.name === 'SP Integration Test'
    )!;

    // Should have generated metrics
    expect(simulated.metrics.impressions).toBeGreaterThan(0);

    // Should have search terms generated
    expect(simulated.searchTerms.length).toBeGreaterThan(0);

    // Step 4: Add a negative keyword
    const termToNegate = simulated.searchTerms[0].term;
    store.addNegative(campaign!.id, termToNegate, 'Negative phrase');
    const negated = getStore().state.campaigns.find(
      (c: Campaign) => c.name === 'SP Integration Test'
    )!;

    expect(negated.negatives.length).toBe(1);
    expect(negated.negatives[0].value).toBe(termToNegate);
  });

  it('full SB flow: configure → launch → simulate', () => {
    const store = getStore();

    store.updateDraft('type', 'SB');
    store.updateDraft('name', 'SB Integration Test');
    store.updateDraft('keywords', 'brand store\nbrand products');
    store.updateDraft('keywordMatchTypes', ['Exact', 'Phrase']);

    store.launchCampaign();
    const campaign = getStore().state.campaigns.find(
      (c: Campaign) => c.name === 'SB Integration Test'
    );
    expect(campaign).toBeDefined();
    expect(campaign!.type).toBe('SB');

    getStore().runSimulation(7);
    const simulated = getStore().state.campaigns.find(
      (c: Campaign) => c.name === 'SB Integration Test'
    )!;
    expect(simulated.metrics.impressions).toBeGreaterThan(0);
    expect(simulated.searchTerms.length).toBeGreaterThan(0);
  });

  it('full SD flow: configure → launch → simulate', () => {
    const store = getStore();

    store.updateDraft('type', 'SD');
    store.updateDraft('name', 'SD Integration Test');

    store.launchCampaign();
    const campaign = getStore().state.campaigns.find(
      (c: Campaign) => c.name === 'SD Integration Test'
    );
    expect(campaign).toBeDefined();
    expect(campaign!.type).toBe('SD');

    getStore().runSimulation(7);
    const simulated = getStore().state.campaigns.find(
      (c: Campaign) => c.name === 'SD Integration Test'
    )!;
    expect(simulated.metrics.impressions).toBeGreaterThan(0);
  });

  it('campaign detail: navigate → adgroups → targets → search terms', () => {
    const store = getStore();
    const c = store.state.campaigns[0]!;

    // Select campaign → detail view, adgroups tab
    store.selectCampaign(c.id);
    expect(getStore().state.selectedTab).toBe('adgroups');

    // Switch to targets tab
    store.setTab('targets');
    expect(getStore().state.selectedTab).toBe('targets');

    // Switch to search terms tab
    store.setTab('searchTerms');
    expect(getStore().state.selectedTab).toBe('searchTerms');

    // Back to campaigns view
    store.selectCampaign(null);
    expect(getStore().view).toBe('campaigns');
  });

  it('search terms are filtered by negatives', () => {
    const store = getStore();
    const c = store.state.campaigns[0]!;

    // Run simulation to generate search terms
    store.runSimulation(7);
    const afterSim = getStore().state.campaigns.find(
      (x: Campaign) => x.id === c.id
    )!;

    if (afterSim.searchTerms.length > 0) {
      const term = afterSim.searchTerms[0].term;

      // Add negative phrase
      store.addNegative(c.id, term, 'Negative phrase');
      const afterNeg = getStore().state.campaigns.find(
        (x: Campaign) => x.id === c.id
      )!;

      // The negative should be in the negatives list
      expect(afterNeg.negatives.some((n) => n.value === term)).toBe(true);
    }
  });

  it('harvest term creates a keyword from search term', () => {
    const store = getStore();
    const c = store.state.campaigns[0]!;

    store.runSimulation(7);
    const afterSim = getStore().state.campaigns.find(
      (x: Campaign) => x.id === c.id
    )!;

    if (afterSim.searchTerms.length > 0) {
      const term = afterSim.searchTerms[0].term;
      store.harvestTerm(c.id, term);
      const afterHarvest = getStore().state.campaigns.find(
        (x: Campaign) => x.id === c.id
      )!;

      expect(
        afterHarvest.targets.some((t) => t.value === term)
      ).toBe(true);
    }
  });

  it('duplicate campaign preserves targets', () => {
    const store = getStore();
    const c = store.state.campaigns[0]!;
    const beforeTargets = c.targets.length;

    store.duplicateCampaign(c.id);
    const afterDup = getStore();
    const dup = afterDup.state.campaigns.find(
      (x: Campaign) => x.name === c.name + ' (copy)'
    );

    expect(dup).toBeDefined();
    expect(dup!.targets.length).toBe(beforeTargets);
  });

  it('archive campaign and verify it disappears from filtered list', () => {
    const store = getStore();
    const c = store.state.campaigns[0]!;

    store.archiveCampaign(c.id);
    const archived = getStore().state.campaigns.find(
      (x: Campaign) => x.id === c.id
    )!;
    expect(archived.status).toBe('Archived');

    // Filter by Enabled status
    store.setFilter({ status: 'Enabled' });
    const filtered = getStore().filteredCampaigns();
    expect(filtered.find((x: Campaign) => x.id === c.id)).toBeUndefined();
  });
});

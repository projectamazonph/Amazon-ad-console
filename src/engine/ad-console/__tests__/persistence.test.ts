import { describe, it, expect, beforeEach } from 'vitest';

describe('export/import state', () => {
  it('exportState returns valid JSON with campaigns', async () => {
    const { useAdConsoleStore } = await import('../store');
    const json = useAdConsoleStore.getState().exportState();
    const parsed = JSON.parse(json);
    expect(parsed.campaigns).toBeDefined();
    expect(parsed.campaigns.length).toBeGreaterThan(0);
  });

  it('importState restores exported state', async () => {
    const { useAdConsoleStore } = await import('../store');
    useAdConsoleStore.getState().runSimulation(7);
    const exported = useAdConsoleStore.getState().exportState();

    const success = useAdConsoleStore.getState().importState(exported);
    expect(success).toBe(true);
    const spend = useAdConsoleStore.getState().state.campaigns.reduce((s, c) => s + c.metrics.spend, 0);
    expect(spend).toBeGreaterThan(0);
  });

  it('importState returns false for invalid JSON', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(useAdConsoleStore.getState().importState('not valid json')).toBe(false);
  });

  it('importState returns false for empty string', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(useAdConsoleStore.getState().importState('')).toBe(false);
  });

  it('importState returns false for non-object JSON', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(useAdConsoleStore.getState().importState('null')).toBe(false);
  });

  it('has initial campaigns', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(useAdConsoleStore.getState().state.campaigns.length).toBeGreaterThan(0);
  });

  it('has portfolios derived from campaigns', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(useAdConsoleStore.getState().state.portfolios.length).toBeGreaterThan(0);
  });

  it('has version field', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(typeof useAdConsoleStore.getState().state.version).toBe('string');
  });
});

describe('localStorage persistence (partialize)', () => {
  it('includes feature-slice state, not just the core `state` field', async () => {
    const { useAdConsoleStore } = await import('../store');
    useAdConsoleStore.getState().createProfile('Alex');

    const partialize = useAdConsoleStore.persist.getOptions().partialize!;
    const persisted = partialize(useAdConsoleStore.getState()) as Record<string, unknown>;

    expect(persisted.state).toBeDefined();
    expect(persisted.profiles).toBeDefined();
    expect((persisted.profiles as { name: string }[]).some((p) => p.name === 'Alex')).toBe(true);
    expect(persisted.activeProfileId).toBeDefined();
  });

  it('excludes functions from the persisted snapshot', async () => {
    const { useAdConsoleStore } = await import('../store');
    const partialize = useAdConsoleStore.persist.getOptions().partialize!;
    const persisted = partialize(useAdConsoleStore.getState()) as Record<string, unknown>;

    for (const value of Object.values(persisted)) {
      expect(typeof value).not.toBe('function');
    }
  });
});

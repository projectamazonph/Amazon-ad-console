import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const STORAGE_KEY = 'ad-console-storage';

const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (index: number) => [...storage.keys()][index] ?? null,
});

describe('export/import state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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
    const success = useAdConsoleStore.getState().importState('not valid json');
    expect(success).toBe(false);
  });
});

describe('store structure', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has initial campaigns', async () => {
    const { useAdConsoleStore } = await import('../store');
    const campaigns = useAdConsoleStore.getState().state.campaigns;
    expect(campaigns.length).toBeGreaterThan(0);
  });

  it('has portfolios derived from campaigns', async () => {
    const { useAdConsoleStore } = await import('../store');
    const portfolios = useAdConsoleStore.getState().state.portfolios;
    expect(portfolios.length).toBeGreaterThan(0);
  });

  it('has version field', async () => {
    const { useAdConsoleStore } = await import('../store');
    const version = useAdConsoleStore.getState().state.version;
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

  it('exportState includes all campaigns with metrics', async () => {
    const { useAdConsoleStore } = await import('../store');
    useAdConsoleStore.getState().runSimulation(7);
    const json = useAdConsoleStore.getState().exportState();
    const parsed = JSON.parse(json);
    const totalSpend = parsed.campaigns.reduce((s: number, c: any) => s + c.metrics.spend, 0);
    expect(totalSpend).toBeGreaterThan(0);
  });

  it('importState validates JSON and rejects garbage', async () => {
    const { useAdConsoleStore } = await import('../store');
    expect(useAdConsoleStore.getState().importState('')).toBe(false);
    expect(useAdConsoleStore.getState().importState('null')).toBe(false);
    expect(useAdConsoleStore.getState().importState('{broken')).toBe(false);
  });
});

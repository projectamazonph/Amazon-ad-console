import { describe, it, expect } from 'vitest';
import {
  resolveBreakpoint,
  mobileMenuReducer,
  isTouchViewport,
  type MobileMenuState,
  type MobileMenuAction,
} from '../engine';

// ── resolveBreakpoint ────────────────────────────────────────────

describe('resolveBreakpoint', () => {
  it('returns mobile below 768px', () => {
    expect(resolveBreakpoint(0)).toBe('mobile');
    expect(resolveBreakpoint(375)).toBe('mobile');
    expect(resolveBreakpoint(767)).toBe('mobile');
  });

  it('returns tablet between 768px and 1100px', () => {
    expect(resolveBreakpoint(768)).toBe('tablet');
    expect(resolveBreakpoint(1024)).toBe('tablet');
    expect(resolveBreakpoint(1100)).toBe('tablet');
  });

  it('returns desktop above 1100px', () => {
    expect(resolveBreakpoint(1101)).toBe('desktop');
    expect(resolveBreakpoint(1440)).toBe('desktop');
    expect(resolveBreakpoint(1920)).toBe('desktop');
  });
});

// ── mobileMenuReducer ────────────────────────────────────────────

describe('mobileMenuReducer', () => {
  it('starts closed', () => {
    const state = mobileMenuReducer(undefined, { type: 'INIT' });
    expect(state.status).toBe('closed');
  });

  it('TOGGLE from closed opens', () => {
    const state = mobileMenuReducer(undefined, { type: 'INIT' });
    const next = mobileMenuReducer(state, { type: 'TOGGLE' });
    expect(next.status).toBe('open');
  });

  it('TOGGLE from open starts closing animation', () => {
    const state: MobileMenuState = { status: 'open' };
    const next = mobileMenuReducer(state, { type: 'TOGGLE' });
    expect(next.status).toBe('closing');
  });

  it('ANIMATION_END from closing goes to closed', () => {
    const state: MobileMenuState = { status: 'closing' };
    const next = mobileMenuReducer(state, { type: 'ANIMATION_END' });
    expect(next.status).toBe('closed');
  });

  it('OPEN sets status to open regardless of current state', () => {
    const state: MobileMenuState = { status: 'closed' };
    const next = mobileMenuReducer(state, { type: 'OPEN' });
    expect(next.status).toBe('open');
  });

  it('CLOSE initiates closing animation', () => {
    const state: MobileMenuState = { status: 'open' };
    const next = mobileMenuReducer(state, { type: 'CLOSE' });
    expect(next.status).toBe('closing');
  });

  it('ignores unknown action types', () => {
    const state: MobileMenuState = { status: 'open' };
    const next = mobileMenuReducer(state, { type: 'UNKNOWN' as MobileMenuAction['type'] });
    expect(next).toBe(state);
  });

  it('ANIMATION_END from open stays open', () => {
    const state: MobileMenuState = { status: 'open' };
    const next = mobileMenuReducer(state, { type: 'ANIMATION_END' });
    expect(next.status).toBe('open');
  });
});

// ── isTouchViewport ──────────────────────────────────────────────

describe('isTouchViewport', () => {
  it('returns true when hasTouch and width <= 1100', () => {
    expect(isTouchViewport(true, 375)).toBe(true);
    expect(isTouchViewport(true, 768)).toBe(true);
    expect(isTouchViewport(true, 1100)).toBe(true);
  });

  it('returns false on desktop width even with touch', () => {
    expect(isTouchViewport(true, 1440)).toBe(false);
  });

  it('returns false when no touch regardless of width', () => {
    expect(isTouchViewport(false, 375)).toBe(false);
    expect(isTouchViewport(false, 1440)).toBe(false);
  });
});

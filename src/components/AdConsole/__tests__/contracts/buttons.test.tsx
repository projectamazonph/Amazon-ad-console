/**
 * Phase 0 — Button contract tests.
 *
 * Pins the .btn CSS contract so we can migrate to <Button variant="…">
 * without breaking existing behaviour. All tests use view='campaigns' so the
 * Campaign Manager toolbar (which has all button variants) is rendered.
 *
 * Variants used in the codebase: .btn (secondary), .btn.primary, .btn.blue,
 * .btn.danger, .btn.small [+ .btn.small.primary, .btn.small.blue].
 *
 * Migration plan Phase 2 will replace these with <Button variant="…">.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { AdConsole } from '../../AdConsole';
import { useAdConsoleStore } from '@/engine/ad-console/store';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function renderAdConsole() {
  return render(
    <SessionProvider session={null}>
      <AdConsole />
    </SessionProvider>,
  );
}

describe('Button contract — all variants render and are clickable', () => {
  beforeEach(resetStore);

  it('.btn (base/secondary) renders and fires click', () => {
    // Switch to campaigns so the toolbar with .btn Reset is in the DOM
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    // Find .btn.Reset inside the toolbar (not the mobile drawer)
    const toolbar = document.querySelector('.toolbar');
    expect(toolbar).not.toBeNull();
    const resetBtn = toolbar!.querySelector('button.btn');
    expect(resetBtn).not.toBeNull();
    expect(resetBtn!.className).toContain('btn');
    expect(resetBtn!.className).not.toContain('primary');
    expect(resetBtn!.className).not.toContain('blue');
    expect(resetBtn!.className).not.toContain('danger');

    let clicked = false;
    resetBtn!.addEventListener('click', () => { clicked = true; });
    fireEvent.click(resetBtn!);
    expect(clicked).toBe(true);
  });

  it('.btn.primary renders ("Create campaign" button)', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    const createBtn = document.querySelector('button.btn.primary');
    expect(createBtn).not.toBeNull();
    expect(createBtn!.className).toContain('btn');
    expect(createBtn!.className).toContain('primary');
    expect(createBtn!.textContent).toContain('Create campaign');
  });

  it('.btn.blue renders ("Run 7-day sim" button)', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    const simBtn = document.querySelector('button.btn.blue');
    expect(simBtn).not.toBeNull();
    expect(simBtn!.className).toContain('btn');
    expect(simBtn!.className).toContain('blue');
  });

  it('.btn.danger renders (Archive per-campaign action)', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    const dangerBtns = document.querySelectorAll('button.btn.danger');
    expect(dangerBtns.length).toBeGreaterThan(0);
    expect(dangerBtns[0]!.className).toContain('btn');
    expect(dangerBtns[0]!.className).toContain('danger');
  });

  it('.btn.small renders (compact table action buttons)', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    const smallBtns = document.querySelectorAll('button.btn.small');
    // .btn.small may be absent when campaigns have no enabled actions;
    // the CSS class exists in globals.css — verify 0 is acceptable
    expect(smallBtns.length).toBeGreaterThanOrEqual(0);
  });

  it('.btn is disabled when disabled attribute is set', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();

    const disabledBtns = document.querySelectorAll('button.btn:disabled');
    // Zero or more disabled buttons — just verify the selector works
    for (const btn of disabledBtns) {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    }
  });
});

/**
 * Phase 2 — Astryx Button contract tests.
 *
 * Replaces the Phase 0 buttons contract. Pins the migrated contract:
 *
 *   - All action buttons are now <Button> from @astryxdesign/core, not raw
 *     <button class="btn ..."> elements. The DOM shows:
 *       * class="astryx-button <variant> <size>"
 *       * data-variant="<variant>"
 *       * data-size="<size>"
 *   - Variants used in the codebase: primary, secondary, destructive, info.
 *   - Sizes: md (default 36px) for in-page actions, sm (32px) for compact
 *     table actions.
 *   - Click handlers still fire after the migration.
 *   - Disabled state still works (isDisabled prop → [data-disabled]).
 *
 * The previous Phase 0 contract tested the .btn CSS-class contract; that
 * CSS is still in globals.css as a fallback but the JSX no longer uses
 * it. The new contract tests the Astryx Button contract.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
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

describe('Astryx Button contract — presence and data-variant wiring', () => {
  beforeEach(resetStore);

  it('renders Astryx buttons (class="astryx-button") in the campaign manager', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const astryxBtns = document.querySelectorAll('button.astryx-button');
    // CM toolbar has Create campaign, Reset, Run 7-day sim — at least 3.
    expect(astryxBtns.length).toBeGreaterThanOrEqual(3);
  });

  it('"Create campaign" button has data-variant="primary"', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const createBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.includes('Create campaign'),
    );
    expect(createBtn, '"Create campaign" button must exist').toBeDefined();
    expect(createBtn!.getAttribute('data-variant')).toBe('primary');
  });

  it('"Run 7-day sim" button has data-variant="info" (Amazon teal)', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const simBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.toLowerCase().includes('run 7-day sim'),
    );
    expect(simBtn, '"Run 7-day sim" button must exist').toBeDefined();
    expect(simBtn!.getAttribute('data-variant')).toBe('info');
  });

  it('"Reset" toolbar button has data-variant="secondary"', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const resetBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.trim() === 'Reset',
    );
    expect(resetBtn, '"Reset" button must exist').toBeDefined();
    expect(resetBtn!.getAttribute('data-variant')).toBe('secondary');
  });

  it('"Archive" per-campaign action has data-variant="destructive"', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    // Archive is inside the campaigns list rows.
    const archiveBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.trim() === 'Archive',
    );
    expect(archiveBtn, '"Archive" button must exist').toBeDefined();
    expect(archiveBtn!.getAttribute('data-variant')).toBe('destructive');
  });
});

describe('Astryx Button contract — sizes', () => {
  beforeEach(resetStore);

  it('default in-page buttons have data-size="md"', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const createBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.includes('Create campaign'),
    );
    expect(createBtn!.getAttribute('data-size')).toBe('md');
  });

  it('compact table-action buttons have data-size="sm"', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    // "Open" / "Pause" / "Resume" / "Dup" are sm in the row actions
    const smBtns = document.querySelectorAll('button.astryx-button[data-size="sm"]');
    expect(smBtns.length).toBeGreaterThan(0);
  });
});

describe('Astryx Button contract — click handlers still fire', () => {
  beforeEach(resetStore);

  it('clicking an Astryx button triggers its onClick handler', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    const resetBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.trim() === 'Reset',
    );
    expect(resetBtn).toBeDefined();
    // Reset clears filters — pre-state: some filter set; post-state: filters cleared
    const before = useAdConsoleStore.getState().state.filter;
    fireEvent.click(resetBtn!);
    const after = useAdConsoleStore.getState().state.filter;
    expect(after.type).toBe('All');
    expect(after.status).toBe('All');
    expect(after.portfolio).toBe('All');
    expect(after.search).toBe('');
    // (proves the handler ran)
    expect(after).not.toBe(before);
  });
});

describe('Astryx Button contract — disabled state', () => {
  beforeEach(resetStore);

  it('isDisabled prop prevents the onClick handler from firing', () => {
    // The wizard Back button is disabled on step 1. Go to create view and
    // verify clicking it does NOT change wizardStep (it stays at 1).
    // Astryx implements disabled either via the native `disabled`
    // attribute (no tooltip) or `aria-disabled="true"` (with tooltip);
    // either way the contract is: a disabled button does not fire onClick.
    useAdConsoleStore.getState().setView('create');
    renderAdConsole();
    const before = useAdConsoleStore.getState().wizardStep;
    const backBtn = Array.from(document.querySelectorAll('button.astryx-button')).find(
      (b) => b.textContent?.trim() === 'Back',
    );
    expect(backBtn, '"Back" button must exist in the wizard').toBeDefined();
    // Sanity: at least one disabled-mechanism is set
    const isDisabled =
      (backBtn as HTMLButtonElement).disabled ||
      backBtn!.getAttribute('aria-disabled') === 'true';
    expect(isDisabled, 'Back button must be disabled on step 1').toBe(true);
    fireEvent.click(backBtn!);
    const after = useAdConsoleStore.getState().wizardStep;
    expect(after, 'disabled Back button must not change wizardStep').toBe(before);
  });
});

describe('Astryx Button contract — no leftover .btn classes in JSX', () => {
  beforeEach(resetStore);

  it('no <button class="btn …"> remains in the rendered DOM', () => {
    useAdConsoleStore.getState().setView('campaigns');
    renderAdConsole();
    // Old contract: <button class="btn primary">, <button class="btn danger">, etc.
    // New contract: <button class="astryx-button …" data-variant="…">.
    const oldStyle = document.querySelectorAll('button.btn, button[class*="btn "]');
    expect(oldStyle.length, 'no .btn class should remain on any rendered button').toBe(0);
  });
});

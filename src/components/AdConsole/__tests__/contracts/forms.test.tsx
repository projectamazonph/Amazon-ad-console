/**
 * Phase 0 — Form contract tests.
 *
 * Pins the label/input wiring contract for the OverviewTab.
 * The CM toolbar tests (search + filter selects) require view='campaigns'
 * and are covered by a11y.test.tsx label wiring. Those toolbar tests live
 * in Phase 4 (Form fields migration) instead.
 *
 * Migration plan Phase 4 will replace raw inputs with <TextInput>/<Selector>.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverviewTab } from '../../details/OverviewTab';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign } from '@/engine/ad-console/types';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function getFirstCampaign(): Campaign {
  return useAdConsoleStore.getState().state.campaigns[0]!;
}

describe('Form contract — OverviewTab label wiring', () => {
  beforeEach(resetStore);

  it('OverviewTab renders a .field container', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    expect(document.querySelectorAll('.field').length).toBeGreaterThan(0);
  });

  it('OverviewTab number inputs are wired: label htmlFor → input id', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);

    // type="number" → spinbutton role
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);

    for (const input of inputs) {
      const id = input.getAttribute('id');
      expect(id, 'input must have an id').toBeTruthy();
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label, `label[for="${id}"] must exist`).not.toBeNull();
    }
  });

  it('OverviewTab number inputs accept and update values', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);

    const input = inputs[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999' } });
    expect(input.value).toBe('999');
  });

  it('OverviewTab select elements are wired to labels', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    const selects = document.querySelectorAll('select.select');
    expect(selects.length).toBeGreaterThan(0);

    for (const sel of selects) {
      const id = (sel as HTMLSelectElement).id;
      expect(id).toBeTruthy();
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label).not.toBeNull();
    }
  });

  it('OverviewTab .field label is a direct child of the field', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    const fields = document.querySelectorAll('.field');
    for (const field of fields) {
      const label = field.querySelector(':scope > label');
      expect(label).not.toBeNull();
    }
  });
});

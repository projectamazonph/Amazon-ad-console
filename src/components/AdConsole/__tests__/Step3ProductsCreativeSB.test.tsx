import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Step3ProductsCreativeSB } from '../wizard/steps/sb/Step3ProductsCreative';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';

describe('Step3ProductsCreativeSB', () => {
  beforeEach(() => {
    useAdConsoleStore.getState().resetAll();
    useAdConsoleStore.getState().updateDraft('products', []);
  });

  it('uses an interactive checkbox to select a product', () => {
    const asin = PRODUCTS[0]!.asin;
    render(<Step3ProductsCreativeSB isActive isComplete={false} />);

    const checkbox = screen.getByRole('checkbox', { name: `Select ${asin}` });
    expect(checkbox.getAttribute('readonly')).toBeNull();

    fireEvent.click(checkbox);

    expect(useAdConsoleStore.getState().draft.products).toContain(asin);
  });
});

/**
 * Phase 0 — Card contract tests.
 *
 * Pins the .card CSS contract:
 * - .card.pad renders via OverviewTab (the sim overlay card is conditional)
 * - .card-title + h2 font weight
 * - CSS hover rules exist in globals.css
 *
 * Uses OverviewTab (direct render) because CampaignManager doesn't render
 * .card elements in its default state — only when sim overlay is active.
 *
 * Migration plan Phase 3 will replace these with <Card> and <Card variant="elevated">.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { OverviewTab } from '../../details/OverviewTab';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign } from '@/engine/ad-console/types';
import fs from 'fs';
import path from 'path';

function resetStore() {
  useAdConsoleStore.getState().resetAll();
}

function getFirstCampaign(): Campaign {
  return useAdConsoleStore.getState().state.campaigns[0]!;
}

describe('Card contract — OverviewTab .card.pad', () => {
  beforeEach(resetStore);

  it('.card.pad renders inside OverviewTab', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    const padded = document.querySelectorAll('.card.pad');
    expect(padded.length).toBeGreaterThan(0);
  });

  it('.card.pad renders with an h2 heading', () => {
    const c = getFirstCampaign();
    render(<OverviewTab campaign={c} />);
    const paddedCards = document.querySelectorAll('.card.pad');
    expect(paddedCards.length).toBeGreaterThan(0);
    // OverviewTab uses .section-head > h2, not .card-title > h2
    const h2s = paddedCards[0]!.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThan(0);
  });
});

describe('Card contract — .card CSS rules in globals.css', () => {
  function readCss() {
    return fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  }

  it('.card base rule exists (background, border, border-radius, box-shadow)', () => {
    const css = readCss();
    expect(css).toMatch(/\.card\s*\{[^}]*background[^}]*\}/);
    expect(css).toMatch(/\.card\s*\{[^}]*border[^}]*\}/);
    expect(css).toMatch(/\.card\s*\{[^}]*border-radius[^}]*\}/);
    expect(css).toMatch(/\.card\s*\{[^}]*box-shadow[^}]*\}/);
  });

  it('.card.pad padding rule exists', () => {
    const css = readCss();
    expect(css).toMatch(/\.card\.pad\s*\{[^}]*padding[^}]*\}/);
  });

  it('.card:hover transition rule exists', () => {
    const css = readCss();
    expect(css).toMatch(/\.card:hover\s*\{[^}]*border-color[^}]*\}/);
    expect(css).toMatch(/\.card:hover\s*\{[^}]*box-shadow[^}]*\}/);
  });

  it('.card-title rule exists', () => {
    const css = readCss();
    expect(css).toMatch(/\.card-title\s*\{[^}]*display[^}]*\}/);
    expect(css).toMatch(/\.card-title\s*\{[^}]*justify-content[^}]*\}/);
  });

  it('.card-title h2 has font-weight 600 (pinned rule for padded-card headings)', () => {
    const css = readCss();
    // OverviewTab renders <div class="card pad"><div class="section-head"><h2>...
    // The h2 styling comes from .section-head h2 (font-weight: 600). Older
    // Amazon console variants used .card-title h2 — both are pinned here so
    // the migration knows the design tokens it must preserve.
    expect(
      css,
      '.section-head h2 must declare font-weight: 600 (OverviewTab path)',
    ).toMatch(/\.section-head\s+h2\s*\{[^}]*font-weight:\s*600[^}]*\}/);
    expect(
      css,
      '.card-title h2 must declare font-weight: 600 (legacy card title path)',
    ).toMatch(/\.card-title\s+h2\s*\{[^}]*font-weight:\s*600[^}]*\}/);
  });
});

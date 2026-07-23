/**
 * Phase 5 — Astryx Table contract tests.
 *
 * Pins the new contract after migrating raw `<table>` inside `.table-wrap`
 * to Astryx `<Table>` (children mode). The Astryx Table emits a stable
 * `.astryx-table` class on the `<table>` element and a
 * `.astryx-table-scroll-wrapper` class on the wrapping div.
 *
 * Behaviour preserved from Phase 0:
 *   - overflow-x scroll container
 *   - sticky header on `<th>`
 *   - tabular numerals on numeric cells
 *   - hover-row highlight
 *   - uppercase + letter-spaced `<th>` labels
 *   - `tr:last-child td` no border
 *
 * Migration plan Phase 5. Note: jsdom does not fully simulate sticky
 * positioning or CSS variable resolution for computed style checks; the
 * rules are verified by reading globals.css / astryx-theme.css directly.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { AdConsole } from '../../AdConsole';
import fs from 'fs';
import path from 'path';

function renderAdConsole() {
  return render(
    <SessionProvider session={null}>
      <AdConsole />
    </SessionProvider>,
  );
}

describe('Table contract — Astryx <Table> children mode', () => {
  it('every .astryx-table lives inside a .astryx-table-scroll-wrapper', () => {
    renderAdConsole();
    const wrappers = document.querySelectorAll('.astryx-table-scroll-wrapper');
    expect(wrappers.length).toBeGreaterThan(0);
    const tables = document.querySelectorAll('.astryx-table');
    expect(tables.length).toBeGreaterThan(0);
    // Every table must be wrapped — not just the first one.
    for (const table of tables) {
      expect(table.closest('.astryx-table-scroll-wrapper')).toBeTruthy();
    }
  });

  it('no leftover .table-wrap class in the rendered DOM', () => {
    renderAdConsole();
    const legacy = document.querySelectorAll('.table-wrap');
    expect(legacy.length).toBe(0);
  });

  it('no leftover .table-wrap rule in globals.css after migration', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).not.toMatch(/\.table-wrap\s*\{/);
  });

  it('.astryx-table-scroll-wrapper has overflow-x: auto via bridge CSS', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/astryx-theme.css'),
      'utf8',
    );
    expect(css).toMatch(/\.astryx-table-scroll-wrapper\s*\{[^}]*overflow-x\s*:\s*auto/);
  });

  it('.astryx-table-scroll-wrapper has border + radius (card-in-table appearance)', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/astryx-theme.css'),
      'utf8',
    );
    expect(css).toMatch(/\.astryx-table-scroll-wrapper\s*\{[^}]*border-radius/);
    expect(css).toMatch(/\.astryx-table-scroll-wrapper\s*\{[^}]*border\s*:/);
  });

  it('th elements exist and are non-empty (header row still rendered)', () => {
    renderAdConsole();
    const headers = document.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);
    for (const th of headers) {
      expect(th.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('th sticky positioning is defined in globals.css', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/th\s*\{[^}]*position\s*:\s*sticky/);
  });

  it('th uppercase + letter-spacing rules are defined in globals.css', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/th\s*\{[^}]*text-transform\s*:\s*uppercase/);
    expect(css).toMatch(/th\s*\{[^}]*letter-spacing/);
  });

  it('.mono class defines font-variant-numeric: tabular-nums (numeric alignment)', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/\.mono\s*\{[^}]*font-variant-numeric\s*:\s*tabular-nums/);
  });

  it('tr:hover td background rule is defined in globals.css', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/tr:hover\s+td\s*\{[^}]*background/);
  });

  it('td padding rule is defined in globals.css', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/td\s*\{[^}]*padding\s*:/);
  });

  it('tr:last-child td rule removes bottom border', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/tr:last-child\s+td\s*\{[^}]*border-bottom\s*:\s*none/);
  });
});

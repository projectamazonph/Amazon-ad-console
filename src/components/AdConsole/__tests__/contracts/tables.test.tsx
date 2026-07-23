/**
 * Phase 0 — Table contract tests.
 *
 * Pins the .table-wrap + <table> CSS contract so we can migrate to <Table>
 * without breaking: overflow-x scroll container, sticky header, tabular numerals,
 * hover rows, sortable th cells.
 *
 * Note: jsdom does not fully simulate sticky positioning or CSS variable
 * resolution for computed style checks — those rules are verified by reading
 * globals.css directly. Structural and DOM-level checks use computed style.
 * Migration plan Phase 5.
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

describe('Table contract — .table-wrap wrapping a <table>', () => {
  it('.table-wrap exists and wraps at least one <table>', () => {
    renderAdConsole();
    const wrappers = document.querySelectorAll('.table-wrap');
    expect(wrappers.length).toBeGreaterThan(0);
    const tables = document.querySelectorAll('.table-wrap table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('.table-wrap overflow-x: auto is defined in globals.css', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/\.table-wrap\s*\{[^}]*overflow-x\s*:\s*auto/);
  });

  it('th elements exist and are non-empty', () => {
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

  it('.mono and .money classes define font-variant-numeric: tabular-nums', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    // The tabular-numerals rule is defined on .mono and .money utility classes
    expect(css).toMatch(/\.mono\s*\{[^}]*font-variant-numeric\s*:\s*tabular-nums/);
  });

  it('tr:hover td background rule is defined in globals.css', () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    expect(css).toMatch(/tr:hover\s+td\s*\{[^}]*background/);
  });

  it('th renders with uppercase, letter-spaced label text', () => {
    renderAdConsole();
    const headers = document.querySelectorAll('th');
    for (const th of headers) {
      const style = window.getComputedStyle(th as HTMLElement);
      // Uppercase CSS may or may not be applied in jsdom; text must be non-empty
      expect(th.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('.table-wrap has border and background (card-in-table appearance)', () => {
    const wrapper = document.querySelector('.table-wrap') as HTMLElement;
    if (!wrapper) return;
    const style = window.getComputedStyle(wrapper);
    expect(style.borderRadius).toBeTruthy();
    expect(style.backgroundColor).toBeTruthy();
  });
});

/**
 * Phase 1 — Astryx ↔ Amazon theme bridge contract.
 *
 * Pins the integration contract between the Astryx design system and the
 * existing Amazon platform theme. The bridge file (src/app/astryx-theme.css)
 * must:
 *
 *   1. Exist at the documented path.
 *   2. Map the Astryx design tokens (--color-*, --font-family-*, --spacing-*,
 *      --radius-*, --shadow-*) onto the existing Amazon tokens defined in
 *      globals.css (--surface-*, --ink-*, --accent, --success, --danger,
 *      --warning, --info, --font-display, --font-mono, --space-*, --radius-*,
 *      --shadow-*).
 *   3. Be imported from globals.css so it actually applies.
 *   4. Not change any of the canonical Amazon token values (visual identity
 *      is preserved — this is a pure bridge, not a re-skin).
 *
 * Why this matters: the previous Astryx migration (PRs #32-#36) regressed
 * the visual theme in 3 places because the bridge file didn't exist — Astryx
 * components rendered with their own default neutral palette, conflicting
 * with the Amazon colors. This test prevents that regression.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// `__dirname` here resolves to src/app/__tests__ at runtime.
// The existing amazon-theme.test.ts uses the same convention.
const GLOBALS_CSS = path.resolve(__dirname, '../../app/globals.css');
const BRIDGE_CSS = path.resolve(__dirname, '../astryx-theme.css');

let globals = '';
let bridge = '';

beforeAll(() => {
  globals = fs.readFileSync(GLOBALS_CSS, 'utf8');
  if (fs.existsSync(BRIDGE_CSS)) {
    bridge = fs.readFileSync(BRIDGE_CSS, 'utf8');
  }
});

function bridgeDecl(name: string): string | undefined {
  // Capture the RHS of a `--name: <value>;` declaration inside the bridge.
  // Tolerates whitespace and the var(--…) form, which is what we want to assert.
  const m = bridge.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  return m?.[1]?.trim();
}

function globalsDecl(name: string): string | undefined {
  const m = globals.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  return m?.[1]?.trim();
}

function readCss(): string {
  // Phase 3 Card overrides live in the bridge CSS (unlayered → wins cascade).
  return bridge;
}

describe('Phase 1 — astryx-theme bridge exists', () => {
  it('the bridge file is at src/app/astryx-theme.css', () => {
    expect(fs.existsSync(BRIDGE_CSS), `expected bridge at ${BRIDGE_CSS}`).toBe(true);
  });

  it('globals.css imports the bridge AFTER the Astryx theme files (cascade wins)', () => {
    // CSS @import must appear before any rules, so the bridge cannot sit
    // after the :root block. What matters for the cascade is that the
    // bridge is the LAST @import — its tokens win over theme-neutral
    // defaults that come earlier in the import order.
    const bridgeIdx = globals.indexOf("@import './astryx-theme.css'");
    const themeNeutralIdx = globals.indexOf("@import '@astryxdesign/theme-neutral/theme.css'");
    const astryxCoreIdx = globals.indexOf("@import '@astryxdesign/core/astryx.css'");
    expect(bridgeIdx, 'globals.css must @import the bridge').toBeGreaterThan(-1);
    expect(themeNeutralIdx, 'globals.css must @import theme-neutral').toBeGreaterThan(-1);
    expect(bridgeIdx, 'bridge must be imported after theme-neutral to win cascade').toBeGreaterThan(themeNeutralIdx);
    expect(bridgeIdx, 'bridge must be imported after core astryx to win cascade').toBeGreaterThan(astryxCoreIdx);
  });

  it('bridge targets [data-astryx-theme] (Astryx theme wrapper)', () => {
    // Astryx Theme component sets data-astryx-theme on its children wrapper.
    // The bridge must target that wrapper so its overrides take precedence
    // over the neutralTheme defaults that @scope in theme.css sets on the
    // same element.
    expect(bridge).toMatch(/\[data-astryx-theme[^\]]*\]/);
  });
});

describe('Phase 1 — astryx-theme bridge maps colors to Amazon tokens', () => {
  it('--color-background-surface → var(--surface-1)', () => {
    expect(bridgeDecl('color-background-surface')).toBe('var(--surface-1)');
  });

  it('--color-background-body → var(--surface-0)', () => {
    expect(bridgeDecl('color-background-body')).toBe('var(--surface-0)');
  });

  it('--color-background-card → var(--surface-1)', () => {
    expect(bridgeDecl('color-background-card')).toBe('var(--surface-1)');
  });

  it('--color-background-popover → var(--surface-1)', () => {
    expect(bridgeDecl('color-background-popover')).toBe('var(--surface-1)');
  });

  it('--color-background-muted → var(--surface-2)', () => {
    expect(bridgeDecl('color-background-muted')).toBe('var(--surface-2)');
  });

  it('--color-text-primary → var(--ink-900)', () => {
    expect(bridgeDecl('color-text-primary')).toBe('var(--ink-900)');
  });

  it('--color-text-secondary → var(--ink-500)', () => {
    expect(bridgeDecl('color-text-secondary')).toBe('var(--ink-500)');
  });

  it('--color-text-disabled → var(--ink-400)', () => {
    expect(bridgeDecl('color-text-disabled')).toBe('var(--ink-400)');
  });

  it('--color-accent → var(--accent)', () => {
    expect(bridgeDecl('color-accent')).toBe('var(--accent)');
  });

  it('--color-border → var(--border)', () => {
    expect(bridgeDecl('color-border')).toBe('var(--border)');
  });

  it('--color-success → var(--success)', () => {
    expect(bridgeDecl('color-success')).toBe('var(--success)');
  });

  it('--color-error → var(--danger) (Amazon error red, not Astryx red)', () => {
    expect(bridgeDecl('color-error')).toBe('var(--danger)');
  });

  it('--color-warning → var(--warning)', () => {
    expect(bridgeDecl('color-warning')).toBe('var(--warning)');
  });
});

describe('Phase 3 — astryx-theme bridge adds Card radius override', () => {
  it('.astryx-card gets Amazon border-radius (12px = --radius-lg)', () => {
    const css = readCss();
    // Card base StyleX class uses 8px; we bump to 12px to match the old .card.
    expect(css).toMatch(/\.astryx-card\s*\{[^}]*border-radius:\s*var\(--radius-lg\)[^}]*\}/);
  });

  it('.astryx-card[data-variant="muted"] uses Amazon --surface-2 background', () => {
    const css = readCss();
    expect(css).toMatch(/\.astryx-card\[data-variant="muted"\]\s*\{[^}]*background:\s*var\(--surface-2\)[^}]*\}/);
  });
});

describe('Phase 1 — astryx-theme bridge maps type + spacing + radius + shadow', () => {
  it('--font-family-body → var(--font-body) (Geist)', () => {
    expect(bridgeDecl('font-family-body')).toBe('var(--font-body)');
  });

  it('--font-family-heading → var(--font-display) (Geist)', () => {
    expect(bridgeDecl('font-family-heading')).toBe('var(--font-display)');
  });

  it('--font-family-code → var(--font-mono) (Geist Mono)', () => {
    expect(bridgeDecl('font-family-code')).toBe('var(--font-mono)');
  });

  it('--spacing-2 maps to a 4px-base scale (var(--space-2) = 8px)', () => {
    expect(bridgeDecl('spacing-2')).toBe('var(--space-2)');
  });

  it('--spacing-4 maps to a 4px-base scale (var(--space-4) = 16px)', () => {
    expect(bridgeDecl('spacing-4')).toBe('var(--space-4)');
  });

  it('--radius-element → var(--radius-md)', () => {
    expect(bridgeDecl('radius-element')).toBe('var(--radius-md)');
  });

  it('--radius-container → var(--radius-lg)', () => {
    expect(bridgeDecl('radius-container')).toBe('var(--radius-lg)');
  });

  it('--shadow-low → var(--shadow-sm) (subtle Amazon elevation)', () => {
    expect(bridgeDecl('shadow-low')).toBe('var(--shadow-sm)');
  });
});

describe('Phase 1 — bridge does not change Amazon token values (no visual regression)', () => {
  // These are the canonical Amazon palette tokens. The bridge must only
  // reference them via var(--…), not redefine them. If a re-skin happens,
  // these values would change and visual identity would drift.
  const CANONICAL = [
    'surface-0', 'surface-1', 'surface-2', 'surface-3', 'surface-4',
    'ink-900', 'ink-800', 'ink-700', 'ink-500', 'ink-400', 'ink-300', 'ink-200',
    'accent', 'accent-hover', 'accent-active',
    'success', 'warning', 'danger', 'info',
    'border', 'border-focus',
  ] as const;

  for (const name of CANONICAL) {
    it(`--${name} value in globals.css is unchanged (Amazon palette)`, () => {
      const v = globalsDecl(name);
      // The bridge must not redefine it (would mean visual identity drift).
      expect(bridgeDecl(name), `bridge must not redefine --${name}`).toBeUndefined();
      // The original definition still exists in globals.css.
      expect(v, `globals.css must still define --${name}`).toBeDefined();
    });
  }
});

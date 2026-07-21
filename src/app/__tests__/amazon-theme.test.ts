/**
 * Amazon platform theme regression test.
 *
 * Pins the canonical Amazon platform color tokens so a future design
 * tweak can't quietly drift away from the official palette. Values are
 * the published Amazon retail + Amazon Ads design-system hex codes:
 *
 *   - Amazon retail top-nav:  #131921
 *   - Amazon retail page bg:  #eaeded
 *   - Amazon orange (brand):   #ff9900
 *   - Amazon orange hover:    #e47911
 *   - Amazon orange active:   #c45500
 *   - Amazon clickable teal:  #007185 (also used for focus)
 *   - Amazon error red:       #cc0c39
 *   - Amazon success green:   #067d62
 *
 * Refs:
 *   - https://www.colorfetch.com/palette/amazon.com
 *   - https://colorswall.com/palette/146377 (aws-technical palette)
 *   - https://developer.amazon.com/en-US/alexa/alexa-haus/visual-design/apl-style-guide/color
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

let css = '';
try {
  css = fs.readFileSync(
    path.resolve(__dirname, '../../app/globals.css'),
    'utf8',
  );
} catch {
  // Source not available — tests will fail, which is the right signal.
}

function token(name: string): string | undefined {
  // Match: --name: #hex; (whitespace tolerant)
  const m = css.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  return m?.[1]?.toLowerCase();
}

describe('Amazon platform theme — canonical color tokens', () => {
  it('--surface-0 is the Amazon retail page background', () => {
    expect(token('surface-0')).toBe('#eaeded');
  });

  it('--surface-3 is the Amazon retail top-nav dark navy', () => {
    expect(token('surface-3')).toBe('#131921');
  });

  it('--surface-4 is the Amazon deepest marketing/hero surface', () => {
    expect(token('surface-4')).toBe('#0f1111');
  });

  it('--accent is Amazon Orange (canonical #ff9900)', () => {
    expect(token('accent')).toBe('#ff9900');
  });

  it('--accent-hover is the canonical Amazon hover orange', () => {
    expect(token('accent-hover')).toBe('#e47911');
  });

  it('--accent-active is the canonical Amazon active orange', () => {
    expect(token('accent-active')).toBe('#c45500');
  });

  it('--border-focus is Amazon clickable teal #007185 (used for focus + links)', () => {
    expect(token('border-focus')).toBe('#007185');
  });

  it('--info matches the Amazon clickable teal', () => {
    expect(token('info')).toBe('#007185');
  });

  it('--danger is the Amazon error red #cc0c39', () => {
    expect(token('danger')).toBe('#cc0c39');
  });

  it('--success is the Amazon success teal #067d62', () => {
    expect(token('success')).toBe('#067d62');
  });

  it('--nav-bg follows the top-nav surface', () => {
    expect(token('nav-bg')).toBe(token('surface-3'));
  });
});

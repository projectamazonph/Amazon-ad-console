/**
 * TDD: SB Store Spotlight URL validation.
 */
import { describe, it, expect } from 'vitest';
import { validateStoreUrl } from '../engine/draft';

describe('validateStoreUrl', () => {
  it('returns valid for a proper Amazon store URL', () => {
    const result = validateStoreUrl('https://www.amazon.com/stores/MyStore');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid for any https URL with a path', () => {
    const result = validateStoreUrl('https://www.example.com/shop');
    expect(result.valid).toBe(true);
  });

  it('rejects empty string for Store spotlight', () => {
    const result = validateStoreUrl('', 'Store spotlight');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('rejects non-http protocol', () => {
    const result = validateStoreUrl('ftp://store.com');
    expect(result.valid).toBe(false);
  });

  it('rejects plain text without URL format', () => {
    const result = validateStoreUrl('not a url');
    expect(result.valid).toBe(false);
  });

  it('rejects relative path without domain', () => {
    const result = validateStoreUrl('/store/page');
    expect(result.valid).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    const result = validateStoreUrl('   ');
    expect(result.valid).toBe(false);
  });

  it('is valid for Store spotlight format when URL is valid', () => {
    const result = validateStoreUrl('https://www.amazon.com/stores/MyStore', 'Store spotlight');
    expect(result.valid).toBe(true);
  });

  it('is required for Store spotlight format', () => {
    const result = validateStoreUrl('', 'Store spotlight');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('is optional for non-Store spotlight formats', () => {
    const result = validateStoreUrl('', 'Product collection');
    expect(result.valid).toBe(true);
  });
});

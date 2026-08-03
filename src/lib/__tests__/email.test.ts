import { describe, it, expect } from 'vitest';
import { normalizeEmail } from '../email';

describe('normalizeEmail', () => {
  it('lowercases the email', () => {
    expect(normalizeEmail('Foo@Example.com')).toBe('foo@example.com');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeEmail('  foo@example.com  ')).toBe('foo@example.com');
  });

  it('is idempotent for an already-normalized email', () => {
    expect(normalizeEmail('foo@example.com')).toBe('foo@example.com');
  });
});

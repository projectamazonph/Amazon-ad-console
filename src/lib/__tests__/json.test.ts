import { describe, it, expect } from 'vitest';
import { safeJsonParse } from '../json';

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', null)).toEqual({ a: 1 });
  });

  it('returns the fallback for null/undefined/empty input', () => {
    expect(safeJsonParse(null, [])).toEqual([]);
    expect(safeJsonParse(undefined, [])).toEqual([]);
    expect(safeJsonParse('', [])).toEqual([]);
  });

  it('returns the fallback instead of throwing on corrupted JSON', () => {
    expect(() => safeJsonParse('{not valid json', [])).not.toThrow();
    expect(safeJsonParse('{not valid json', ['fallback'])).toEqual(['fallback']);
  });
});

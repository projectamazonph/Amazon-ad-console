import { describe, it, expect } from 'vitest';
import { generateSearchTermsForTarget } from '../engine/search-term-generator';

describe('Search Term Generation', () => {
  // --- Exact Match ---
  describe('Exact match', () => {
    it('generates keyword + plural variant', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Exact');
      expect(terms).toContain('coffee filter');
      expect(terms).toContain('coffee filters');
    });

    it('generates keyword + singular variant for plural input', () => {
      const terms = generateSearchTermsForTarget('coffee filters', 'Exact');
      expect(terms).toContain('coffee filters');
      expect(terms).toContain('coffee filter');
    });

    it('handles single word keywords', () => {
      const terms = generateSearchTermsForTarget('coffee', 'Exact');
      expect(terms).toContain('coffee');
      expect(terms).toContain('coffees');
    });

    it('returns unique terms only', () => {
      const terms = generateSearchTermsForTarget('test', 'Exact');
      const unique = new Set(terms);
      expect(terms.length).toBe(unique.size);
    });

    it('trims and lowercases input', () => {
      const terms = generateSearchTermsForTarget('  COFFEE FILTER  ', 'Exact');
      expect(terms).toContain('coffee filter');
    });
  });

  // --- Phrase Match ---
  describe('Phrase match', () => {
    it('generates keyword with prefixes', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Phrase');
      expect(terms.some(t => t.startsWith('best '))).toBe(true);
      expect(terms.some(t => t.startsWith('cheap '))).toBe(true);
      expect(terms.some(t => t.startsWith('organic '))).toBe(true);
    });

    it('generates keyword with suffixes', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Phrase');
      expect(terms.some(t => t.endsWith(' for sale'))).toBe(true);
      expect(terms.some(t => t.endsWith(' online'))).toBe(true);
      expect(terms.some(t => t.endsWith(' near me'))).toBe(true);
    });

    it('includes the keyword itself', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Phrase');
      expect(terms).toContain('coffee filter');
    });

    it('returns unique terms only', () => {
      const terms = generateSearchTermsForTarget('test', 'Phrase');
      const unique = new Set(terms);
      expect(terms.length).toBe(unique.size);
    });

    it('generates more terms than exact match', () => {
      const exactTerms = generateSearchTermsForTarget('coffee filter', 'Exact');
      const phraseTerms = generateSearchTermsForTarget('coffee filter', 'Phrase');
      expect(phraseTerms.length).toBeGreaterThan(exactTerms.length);
    });
  });

  // --- Broad Match ---
  describe('Broad match', () => {
    it('generates keyword with prefixes', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Broad');
      expect(terms.some(t => t.startsWith('cheap '))).toBe(true);
      expect(terms.some(t => t.startsWith('best '))).toBe(true);
      expect(terms.some(t => t.startsWith('affordable '))).toBe(true);
    });

    it('generates keyword with suffixes', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Broad');
      expect(terms.some(t => t.endsWith(' accessories'))).toBe(true);
      expect(terms.some(t => t.endsWith(' deals'))).toBe(true);
      expect(terms.some(t => t.endsWith(' sale'))).toBe(true);
    });

    it('generates related term variations for known categories', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Broad');
      expect(terms.some(t => t.includes('espresso'))).toBe(true);
      expect(terms.some(t => t.includes('brew'))).toBe(true);
      expect(terms.some(t => t.includes('strainer') || t.includes('mesh') || t.includes('paper'))).toBe(true);
    });

    it('includes the keyword itself', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Broad');
      expect(terms).toContain('coffee filter');
    });

    it('returns unique terms only', () => {
      const terms = generateSearchTermsForTarget('test', 'Broad');
      const unique = new Set(terms);
      expect(terms.length).toBe(unique.size);
    });

    it('generates more terms than phrase match', () => {
      const phraseTerms = generateSearchTermsForTarget('coffee filter', 'Phrase');
      const broadTerms = generateSearchTermsForTarget('coffee filter', 'Broad');
      expect(broadTerms.length).toBeGreaterThan(phraseTerms.length);
    });
  });

  // --- Negative Filtering ---
  describe('Negative filtering during generation', () => {
    it('filters Negative exact during generation', () => {
      const terms = generateSearchTermsForTarget(
        'coffee filter',
        'Broad',
        [{ value: 'cheap coffee filter', type: 'Negative exact' }]
      );
      expect(terms).not.toContain('cheap coffee filter');
    });

    it('filters Negative phrase during generation', () => {
      const terms = generateSearchTermsForTarget(
        'coffee filter',
        'Broad',
        [{ value: 'plastic', type: 'Negative phrase' }]
      );
      expect(terms.every(t => !t.includes('plastic'))).toBe(true);
    });

    it('Negative phrase blocks any term containing the phrase', () => {
      const terms = generateSearchTermsForTarget(
        'coffee filter',
        'Broad',
        [{ value: 'cheap', type: 'Negative phrase' }]
      );
      expect(terms.every(t => !t.includes('cheap'))).toBe(true);
    });

    it('Negative exact only blocks exact match', () => {
      const terms = generateSearchTermsForTarget(
        'coffee filter',
        'Broad',
        [{ value: 'cheap coffee filter', type: 'Negative exact' }]
      );
      expect(terms.some(t => t === 'cheap coffee filter deals')).toBe(true);
    });

    it('multiple negatives all apply', () => {
      const terms = generateSearchTermsForTarget(
        'coffee filter',
        'Broad',
        [
          { value: 'cheap', type: 'Negative phrase' },
          { value: 'plastic', type: 'Negative phrase' },
          { value: 'coffee filter', type: 'Negative exact' },
        ]
      );
      expect(terms.every(t => !t.includes('cheap'))).toBe(true);
      expect(terms.every(t => !t.includes('plastic'))).toBe(true);
      expect(terms).not.toContain('coffee filter');
    });

    it('empty negatives returns all generated terms', () => {
      const terms = generateSearchTermsForTarget('coffee filter', 'Exact', []);
      const allTerms = generateSearchTermsForTarget('coffee filter', 'Exact');
      expect(terms.sort()).toEqual(allTerms.sort());
    });

    it('handles case insensitive negative matching', () => {
      const terms = generateSearchTermsForTarget(
        'coffee filter',
        'Broad',
        [{ value: 'PLASTIC', type: 'Negative phrase' }]
      );
      expect(terms.every(t => !t.toLowerCase().includes('plastic'))).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  ExactMatchGenerator,
  PhraseMatchGenerator,
  BroadMatchGenerator,
  searchTermGenerators,
  getSearchTermGenerator,
  generateSearchTermsForTarget,
} from '../engine/search-term-generator';
import type { MatchType } from '../types';

describe('Search Term Generators', () => {
  // --- Exact Match Generator ---
  describe('ExactMatchGenerator', () => {
    const generator = new ExactMatchGenerator();

    it('returns Exact match type', () => {
      expect(generator.getMatchType()).toBe('Exact');
    });

    it('generates keyword + plural variant', () => {
      const terms = generator.generate('coffee filter');
      expect(terms).toContain('coffee filter');
      expect(terms).toContain('coffee filters');
    });

    it('generates keyword + singular variant for plural input', () => {
      const terms = generator.generate('coffee filters');
      expect(terms).toContain('coffee filters');
      expect(terms).toContain('coffee filter');
    });

    it('handles single word keywords', () => {
      const terms = generator.generate('coffee');
      expect(terms).toContain('coffee');
      expect(terms).toContain('coffees');
    });

    it('returns unique terms only', () => {
      const terms = generator.generate('test');
      const unique = new Set(terms);
      expect(terms.length).toBe(unique.size);
    });

    it('trims and lowercases input', () => {
      const terms = generator.generate('  COFFEE FILTER  ');
      expect(terms).toContain('coffee filter');
    });
  });

  // --- Phrase Match Generator ---
  describe('PhraseMatchGenerator', () => {
    const generator = new PhraseMatchGenerator();

    it('returns Phrase match type', () => {
      expect(generator.getMatchType()).toBe('Phrase');
    });

    it('generates keyword with prefixes', () => {
      const terms = generator.generate('coffee filter');
      expect(terms.some(t => t.startsWith('best '))).toBe(true);
      expect(terms.some(t => t.startsWith('cheap '))).toBe(true);
      expect(terms.some(t => t.startsWith('organic '))).toBe(true);
    });

    it('generates keyword with suffixes', () => {
      const terms = generator.generate('coffee filter');
      expect(terms.some(t => t.endsWith(' for sale'))).toBe(true);
      expect(terms.some(t => t.endsWith(' online'))).toBe(true);
      expect(terms.some(t => t.endsWith(' near me'))).toBe(true);
    });

    it('includes the keyword itself', () => {
      const terms = generator.generate('coffee filter');
      expect(terms).toContain('coffee filter');
    });

    it('returns unique terms only', () => {
      const terms = generator.generate('test');
      const unique = new Set(terms);
      expect(terms.length).toBe(unique.size);
    });

    it('generates more terms than exact match', () => {
      const exactTerms = new ExactMatchGenerator().generate('coffee filter');
      const phraseTerms = generator.generate('coffee filter');
      expect(phraseTerms.length).toBeGreaterThan(exactTerms.length);
    });
  });

  // --- Broad Match Generator ---
  describe('BroadMatchGenerator', () => {
    const generator = new BroadMatchGenerator();

    it('returns Broad match type', () => {
      expect(generator.getMatchType()).toBe('Broad');
    });

    it('generates keyword with prefixes', () => {
      const terms = generator.generate('coffee filter');
      expect(terms.some(t => t.startsWith('cheap '))).toBe(true);
      expect(terms.some(t => t.startsWith('best '))).toBe(true);
      expect(terms.some(t => t.startsWith('affordable '))).toBe(true);
    });

    it('generates keyword with suffixes', () => {
      const terms = generator.generate('coffee filter');
      expect(terms.some(t => t.endsWith(' accessories'))).toBe(true);
      expect(terms.some(t => t.endsWith(' deals'))).toBe(true);
      expect(terms.some(t => t.endsWith(' sale'))).toBe(true);
    });

    it('generates related term variations for known categories', () => {
      const terms = generator.generate('coffee filter');
      // Coffee-related synonyms
      expect(terms.some(t => t.includes('espresso'))).toBe(true);
      expect(terms.some(t => t.includes('brew'))).toBe(true);
      // Filter-related synonyms
      expect(terms.some(t => t.includes('strainer') || t.includes('mesh') || t.includes('paper'))).toBe(true);
    });

    it('includes the keyword itself', () => {
      const terms = generator.generate('coffee filter');
      expect(terms).toContain('coffee filter');
    });

    it('returns unique terms only', () => {
      const terms = generator.generate('test');
      const unique = new Set(terms);
      expect(terms.length).toBe(unique.size);
    });

    it('generates more terms than phrase match', () => {
      const phraseTerms = new PhraseMatchGenerator().generate('coffee filter');
      const broadTerms = generator.generate('coffee filter');
      expect(broadTerms.length).toBeGreaterThan(phraseTerms.length);
    });
  });

  // --- Registry ---
  describe('searchTermGenerators registry', () => {
    it('has all three match types', () => {
      expect(searchTermGenerators.Exact).toBeDefined();
      expect(searchTermGenerators.Phrase).toBeDefined();
      expect(searchTermGenerators.Broad).toBeDefined();
    });

    it('returns correct generator for each match type', () => {
      expect(getSearchTermGenerator('Exact')).toBeInstanceOf(ExactMatchGenerator);
      expect(getSearchTermGenerator('Phrase')).toBeInstanceOf(PhraseMatchGenerator);
      expect(getSearchTermGenerator('Broad')).toBeInstanceOf(BroadMatchGenerator);
    });
  });

  // --- Negative Filtering During Generation ---
  describe('generateSearchTermsForTarget with negatives', () => {
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
      // None of the generated terms should contain 'plastic'
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
      // 'cheap coffee filter deals' should NOT be blocked by exact negative
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
      const allTerms = new ExactMatchGenerator().generate('coffee filter');
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

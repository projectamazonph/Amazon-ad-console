/**
 * Search Term Generators — Strategy Pattern for Match Types
 *
 * Each match type has its own generator, making the system
 * open for extension but closed for modification (OCP).
 */
import type { MatchType } from '../types';

export interface SearchTermGenerator {
  generate(keyword: string): string[];
  getMatchType(): MatchType;
}

/**
 * Exact Match Generator
 * Generates: exact keyword + close variants (plural/singular, minor misspellings)
 */
export class ExactMatchGenerator implements SearchTermGenerator {
  getMatchType(): MatchType {
    return 'Exact';
  }

  generate(keyword: string): string[] {
    const normalized = keyword.trim().toLowerCase();
    const terms = new Set<string>();
    terms.add(normalized);

    // Add plural/singular variants
    if (normalized.endsWith('s') && normalized.length > 3) {
      terms.add(normalized.slice(0, -1)); // singular
    } else if (!normalized.endsWith('s')) {
      terms.add(normalized + 's'); // plural
    }

    return Array.from(terms);
  }
}

/**
 * Phrase Match Generator
 * Generates: keyword with prefixes/suffixes (words before/after)
 */
export class PhraseMatchGenerator implements SearchTermGenerator {
  getMatchType(): MatchType {
    return 'Phrase';
  }

  generate(keyword: string): string[] {
    const normalized = keyword.trim().toLowerCase();
    const terms = new Set<string>();

    // Common prefixes for phrase match
    const prefixes = ['best ', 'top ', 'buy ', 'cheap ', 'organic ', 'premium ', 'quality ', 'discount '];
    // Common suffixes for phrase match
    const suffixes = [' for sale', ' online', ' near me', ' reviews', ' 2024', ' bulk', ' wholesale'];

    for (const prefix of prefixes) {
      terms.add(prefix + normalized);
    }
    for (const suffix of suffixes) {
      terms.add(normalized + suffix);
    }
    // Also include the keyword itself as a phrase match can match exact
    terms.add(normalized);

    return Array.from(terms);
  }
}

/**
 * Broad Match Generator
 * Generates: expanded variations, related terms, synonyms, accessories
 * Also combines prefix + keyword + suffix for more realistic broad match
 */
export class BroadMatchGenerator implements SearchTermGenerator {
  getMatchType(): MatchType {
    return 'Broad';
  }

  generate(keyword: string): string[] {
    const normalized = keyword.trim().toLowerCase();
    const terms = new Set<string>();

    // Prefixes
    const prefixes = ['cheap ', 'affordable ', 'best ', 'top rated ', 'buy ', 'discount ', 'premium ', 'quality '];
    // Suffixes
    const suffixes = [' accessories', ' deals', ' sale', ' online', ' near me', ' reviews', ' 2024', ' kit', ' set', ' pack', ' replacement', ' parts'];
    // Related/expanded terms (simple synonym/related word injection)
    const related: Record<string, string[]> = {
      coffee: ['espresso', 'caffeine', 'brew', 'bean', 'roast'],
      filter: ['strainer', 'screen', 'mesh', 'paper'],
      mug: ['cup', 'tumbler', 'thermos', 'glass'],
      press: ['french press', 'aeropress', 'brewer'],
      grinder: ['mill', 'burr grinder', 'blade grinder'],
      bean: ['coffee bean', 'espresso bean', 'roasted bean'],
      machine: ['maker', 'brewer', 'espresso machine'],
      pod: ['capsule', 'k-cup', 'nespresso pod'],
    };

    // Add prefix + keyword combinations
    for (const prefix of prefixes) {
      terms.add(prefix + normalized);
    }
    // Add keyword + suffix combinations
    for (const suffix of suffixes) {
      terms.add(normalized + suffix);
    }
    // Add prefix + keyword + suffix combinations (broad match often does this)
    for (const prefix of prefixes) {
      for (const suffix of suffixes) {
        terms.add(prefix + normalized + suffix);
      }
    }
    // Add related term variations
    for (const [root, relatedTerms] of Object.entries(related)) {
      if (normalized.includes(root)) {
        for (const relatedTerm of relatedTerms) {
          const variant = normalized.replace(root, relatedTerm);
          if (variant !== normalized) {
            terms.add(variant);
          }
        }
      }
    }
    // Add the keyword itself
    terms.add(normalized);

    return Array.from(terms);
  }
}

/**
 * Registry of all generators — open for extension
 * Add new match types here without modifying simulation.ts
 */
export const searchTermGenerators: Record<MatchType, SearchTermGenerator> = {
  Exact: new ExactMatchGenerator(),
  Phrase: new PhraseMatchGenerator(),
  Broad: new BroadMatchGenerator(),
};

/**
 * Get generator for a match type
 */
export function getSearchTermGenerator(matchType: MatchType): SearchTermGenerator {
  return searchTermGenerators[matchType];
}

/**
 * Generate search terms for a keyword with negative filtering applied
 * during generation (not after) — filtered terms never enter the system
 */
export function generateSearchTermsForTarget(
  keyword: string,
  matchType: MatchType,
  negatives: Array<{ value: string; type: string }> = []
): string[] {
  const generator = getSearchTermGenerator(matchType);
  const generated = generator.generate(keyword);

  // Filter by negatives during generation
  return generated.filter((term) => {
    const termLower = term.toLowerCase();
    return !negatives.some((neg) => {
      const negLower = neg.value.toLowerCase();
      if (neg.type === 'Negative exact') return termLower === negLower;
      if (neg.type === 'Negative phrase') return termLower.includes(negLower);
      return false;
    });
  });
}

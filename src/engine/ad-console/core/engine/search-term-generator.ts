/**
 * Search term generation for keyword match types.
 *
 * ponytail: flat functions instead of Strategy pattern classes.
 */
import type { MatchType } from '../types';

function generateExact(keyword: string): string[] {
  const normalized = keyword.trim().toLowerCase();
  const terms = new Set<string>();
  terms.add(normalized);
  if (normalized.endsWith('s') && normalized.length > 3) {
    terms.add(normalized.slice(0, -1));
  } else if (!normalized.endsWith('s')) {
    terms.add(normalized + 's');
  }
  return Array.from(terms);
}

function generatePhrase(keyword: string): string[] {
  const normalized = keyword.trim().toLowerCase();
  const terms = new Set<string>();
  const prefixes = ['best ', 'top ', 'buy ', 'cheap ', 'organic ', 'premium ', 'quality ', 'discount '];
  const suffixes = [' for sale', ' online', ' near me', ' reviews', ' 2024', ' bulk', ' wholesale'];
  for (const prefix of prefixes) terms.add(prefix + normalized);
  for (const suffix of suffixes) terms.add(normalized + suffix);
  terms.add(normalized);
  return Array.from(terms);
}

function generateBroad(keyword: string): string[] {
  const normalized = keyword.trim().toLowerCase();
  const terms = new Set<string>();
  const prefixes = ['cheap ', 'affordable ', 'best ', 'top rated ', 'buy ', 'discount ', 'premium ', 'quality '];
  const suffixes = [' accessories', ' deals', ' sale', ' online', ' near me', ' reviews', ' 2024', ' kit', ' set', ' pack', ' replacement', ' parts'];
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
  for (const prefix of prefixes) terms.add(prefix + normalized);
  for (const suffix of suffixes) terms.add(normalized + suffix);
  for (const prefix of prefixes) {
    for (const suffix of suffixes) terms.add(prefix + normalized + suffix);
  }
  for (const [root, relatedTerms] of Object.entries(related)) {
    if (normalized.includes(root)) {
      for (const relatedTerm of relatedTerms) {
        const variant = normalized.replace(root, relatedTerm);
        if (variant !== normalized) terms.add(variant);
      }
    }
  }
  terms.add(normalized);
  return Array.from(terms);
}

export function generateSearchTermsForTarget(
  keyword: string,
  matchType: MatchType,
  negatives: Array<{ value: string; type: string }> = [],
): string[] {
  const generated = matchType === 'Exact' ? generateExact(keyword)
    : matchType === 'Phrase' ? generatePhrase(keyword)
    : generateBroad(keyword);

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

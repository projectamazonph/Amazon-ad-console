/**
 * Wizard draft helpers — product selection & keyword parsing.
 */
import type { CampaignDraft } from '../types';
import { assertNonEmpty, ValidationError } from '../../../../lib/validation';

export function selectProduct(draft: CampaignDraft, asin: string): CampaignDraft {
  assertNonEmpty('product ASIN', asin);
  const trimmed = asin.trim();
  if (draft.products.includes(trimmed)) return draft;
  return { ...draft, products: [...draft.products, trimmed] };
}

export function removeProduct(draft: CampaignDraft, asin: string): CampaignDraft {
  assertNonEmpty('product ASIN', asin);
  const trimmed = asin.trim();
  if (!draft.products.includes(trimmed)) return draft;
  if (draft.products.length <= 1) {
    throw new ValidationError('A campaign must keep at least one product');
  }
  return { ...draft, products: draft.products.filter((p) => p !== trimmed) };
}

const MAX_KEYWORD_LENGTH = 200;

export function parseKeywords(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.length > MAX_KEYWORD_LENGTH) {
        throw new ValidationError(`Keyword exceeds ${MAX_KEYWORD_LENGTH} characters`);
      }
      return true;
    });
}

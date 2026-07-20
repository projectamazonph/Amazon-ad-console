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

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Amazon's campaign minimums, enforced in the wizard so garbage can't launch. */
export const MIN_DAILY_BUDGET = 1;

/**
 * Blocking problems that must be resolved before a draft can be launched:
 * a non-empty name, a daily budget of at least $1, and at least one product.
 */
export function draftLaunchErrors(draft: CampaignDraft): string[] {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push('Campaign name is required');
  if (!Number.isFinite(draft.dailyBudget) || draft.dailyBudget < MIN_DAILY_BUDGET) {
    errors.push(`Daily budget must be at least $${MIN_DAILY_BUDGET}`);
  }
  if (!draft.products.length) errors.push('Select at least one product');
  if (usesKeywordTargeting(draft.targetingMode) && draft.keywords.trim() && draft.keywordMatchTypes.length === 0) {
    errors.push('Select at least one keyword match type');
  }
  return errors;
}

/** Whether a targeting mode adds keyword targets (SP "Manual keyword" / SB "Keyword"). */
export function usesKeywordTargeting(mode: string): boolean {
  return mode === 'Manual keyword' || mode === 'Keyword';
}

/**
 * Whether the wizard may advance from the given step. Gates step 2 on
 * name + budget and step 3 on having a product; other steps are unrestricted.
 */
export function canLeaveWizardStep(draft: CampaignDraft, step: number): boolean {
  if (step === 2) return draft.name.trim().length > 0 && Number.isFinite(draft.dailyBudget) && draft.dailyBudget >= MIN_DAILY_BUDGET;
  if (step === 3) return draft.products.length > 0;
  // Step 4 is targeting: if keywords are entered, at least one match type is required.
  if (step === 4 && usesKeywordTargeting(draft.targetingMode) && draft.keywords.trim()) {
    return draft.keywordMatchTypes.length > 0;
  }
  return true;
}

const URL_REGEX = /^https:\/\/.+\..+/;

export function validateStoreUrl(url: string, adFormat?: string): ValidationResult {
  const trimmed = url.trim();

  if (trimmed !== url && !trimmed) {
    return { valid: false, error: "Must be a valid https:// URL (e.g. https://www.amazon.com/stores/YourStore)" };
  }

  // Store spotlight requires a URL; other formats it's optional
  if (adFormat === 'Store spotlight' && !trimmed) {
    return { valid: false, error: 'Store URL is required for Store spotlight format' };
  }

  // Non-Store spotlight: empty is fine
  if (!trimmed) {
    return { valid: true };
  }

  if (!URL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Must be a valid https:// URL (e.g. https://www.amazon.com/stores/YourStore)' };
  }

  return { valid: true };
}

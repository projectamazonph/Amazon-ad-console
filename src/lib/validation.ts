/**
 * Fail-fast input validation helpers for the ad console domain.
 *
 * These throw on programmer/input errors so invalid state never
 * propagates through the engine. Keep them dependency-free.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError(`${name} must be a finite non-negative number, got ${value}`);
  }
}

/** Amazon Ads' real minimum bid — used by functions that set an explicit bid on existing entities. */
export const MIN_BID = 0.02;

/**
 * Like assertFiniteNonNegative, but also enforces the platform's real bid
 * floor. Use this for "set the bid to X" actions on an existing entity,
 * where silently substituting a different value than what was explicitly
 * requested would be misleading. Creation/normalization paths that fill in
 * defaults for otherwise-incomplete data should keep clamping instead.
 */
export function assertValidBid(name: string, value: number): void {
  assertFiniteNonNegative(name, value);
  if (value < MIN_BID) {
    throw new ValidationError(`${name} must be at least $${MIN_BID.toFixed(2)}, got ${value}`);
  }
}

export function assertNonEmpty(name: string, value: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${name} must be a non-empty string`);
  }
}

const CAMPAIGN_TYPES = ['SP', 'SB', 'SD'] as const;
const CAMPAIGN_STATUSES = ['Enabled', 'Paused', 'Archived', 'Draft'] as const;

export function assertCampaignType(value: string): asserts value is 'SP' | 'SB' | 'SD' {
  if (!CAMPAIGN_TYPES.includes(value as (typeof CAMPAIGN_TYPES)[number])) {
    throw new ValidationError(`Invalid campaign type: ${value}`);
  }
}

export function assertCampaignStatus(value: string): asserts value is 'Enabled' | 'Paused' | 'Archived' | 'Draft' {
  if (!CAMPAIGN_STATUSES.includes(value as (typeof CAMPAIGN_STATUSES)[number])) {
    throw new ValidationError(`Invalid campaign status: ${value}`);
  }
}

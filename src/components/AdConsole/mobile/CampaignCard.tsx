'use client';

/**
 * CampaignCard — mobile-first (and desktop-safe) card representation
 * of a single Campaign.
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1: at <768px, each campaign renders as
 * a full-width card instead of a row in the table. Primary face shows
 * Name + Type + Status; secondary metrics and quick actions expand on
 * demand. Visual treatment is owned by `.campaign-card` in globals.css.
 */
import type { Campaign } from '@/engine/ad-console/types';

export interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (id: string) => void;
}

export function CampaignCard({ campaign, onSelect }: CampaignCardProps) {
  return (
    <article
      className="campaign-card"
      data-testid={`campaign-card-${campaign.id}`}
    >
      <button
        type="button"
        className="campaign-card__select"
        onClick={() => onSelect(campaign.id)}
        aria-label={`Open campaign ${campaign.name}`}
      >
        <span className="campaign-card__name">{campaign.name}</span>
        <span className="campaign-card__status">{campaign.status}</span>
      </button>
    </article>
  );
}

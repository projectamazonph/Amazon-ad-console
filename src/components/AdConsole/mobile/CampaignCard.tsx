'use client';

/**
 * CampaignCard - mobile-first (and desktop-safe) card representation
 * of a single Campaign.
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1: at <768px, each campaign renders as
 * a full-width card instead of a row in the table. Primary face shows
 * Name + Type + Status; secondary metrics expand on demand.
 *
 * Visual treatment owned by `.campaign-card*` classes in globals.css.
 */
import type { Campaign, CampaignStatus, CampaignType } from '@/engine/ad-console/types';

export interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (id: string) => void;
}

function formatMoney(n: number): string {
  return '$' + n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRoas(sales: number, spend: number): string {
  if (spend <= 0) return '0.00';
  return (sales / spend).toFixed(2);
}

function statusPillClass(status: CampaignStatus): string {
  // Reuse existing pill color system: green=Enabled, orange=Paused,
  // red=Archived, bad=Draft. Matches Dashboard.tsx and CampaignManager.
  switch (status) {
    case 'Enabled':
      return 'pill green';
    case 'Paused':
      return 'pill orange';
    case 'Archived':
      return 'pill red';
    default:
      return 'pill bad';
  }
}

function typePillClass(type: CampaignType): string {
  // SP=info/active, SB=orange, SD=purple. Matches the table render.
  switch (type) {
    case 'SP':
      return 'pill active';
    case 'SB':
      return 'pill orange';
    case 'SD':
      return 'pill purple';
    default:
      return 'pill';
  }
}

export function CampaignCard({ campaign, onSelect }: CampaignCardProps) {
  const { metrics } = campaign;
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
        <div className="campaign-card__row campaign-card__row--primary">
          <span className="campaign-card__name">{campaign.name}</span>
          <span className={typePillClass(campaign.type)}>{campaign.type}</span>
          <span className={statusPillClass(campaign.status)}>
            {campaign.status}
          </span>
        </div>
        <div className="campaign-card__row campaign-card__row--metrics">
          <span className="campaign-card__metric">
            <span className="campaign-card__metric-label">Spend</span>
            <span className="campaign-card__metric-value campaign-card__metric-value--num">
              {formatMoney(metrics.spend)}
            </span>
          </span>
          <span className="campaign-card__metric">
            <span className="campaign-card__metric-label">Sales</span>
            <span className="campaign-card__metric-value campaign-card__metric-value--num">
              {formatMoney(metrics.sales)}
            </span>
          </span>
          <span className="campaign-card__metric">
            <span className="campaign-card__metric-label">ROAS</span>
            <span className="campaign-card__metric-value campaign-card__metric-value--num">
              {formatRoas(metrics.sales, metrics.spend)}x
            </span>
          </span>
        </div>
      </button>
    </article>
  );
}

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
import { useState } from 'react';
import type { Campaign, CampaignStatus, CampaignType } from '@/engine/ad-console/types';

export interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onArchive?: (id: string) => void;
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

function formatPercent(n: number): string {
  return n.toFixed(2) + '%';
}

function statusPillClass(status: CampaignStatus): string {
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

export function CampaignCard({
  campaign,
  onSelect,
  onToggleStatus,
  onArchive,
}: CampaignCardProps) {
  const { metrics } = campaign;
  const [expanded, setExpanded] = useState(false);

  const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const cpc = metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0;
  const acos = metrics.sales > 0 ? (metrics.spend / metrics.sales) * 100 : 0;

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

      <button
        type="button"
        className="campaign-card__toggle"
        aria-expanded={expanded}
        aria-controls={`campaign-card-details-${campaign.id}`}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <div
          id={`campaign-card-details-${campaign.id}`}
          className="campaign-card__details"
        >
          <dl className="campaign-card__metrics-grid">
            <div>
              <dt>CPC</dt>
              <dd className="campaign-card__metric-value--num">{formatMoney(cpc)}</dd>
            </div>
            <div>
              <dt>Orders</dt>
              <dd className="campaign-card__metric-value--num">{metrics.orders}</dd>
            </div>
            <div>
              <dt>ACOS</dt>
              <dd className="campaign-card__metric-value--num">{formatPercent(acos)}</dd>
            </div>
            <div>
              <dt>CTR</dt>
              <dd className="campaign-card__metric-value--num">{formatPercent(ctr)}</dd>
            </div>
          </dl>

          <div className="campaign-card__actions">
            <button
              type="button"
              className="campaign-card__action"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus?.(campaign.id);
              }}
            >
              {campaign.status === 'Paused' ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              className="campaign-card__action campaign-card__action--danger"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(campaign.id);
              }}
            >
              Archive
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

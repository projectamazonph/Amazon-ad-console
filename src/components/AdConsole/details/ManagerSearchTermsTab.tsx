'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass, isFilteredByNegative } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';

interface Props {
  campaigns: Campaign[];
}

export function ManagerSearchTermsTab({ campaigns }: Props) {
  const rows = campaigns.flatMap((c) =>
    (c.searchTerms || [])
      .filter((st) => !isFilteredByNegative(st.term, c.negatives))
      .map((st) => ({ c, st }))
  );

  if (!rows.length) {
    return <EmptyState icon="search" title="No search terms" message="Search terms appear after running a simulation. They are also filtered by negatives: check the Negatives tab." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Search term</th><th>Campaign</th><th>Matched target</th>
            <th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Rec</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, st }) => {
            const x = calc({ impressions: st.impressions || 0, clicks: st.clicks, spend: st.spend, sales: st.sales, orders: st.orders });
            return (
              <tr key={st.id}>
                <td><strong>{st.term}</strong></td>
                <td>{c.name}</td><td>{st.targetValue}</td>
                <td className="mono">{formatWhole(st.impressions || 0)}</td>
                <td className="mono">{formatWhole(st.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(st.spend)}</td>
                <td className="money">{formatMoney(st.sales)}</td>
                <td className="mono">{formatWhole(st.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{st.sales ? formatPercent(x.acos) : 'No sales'}</td>
                <td className="mono">{formatRoas(x.roas)}</td>
                <td><span className={`pill ${st.recommendation === 'Negate' ? 'bad' : st.recommendation === 'Add as exact keyword' ? 'green' : ''}`}>{st.recommendation}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

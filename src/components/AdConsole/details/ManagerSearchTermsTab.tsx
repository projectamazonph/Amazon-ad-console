'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass, isFilteredByNegative } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';

interface Props {
  campaigns: Campaign[];
}

/**
 * Account-wide search-terms table (negative-filtered). Rows link through to the
 * campaign's Search terms tab and expose harvest and negate actions.
 */
export function ManagerSearchTermsTab({ campaigns }: Props) {
  const selectCampaign = useAdConsoleStore((s) => s.selectCampaign);
  const setTab = useAdConsoleStore((s) => s.setTab);
  const harvestTerm = useAdConsoleStore((s) => s.harvestTerm);
  const addNegative = useAdConsoleStore((s) => s.addNegative);

  const open = (campaignId: string) => { selectCampaign(campaignId); setTab('searchTerms'); };

  const rows = campaigns.flatMap((c) =>
    (c.searchTerms || [])
      .filter((st) => !isFilteredByNegative(st.term, c.negatives))
      .map((st) => ({ c, st }))
  );

  if (!rows.length) {
    return <EmptyState icon="search" title="No search terms" message="Search terms appear after running a simulation. They are also filtered by negatives: check the Negatives tab." />;
  }

  const linkStyle = { border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', textAlign: 'left' as const, padding: 0 };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Search term</th><th>Campaign</th><th>Matched target</th>
            <th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Rec</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, st }) => {
            const x = calc({ impressions: st.impressions || 0, clicks: st.clicks, spend: st.spend, sales: st.sales, orders: st.orders });
            return (
              <tr key={st.id}>
                <td><button className="row-link" style={{ ...linkStyle, fontWeight: 600 }} onClick={() => open(c.id)}>{st.term}</button></td>
                <td><button className="row-link" style={linkStyle} onClick={() => open(c.id)}>{c.name}</button></td>
                <td>{st.targetValue}</td>
                <td className="mono">{formatWhole(st.impressions || 0)}</td>
                <td className="mono">{formatWhole(st.clicks)}</td>
                <td className="money">{formatBid(x.cpc)}</td>
                <td className="money">{formatMoney(st.spend)}</td>
                <td className="money">{formatMoney(st.sales)}</td>
                <td className="mono">{formatWhole(st.orders)}</td>
                <td className={`mono ${acosClass(x.acos)}`}>{st.sales ? formatPercent(x.acos) : 'No sales'}</td>
                <td className="mono">{formatRoas(x.roas)}</td>
                <td><span className={`pill ${st.recommendation === 'Negate' ? 'bad' : st.recommendation === 'Add as exact keyword' ? 'green' : ''}`}>{st.recommendation}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn small" onClick={() => harvestTerm(c.id, st.term)}>Harvest</button>{' '}
                  <button className="btn small danger" onClick={() => addNegative(c.id, st.term, 'Negative exact')}>Negate</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

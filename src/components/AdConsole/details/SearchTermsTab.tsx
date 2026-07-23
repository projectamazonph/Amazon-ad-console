'use client';

import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass, isFilteredByNegative } from '@/engine/ad-console/engine';
import { EmptyState } from './EmptyState';
import { Badge } from '@astryxdesign/core/Badge';

interface Props { campaign: Campaign }

export function SearchTermsTab({ campaign }: Props) {
  const addNegative = useAdConsoleStore((s) => s.addNegative);
  const harvestTerm = useAdConsoleStore((s) => s.harvestTerm);
  const runSimulation = useAdConsoleStore((s) => s.runSimulation);

  const c = campaign;
  const visibleSearchTerms = c.searchTerms.filter(
    (st) => !isFilteredByNegative(st.term, c.negatives)
  );

  if (!visibleSearchTerms.length) {
    const hasNegatives = c.negatives.length > 0;
    return (
      <EmptyState
        icon="search"
        title="No search terms"
        message={hasNegatives ? 'All search terms are filtered by negatives. Check the Negatives tab to review.' : 'Run a simulation to generate search terms from your keyword targets.'}
      >
        {!hasNegatives && <button className="btn primary" onClick={() => runSimulation()}>Run 7-day simulation</button>}
      </EmptyState>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Search term</th><th>Matched target</th><th>Impr.</th><th>Clicks</th><th>CPC</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>ROAS</th><th>Rec</th><th>Actions</th></tr></thead>
        <tbody>
          {visibleSearchTerms.map((st) => {
            const impressions = st.impressions ?? 0;
            const sx = calc({ impressions, clicks: st.clicks, spend: st.spend, sales: st.sales, orders: st.orders });
            return (
              <tr key={st.id}>
                <td><strong>{st.term}</strong></td><td>{st.targetValue}</td>
                <td className="mono">{formatWhole(impressions)}</td>
                <td className="mono">{formatWhole(st.clicks)}</td>
                <td className="money">{formatBid(sx.cpc)}</td>
                <td className="money">{formatMoney(st.spend)}</td>
                <td className="money">{formatMoney(st.sales)}</td>
                <td className="mono">{formatWhole(st.orders)}</td>
                <td className={`mono ${st.sales ? acosClass(sx.acos) : 'bad'}`}>{st.sales ? formatPercent(sx.acos) : 'No sales'}</td>
                <td className="mono">{formatRoas(sx.roas)}</td>
                <td><Badge variant={st.recommendation === "Negate" ? "error" : st.recommendation === "Add as exact keyword" ? "success" : "neutral"} label={st.recommendation} /></td>
                <td>
                  <button className="btn small" onClick={() => harvestTerm(c.id, st.term)}>Harvest exact</button>{' '}
                  <button className="btn small danger" onClick={() => addNegative(c.id, st.term, 'Negative exact')}>Negate exact</button>{' '}
                  <button className="btn small danger" onClick={() => addNegative(c.id, st.term, 'Negative phrase')}>Negate phrase</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

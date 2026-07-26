'use client';

import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent, formatBid, formatRoas, acosClass, isFilteredByNegative } from '@/engine/ad-console/core/engine';
import { EmptyState } from './EmptyState';

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
        {!hasNegatives && <Button label="Run 7-day simulation" variant="primary" onClick={() => runSimulation()} />}
      </EmptyState>
    );
  }

  return (
    <Table>
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
                <td><span className={`pill ${st.recommendation === 'Negate' ? 'bad' : st.recommendation === 'Add as exact keyword' ? 'green' : ''}`}>{st.recommendation}</span></td>
                <td>
                  <Button label="Harvest exact" size="sm" onClick={() => harvestTerm(c.id, st.term)} />{' '}
                  <Button label="Negate exact" variant="destructive" size="sm" onClick={() => addNegative(c.id, st.term, 'Negative exact')} />{' '}
                  <Button label="Negate phrase" variant="destructive" size="sm" onClick={() => addNegative(c.id, st.term, 'Negative phrase')} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
  );
}

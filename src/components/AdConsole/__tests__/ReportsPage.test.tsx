import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ReportsPage } from '../features/reports/ReportsPage';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Report } from '@/engine/ad-console/features/reports/types';

const REPORT: Report = {
  id: 'report-1',
  type: 'campaign',
  generatedAt: '2026-07-23T00:00:00.000Z',
  rows: [
    {
      impressions: 1000,
      clicks: 100,
      spend: 25,
      sales: 200,
      orders: 4,
      ctr: 10,
      cpc: 0.25,
      acos: 12.5,
      roas: 8,
    },
  ],
};

describe('ReportsPage', () => {
  beforeEach(() => {
    useAdConsoleStore.getState().resetAll();
    useAdConsoleStore.setState({
      reports: [REPORT],
      selectedReportId: REPORT.id,
    });
  });

  it('renders headers that match the visible report metric cells', () => {
    const { container } = render(<ReportsPage />);
    const headers = Array.from(container.querySelectorAll('thead th')).map(
      (header) => header.textContent,
    );
    const cells = container.querySelectorAll('tbody tr:first-child td');

    expect(headers).toEqual(['Impressions', 'Clicks', 'Spend', 'Sales', 'ACOS']);
    expect(cells).toHaveLength(headers.length);
  });
});

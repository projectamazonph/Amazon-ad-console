'use client';

import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Card } from '@astryxdesign/core/Card';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent } from '@/engine/ad-console/core/engine';

export function ReportsPage() {
  const requests = useAdConsoleStore((s) => s.reportQueue);
  const reports = useAdConsoleStore((s) => s.reports);
  const selectedReportId = useAdConsoleStore((s) => s.selectedReportId);
  const requestReport = useAdConsoleStore((s) => s.requestReport);
  const selectReport = useAdConsoleStore((s) => s.selectReport);
  const exportCsv = useAdConsoleStore((s) => s.exportReportCsv);
  const setView = useAdConsoleStore((s) => s.setView);

  const selected = selectedReportId ? reports.find((r) => r.id === selectedReportId) : null;

  const handleExportCsv = (reportId: string, type: string) => {
    const csv = exportCsv(reportId);
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Reports</h1>
          <p>Generate and download performance reports for your campaigns.</p>
        </div>
        <div className="page-actions">
          <Button label="Campaign report" onClick={() => requestReport('campaign')} />
          <Button label="Target report" onClick={() => requestReport('target')} />
          <Button label="Search term report" onClick={() => requestReport('searchTerm')} />
        </div>
      </div>

      {requests.length > 0 && (
        <Card variant="default" padding={6} className="reports-queue-card">
          <div className="card-title"><h2>Report queue</h2><span>{requests.length} requests</span></div>
          {requests.slice(0, 10).map((r) => (
            <div key={r.id} className="report-queue-item">
              <span className={`pill ${r.status === 'completed' ? 'green' : 'orange'}`}>
                {r.status === 'completed' ? (
                  <CheckCircle size={12} weight="fill" style={{ marginRight: 'var(--space-1)' }} />
                ) : null}
                {r.status}
              </span>
              <span className="report-queue-type">{r.type} report</span>
              <span className="report-queue-time">{new Date(r.requestedAt).toLocaleTimeString()}</span>
              {r.status === 'completed' && (
                <Button label="View" size="sm" onClick={() => selectReport(r.id)} />
              )}
            </div>
          ))}
        </Card>
      )}

      {selected && (
        <div>
          <div className="card-title">
            <h2>{selected.type} report</h2>
            <Button label="Export CSV" size="sm" onClick={() => handleExportCsv(selected.id, selected.type)} />
          </div>
          {selected.rows.length > 0 ? (
            <Table>
                <thead>
                  <tr>{Object.keys(selected.rows[0]).map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {selected.rows.map((row, i) => {
                    const m = { impressions: Number(row.impressions || 0), clicks: Number(row.clicks || 0), spend: Number(row.spend || 0), sales: Number(row.sales || 0), orders: Number(row.orders || 0) };
                    const x = calc(m);
                    return (
                      <tr key={i}>
                        <td className="mono">{formatWhole(m.impressions)}</td>
                        <td className="mono">{formatWhole(m.clicks)}</td>
                        <td className="money">{formatMoney(m.spend)}</td>
                        <td className="money">{formatMoney(m.sales)}</td>
                        <td className="mono">{formatPercent(x.acos)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
          ) : (
            <Card variant="default" padding={6}>
              <p className="muted">This report type has no data yet.</p>
            </Card>
          )}
        </div>
      )}

      {!requests.length && (
        <div className="empty"><h3>No reports yet</h3><p>Request a report above to get started.</p></div>
      )}
    </div>
  );
}

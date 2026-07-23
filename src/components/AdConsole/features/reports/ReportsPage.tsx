'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent } from '@/engine/ad-console/core/engine';
import { Badge } from '@astryxdesign/core/Badge';

export function ReportsPage() {
  const requests = useAdConsoleStore((s) => s.reportQueue);
  const reports = useAdConsoleStore((s) => s.reports);
  const selectedReportId = useAdConsoleStore((s) => s.selectedReportId);
  const requestReport = useAdConsoleStore((s) => s.requestReport);
  const selectReport = useAdConsoleStore((s) => s.selectReport);
  const exportCsv = useAdConsoleStore((s) => s.exportReportCsv);
  const setView = useAdConsoleStore((s) => s.setView);

  const selected = selectedReportId ? reports.find((r) => r.id === selectedReportId) : null;

  return (
    <div>
      <div className="page-title">
        <button className="btn small" onClick={() => setView('campaigns')} aria-label="Back to campaigns">← Back to campaigns</button>
        <h1 style={{ marginTop: 'var(--space-2)' }}>Reports</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn" onClick={() => requestReport('campaign')}>Campaign report</button>
          <button className="btn" onClick={() => requestReport('target')}>Target report</button>
          <button className="btn" onClick={() => requestReport('searchTerm')}>Search term report</button>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="card pad" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-title"><h2>Report queue</h2><span>{requests.length} requests</span></div>
          {requests.slice(0, 10).map((r) => (
            <div key={r.id} className="report-queue-item">
              <Badge variant={r.status === "completed" ? "success" : "warning"} label={r.status} />
              <span className="report-queue-type">{r.type} report</span>
              <span className="report-queue-time">{new Date(r.requestedAt).toLocaleTimeString()}</span>
              {r.status === 'completed' && (
                <button className="btn small" onClick={() => selectReport(r.id)}>View</button>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="card pad">
          <div className="card-title">
            <h2>{selected.type} report</h2>
            <button className="btn small" onClick={() => {
              const csv = exportCsv(selected.id);
              if (csv) {
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `${selected.type}-report.csv`; a.click();
              }
            }}>Export CSV</button>
          </div>
          {selected.rows.length > 0 && (
            <div className="table-wrap">
              <table>
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
              </table>
            </div>
          )}
        </div>
      )}

      {!requests.length && (
        <div className="empty"><h3>No reports yet</h3><p>Request a report above to get started.</p></div>
      )}
    </div>
  );
}

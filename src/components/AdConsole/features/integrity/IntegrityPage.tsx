'use client';

import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';

export function IntegrityPage() {
  const report = useAdConsoleStore((s) => s.integrityReport);
  const runIntegrity = useAdConsoleStore((s) => s.runIntegrity);
  const campaigns = useAdConsoleStore((s) => s.state.campaigns);
  const clear = useAdConsoleStore((s) => s.clearIntegrity);
  const setView = useAdConsoleStore((s) => s.setView);

  return (
    <div>
      <div className="page-title">
        <Button label="← Back to campaigns" size="sm" onClick={() => setView('campaigns')} tooltip="Back to campaigns" />
        <h1 style={{ marginTop: 'var(--space-2)' }}>Integrity center</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button label="Run integrity check" variant="primary" onClick={() => runIntegrity(campaigns)} />
          {report && <Button label="Clear results" onClick={clear} />}
        </div>
      </div>

      {report ? (
        <>
          <div className="grid-4" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="metric-card">
              <div className="label">Integrity score</div>
              <div className="value" style={{ color: report.score >= 80 ? 'var(--success)' : report.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{report.score}%</div>
              <div className="delta">{report.passed ? '✅ Passed' : '❌ Needs attention'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Errors</div>
              <div className="value" style={{ color: 'var(--danger)' }}>{report.issues.filter((i) => i.severity === 'error').length}</div>
            </div>
            <div className="metric-card">
              <div className="label">Warnings</div>
              <div className="value" style={{ color: 'var(--warning)' }}>{report.issues.filter((i) => i.severity === 'warn').length}</div>
            </div>
            <div className="metric-card">
              <div className="label">Last run</div>
              <div className="value" style={{ fontSize: 'var(--text-base)' }}>{report.lastRun ? new Date(report.lastRun).toLocaleTimeString() : '-'}</div>
            </div>
          </div>

          {report.issues.length === 0 ? (
            <div className="card pad drill-complete-card">
              <h2>✨ No issues found</h2>
              <p className="muted">All campaigns pass integrity checks.</p>
            </div>
          ) : (
            <div className="card pad">
              <div className="card-title"><h2>Issues</h2><span>{report.issues.length} found</span></div>
              {report.issues.map((issue) => (
                <div key={issue.id} className={`integrity-issue ${issue.severity}`}>
                  <strong className="integrity-issue-message">{issue.message}</strong>
                  <span className="integrity-issue-recommendation">💡 {issue.recommendation}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="empty">
          <h3>No integrity data</h3>
          <p>Run an integrity check to scan campaigns for common issues.</p>
        </div>
      )}
    </div>
  );
}

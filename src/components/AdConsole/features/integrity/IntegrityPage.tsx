'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';

export function IntegrityPage() {
  const report = useAdConsoleStore((s) => s.integrityReport);
  const runIntegrity = useAdConsoleStore((s) => s.runIntegrity);
  const campaigns = useAdConsoleStore((s) => s.state.campaigns);
  const clear = useAdConsoleStore((s) => s.clearIntegrity);

  return (
    <div>
      <div className="page-title">
        <h1>Integrity center</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary" onClick={() => runIntegrity(campaigns)}>Run integrity check</button>
          {report && <button className="btn" onClick={clear}>Clear results</button>}
        </div>
      </div>

      {report ? (
        <>
          <div className="grid-4" style={{ marginBottom: 14 }}>
            <div className="metric-card">
              <div className="label">Integrity score</div>
              <div className="value" style={{ color: report.score >= 80 ? 'var(--green)' : report.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>{report.score}%</div>
              <div className="delta">{report.passed ? '✅ Passed' : '❌ Needs attention'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Errors</div>
              <div className="value" style={{ color: 'var(--red)' }}>{report.issues.filter((i) => i.severity === 'error').length}</div>
            </div>
            <div className="metric-card">
              <div className="label">Warnings</div>
              <div className="value" style={{ color: 'var(--amber)' }}>{report.issues.filter((i) => i.severity === 'warn').length}</div>
            </div>
            <div className="metric-card">
              <div className="label">Last run</div>
              <div className="value" style={{ fontSize: 16 }}>{report.lastRun ? new Date(report.lastRun).toLocaleTimeString() : '-'}</div>
            </div>
          </div>

          {report.issues.length === 0 ? (
            <div className="card pad" style={{ textAlign: 'center', padding: 40 }}>
              <h2>✨ No issues found</h2>
              <p className="muted">All campaigns pass integrity checks.</p>
            </div>
          ) : (
            <div className="card pad">
              <div className="card-title"><h2>Issues</h2><span>{report.issues.length} found</span></div>
              {report.issues.map((issue, i) => (
                <div key={issue.id} style={{
                  padding: '10px 12px',
                  marginBottom: 8,
                  borderRadius: 6,
                  fontSize: 13,
                  borderLeft: '3px solid',
                  borderColor: issue.severity === 'error' ? 'var(--red)' : issue.severity === 'warn' ? 'var(--amber)' : 'var(--blue)',
                  background: issue.severity === 'error' ? 'var(--red-bg)' : issue.severity === 'warn' ? 'var(--amber-bg)' : 'var(--blue-bg)',
                }}>
                  <strong style={{ display: 'block', marginBottom: 2 }}>{issue.message}</strong>
                  <span className="muted">💡 {issue.recommendation}</span>
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

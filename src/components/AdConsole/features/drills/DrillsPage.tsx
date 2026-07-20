'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getDrill, getAllDrills, calculateScore } from '@/engine/ad-console/features/drills/engine';

export function DrillsPage() {
  const session = useAdConsoleStore((s) => s.drillSession);
  const results = useAdConsoleStore((s) => s.drillResults);
  const startDrill = useAdConsoleStore((s) => s.startDrill);
  const stopDrill = useAdConsoleStore((s) => s.stopDrill);
  const skipDrillStep = useAdConsoleStore((s) => s.skipDrillStep);
  const evaluateAction = useAdConsoleStore((s) => s.evaluateDrillAction);
  const setView = useAdConsoleStore((s) => s.setView);

  const drills = getAllDrills();
  const activeDrill = session.drillId ? getDrill(session.drillId) : null;

  if (activeDrill && session.startedAt) {
    const step = activeDrill.steps[session.currentStep];
    const score = session.completed ? calculateScore(session, activeDrill.steps.length) : null;

    return (
      <div>
        <div className="page-title">
          <h1>{activeDrill.title}</h1>
          <button className="btn" onClick={() => stopDrill()}>Stop drill</button>
        </div>
        {session.completed ? (
          <div className="card pad drill-complete-card">
            <h2>🎉 Drill complete!</h2>
            <p className="drill-complete-score">Score: {score}%</p>
            <p className="muted">Mistakes: {session.mistakes} · Skips: {session.skips}</p>
            <button className="btn primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setView('drills')}>
              Back to drills
            </button>
          </div>
        ) : (
          <div className="split">
            <div className="card pad">
              <h3>Step {session.currentStep + 1} of {activeDrill.steps.length}</h3>
              <p className="drill-step-instruction">{step?.instruction}</p>
              {step?.hint && <div className="coach-tip">{step.hint}</div>}
              <div className="drill-step-actions">
                <button className="btn" onClick={skipDrillStep}>Skip step</button>
                <button className="btn danger" onClick={() => stopDrill()}>Stop drill</button>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <p className="muted drill-progress-label">Progress:</p>
                <div className="drill-progress-bar">
                  <div className="drill-progress-fill" style={{ width: `${((session.currentStep) / activeDrill.steps.length) * 100}%` }} />
                </div>
              </div>
            </div>
            <div>
              <div className="card pad" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-title"><h3>Score</h3></div>
                <p className="drill-score-value">{calculateScore(session, activeDrill.steps.length)}%</p>
                <p className="muted">Mistakes: {session.mistakes} · Skips: {session.skips}</p>
              </div>
              <div className="card pad">
                <div className="card-title"><h3>Navigation</h3></div>
                {activeDrill.steps.map((s, i) => (
                  <div key={i} className="drill-nav-item">
                    <span className={`drill-nav-step ${i < session.currentStep ? 'completed' : i === session.currentStep ? 'current' : 'pending'}`}>
                      {i < session.currentStep ? '✓' : i + 1}
                    </span>
                    <span className={`drill-nav-label ${i === session.currentStep ? 'current' : 'pending'}`}>{s.instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Guided navigation drills</h1>
          <p className="drill-card-desc" style={{ maxWidth: 500, marginTop: 'var(--space-1)' }}>
            Click-by-click navigation training with target highlighting, wrong-click scoring, and trainer results.
          </p>
        </div>
      </div>

      <div className="drill-grid">
        {drills.map((drill) => (
          <div key={drill.id} className="card pad">
            <div className="drill-card-tags">
              <span className={`pill ${drill.adType === 'SP' ? 'active' : drill.adType === 'SB' ? 'orange' : 'purple'}`}>{drill.adType}</span>
              <span className={`pill ${drill.difficulty === 'beginner' ? 'green' : 'orange'}`}>{drill.difficulty}</span>
              <span className="pill">{drill.estimatedMinutes} min</span>
            </div>
            <h3 className="drill-card-title">{drill.title}</h3>
            <p className="drill-card-desc">{drill.description}</p>
            <p className="drill-card-steps">{drill.steps.length} steps</p>
            <button className="btn primary" onClick={() => startDrill(drill.id)}>Start drill</button>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="card pad" style={{ marginTop: 'var(--space-5)' }}>
          <div className="card-title"><h2>Past drill results</h2><span>{results.length} completed</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Drill</th><th>Score</th><th>Mistakes</th><th>Skips</th><th>Date</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{getDrill(r.drillId)?.title || r.drillId}</strong></td>
                    <td className={`mono ${r.score >= 80 ? 'good' : r.score >= 50 ? 'warn' : 'bad'}`}>{r.score}%</td>
                    <td className="mono">{r.mistakes}</td>
                    <td className="mono">{r.skips}</td>
                    <td className="muted">{new Date(r.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

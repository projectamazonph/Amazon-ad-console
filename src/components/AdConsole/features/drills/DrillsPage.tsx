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
          <div className="card pad" style={{ textAlign: 'center', padding: 40 }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>🎉 Drill complete!</h2>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Score: {score}%</p>
            <p className="muted">Mistakes: {session.mistakes} · Skips: {session.skips}</p>
            <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setView('drills')}>
              Back to drills
            </button>
          </div>
        ) : (
          <div className="split">
            <div className="card pad">
              <h3>Step {session.currentStep + 1} of {activeDrill.steps.length}</h3>
              <p style={{ fontSize: 16, marginTop: 8, marginBottom: 16 }}>{step?.instruction}</p>
              {step?.hint && <div className="coach-tip">{step.hint}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn" onClick={skipDrillStep}>Skip step</button>
                <button className="btn danger" onClick={() => stopDrill()}>Stop drill</button>
              </div>
              <div style={{ marginTop: 16 }}>
                <p className="muted" style={{ marginBottom: 4 }}>Progress:</p>
                <div style={{ background: 'var(--line)', borderRadius: 4, height: 8, width: '100%' }}>
                  <div style={{ background: 'var(--blue)', borderRadius: 4, height: 8, width: `${((session.currentStep) / activeDrill.steps.length) * 100}%` }} />
                </div>
              </div>
            </div>
            <div>
              <div className="card pad" style={{ marginBottom: 14 }}>
                <div className="card-title"><h3>Score</h3></div>
                <p style={{ fontSize: 32, fontWeight: 700 }}>{calculateScore(session, activeDrill.steps.length)}%</p>
                <p className="muted">Mistakes: {session.mistakes} · Skips: {session.skips}</p>
              </div>
              <div className="card pad">
                <div className="card-title"><h3>Navigation</h3></div>
                {activeDrill.steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', alignItems: 'center' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: i < session.currentStep ? 'var(--green)' : i === session.currentStep ? 'var(--blue)' : 'var(--line)', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i < session.currentStep ? '✓' : i + 1}
                    </span>
                    <span style={{ fontSize: 12, color: i === session.currentStep ? 'var(--ink)' : 'var(--ink-500)' }}>{s.instruction}</span>
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
        <h1>Guided navigation drills</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-500)', maxWidth: 500, marginTop: 4 }}>
          Click-by-click navigation training with target highlighting, wrong-click scoring, and trainer results.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {drills.map((drill) => (
          <div key={drill.id} className="card pad">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span className={`pill ${drill.adType === 'SP' ? 'active' : drill.adType === 'SB' ? 'orange' : 'purple'}`}>{drill.adType}</span>
              <span className={`pill ${drill.difficulty === 'beginner' ? 'green' : 'orange'}`}>{drill.difficulty}</span>
              <span className="pill">{drill.estimatedMinutes} min</span>
            </div>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>{drill.title}</h3>
            <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{drill.description}</p>
            <p className="muted" style={{ fontSize: 11, marginBottom: 12 }}>{drill.steps.length} steps</p>
            <button className="btn primary" onClick={() => startDrill(drill.id)}>Start drill</button>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="card pad" style={{ marginTop: 20 }}>
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

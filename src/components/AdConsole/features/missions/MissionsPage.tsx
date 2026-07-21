'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { getMission } from '@/engine/ad-console/features/missions/engine';

export function MissionsPage() {
  const missions = useAdConsoleStore((s) => s.missions);
  const session = useAdConsoleStore((s) => s.missionSession);
  const startMission = useAdConsoleStore((s) => s.startMission);
  const stopMission = useAdConsoleStore((s) => s.stopMission);
  const completeStep = useAdConsoleStore((s) => s.completeMissionStep);
  const useHint = useAdConsoleStore((s) => s.useHint);
  const setView = useAdConsoleStore((s) => s.setView);

  const activeMission = session.missionId ? getMission(session.missionId) : null;

  if (activeMission && session.startedAt) {
    const step = activeMission.steps[session.currentStep];
    return (
      <div>
        <div className="page-title">
          <h1>{activeMission.title}</h1>
          <button className="btn" onClick={() => stopMission()}>Stop mission</button>
        </div>
        {session.completed ? (
          <div className="card pad mission-complete-card">
            <h2>🏆 Mission complete!</h2>
            <p className="mission-complete-score">Score: {session.score}/100</p>
            <p className="muted">Hints used: {session.hintsUsed}</p>
            <button className="btn primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => stopMission()}>Back to missions</button>
          </div>
        ) : (
          <div className="card pad">
            <h3>Step {session.currentStep + 1} of {activeMission.steps.length}</h3>
            <p className="mission-step-instruction">{step?.instruction}</p>
            <div className="coach-tip mission-hint">💡 {step?.hint}</div>
            <div className="mission-step-actions">
              <button className="btn primary" onClick={completeStep}>✓ Complete step</button>
              <button className="btn" onClick={useHint}>💡 Use hint (-10 pts)</button>
            </div>
            <p className="mission-score-label">Score: {session.score}/100 · Hints: {session.hintsUsed}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <button className="btn small" onClick={() => setView('campaigns')} aria-label="Back to campaigns">← Back to campaigns</button>
        <h1 style={{ marginTop: 'var(--space-2)' }}>Training missions</h1>
      </div>
      <div className="drill-grid">
        {missions.map((m) => (
          <div key={m.id} className="card pad">
            <div className="mission-card-tags">
              <span className={`pill ${m.adType === 'SP' ? 'active' : m.adType === 'SB' ? 'orange' : 'purple'}`}>{m.adType}</span>
              <span className={`pill ${m.difficulty === 'beginner' ? 'green' : 'orange'}`}>{m.difficulty}</span>
            </div>
            <h3 className="mission-card-title">{m.title}</h3>
            <p className="mission-card-desc">{m.description}</p>
            <p className="mission-card-steps">{m.steps.length} steps</p>
            <button className="btn primary" style={{ marginTop: 'var(--space-2)' }} onClick={() => startMission(m.id)}>Start mission</button>
          </div>
        ))}
      </div>
    </div>
  );
}

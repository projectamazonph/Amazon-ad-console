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
          <div className="card pad" style={{ textAlign: 'center', padding: 40 }}>
            <h2>🏆 Mission complete!</h2>
            <p style={{ fontSize: 24, fontWeight: 700, margin: '12px 0' }}>Score: {session.score}/100</p>
            <p className="muted">Hints used: {session.hintsUsed}</p>
            <button className="btn primary" style={{ marginTop: 16 }} onClick={() => stopMission()}>Back to missions</button>
          </div>
        ) : (
          <div className="card pad">
            <h3>Step {session.currentStep + 1} of {activeMission.steps.length}</h3>
            <p style={{ fontSize: 16, margin: '12px 0' }}>{step?.instruction}</p>
            <div className="coach-tip" style={{ marginBottom: 16 }}>💡 {step?.hint}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" onClick={completeStep}>✓ Complete step</button>
              <button className="btn" onClick={useHint}>💡 Use hint (-10 pts)</button>
            </div>
            <div style={{ marginTop: 16 }}>
              <p className="muted">Score: {session.score}/100 · Hints: {session.hintsUsed}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-title"><h1>Training missions</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {missions.map((m) => (
          <div key={m.id} className="card pad">
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <span className={`pill ${m.adType === 'SP' ? 'active' : m.adType === 'SB' ? 'orange' : 'purple'}`}>{m.adType}</span>
              <span className={`pill ${m.difficulty === 'beginner' ? 'green' : 'orange'}`}>{m.difficulty}</span>
            </div>
            <h3>{m.title}</h3>
            <p className="muted" style={{ fontSize: 12, margin: '4px 0 8px' }}>{m.description}</p>
            <p className="muted" style={{ fontSize: 11 }}>{m.steps.length} steps</p>
            <button className="btn primary" style={{ marginTop: 8 }} onClick={() => startMission(m.id)}>Start mission</button>
          </div>
        ))}
      </div>
    </div>
  );
}

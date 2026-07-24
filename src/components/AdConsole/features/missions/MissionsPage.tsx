'use client';

import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
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
          <Button label="Stop mission" onClick={() => stopMission()} />
        </div>
        {session.completed ? (
          <Card variant="default" padding={6} className="mission-complete-card">
            <h2>Mission complete!</h2>
            <p className="mission-complete-score">Score: {session.score}/100</p>
            <p className="muted">Hints used: {session.hintsUsed}</p>
            <Button label="Back to missions" variant="primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => stopMission()} />
          </Card>
        ) : (
          <Card variant="default" padding={6}>
            <h3>Step {session.currentStep + 1} of {activeMission.steps.length}</h3>
            <p className="mission-step-instruction">{step?.instruction}</p>
            <div className="coach-tip mission-hint">{step?.hint}</div>
            <div className="mission-step-actions">
              <Button label="✓ Complete step" variant="primary" onClick={completeStep} />
              <Button label="Use hint (-10 pts)" onClick={useHint} />
            </div>
            <p className="mission-score-label">Score: {session.score}/100 · Hints: {session.hintsUsed}</p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Training missions</h1>
          <p>Real-world scenario training with guided step completion.</p>
        </div>
        <Button label="← Back to campaigns" size="sm" onClick={() => setView('campaigns')} tooltip="Back to campaigns" />
      </div>
      <div className="drill-grid">
        {missions.map((m) => (
          <Card key={m.id} variant="default" padding={6}>
            <div className="mission-card-tags">
              <span className={`pill ${m.adType === 'SP' ? 'active' : m.adType === 'SB' ? 'orange' : 'purple'}`}>{m.adType}</span>
              <span className={`pill ${m.difficulty === 'beginner' ? 'green' : 'orange'}`}>{m.difficulty}</span>
            </div>
            <h3 className="mission-card-title">{m.title}</h3>
            <p className="mission-card-desc">{m.description}</p>
            <p className="mission-card-steps">{m.steps.length} steps</p>
            <Button label="Start mission" variant="primary" style={{ marginTop: 'var(--space-2)' }} onClick={() => startMission(m.id)} />
          </Card>
        ))}
      </div>
    </div>
  );
}

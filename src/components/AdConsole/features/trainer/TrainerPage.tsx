'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';

export function TrainerPage() {
  const notes = useAdConsoleStore((s) => s.notes);
  const actionLog = useAdConsoleStore((s) => s.actionLog);
  const certChecklist = useAdConsoleStore((s) => s.certificationChecklist);
  const addNote = useAdConsoleStore((s) => s.addNote);
  const deleteNote = useAdConsoleStore((s) => s.deleteNote);
  const toggleCertItem = useAdConsoleStore((s) => s.toggleCertItem);
  const certScore = useAdConsoleStore((s) => s.certScore);
  const drillResults = useAdConsoleStore((s) => s.drillResults);
  const setView = useAdConsoleStore((s) => s.setView);

  const [noteText, setNoteText] = useState('');

  const score = certScore();

  return (
    <div>
      <div className="page-title">
        <Button label="← Back to campaigns" size="sm" onClick={() => setView('campaigns')} tooltip="Back to campaigns" />
        <h1 style={{ marginTop: 'var(--space-2)' }}>Trainer dashboard</h1>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="metric-card">
          <div className="label">Certification score</div>
          <div className="value" style={{ color: score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{score}%</div>
          <div className="delta">{certChecklist.filter((c) => c.checked).length}/{certChecklist.length} items</div>
        </div>
        <div className="metric-card">
          <div className="label">Action log</div>
          <div className="value">{actionLog.length}</div>
          <div className="delta">Recorded actions</div>
        </div>
        <div className="metric-card">
          <div className="label">Trainer notes</div>
          <div className="value">{notes.length}</div>
          <div className="delta">Saved notes</div>
        </div>
        <div className="metric-card">
          <div className="label">Drills completed</div>
          <div className="value">{drillResults.length}</div>
          <div className="delta">Guided navigation</div>
        </div>
      </div>

      <div className="split">
        <div>
          <div className="card pad" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-title"><h2>Certification checklist</h2><span>{score}%</span></div>
            {certChecklist.map((item) => (
              <label key={item.id} className="trainer-cert-item">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCertItem(item.id)}
                  aria-label={item.label}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div className="card pad">
            <div className="card-title"><h2>Action log</h2><span>{actionLog.length} entries</span></div>
            {actionLog.length === 0 ? (
              <p className="muted">No actions recorded yet.</p>
            ) : (
              <div className="trainer-log-scroll">
                {actionLog.slice(0, 50).map((a, i) => (
                  <div key={i} className="trainer-log-item">
                    <span className={`pill ${a.tone === 'good' ? 'green' : a.tone === 'bad' ? 'bad' : 'orange'}`} style={{ fontSize: 10 }}>{a.tone}</span>
                    <span style={{ flex: 1 }}>{a.message}</span>
                    <span className="muted" style={{ fontSize: 10 }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card pad" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-title"><h2>Trainer notes</h2></div>
            <div className="trainer-note-input-row">
              <label htmlFor="tp-note" className="visually-hidden">Trainer note</label>
              <input id="tp-note" className="input trainer-note-input" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add note..." />
              <Button label="Add" variant="primary" onClick={() => { if (noteText.trim()) { addNote(noteText.trim()); setNoteText(''); } }} />
            </div>
            {notes.length === 0 ? (
              <p className="muted">No notes yet.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="trainer-note-item">
                  <span className="trainer-note-text">{n.text}</span>
                  <span className="trainer-note-date">{new Date(n.timestamp).toLocaleDateString()}</span>
                  <Button label="×" variant="destructive" size="sm" isIconOnly onClick={() => deleteNote(n.id)} />
                </div>
              ))
            )}
          </div>

          {drillResults.length > 0 && (
            <div className="card pad">
              <div className="card-title"><h2>Drill results</h2></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Score</th><th>Mistakes</th><th>Skips</th></tr></thead>
                  <tbody>
                    {drillResults.map((r, i) => (
                      <tr key={i}>
                        <td className={`mono ${r.score >= 80 ? 'good' : 'bad'}`}>{r.score}%</td>
                        <td className="mono">{r.mistakes}</td>
                        <td className="mono">{r.skips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

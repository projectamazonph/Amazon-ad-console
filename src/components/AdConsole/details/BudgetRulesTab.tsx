'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { EmptyState } from './EmptyState';

interface Props { campaign: Campaign }

export function BudgetRulesTab({ campaign }: Props) {
  const addBudgetRule = useAdConsoleStore((s) => s.addBudgetRule);
  const removeBudgetRule = useAdConsoleStore((s) => s.removeBudgetRule);
  const updateBudgetRule = useAdConsoleStore((s) => s.updateBudgetRule);
  const c = campaign;

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Schedule' | 'Performance'>('Schedule');
  const [newIncrease, setNewIncrease] = useState('1.5');
  const [newCondition, setNewCondition] = useState('');
  const [nameEdits, setNameEdits] = useState<Record<string, string>>({});
  const [increaseEdits, setIncreaseEdits] = useState<Record<string, string>>({});
  const [conditionEdits, setConditionEdits] = useState<Record<string, string>>({});

  return (
    <div>
      <div className="card pad" style={{ marginBottom: 14 }}>
        <div className="section-head"><h2>Add budget rule</h2><span className="meta">Schedule or performance-based</span></div>
        <div className="form-grid">
          <div className="field">
            <label>Rule name</label>
            <input className="input full" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Weekend boost" />
          </div>
          <div className="field">
            <label>Type</label>
            <select className="select full" value={newType} onChange={(e) => setNewType(e.target.value as 'Schedule' | 'Performance')}>
              <option>Schedule</option><option>Performance</option>
            </select>
          </div>
          <div className="field">
            <label>Budget increase (x)</label>
            <input className="input full" type="number" min="0.01" step="0.1" value={newIncrease} onChange={(e) => setNewIncrease(e.target.value)} />
          </div>
          <div className="field">
            <label>Condition</label>
            <input className="input full" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} placeholder={newType === 'Schedule' ? 'Saturday through Sunday' : 'ACoS below 25%'} />
          </div>
        </div>
        <button className="btn primary" style={{ marginTop: 10 }} onClick={() => {
          if (newName.trim() && newCondition.trim() && Number(newIncrease) > 0) {
            addBudgetRule(c.id, newName.trim(), newType, Number(newIncrease), newCondition.trim());
            setNewName(''); setNewCondition(''); setNewIncrease('1.5');
          }
        }}>Add rule</button>
      </div>
      {c.budgetRules.length === 0 ? (
        <EmptyState icon="rule" title="No budget rules" message="Schedule-based or performance-based rules let you automate budget adjustments. Create one using the form above." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Increase</th><th>Condition</th><th>Actions</th></tr></thead>
            <tbody>
              {c.budgetRules.map((r) => (
                <tr key={r.id}>
                  <td>
                    <input className="input" style={{ width: 160, fontWeight: 600 }}
                      value={nameEdits[r.id] ?? r.name}
                      onChange={(e) => setNameEdits((p) => ({ ...p, [r.id]: e.target.value }))}
                      onBlur={(e) => { if (e.target.value.trim() && e.target.value !== r.name) updateBudgetRule(c.id, r.id, { name: e.target.value.trim() }); }} />
                  </td>
                  <td>
                    <select className="select" value={r.type as 'Schedule' | 'Performance'}
                      onChange={(e) => updateBudgetRule(c.id, r.id, { type: e.target.value as 'Schedule' | 'Performance' })}>
                      <option>Schedule</option><option>Performance</option>
                    </select>
                  </td>
                  <td>
                    <input className="input" style={{ width: 70 }} type="number" min="0.01" step="0.1"
                      value={increaseEdits[r.id] ?? String(r.increase)}
                      onChange={(e) => setIncreaseEdits((p) => ({ ...p, [r.id]: e.target.value }))}
                      onBlur={(e) => { const v = Number(e.target.value); if (v > 0 && v !== r.increase) updateBudgetRule(c.id, r.id, { increase: v }); }} />
                  </td>
                  <td>
                    <input className="input" style={{ width: 180 }}
                      value={conditionEdits[r.id] ?? r.condition}
                      onChange={(e) => setConditionEdits((p) => ({ ...p, [r.id]: e.target.value }))}
                      onBlur={(e) => { if (e.target.value.trim() && e.target.value !== r.condition) updateBudgetRule(c.id, r.id, { condition: e.target.value.trim() }); }} />
                  </td>
                  <td>
                    <button className="btn small danger" onClick={() => {
                      if (confirm(`Remove budget rule "${r.name}"?`)) removeBudgetRule(c.id, r.id);
                    }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

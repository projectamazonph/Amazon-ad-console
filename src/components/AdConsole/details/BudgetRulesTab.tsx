'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Table } from '@astryxdesign/core/Table';
import { Card } from '@astryxdesign/core/Card';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Selector } from '@astryxdesign/core/Selector';
import { TextInput } from '@astryxdesign/core/TextInput';
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
  const [newIncrease, setNewIncrease] = useState(1.5);
  const [newCondition, setNewCondition] = useState('');
  const [nameEdits, setNameEdits] = useState<Record<string, string>>({});
  const [increaseEdits, setIncreaseEdits] = useState<Record<string, number>>({});
  const [conditionEdits, setConditionEdits] = useState<Record<string, string>>({});

  return (
    <div>
      <Card variant="default" padding={6} style={{ marginBottom: 14 }}>
        <div className="section-head"><h2>Add budget rule</h2><span className="meta">Schedule or performance-based</span></div>
        <div className="form-grid">
          <TextInput
            id="br-name"
            label="Rule name"
            value={newName}
            onChange={(v) => setNewName(v)}
            placeholder="e.g. Weekend boost"
          />
          <Selector
            id="br-type"
            label="Type"
            value={newType}
            onChange={(v) => setNewType(v as 'Schedule' | 'Performance')}
            options={['Schedule', 'Performance'].map((x) => ({ value: x, label: x }))}
          />
          <NumberInput
            id="br-increase"
            label="Budget increase (x)"
            min={0.01}
            step={0.1}
            value={newIncrease}
            onChange={(v) => setNewIncrease(Number(v))}
          />
          <TextInput
            id="br-condition"
            label="Condition"
            value={newCondition}
            onChange={(v) => setNewCondition(v)}
            placeholder={newType === 'Schedule' ? 'Saturday through Sunday' : 'ACoS below 25%'}
          />
        </div>
        <Button label="Add rule" variant="primary" style={{ marginTop: 10 }} onClick={() => {
          if (newName.trim() && newCondition.trim() && newIncrease > 0) {
            addBudgetRule(c.id, newName.trim(), newType, newIncrease, newCondition.trim());
            setNewName(''); setNewCondition(''); setNewIncrease(1.5);
          }
        }} />
      </Card>
      {c.budgetRules.length === 0 ? (
        <EmptyState icon="rule" title="No budget rules" message="Schedule-based or performance-based rules let you automate budget adjustments. Create one using the form above." />
      ) : (
        <Table>
            <thead><tr><th>Name</th><th>Type</th><th>Increase</th><th>Condition</th><th>Actions</th></tr></thead>
            <tbody>
              {c.budgetRules.map((r) => (
                <tr key={r.id}>
                  <td>
                    <TextInput
                      id={`br-row-name-${r.id}`}
                      label="Rule name"
                      isLabelHidden
                      value={nameEdits[r.id] ?? r.name}
                      onChange={(v) => setNameEdits((p) => ({ ...p, [r.id]: v }))}
                      onBlur={() => { const v = nameEdits[r.id] ?? r.name; if (v.trim() && v !== r.name) updateBudgetRule(c.id, r.id, { name: v.trim() }); }}
                      style={{ width: 160, fontWeight: 600 }}
                    />
                  </td>
                  <td>
                    <Selector
                      id={`br-row-type-${r.id}`}
                      label="Rule type"
                      isLabelHidden
                      value={r.type as 'Schedule' | 'Performance'}
                      onChange={(v) => updateBudgetRule(c.id, r.id, { type: v as 'Schedule' | 'Performance' })}
                      options={['Schedule', 'Performance'].map((x) => ({ value: x, label: x }))}
                    />
                  </td>
                  <td>
                    <NumberInput
                      id={`br-row-increase-${r.id}`}
                      label="Budget increase"
                      isLabelHidden
                      min={0.01}
                      step={0.1}
                      value={increaseEdits[r.id] ?? r.increase}
                      onChange={(v) => setIncreaseEdits((p) => ({ ...p, [r.id]: v }))}
                      onBlur={() => { const v = increaseEdits[r.id] ?? r.increase; if (v > 0 && v !== r.increase) updateBudgetRule(c.id, r.id, { increase: v }); }}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td>
                    <TextInput
                      id={`br-row-condition-${r.id}`}
                      label="Condition"
                      isLabelHidden
                      value={conditionEdits[r.id] ?? r.condition}
                      onChange={(v) => setConditionEdits((p) => ({ ...p, [r.id]: v }))}
                      onBlur={() => { const v = conditionEdits[r.id] ?? r.condition; if (v.trim() && v !== r.condition) updateBudgetRule(c.id, r.id, { condition: v.trim() }); }}
                      style={{ width: 180 }}
                    />
                  </td>
                  <td>
                    <Button label="Remove" variant="destructive" size="sm" onClick={() => {
                      if (confirm(`Remove budget rule "${r.name}"?`)) removeBudgetRule(c.id, r.id);
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
      )}
    </div>
  );
}

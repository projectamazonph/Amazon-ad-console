'use client';

import { useState } from 'react';
import type { Campaign } from '@/engine/ad-console/types';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { EmptyState } from './EmptyState';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Props {
  campaign: Campaign;
}

const RULE_TYPES = [
  { value: 'Schedule', label: 'Schedule' },
  { value: 'Performance', label: 'Performance' },
];

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
      <Card padding={5} style={{ marginBottom: 14 }}>
        <Stack gap={4}>
          <div className="section-head">
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip>
              Add budget rule
            </Text>
            <Text type="supporting" size="sm" maxLines={1}>
              Schedule or performance-based
            </Text>
          </div>
          <HStack gap={3} wrap>
            <div style={{ flex: 1, minWidth: 200 }}>
              <TextInput
                label="Rule name"
                value={newName}
                onChange={(v) => setNewName(v)}
                description="e.g. Weekend boost"
                width="100%"
              />
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label htmlFor="br-type">Type</label>
              <select
                id="br-type"
                className="select full"
                value={newType}
                onChange={(e) =>
                  setNewType(e.target.value as 'Schedule' | 'Performance')
                }
              >
                {RULE_TYPES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 120 }}>
              <label htmlFor="br-increase">Budget increase (x)</label>
              <input
                id="br-increase"
                className="input full"
                type="number"
                min={0.01}
                step={0.1}
                value={newIncrease}
                onChange={(e) => setNewIncrease(e.target.value)}
              />
            </div>
            <div style={{ flex: 2, minWidth: 200 }}>
              <TextInput
                label="Condition"
                value={newCondition}
                onChange={(v) => setNewCondition(v)}
                description={
                  newType === 'Schedule' ? 'Saturday through Sunday' : 'ACoS below 25%'
                }
                width="100%"
              />
            </div>
          </HStack>
          <div>
            <Button
              variant="primary"
              size="sm"
              label="Add rule"
              onClick={() => {
                if (
                  newName.trim() &&
                  newCondition.trim() &&
                  Number(newIncrease) > 0
                ) {
                  addBudgetRule(
                    c.id,
                    newName.trim(),
                    newType,
                    Number(newIncrease),
                    newCondition.trim(),
                  );
                  setNewName('');
                  setNewCondition('');
                  setNewIncrease('1.5');
                }
              }}
            />
          </div>
        </Stack>
      </Card>

      {c.budgetRules.length === 0 ? (
        <EmptyState
          icon="rule"
          title="No budget rules"
          message="Schedule-based or performance-based rules let you automate budget adjustments. Create one using the form above."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Increase</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.budgetRules.map((r) => (
                <tr key={r.id}>
                  <td>
                    <label htmlFor={`br-row-name-${r.id}`} className="visually-hidden">
                      Rule name
                    </label>
                    <input
                      id={`br-row-name-${r.id}`}
                      className="input"
                      type="text"
                      value={nameEdits[r.id] ?? r.name}
                      onChange={(e) =>
                        setNameEdits((p) => ({ ...p, [r.id]: e.target.value }))
                      }
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== r.name) {
                          updateBudgetRule(c.id, r.id, {
                            name: e.target.value.trim(),
                          });
                        }
                      }}
                      style={{ width: 160, fontWeight: 600 }}
                    />
                  </td>
                  <td>
                    <label htmlFor={`br-row-type-${r.id}`} className="visually-hidden">
                      Rule type
                    </label>
                    <select
                      id={`br-row-type-${r.id}`}
                      className="select"
                      value={r.type as 'Schedule' | 'Performance'}
                      onChange={(e) =>
                        updateBudgetRule(c.id, r.id, {
                          type: e.target.value as 'Schedule' | 'Performance',
                        })
                      }
                    >
                      {RULE_TYPES.map((x) => (
                        <option key={x.value} value={x.value}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label htmlFor={`br-row-increase-${r.id}`} className="visually-hidden">
                      Budget increase
                    </label>
                    <input
                      id={`br-row-increase-${r.id}`}
                      className="input"
                      type="number"
                      min={0.01}
                      step={0.1}
                      value={increaseEdits[r.id] ?? String(r.increase)}
                      onChange={(e) =>
                        setIncreaseEdits((p) => ({ ...p, [r.id]: e.target.value }))
                      }
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v > 0 && v !== r.increase) {
                          updateBudgetRule(c.id, r.id, { increase: v });
                        }
                      }}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td>
                    <label
                      htmlFor={`br-row-condition-${r.id}`}
                      className="visually-hidden"
                    >
                      Condition
                    </label>
                    <input
                      id={`br-row-condition-${r.id}`}
                      className="input"
                      type="text"
                      value={conditionEdits[r.id] ?? r.condition}
                      onChange={(e) =>
                        setConditionEdits((p) => ({
                          ...p,
                          [r.id]: e.target.value,
                        }))
                      }
                      onBlur={(e) => {
                        if (
                          e.target.value.trim() &&
                          e.target.value !== r.condition
                        ) {
                          updateBudgetRule(c.id, r.id, {
                            condition: e.target.value.trim(),
                          });
                        }
                      }}
                      style={{ width: 180 }}
                    />
                  </td>
                  <td>
                    <Button
                      variant="destructive"
                      size="sm"
                      label="Remove"
                      onClick={() => {
                        if (confirm(`Remove budget rule "${r.name}"?`)) {
                          removeBudgetRule(c.id, r.id);
                        }
                      }}
                    />
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

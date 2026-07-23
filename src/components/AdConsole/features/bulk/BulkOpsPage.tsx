'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { applyBulkRows } from '@/engine/ad-console/features/bulk/engine';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextArea } from '@astryxdesign/core/TextArea';

export function BulkOpsPage() {
  const input = useAdConsoleStore((s) => s.bulkInput);
  const preview = useAdConsoleStore((s) => s.bulkPreview);
  const errors = useAdConsoleStore((s) => s.bulkErrors);
  const valid = useAdConsoleStore((s) => s.bulkValid);
  const bulkApplied = useAdConsoleStore((s) => s.bulkApplied);
  const bulkSkipped = useAdConsoleStore((s) => s.bulkSkipped);
  const bulkExecutionErrors = useAdConsoleStore((s) => s.bulkExecutionErrors);
  const setInput = useAdConsoleStore((s) => s.setBulkInput);
  const parseAndValidate = useAdConsoleStore((s) => s.parseAndValidate);
  const clear = useAdConsoleStore((s) => s.clearBulk);
  const getTemplate = useAdConsoleStore((s) => s.getTemplate);
  const setView = useAdConsoleStore((s) => s.setView);

  const handleExecute = () => {
    const campaigns = useAdConsoleStore.getState().state.campaigns;
    const result = applyBulkRows(campaigns, preview);
    useAdConsoleStore.setState((s) => ({
      state: { ...s.state, campaigns: result.campaigns },
      bulkApplied: result.applied,
      bulkSkipped: result.skipped,
      bulkExecutionErrors: result.errors,
    }));
  };

  return (
    <div>
      <div className="page-title">
        <Button
          variant="secondary"
          size="sm"
          label="← Back to campaigns"
          onClick={() => setView('campaigns')}
        />
        <Text
          type="display-3"
          size="lg"
          weight="semibold"
          maxLines={1}
          hasTruncateTooltip
          as="h1"
          style={{ marginTop: 'var(--space-2)' }}
        >
          Bulk operations
        </Text>
        <Button
          variant="secondary"
          label="Load template"
          onClick={() => {
            const template = getTemplate();
            setInput(template);
          }}
        />
      </div>

      <div className="split">
        <div>
          <Card padding={5} variant="default" style={{ marginBottom: 'var(--space-4)' }}>
            <Stack gap={3}>
              <HStack justify="between" vAlign="baseline">
                <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h2">
                  CSV input
                </Text>
                <Text type="supporting" size="sm" maxLines={1}>
                  entity,operation,...
                </Text>
              </HStack>
              <TextArea
                label="Paste CSV"
                value={input}
                onChange={(v) => setInput(v)}
                description="entity,operation,id,name,field,value"
                rows={12}
                width="100%"
              />
              <HStack gap={2}>
                <Button
                  variant="primary"
                  label="Preview & validate"
                  onClick={parseAndValidate}
                />
                <Button variant="secondary" label="Clear" onClick={clear} />
              </HStack>
            </Stack>
          </Card>
        </div>

        <div>
          {bulkExecutionErrors.length > 0 && (
            <Card padding={5} variant="default" style={{ marginBottom: 'var(--space-4)' }}>
              <Stack gap={2}>
                <Text
                  type="large"
                  weight="semibold"
                  maxLines={1}
                  hasTruncateTooltip
                  as="h2"
                  style={{ color: 'var(--danger)' }}
                >
                  Execution errors
                </Text>
                {bulkExecutionErrors.map((e, i) => (
                  <Text key={i} type="body" maxLines={2} hasTruncateTooltip style={{ color: 'var(--danger)' }}>
                    Row {e.row}: {e.message}
                  </Text>
                ))}
              </Stack>
            </Card>
          )}

          {(bulkApplied > 0 || bulkSkipped > 0) && (
            <Card padding={5} variant="default" style={{ marginBottom: 'var(--space-4)' }}>
              <Stack gap={2}>
                <Text
                  type="large"
                  weight="semibold"
                  maxLines={1}
                  hasTruncateTooltip
                  as="h2"
                  style={{ color: 'var(--success)' }}
                >
                  Execution complete
                </Text>
                <Text type="body" style={{ color: 'var(--success)' }}>
                  Applied: {bulkApplied} · Skipped: {bulkSkipped}
                </Text>
              </Stack>
            </Card>
          )}

          {errors.length > 0 && (
            <Card padding={5} variant="default" style={{ marginBottom: 'var(--space-4)' }}>
              <Stack gap={2}>
                <Text
                  type="large"
                  weight="semibold"
                  maxLines={1}
                  hasTruncateTooltip
                  as="h2"
                  style={{ color: 'var(--danger)' }}
                >
                  Validation errors
                </Text>
                {errors.map((e, i) => (
                  <Text key={i} type="body" maxLines={2} hasTruncateTooltip style={{ color: 'var(--danger)' }}>
                    Row {e.row}: {e.message}
                  </Text>
                ))}
              </Stack>
            </Card>
          )}

          {preview.length > 0 && (
            <Card padding={5} variant="default">
              <Stack gap={3}>
                <HStack justify="between" vAlign="baseline">
                  <Text
                    type="large"
                    weight="semibold"
                    maxLines={1}
                    hasTruncateTooltip
                    as="h2"
                  >
                    Preview
                  </Text>
                  <Text type="supporting" size="sm" maxLines={1}>
                    {preview.length} rows · {valid ? '✅ Valid' : '❌ Has errors'}
                  </Text>
                </HStack>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(preview[0]).map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="bulk-preview-text">
                              <Text type="body" maxLines={1} hasTruncateTooltip>
                                {String(v)}
                              </Text>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {valid && (
                  <div>
                    <Button
                      variant="primary"
                      label="Apply bulk operations"
                      onClick={handleExecute}
                    />
                  </div>
                )}
              </Stack>
            </Card>
          )}

          {!preview.length && !errors.length && !bulkApplied && !bulkExecutionErrors && (
            <Card padding={6} variant="muted">
              <Stack gap={2} align="center">
                <Text type="large" weight="medium" maxLines={1} hasTruncateTooltip>
                  Enter CSV data
                </Text>
                <Text type="body" color="secondary" maxLines={2} hasTruncateTooltip>
                  Paste bulk operations CSV and click Preview.
                </Text>
              </Stack>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

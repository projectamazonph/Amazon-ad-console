'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { MetricCard } from '../../metrics/MetricCard';

export function IntegrityPage() {
  const report = useAdConsoleStore((s) => s.integrityReport);
  const runIntegrity = useAdConsoleStore((s) => s.runIntegrity);
  const campaigns = useAdConsoleStore((s) => s.state.campaigns);
  const clear = useAdConsoleStore((s) => s.clearIntegrity);
  const setView = useAdConsoleStore((s) => s.setView);

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
          Integrity center
        </Text>
        <HStack gap={2} wrap>
          <Button
            variant="primary"
            label="Run integrity check"
            onClick={() => runIntegrity(campaigns)}
          />
          {report && <Button variant="secondary" label="Clear results" onClick={clear} />}
        </HStack>
      </div>

      {report ? (
        <Stack gap={4}>
          <div className="grid-4">
            <MetricCard
              label="Integrity score"
              value={`${report.score}%`}
              delta={report.passed ? '✅ Passed' : '❌ Needs attention'}
              tone={report.score >= 80 ? 'good' : report.score >= 50 ? '' : 'bad'}
            />
            <MetricCard
              label="Errors"
              value={String(report.issues.filter((i) => i.severity === 'error').length)}
            />
            <MetricCard
              label="Warnings"
              value={String(report.issues.filter((i) => i.severity === 'warn').length)}
            />
            <MetricCard
              label="Last run"
              value={report.lastRun ? new Date(report.lastRun).toLocaleTimeString() : '-'}
            />
          </div>

          {report.issues.length === 0 ? (
            <Card padding={5} variant="default" className="drill-complete-card">
              <Stack gap={2}>
                <Text
                  type="large"
                  weight="semibold"
                  maxLines={1}
                  hasTruncateTooltip
                  as="h2"
                >
                  ✨ No issues found
                </Text>
                <Text type="body" color="secondary" maxLines={2} hasTruncateTooltip>
                  All campaigns pass integrity checks.
                </Text>
              </Stack>
            </Card>
          ) : (
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
                    Issues
                  </Text>
                  <Text type="supporting" size="sm" maxLines={1}>
                    {report.issues.length} found
                  </Text>
                </HStack>
                {report.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`integrity-issue ${issue.severity}`}
                  >
                    <Text
                      type="body"
                      weight="semibold"
                      maxLines={3}
                      hasTruncateTooltip
                    >
                      {issue.message}
                    </Text>
                    <Text
                      type="supporting"
                      size="sm"
                      maxLines={2}
                      hasTruncateTooltip
                    >
                      💡 {issue.recommendation}
                    </Text>
                  </div>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      ) : (
        <Card padding={6} variant="muted">
          <Stack gap={2} align="center">
            <Text type="large" weight="medium" maxLines={1} hasTruncateTooltip>
              No integrity data
            </Text>
            <Text type="body" color="secondary" maxLines={3} hasTruncateTooltip>
              Run an integrity check to scan campaigns for common issues.
            </Text>
          </Stack>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { calc, formatMoney, formatWhole, formatPercent } from '@/engine/ad-console/core/engine';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

export function ReportsPage() {
  const requests = useAdConsoleStore((s) => s.reportQueue);
  const reports = useAdConsoleStore((s) => s.reports);
  const selectedReportId = useAdConsoleStore((s) => s.selectedReportId);
  const requestReport = useAdConsoleStore((s) => s.requestReport);
  const selectReport = useAdConsoleStore((s) => s.selectReport);
  const exportCsv = useAdConsoleStore((s) => s.exportReportCsv);
  const setView = useAdConsoleStore((s) => s.setView);

  const selected = selectedReportId ? reports.find((r) => r.id === selectedReportId) : null;

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
          Reports
        </Text>
        <HStack gap={2} wrap="wrap">
          <Button
            variant="secondary"
            label="Campaign report"
            onClick={() => requestReport('campaign')}
          />
          <Button
            variant="secondary"
            label="Target report"
            onClick={() => requestReport('target')}
          />
          <Button
            variant="secondary"
            label="Search term report"
            onClick={() => requestReport('searchTerm')}
          />
        </HStack>
      </div>

      {requests.length > 0 && (
        <Card padding={5} variant="default" style={{ marginBottom: 'var(--space-4)' }}>
          <Stack gap={3}>
            <HStack justify="between" vAlign="center">
              <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h2">
                Report queue
              </Text>
              <Text type="supporting" size="sm" maxLines={1}>
                {requests.length} requests
              </Text>
            </HStack>
            {requests.slice(0, 10).map((r) => (
              <HStack key={r.id} gap={2} vAlign="center" wrap="wrap">
                <Badge
                  variant={r.status === 'completed' ? 'success' : 'warning'}
                  label={r.status}
                />
                <Text type="body" maxLines={1} hasTruncateTooltip>
                  {r.type} report
                </Text>
                <Text type="supporting" size="sm" maxLines={1}>
                  {new Date(r.requestedAt).toLocaleTimeString()}
                </Text>
                {r.status === 'completed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    label="View"
                    onClick={() => selectReport(r.id)}
                  />
                )}
              </HStack>
            ))}
          </Stack>
        </Card>
      )}

      {selected && (
        <Card padding={5} variant="default">
          <Stack gap={4}>
            <HStack justify="between" vAlign="center">
              <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h2">
                {selected.type} report
              </Text>
              <Button
                variant="primary"
                size="sm"
                label="Export CSV"
                onClick={() => {
                  const csv = exportCsv(selected.id);
                  if (csv) {
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selected.type}-report.csv`;
                    a.click();
                  }
                }}
              />
            </HStack>
            {selected.rows.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Impressions</th>
                      <th>Clicks</th>
                      <th>Spend</th>
                      <th>Sales</th>
                      <th>ACOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.rows.map((row, i) => {
                      const m = {
                        impressions: Number(row.impressions || 0),
                        clicks: Number(row.clicks || 0),
                        spend: Number(row.spend || 0),
                        sales: Number(row.sales || 0),
                        orders: Number(row.orders || 0),
                      };
                      const x = calc(m);
                      return (
                        <tr key={i}>
                          <td className="mono">{formatWhole(m.impressions)}</td>
                          <td className="mono">{formatWhole(m.clicks)}</td>
                          <td className="money">{formatMoney(m.spend)}</td>
                          <td className="money">{formatMoney(m.sales)}</td>
                          <td className="mono">{formatPercent(x.acos)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Stack>
        </Card>
      )}

      {!requests.length && (
        <Card padding={6} variant="muted">
          <Stack gap={2} align="center">
            <Text type="large" weight="medium" maxLines={1} hasTruncateTooltip>
              No reports yet
            </Text>
            <Text type="body" color="secondary" maxLines={2} hasTruncateTooltip>
              Request a report above to get started.
            </Text>
          </Stack>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

export function SyncButton() {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  if (!session) return null;

  const handleSync = async (direction: 'upload' | 'download') => {
    setSyncing(true);
    try {
      if (direction === 'upload') {
        const state = useAdConsoleStore.getState().state;
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaigns: state.campaigns }),
        });
        if (response.ok) {
          setLastSync('Saved to cloud');
        }
      } else {
        const response = await fetch('/api/sync');
        if (response.ok) {
          const campaigns = await response.json();
          useAdConsoleStore.setState((s) => ({
            state: { ...s.state, campaigns },
          }));
          setLastSync('Loaded from cloud');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      setLastSync('Sync failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setLastSync(null), 2000);
    }
  };

  return (
    <div className="sync-controls">
      <Stack gap={1}>
        <HStack gap={1} vAlign="center">
          {lastSync && (
            <Text
              type="supporting"
              size="sm"
              maxLines={1}
              hasTruncateTooltip
              style={{ minWidth: 0 }}
            >
              {lastSync}
            </Text>
          )}
          <Button
            variant="secondary"
            size="sm"
            label={syncing ? '...' : 'Save'}
            isDisabled={syncing}
            onClick={() => handleSync('upload')}
          />
          <Button
            variant="secondary"
            size="sm"
            label={syncing ? '...' : 'Load'}
            isDisabled={syncing}
            onClick={() => handleSync('download')}
          />
        </HStack>
      </Stack>
    </div>
  );
}

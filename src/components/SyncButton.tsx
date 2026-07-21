'use client';

import { useSession } from 'next-auth/react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { useState } from 'react';

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
      {lastSync && <span className="sync-status">{lastSync}</span>}
      <button
        onClick={() => handleSync('upload')}
        disabled={syncing}
        className="sync-btn save"
        title="Save campaigns to cloud"
      >
        {syncing ? '...' : '↑ Save'}
      </button>
      <button
        onClick={() => handleSync('download')}
        disabled={syncing}
        className="sync-btn load"
        title="Load campaigns from cloud"
      >
        {syncing ? '...' : '↓ Load'}
      </button>
    </div>
  );
}

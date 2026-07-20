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
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button
        onClick={() => handleSync('upload')}
        disabled={syncing}
        style={{ fontSize: 'var(--text-xs)', background: 'rgba(6, 125, 98, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)', opacity: syncing ? 0.5 : 1 }}
        title="Save campaigns to cloud"
      >
        {syncing ? '...' : '↑ Save'}
      </button>
      <button
        onClick={() => handleSync('download')}
        disabled={syncing}
        style={{ fontSize: 'var(--text-xs)', background: 'rgba(0, 113, 133, 0.1)', color: 'var(--info)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)', opacity: syncing ? 0.5 : 1 }}
        title="Load campaigns from cloud"
      >
        {syncing ? '...' : '↓ Load'}
      </button>
      {lastSync && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--nav-ink-dim)' }}>{lastSync}</span>
      )}
    </div>
  );
}

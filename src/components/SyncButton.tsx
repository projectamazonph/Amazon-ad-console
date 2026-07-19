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
        // Get campaigns from local store
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
        // Load campaigns from server
        const response = await fetch('/api/sync');
        if (response.ok) {
          const campaigns = await response.json();
          // Update local store with server data
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
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleSync('upload')}
        disabled={syncing}
        className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        title="Save campaigns to cloud"
      >
        {syncing ? '...' : '↑ Save'}
      </button>
      <button
        onClick={() => handleSync('download')}
        disabled={syncing}
        className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors disabled:opacity-50"
        title="Load campaigns from cloud"
      >
        {syncing ? '...' : '↓ Load'}
      </button>
      {lastSync && (
        <span className="text-xs text-zinc-500">{lastSync}</span>
      )}
    </div>
  );
}

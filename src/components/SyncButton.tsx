'use client';

import { useCloudSync, type SyncStatus } from '@/lib/cloud-sync';

const STATUS_LABEL: Record<SyncStatus, string> = {
  offline: '',
  syncing: 'Saving…',
  synced: 'Synced',
  error: 'Sync failed',
};

const STATUS_COLOR: Record<SyncStatus, string> = {
  offline: 'var(--nav-ink-dim)',
  syncing: 'var(--nav-ink-dim)',
  synced: 'var(--success)',
  error: 'var(--danger, #c40000)',
};

/**
 * Cloud sync indicator. When signed in, account state auto-saves to the
 * server (debounced) and hydrates on login; the buttons remain as a manual
 * escape hatch.
 */
export function SyncButton() {
  const { status, signedIn, pushNow, pullNow } = useCloudSync();

  if (!signedIn) return null;

  const busy = status === 'syncing';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button
        onClick={() => void pushNow()}
        disabled={busy}
        style={{ fontSize: 'var(--text-xs)', background: 'rgba(6, 125, 98, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)', opacity: busy ? 0.5 : 1 }}
        title="Save campaigns to cloud now"
      >
        {busy ? '...' : '↑ Save'}
      </button>
      <button
        onClick={() => void pullNow()}
        disabled={busy}
        style={{ fontSize: 'var(--text-xs)', background: 'rgba(0, 113, 133, 0.1)', color: 'var(--info)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)', opacity: busy ? 0.5 : 1 }}
        title="Reload campaigns from cloud"
      >
        {busy ? '...' : '↓ Load'}
      </button>
      {STATUS_LABEL[status] && (
        <span style={{ fontSize: 'var(--text-xs)', color: STATUS_COLOR[status] }}>
          {STATUS_LABEL[status]}
        </span>
      )}
    </div>
  );
}

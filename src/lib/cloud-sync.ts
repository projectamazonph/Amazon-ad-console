'use client';

/**
 * Cloud sync — server-authoritative account state when signed in.
 *
 * Like the real Ads console, a signed-in user's account lives on the server:
 * on login we hydrate the store from the API (or seed the server from local
 * state on first login), and every campaign mutation is auto-saved with a
 * debounce. Signed-out users keep the purely local sandbox.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { Campaign } from '@/engine/ad-console/core/types';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 2000;

/** Load the signed-in account's campaigns from the server. */
async function fetchServerCampaigns(): Promise<Campaign[]> {
  const res = await fetch('/api/sync');
  if (!res.ok) throw new Error(`Sync load failed (${res.status})`);
  return res.json();
}

/** Persist the given campaigns to the server (transactional upsert-and-prune). */
async function pushServerCampaigns(campaigns: Campaign[]): Promise<void> {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaigns }),
  });
  if (!res.ok) throw new Error(`Sync save failed (${res.status})`);
}

/**
 * React hook that keeps the Zustand store in sync with the server when signed
 * in: hydrates on login (seeding the server on first login), auto-saves changes
 * with a debounce, and exposes manual push/pull plus a sync status.
 */
export function useCloudSync(): {
  status: SyncStatus;
  signedIn: boolean;
  pushNow: () => Promise<void>;
  pullNow: () => Promise<void>;
} {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [status, setStatus] = useState<SyncStatus>('offline');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutosave = useRef(false);

  const push = useCallback(async () => {
    setStatus('syncing');
    try {
      await pushServerCampaigns(useAdConsoleStore.getState().state.campaigns);
      setStatus('synced');
    } catch {
      setStatus('error');
    }
  }, []);

  const pull = useCallback(async () => {
    setStatus('syncing');
    try {
      const campaigns = await fetchServerCampaigns();
      suppressAutosave.current = true;
      useAdConsoleStore.setState((s) => ({ state: { ...s.state, campaigns } }));
      setStatus('synced');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setStatus('offline');
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      setStatus('syncing');
      try {
        const serverCampaigns = await fetchServerCampaigns();
        if (cancelled) return;
        if (serverCampaigns.length > 0) {
          // Server is the source of truth for an existing account.
          suppressAutosave.current = true;
          useAdConsoleStore.setState((s) => ({
            state: { ...s.state, campaigns: serverCampaigns },
          }));
        } else {
          // First login: seed the account from the local sandbox.
          await pushServerCampaigns(useAdConsoleStore.getState().state.campaigns);
        }
        if (!cancelled) setStatus('synced');
      } catch {
        if (!cancelled) setStatus('error');
      }

      // Subscribe only after hydration settles. Subscribing earlier would let a
      // mutation made during the in-flight fetch schedule a debounced push that
      // fires after the server overwrite, silently discarding that mutation.
      if (cancelled) return;
      unsubscribe = useAdConsoleStore.subscribe((current, previous) => {
        if (current.state.campaigns === previous.state.campaigns) return;
        if (suppressAutosave.current) {
          suppressAutosave.current = false;
          return;
        }
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          void push();
        }, AUTOSAVE_DEBOUNCE_MS);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [userId, push]);

  return { status, signedIn: !!userId, pushNow: push, pullNow: pull };
}

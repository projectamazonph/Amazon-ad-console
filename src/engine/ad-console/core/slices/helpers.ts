/**
 * Slice boilerplate helpers — campaignMutator and campaignMutatorObj.
 *
 * ponytail: eliminates repetitive set/map wrapper in every slice factory.
 */
import type { Campaign } from '../types';

/** Wraps a (campaign, ...args) -> Campaign engine function into a Zustand setter. */
export function campaignMutator<T extends unknown[]>(
  set: (fn: (state: any) => any) => void,
  fn: (campaign: Campaign, ...args: T) => Campaign,
) {
  return (cid: string, ...args: T): void =>
    set((s: any) => ({
      state: {
        ...s.state,
        campaigns: s.state.campaigns.map((c: Campaign) =>
          c.id === cid ? fn(c, ...args) : c,
        ),
      },
    }));
}

/** Wraps a (campaign, ...args) -> { campaign } engine function into a Zustand setter. */
export function campaignMutatorObj<T extends unknown[]>(
  set: (fn: (state: any) => any) => void,
  fn: (campaign: Campaign, ...args: T) => { campaign: Campaign },
) {
  return (cid: string, ...args: T): void =>
    set((s: any) => ({
      state: {
        ...s.state,
        campaigns: s.state.campaigns.map((c: Campaign) =>
          c.id === cid ? fn(c, ...args).campaign : c,
        ),
      },
    }));
}

/**
 * Negative keyword slice.
 */
import { addNegative, harvestTerm } from '../engine';

export interface NegativeSlice {
  addNegative: (campaignId: string, term: string, type?: string) => void;
  harvestTerm: (campaignId: string, term: string) => void;
}

export const createNegativeSlice = (set: any, ..._rest: any[]): NegativeSlice => ({
  addNegative: (cid, term, type) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? addNegative(c, term, type) : c) } })),
  harvestTerm: (cid, term) => set((s: any) => ({ state: { ...s.state, campaigns: s.state.campaigns.map((c: any) => c.id === cid ? harvestTerm(c, term) : c) } })),
});

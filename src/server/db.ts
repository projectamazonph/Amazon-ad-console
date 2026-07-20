/**
 * Narrow database contract for the server-side campaign engine.
 *
 * A structural subset of PrismaClient so the service layer can be unit-tested
 * against an in-memory fake without a live Postgres connection.
 */

export interface CampaignRecord {
  id: string;
  userId: string;
  campaignId: string;
  type: string;
  name: string;
  portfolio: string | null;
  portfolioId: string | null;
  status: string;
  dailyBudget: number;
  defaultBid: number;
  startDate: string | null;
  endDate: string | null;
  targetingMode: string | null;
  adFormat: string | null;
  campaignGoal: string | null;
  bidStrategy: string | null;
  creativeStatus: string | null;
  creativeIssue: string | null;
  createdBySimulator: boolean;
  placements: string | null;
  products: string | null;
  creative: string | null;
  metrics: string | null;
  adGroups: string | null;
  targets: string | null;
  searchTerms: string | null;
  negatives: string | null;
  budgetRules: string | null;
  productAds: string | null;
  ads: string | null;
  history: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Row payload for creates/updates (server-managed fields omitted). */
export type CampaignRowData = Omit<CampaignRecord, 'id' | 'createdAt' | 'updatedAt'>;

export interface CampaignDelegate {
  findMany(args: {
    where: { userId: string };
    orderBy?: { createdAt: 'asc' | 'desc' };
  }): Promise<CampaignRecord[]>;
  findFirst(args: {
    where: { userId: string; campaignId: string };
  }): Promise<CampaignRecord | null>;
  create(args: { data: CampaignRowData }): Promise<CampaignRecord>;
  update(args: {
    where: { id: string };
    data: Partial<CampaignRowData>;
  }): Promise<CampaignRecord>;
  upsert(args: {
    where: { userId_campaignId: { userId: string; campaignId: string } };
    create: CampaignRowData;
    update: Partial<CampaignRowData>;
  }): Promise<CampaignRecord>;
  delete(args: { where: { id: string } }): Promise<CampaignRecord>;
  deleteMany(args: {
    where: { userId: string; campaignId?: { notIn: string[] } };
  }): Promise<{ count: number }>;
}

export interface SimulationDelegate {
  create(args: {
    data: { userId: string; days: number; results: string | null };
  }): Promise<unknown>;
}

export interface CampaignDb {
  campaign: CampaignDelegate;
  simulation: SimulationDelegate;
  $transaction<T>(fn: (tx: CampaignDb) => Promise<T>): Promise<T>;
}

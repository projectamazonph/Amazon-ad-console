/**
 * Metrics calculation and formatting — pure functions, no dependencies.
 */
import type { Campaign, Metrics, DerivedMetrics } from '../types';
import { assertFiniteNonNegative } from '../../../../lib/validation';

export function calc(metrics: Metrics): DerivedMetrics {
  assertFiniteNonNegative('impressions', metrics.impressions);
  assertFiniteNonNegative('clicks', metrics.clicks);
  assertFiniteNonNegative('spend', metrics.spend);
  assertFiniteNonNegative('sales', metrics.sales);
  assertFiniteNonNegative('orders', metrics.orders);
  const ctr = metrics.impressions ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const cpc = metrics.clicks ? metrics.spend / metrics.clicks : 0;
  const acos = metrics.sales ? (metrics.spend / metrics.sales) * 100 : 0;
  const roas = metrics.spend ? metrics.sales / metrics.spend : 0;
  const cvr = metrics.clicks ? (metrics.orders / metrics.clicks) * 100 : 0;
  return { ctr, cpc, acos, roas, cvr };
}

export function totalMetrics(campaigns: Campaign[]): Metrics {
  return campaigns.reduce(
    (acc, c) => {
      acc.impressions += c.metrics.impressions;
      acc.clicks += c.metrics.clicks;
      acc.spend += c.metrics.spend;
      acc.sales += c.metrics.sales;
      acc.orders += c.metrics.orders;
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 },
  );
}

export function metricDefaults(m: Partial<Metrics>): Metrics {
  return {
    impressions: m.impressions ?? 0,
    clicks: m.clicks ?? 0,
    spend: m.spend ?? 0,
    sales: m.sales ?? 0,
    orders: m.orders ?? 0,
  };
}

export function formatMoney(n: number): string {
  return '$' + n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatWhole(n: number): string {
  return n.toLocaleString();
}

export function formatBid(n: number): string {
  return '$' + n.toFixed(2);
}

export function formatPercent(n: number): string {
  return n.toFixed(2) + '%';
}

export function formatRoas(n: number): string {
  return n.toFixed(2);
}

export function acosClass(acos: number): string {
  if (acos <= 30) return 'good';
  if (acos <= 50) return 'warn';
  return 'bad';
}

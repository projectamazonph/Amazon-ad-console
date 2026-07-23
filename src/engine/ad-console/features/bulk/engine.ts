/**
 * Bulk Operations — pure engine.
 *
 * Supports parsing Amazon Ads bulk CSV with quoted-field handling,
 * validating rows, and applying operations to campaign state.
 */
import type { Campaign, CampaignStatus } from '../../core/types';
import type { BulkRow, BulkValidationError } from './types';
import { ValidationError } from '../../../../lib/validation';
import { addNegativeKeyword } from '../../core/engine/negative';

// ---------------------------------------------------------------------------
// CSV parsing — with quoted-field support
// ---------------------------------------------------------------------------

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseBulkCsv(text: string): BulkRow[] {
  if (typeof text !== 'string') throw new ValidationError('csv text must be a string');
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  if (!headers.includes('entity') || !headers.includes('operation')) {
    throw new ValidationError('CSV must have "entity" and "operation" columns');
  }
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = parseCsvLine(line);
    const row: BulkRow = { entity: '', operation: '' };
    headers.forEach((h, i) => {
      const v = values[i] ?? '';
      if (h === 'entity') row.entity = v;
      else if (h === 'operation') row.operation = v;
      else if (v) {
        // Handle known BulkRow properties (camelCase in TS, but lowercase in CSV headers)
        if (h === 'id') row.id = v;
        else if (h === 'campaignid') row.campaignId = v;
        else if (h === 'adgroupid') row.adGroupId = v;
        else if (h === 'campaignname') row.campaignName = v;
        else if (h === 'name') row.name = v;
        else if (h === 'field') row.field = v;
        else if (h === 'value') row.value = v;
      }
    });
    return row;
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_ENTITIES = ['campaign', 'target', 'negative', 'budgetRule'] as const;
const VALID_OPERATIONS = ['update', 'pause', 'enable', 'archive', 'delete'] as const;

const CAMPAIGN_SCALAR_FIELDS = new Set([
  'name', 'status', 'dailyBudget', 'defaultBid',
  'targetingMode', 'bidStrategy', 'campaignGoal', 'portfolio',
] as const);
const CAMPAIGN_PLACEMENT_FIELDS = new Set(['placements_top', 'placements_product', 'placements_rest'] as const);

export function validateBulkRows(rows: BulkRow[]): BulkValidationError[] {
  if (!Array.isArray(rows)) throw new ValidationError('rows must be an array');
  const errors: BulkValidationError[] = [];

  rows.forEach((row, i) => {
    const rowNum = i + 2;

    if (!row.entity) {
      errors.push({ row: rowNum, field: 'entity', message: 'Entity is required' });
    } else if (!VALID_ENTITIES.includes(row.entity as typeof VALID_ENTITIES[number])) {
      errors.push({ row: rowNum, field: 'entity', message: `Unknown entity: "${row.entity}". Valid: ${VALID_ENTITIES.join(', ')}` });
    }

    if (!row.operation) {
      errors.push({ row: rowNum, field: 'operation', message: 'Operation is required' });
    } else if (!VALID_OPERATIONS.includes(row.operation as typeof VALID_OPERATIONS[number])) {
      errors.push({ row: rowNum, field: 'operation', message: `Unknown operation: "${row.operation}". Valid: ${VALID_OPERATIONS.join(', ')}` });
    }

    if (row.entity === 'campaign') {
      if (!row.id && row.operation === 'update') {
        errors.push({ row: rowNum, field: 'id', message: 'Campaign ID is required for update operations' });
      }
      const field = row.field as string;
      if (field && !CAMPAIGN_SCALAR_FIELDS.has(field as 'name' | 'status' | 'dailyBudget' | 'defaultBid' | 'targetingMode' | 'bidStrategy' | 'campaignGoal' | 'portfolio') &&
          !CAMPAIGN_PLACEMENT_FIELDS.has(field as 'placements_top' | 'placements_product' | 'placements_rest')) {
        errors.push({ row: rowNum, field: 'field', message: `Unknown campaign field: "${field}". Valid: ${[...CAMPAIGN_SCALAR_FIELDS, ...CAMPAIGN_PLACEMENT_FIELDS].join(', ')}` });
      }
    }

    if (row.entity === 'target') {
      if (!row.campaignId && !row.id) {
        errors.push({ row: rowNum, field: 'id', message: 'Either campaignId or target id is required for target operations' });
      }
    }

    if (row.entity === 'negative') {
      if (!row.campaignId) {
        errors.push({ row: rowNum, field: 'campaignId', message: 'campaignId is required for negative keyword operations' });
      }
      if (!row.value) {
        errors.push({ row: rowNum, field: 'value', message: 'Negative keyword value is required' });
      }
    }
  });

  return errors;
}

// ---------------------------------------------------------------------------
// Bulk execution
// ---------------------------------------------------------------------------

export interface BulkExecutionResult {
  applied: number;
  skipped: number;
  errors: BulkValidationError[];
  campaigns: Campaign[];
}

function parseNumeric(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = parseFloat(value);
  return isFinite(n) ? n : fallback;
}

function applyCampaignUpdate(c: Campaign, row: BulkRow): Campaign {
  const history = [...c.history, `Bulk update: ${row.field ?? 'settings'} → ${row.value ?? row.operation}`];

  if (row.field === 'name') return { ...c, name: row.value ?? c.name, history };
  if (row.field === 'status') {
    const status = (['Enabled', 'Paused', 'Archived'].includes(row.value ?? '') ? row.value : c.status) as CampaignStatus;
    return { ...c, status, history };
  }
  if (row.field === 'dailyBudget') return { ...c, dailyBudget: parseNumeric(row.value, c.dailyBudget), history };
  if (row.field === 'defaultBid') return { ...c, defaultBid: parseNumeric(row.value, c.defaultBid), history };
  if (row.field === 'bidStrategy') return { ...c, bidStrategy: (row.value ?? c.bidStrategy) as Campaign['bidStrategy'], history };
  if (row.field === 'portfolio') return { ...c, portfolio: row.value ?? c.portfolio, history };

  if (row.field?.startsWith('placements_')) {
    const placement = row.field.replace('placements_', '') as 'top' | 'product' | 'rest';
    return { ...c, placements: { ...c.placements, [placement]: parseNumeric(row.value, c.placements[placement]) }, history };
  }

  return c;
}

export function applyBulkRows(campaigns: Campaign[], rows: BulkRow[]): BulkExecutionResult {
  let applied = 0;
  let skipped = 0;
  const errors: BulkValidationError[] = [];

  const result = rows.reduce((acc, row, i) => {
    try {
      if (row.entity === 'campaign') {
        const c = acc.find((x) => x.id === row.id);
        if (!c) { skipped++; return acc; }

        if (row.operation === 'update') {
          applied++;
          const updated = applyCampaignUpdate(c, row);
          return acc.map((x) => x.id === row.id ? updated : x);
        }
        if (row.operation === 'pause') {
          applied++;
          return acc.map((x) => x.id === row.id ? { ...x, status: 'Paused' as CampaignStatus, history: [...x.history, 'Bulk: paused'] } : x);
        }
        if (row.operation === 'enable') {
          applied++;
          return acc.map((x) => x.id === row.id ? { ...x, status: 'Enabled' as CampaignStatus, history: [...x.history, 'Bulk: enabled'] } : x);
        }
        if (row.operation === 'archive') {
          applied++;
          return acc.map((x) => x.id === row.id ? { ...x, status: 'Archived' as CampaignStatus, history: [...x.history, 'Bulk: archived'] } : x);
        }
      }

      if (row.entity === 'target') {
        const c = acc.find((x) => x.id === row.campaignId || x.targets.some((t) => t.id === row.id));
        if (!c) { skipped++; return acc; }

        if (row.operation === 'pause') {
          applied++;
          return acc.map((x) => {
            if (x.id !== c.id) return x;
            return {
              ...x,
              targets: x.targets.map((t) => (t.id === row.id || (row.campaignId === x.id && row.id === undefined) ? { ...t, status: 'Paused' as CampaignStatus } : t)),
              history: [...x.history, `Bulk: target paused`],
            };
          });
        }
        if (row.operation === 'enable') {
          applied++;
          return acc.map((x) => {
            if (x.id !== c.id) return x;
            return {
              ...x,
              targets: x.targets.map((t) => (t.id === row.id ? { ...t, status: 'Enabled' as CampaignStatus } : t)),
              history: [...x.history, `Bulk: target enabled`],
            };
          });
        }
        if (row.operation === 'update' && row.field === 'bid' && row.value) {
          applied++;
          const bid = parseNumeric(row.value, 0.75);
          return acc.map((x) => {
            if (x.id !== c.id) return x;
            return {
              ...x,
              targets: x.targets.map((t) => (t.id === row.id ? { ...t, bid } : t)),
              history: [...x.history, `Bulk: target bid → $${bid.toFixed(2)}`],
            };
          });
        }
      }

      if (row.entity === 'negative') {
        const c = acc.find((x) => x.id === row.campaignId);
        if (!c) { skipped++; return acc; }

        if (row.operation === 'update' && row.value) {
          applied++;
          const result2 = addNegativeKeyword(c, row.value, 'Negative exact');
          return acc.map((x) => x.id === row.campaignId ? result2 : x);
        }
        if (row.operation === 'delete') {
          applied++;
          return acc.map((x) => {
            if (x.id !== row.campaignId) return x;
            return { ...x, negatives: x.negatives.filter((n) => n.value.toLowerCase() !== (row.value ?? '').toLowerCase()), history: [...x.history, `Bulk: negative removed`] };
          });
        }
      }

      if (row.entity === 'budgetRule') {
        const c = acc.find((x) => x.id === row.campaignId);
        if (!c) { skipped++; return acc; }

        if (row.operation === 'delete' && row.id) {
          applied++;
          return acc.map((x) => {
            if (x.id !== row.campaignId) return x;
            return { ...x, budgetRules: x.budgetRules.filter((r) => r.id !== row.id), history: [...x.history, `Bulk: budget rule removed`] };
          });
        }
      }

      skipped++;
      return acc;
    } catch (err) {
      errors.push({ row: i + 2, field: 'operation', message: `Failed to apply: ${(err as Error).message}` });
      return acc;
    }
  }, [...campaigns]);

  return { applied, skipped, errors, campaigns: result };
}

// ---------------------------------------------------------------------------
// Template — all rows pass validation
// ---------------------------------------------------------------------------

export function generateBulkTemplate(): string {
  return [
    'entity,operation,id,campaignId,adGroupId,field,value',
    'campaign,update,C-SP-AUTO-001,,,status,Paused',
    'campaign,update,C-SP-AUTO-001,,,dailyBudget,50',
    'campaign,update,C-SP-AUTO-001,,,placements_top,30',
    'target,pause,T-SP-001,C-SP-AUTO-001,,',
    'target,update,T-SP-001,C-SP-AUTO-001,bid,1.50',
    'negative,update,,C-SP-AUTO-001,,,free trial',
    'budgetRule,delete,BR-SP-001,C-SP-AUTO-001,,',
  ].join('\n');
}

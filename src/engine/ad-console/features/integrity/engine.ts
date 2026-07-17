/**
 * Integrity Center — pure engine.
 *
 * Runs data-quality checks on campaign state to catch common setup
 * mistakes trainees make, providing self-heal recommendations.
 */
import type { Campaign } from '../../core/types';
import type { IntegrityIssue, IntegrityReport } from './types';
import { ValidationError } from '../../../../lib/validation';

let _counter = 0;
function uid(): string {
  _counter++;
  return 'II-' + Date.now().toString(36) + '-' + _counter;
}

export function runIntegrityCheck(campaigns: Campaign[]): IntegrityReport {
  if (!Array.isArray(campaigns)) throw new ValidationError('campaigns must be an array');
  const issues: IntegrityIssue[] = [];

  campaigns.forEach((c) => {
    // Check archived campaign has archived children
    if (c.status === 'Archived') {
      c.targets.forEach((t) => {
        if (t.status !== 'Archived') {
          issues.push({
            id: uid(),
            severity: 'error',
            message: `Archived campaign "${c.name}" has active target "${t.value}"`,
            entityId: t.id,
            entityType: 'target',
            recommendation: 'Archive children with parent campaign.',
          });
        }
      });
    }

    // Check duplicate target IDs
    const seen = new Set<string>();
    c.targets.forEach((t) => {
      if (seen.has(t.id)) {
        issues.push({
          id: uid(),
          severity: 'error',
          message: `Duplicate target ID: ${t.id} in campaign "${c.name}"`,
          entityId: t.id,
          entityType: 'target',
          recommendation: 'Regenerate unique IDs for duplicate targets.',
        });
      }
      seen.add(t.id);
    });

    // Check for orphaned search terms (no target link)
    c.searchTerms.forEach((st) => {
      if (!st.targetId && c.type !== 'SD') {
        issues.push({
          id: uid(),
          severity: 'warn',
          message: `Search term "${st.term}" in "${c.name}" has no target link`,
          entityId: st.id,
          entityType: 'searchTerm',
          recommendation: 'Link the search term to its matched target.',
        });
      }
    });

    // Check SD campaigns don't have search terms
    if (c.type === 'SD' && c.searchTerms.length > 0) {
      issues.push({
        id: uid(),
        severity: 'warn',
        message: `SD campaign "${c.name}" has search term rows (should use audience reports)`,
        entityId: c.id,
        entityType: 'campaign',
        recommendation: 'Remove search term rows from Sponsored Display campaigns.',
      });
    }

    // Check SB creative status
    if (c.type === 'SB' && c.creativeStatus === 'Rejected') {
      issues.push({
        id: uid(),
        severity: 'error',
        message: `SB campaign "${c.name}" has rejected creative: "${c.creativeIssue}"`,
        entityId: c.id,
        entityType: 'campaign',
        recommendation: 'Fix creative issues before enabling the campaign.',
      });
    }

    // Check low-inventory products
    c.products.forEach((asin) => {
      if (asin === 'B0TRAIN004') {
        // Known low-inventory product
        issues.push({
          id: uid(),
          severity: 'warn',
          message: `Campaign "${c.name}" includes a low-inventory product (${asin})`,
          entityId: c.id,
          entityType: 'campaign',
          recommendation: 'Confirm retail readiness before scaling campaign.',
        });
      }
    });
  });

  // Calculate score
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warnCount = issues.filter((i) => i.severity === 'warn').length;
  const score = Math.max(0, 100 - errorCount * 15 - warnCount * 5);

  return {
    score,
    issues,
    passed: score >= 70,
    lastRun: new Date().toISOString(),
  };
}

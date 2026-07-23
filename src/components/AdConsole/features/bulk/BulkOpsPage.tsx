'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { applyBulkRows } from '@/engine/ad-console/features/bulk/engine';

export function BulkOpsPage() {
  const input = useAdConsoleStore((s) => s.bulkInput);
  const preview = useAdConsoleStore((s) => s.bulkPreview);
  const errors = useAdConsoleStore((s) => s.bulkErrors);
  const valid = useAdConsoleStore((s) => s.bulkValid);
  const bulkApplied = useAdConsoleStore((s) => s.bulkApplied);
  const bulkSkipped = useAdConsoleStore((s) => s.bulkSkipped);
  const bulkExecutionErrors = useAdConsoleStore((s) => s.bulkExecutionErrors);
  const setInput = useAdConsoleStore((s) => s.setBulkInput);
  const parseAndValidate = useAdConsoleStore((s) => s.parseAndValidate);
  const clear = useAdConsoleStore((s) => s.clearBulk);
  const getTemplate = useAdConsoleStore((s) => s.getTemplate);
  const setView = useAdConsoleStore((s) => s.setView);

  const handleExecute = () => {
    const campaigns = useAdConsoleStore.getState().state.campaigns;
    const result = applyBulkRows(campaigns, preview);
    useAdConsoleStore.setState((s) => ({
      state: { ...s.state, campaigns: result.campaigns },
      bulkApplied: result.applied,
      bulkSkipped: result.skipped,
      bulkExecutionErrors: result.errors,
    }));
  };

  return (
    <div>
      <div className="page-title">
        <button className="btn small" onClick={() => setView('campaigns')} aria-label="Back to campaigns">← Back to campaigns</button>
        <h1 style={{ marginTop: 'var(--space-2)' }}>Bulk operations</h1>
        <button className="btn" onClick={() => {
          const template = getTemplate();
          setInput(template);
        }}>Load template</button>
      </div>

      <div className="split">
        <div>
          <div className="card pad" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-title"><h2>CSV input</h2><span>entity,operation,...</span></div>
            <textarea
              className="input full bulk-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="entity,operation,id,name,field,value"
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <button className="btn primary" onClick={parseAndValidate}>Preview &amp; validate</button>
              <button className="btn" onClick={clear}>Clear</button>
            </div>
          </div>
        </div>

        <div>
          {bulkExecutionErrors.length > 0 && (
            <div className="card pad" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--danger)' }}>
              <div className="card-title"><h2 style={{ color: 'var(--danger)' }}>Execution errors</h2></div>
              {bulkExecutionErrors.map((e, i) => (
                <div key={i} style={{ padding: '4px 0', color: 'var(--danger)' }}>
                  Row {e.row}: {e.message}
                </div>
              ))}
            </div>
          )}

          {(bulkApplied > 0 || bulkSkipped > 0) && (
            <div className="card pad" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--success)' }}>
              <div className="card-title"><h2 style={{ color: 'var(--success)' }}>Execution complete</h2></div>
              <p style={{ color: 'var(--success)' }}>Applied: {bulkApplied} · Skipped: {bulkSkipped}</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="card pad" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--danger)' }}>
              <div className="card-title"><h2 style={{ color: 'var(--danger)' }}>Validation errors</h2></div>
              {errors.map((e, i) => (
                <div key={i} style={{ padding: '4px 0', color: 'var(--danger)' }}>
                  Row {e.row}: {e.message}
                </div>
              ))}
            </div>
          )}

          {preview.length > 0 && (
            <div className="card pad">
              <div className="card-title">
                <h2>Preview</h2>
                <span className="bulk-status">{preview.length} rows · {valid ? '✅ Valid' : '❌ Has errors'}</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>{Object.keys(preview[0]).map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => <td key={j} className="bulk-preview-text">{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {valid && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <button className="btn primary" onClick={handleExecute}>
                    Apply bulk operations
                  </button>
                </div>
              )}
            </div>
          )}

          {!preview.length && !errors.length && !bulkApplied && !bulkExecutionErrors && (
            <div className="empty"><h3>Enter CSV data</h3><p>Paste bulk operations CSV and click Preview.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

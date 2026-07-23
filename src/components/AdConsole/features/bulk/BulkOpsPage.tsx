'use client';

import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';

export function BulkOpsPage() {
  const input = useAdConsoleStore((s) => s.bulkInput);
  const preview = useAdConsoleStore((s) => s.bulkPreview);
  const errors = useAdConsoleStore((s) => s.bulkErrors);
  const valid = useAdConsoleStore((s) => s.bulkValid);
  const setInput = useAdConsoleStore((s) => s.setBulkInput);
  const parseAndValidate = useAdConsoleStore((s) => s.parseAndValidate);
  const clear = useAdConsoleStore((s) => s.clearBulk);
  const getTemplate = useAdConsoleStore((s) => s.getTemplate);
  const setView = useAdConsoleStore((s) => s.setView);

  return (
    <div>
      <div className="page-title">
        <Button label="← Back to campaigns" size="sm" onClick={() => setView('campaigns')} tooltip="Back to campaigns" />
        <h1 style={{ marginTop: 'var(--space-2)' }}>Bulk operations</h1>
        <Button label="Load template" onClick={() => {
          const template = getTemplate();
          setInput(template);
        }} />
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
              <Button label="Preview & validate" variant="primary" onClick={parseAndValidate} />
              <Button label="Clear" onClick={clear} />
            </div>
          </div>
        </div>

        <div>
          {errors.length > 0 && (
            <div className="card pad" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--danger)' }}>
              <div className="card-title"><h2 style={{ color: 'var(--danger)' }}>Validation errors</h2></div>
              {errors.map((e, i) => (
                <div key={i} className="bulk-preview-text" style={{ padding: '4px 0', color: 'var(--danger)' }}>
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
            </div>
          )}

          {!preview.length && !errors.length && (
            <div className="empty"><h3>Enter CSV data</h3><p>Paste bulk operations CSV and click Preview.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';

interface Step3ProductsCreativeProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step3ProductsCreativeSP({ isActive, isComplete }: Step3ProductsCreativeProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const selectedProducts = draft.products;
  const availableProducts = PRODUCTS.filter((p) => !selectedProducts.includes(p.asin));

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Products & creative</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Select products to advertise.</p>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="card-title"><h3>Selected products ({selectedProducts.length})</h3></div>
        {selectedProducts.length === 0 ? (
          <p className="muted">No products selected</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedProducts.map((asin) => {
              const p = PRODUCTS.find((x) => x.asin === asin);
              return (
                <div key={asin} className="card pad" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{p?.image || '📦'}</span>
                  <div>
                    <strong>{p?.title || asin}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>${p?.price}</div>
                  </div>
                  <Button label="Remove" variant="destructive" size="sm" style={{ marginLeft: 'auto' }} onClick={() => removeProductAction(asin)} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="card-title"><h3>Add products</h3></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {availableProducts.map((p) => (
            <div key={p.asin} className="card pad" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>{p.image}</span>
              <div>
                <strong>{p.title}</strong>
                <div className="muted" style={{ fontSize: 12 }}>${p.price} | {p.category}</div>
              </div>
              <Button label="Add" variant="primary" size="sm" style={{ marginLeft: 'auto' }} onClick={() => selectProductAction(p.asin)} />
            </div>
          ))}
        </div>
      </div>

      <div className="coach-tip">Sponsored Products campaigns use the product detail page as the ad creative.</div>
    </div>
  );
}

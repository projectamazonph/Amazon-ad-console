'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS, BRANDS } from '@/engine/ad-console/core/scenarios';

const HEADLINE_MAX = 50;

interface Step3ProductsCreativeProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step3ProductsCreativeSD({ isActive, isComplete }: Step3ProductsCreativeProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const [brand, setBrand] = useState(draft.creative.brandName || '');
  const [logo, setLogo] = useState(draft.creative.logo || '');
  const [headline, setHeadline] = useState(draft.creative.headline || '');
  const [image, setImage] = useState(draft.creative.image || '');
  const [video, setVideo] = useState(draft.creative.video || '');
  const [destination, setDestination] = useState(draft.creative.destination || 'Product detail page');

  const selectedProducts = draft.products;
  const availableProducts = PRODUCTS.filter((p) => !selectedProducts.includes(p.asin));

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Products & creative</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Select products to advertise and configure creative.</p>

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

      {/* Creative Configuration */}
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="card-title"><h3>Creative</h3></div>
        <div className="form-grid">
          <div className="field">
            <label>Ad format</label>
            <select className="select full" value={draft.adFormat} onChange={(e) => updateDraft('adFormat', e.target.value)}>
              <option value="Auto generated">Auto generated</option>
              <option value="Custom image">Custom image</option>
              <option value="Video creative">Video creative</option>
            </select>
          </div>
          <div className="field">
            <label>Brand</label>
            <select className="select full" value={brand} onChange={(e) => { setBrand(e.target.value); const b = BRANDS.find(x => x.id === e.target.value); updateDraft('creative', { ...draft.creative, brandName: b?.name || e.target.value, logo: b?.logo || '' }); }}>
              <option value="">Select brand</option>
              {BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sd3-logo">Logo</label>
            <input id="sd3-logo" className="input full" value={logo} onChange={(e) => { setLogo(e.target.value); updateDraft('creative', { ...draft.creative, logo: e.target.value }); }} placeholder="TL" />
          </div>
          <div className="field full">
            <label htmlFor="sd3-headline">Headline <span className="muted">({headline.length}/{HEADLINE_MAX})</span></label>
            <input id="sd3-headline" className="input full" value={headline}
              maxLength={HEADLINE_MAX}
              onChange={(e) => { setHeadline(e.target.value); updateDraft('creative', { ...draft.creative, headline: e.target.value }); }}
              placeholder="Perfect coffee starts here"
              style={headline.length >= HEADLINE_MAX ? { borderColor: 'var(--danger)' } : {}} />
            {headline.length >= HEADLINE_MAX && <small style={{ color: 'var(--danger)' }}>Maximum {HEADLINE_MAX} characters.</small>}
          </div>
          <div className="field">
            <label htmlFor="sd3-destination">Destination</label>
            <select id="sd3-destination" className="select full" value={destination} onChange={(e) => { setDestination(e.target.value); updateDraft('creative', { ...draft.creative, destination: e.target.value }); }}>
              <option value="Product detail page">Product detail page</option>
              <option value="Brand Store">Brand Store</option>
            </select>
          </div>
          {(draft.adFormat === 'Custom image' || draft.adFormat === 'Video creative') && (
            <div className="field full">
              <label htmlFor="sd3-image">Image URL</label>
              <input id="sd3-image" className="input full" value={image} onChange={(e) => { setImage(e.target.value); updateDraft('creative', { ...draft.creative, image: e.target.value }); }} placeholder="https://..." />
            </div>
          )}
          {draft.adFormat === 'Video creative' && (
            <div className="field full">
              <label htmlFor="sd3-video">Video URL</label>
              <input id="sd3-video" className="input full" value={video} onChange={(e) => { setVideo(e.target.value); updateDraft('creative', { ...draft.creative, video: e.target.value }); }} placeholder="https://..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

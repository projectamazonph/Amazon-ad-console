'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Table } from '@astryxdesign/core/Table';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS, BRANDS } from '@/engine/ad-console/core/scenarios';

const HEADLINE_MAX = 50;

interface Step3ProductsCreativeSBProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step3ProductsCreativeSB({ isActive, isComplete }: Step3ProductsCreativeSBProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const [storeUrl, setStoreUrl] = useState(draft.creative.destination || '');
  const [brand, setBrand] = useState(draft.creative.brandName || '');
  const [logo, setLogo] = useState(draft.creative.logo || '');
  const [headline, setHeadline] = useState(draft.creative.headline || '');
  const [image, setImage] = useState(draft.creative.image || '');
  const [video, setVideo] = useState(draft.creative.video || '');

  return (
    <div className="wizard-step" style={{ display: isActive || isComplete ? 'block' : 'none' }}>
      <h2>Products & creative</h2>
      <p className="muted" style={{ marginBottom: 14 }}>Select products to advertise and configure creative.</p>

      {/* Product Selection (not for Store spotlight) */}
      {!(draft.adFormat === 'Store spotlight') && (
        <Card variant="default" padding={6} style={{ marginBottom: 14 }}>
          <div className="card-title"><h3>Product catalog</h3><span>{draft.products.length} selected</span></div>
          <Table>
              <thead>
                <tr><th></th><th>ASIN</th><th>Product</th><th>Price</th><th>Category</th><th>Rating</th><th>Status</th></tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p) => {
                  const selected = draft.products.includes(p.asin);
                  return (
                    <tr key={p.asin} style={{ cursor: 'pointer', background: selected ? 'var(--accent-soft)' : undefined }}
                      onClick={() => selected ? removeProductAction(p.asin) : selectProductAction(p.asin)}>
                      <td><input type="checkbox" checked={selected} readOnly /></td>
                      <td className="mono">{p.asin}</td>
                      <td><strong>{p.image} {p.title}</strong></td>
                      <td className="money">${p.price.toFixed(2)}</td>
                      <td>{p.category}</td>
                      <td>{p.rating} ({p.reviews.toLocaleString()})</td>
                      <td><span className={`pill ${p.status === 'In stock' ? 'green' : 'orange'}`}>{p.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          {draft.products.length === 0 && <div className="error-state" style={{ margin: '8px 0', padding: 12, textAlign: 'left' }}>
            <strong>⚠️ Select at least one product</strong>
            <p style={{ fontSize: 'var(--text-xs)', marginTop: 2 }}>Campaigns require at least one product to advertise.</p>
          </div>}
        </Card>
      )}

      {/* Creative Configuration */}
      {draft.adFormat === 'Store spotlight' && (
        <Card variant="default" padding={6} style={{ marginBottom: 14 }}>
          <div className="card-title"><h3>Store spotlight</h3><span>Store URL</span></div>
          <div className="field full">
            <label htmlFor="sb3-store-url">Store URL</label>
            <input id="sb3-store-url" className="input full" placeholder="https://www.amazon.com/stores/YourStore"
              value={storeUrl}
              onChange={(e) => { setStoreUrl(e.target.value); updateDraft('creative', { ...draft.creative, destination: e.target.value }); }} />
            <p className="muted" style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>
              Store spotlight promotes your entire Amazon Store, not individual products.
            </p>
          </div>
        </Card>
      )}

      {draft.adFormat === 'Product collection' && (
        <Card variant="default" padding={6} style={{ marginBottom: 14 }}>
          <div className="card-title"><h3>Creative</h3></div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="sb3-pc-brand">Brand</label>
              <select id="sb3-pc-brand" className="select full" value={brand} onChange={(e) => { setBrand(e.target.value); const b = BRANDS.find(x => x.id === e.target.value); updateDraft('creative', { ...draft.creative, brandName: b?.name || e.target.value, logo: b?.logo || '' }); }}>
                <option value="">Select brand</option>
                {BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sb3-pc-logo">Logo</label>
              <input id="sb3-pc-logo" className="input full" value={logo} onChange={(e) => { setLogo(e.target.value); updateDraft('creative', { ...draft.creative, logo: e.target.value }); }} />
            </div>
            <div className="field full">
              <label htmlFor="sb3-pc-headline">Headline <span className="muted">({headline.length}/{HEADLINE_MAX})</span></label>
              <input id="sb3-pc-headline" className="input full" value={headline}
                maxLength={HEADLINE_MAX}
                onChange={(e) => { setHeadline(e.target.value); updateDraft('creative', { ...draft.creative, headline: e.target.value }); }}
                placeholder="Discover your perfect brew"
                style={headline.length >= HEADLINE_MAX ? { borderColor: 'var(--danger)' } : {}} />
              {headline.length >= HEADLINE_MAX && <small style={{ color: 'var(--danger)' }}>Maximum {HEADLINE_MAX} characters.</small>}
            </div>
            <div className="field">
              <label htmlFor="sb3-pc-destination">Destination</label>
              <input id="sb3-pc-destination" className="input full" value={storeUrl} onChange={(e) => { setStoreUrl(e.target.value); updateDraft('creative', { ...draft.creative, destination: e.target.value }); }} placeholder="Brand Store URL" />
            </div>
            <div className="field">
              <label htmlFor="sb3-pc-image">Image</label>
              <input id="sb3-pc-image" className="input full" value={image} onChange={(e) => { setImage(e.target.value); updateDraft('creative', { ...draft.creative, image: e.target.value }); }} placeholder="Auto generated or custom" />
            </div>
          </div>
        </Card>
      )}

      {draft.adFormat === 'Video' && (
        <Card variant="default" padding={6} style={{ marginBottom: 14 }}>
          <div className="card-title"><h3>Video creative</h3></div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="sb3-vid-brand">Brand</label>
              <select id="sb3-vid-brand" className="select full" value={brand} onChange={(e) => { setBrand(e.target.value); const b = BRANDS.find(x => x.id === e.target.value); updateDraft('creative', { ...draft.creative, brandName: b?.name || e.target.value, logo: b?.logo || '' }); }}>
                <option value="">Select brand</option>
                {BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sb3-vid-logo">Logo</label>
              <input id="sb3-vid-logo" className="input full" value={logo} onChange={(e) => { setLogo(e.target.value); updateDraft('creative', { ...draft.creative, logo: e.target.value }); }} />
            </div>
            <div className="field full">
              <label htmlFor="sb3-vid-headline">Headline <span className="muted">({headline.length}/{HEADLINE_MAX})</span></label>
              <input id="sb3-vid-headline" className="input full" value={headline}
                maxLength={HEADLINE_MAX}
                onChange={(e) => { setHeadline(e.target.value); updateDraft('creative', { ...draft.creative, headline: e.target.value }); }}
                placeholder="Discover your perfect brew"
                style={headline.length >= HEADLINE_MAX ? { borderColor: 'var(--danger)' } : {}} />
              {headline.length >= HEADLINE_MAX && <small style={{ color: 'var(--danger)' }}>Maximum {HEADLINE_MAX} characters.</small>}
            </div>
            <div className="field">
              <label htmlFor="sb3-vid-destination">Destination</label>
              <input id="sb3-vid-destination" className="input full" value={storeUrl} onChange={(e) => { setStoreUrl(e.target.value); updateDraft('creative', { ...draft.creative, destination: e.target.value }); }} placeholder="Product detail page or Store URL" />
            </div>
            <div className="field full">
              <label htmlFor="sb3-vid-video">Video URL</label>
              <input id="sb3-vid-video" className="input full" value={video} onChange={(e) => { setVideo(e.target.value); updateDraft('creative', { ...draft.creative, video: e.target.value }); }} placeholder="https://..." />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { CampaignType, TargetingMode } from '@/engine/ad-console/types';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';

const STEPS = ['Ad type', 'Basics', 'Products & creative', 'Targeting', 'Bidding', 'Review'];

export function CreateCampaignWizard() {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);
  const wizardStep = useAdConsoleStore((s) => s.wizardStep);
  const setWizardStep = useAdConsoleStore((s) => s.setWizardStep);
  const launchCampaign = useAdConsoleStore((s) => s.launchCampaign);
  const resetDraft = useAdConsoleStore((s) => s.resetDraft);
  const setView = useAdConsoleStore((s) => s.setView);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const d = draft;

  return (
    <div>
      <div className="page-title">
        <h1>Create campaign</h1>
        <button className="btn" onClick={() => setView('campaigns')}>Back to campaigns</button>
      </div>

      <div className="wizard">
        <div className="steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`step ${wizardStep === i + 1 ? 'active' : wizardStep > i + 1 ? 'done' : ''}`}>
              <span className="step-num">{wizardStep > i + 1 ? '✓' : i + 1}</span>
              <div>{label}</div>
            </div>
          ))}
        </div>

        <div className="wizard-panel">
          {wizardStep === 1 && (
            <>
              <h2>Choose campaign type</h2>
              <p className="muted" style={{ marginBottom: 14 }}>The simulator includes the three core ad types.</p>
              <div className="choice-grid">
                {[
                  { type: 'SP' as const, title: 'Sponsored Products', desc: 'Promote individual listings. Train automatic targeting, manual keyword targeting, product targeting, search term reports, bids, negatives, and placements.', foot: 'Best first PPC operations module' },
                  { type: 'SB' as const, title: 'Sponsored Brands', desc: 'Promote brand creative, product collections, Store spotlight, or video. Train headlines, brand assets, destinations, and keyword/product/category targeting.', foot: 'Brand registered workflow' },
                  { type: 'SD' as const, title: 'Sponsored Display', desc: 'Reach shoppers through contextual targeting or audiences such as views remarketing. Train display setup, creative, products, and audience logic.', foot: 'Upper funnel and remarketing' },
                ].map((choice) => (
                  <div key={choice.type}
                    className={`choice ${d.type === choice.type ? 'active' : ''}`}
                    onClick={() => { updateDraft('type', choice.type); updateDraft('adFormat', choice.type === 'SP' ? 'Standard' : choice.type === 'SB' ? 'Product collection' : 'Auto generated'); }}>
                    <div><span className={`pill ${choice.type === 'SP' ? 'active' : choice.type === 'SB' ? 'orange' : 'purple'}`}>{choice.type}</span></div>
                    <h3>{choice.title}</h3>
                    <p>{choice.desc}</p>
                    <span className="pill orange" style={{ marginTop: 8 }}>{choice.foot}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {wizardStep === 2 && (
            <>
              <h2>Campaign basics</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Set campaign-level controls.</p>
              <div className="form-grid">
                <div className="field full">
                  <label>Campaign name</label>
                  <input className="input full" value={d.name} onChange={(e) => updateDraft('name', e.target.value)} placeholder={`${d.type} | Manual | Training`} />
                </div>
                <div className="field">
                  <label>Portfolio</label>
                  <input className="input full" value={d.portfolio} onChange={(e) => updateDraft('portfolio', e.target.value)} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="select full" value={d.status} onChange={(e) => updateDraft('status', e.target.value)}>
                    <option>Enabled</option><option>Paused</option>
                  </select>
                </div>
                <div className="field">
                  <label>Daily budget</label>
                  <input className="input full" type="number" min="1" value={d.dailyBudget} onChange={(e) => updateDraft('dailyBudget', Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Start date</label>
                  <input className="input full" type="date" value={d.startDate} onChange={(e) => updateDraft('startDate', e.target.value)} />
                </div>
                <div className="field">
                  <label>Ad format</label>
                  <select className="select full" value={d.adFormat} onChange={(e) => updateDraft('adFormat', e.target.value)}>
                    {d.type === 'SP' && ['Standard', 'Video'].map((x) => <option key={x}>{x}</option>)}
                    {d.type === 'SB' && ['Product collection', 'Store spotlight', 'Video'].map((x) => <option key={x}>{x}</option>)}
                    {d.type === 'SD' && ['Auto generated', 'Custom image', 'Video creative'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {wizardStep === 3 && (
            <>
              <h2>Products & creative</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Select which products to advertise and set creative content.</p>
              <div className="card pad" style={{ marginBottom: 14 }}>
                <div className="card-title"><h2>Product catalog</h2><span>{d.products.length} selected</span></div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th></th><th>ASIN</th><th>Product</th><th>Price</th><th>Category</th><th>Rating</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {PRODUCTS.map((p) => {
                        const selected = d.products.includes(p.asin);
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
                  </table>
                </div>
                {d.products.length === 0 && <div className="coach-tip" style={{ marginTop: 8 }}>Select at least one product to advertise.</div>}
              </div>
              <h2>Creative & products</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Select products to advertise.</p>
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {PRODUCTS.map((p) => (
                  <label key={p.asin} className={`product-choice ${d.products.includes(p.asin) ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: d.products.includes(p.asin) ? 'var(--accent-bg)' : '' }}>
                    <input type="checkbox" checked={d.products.includes(p.asin)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateDraft('products', [...d.products, p.asin]);
                        } else {
                          updateDraft('products', d.products.filter(a => a !== p.asin));
                        }
                      }} />
                    <span>{p.image}</span>
                    <div style={{ flex: 1 }}>
                      <div><strong>{p.title}</strong></div>
                      <div className="muted">${p.price.toFixed(2)} &middot; {p.category}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <span className="muted">Selected: {d.products.length} product{d.products.length !== 1 ? 's' : ''}</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {d.products.map(asin => {
                    const p = PRODUCTS.find(x => x.asin === asin);
                    return <span key={asin} className="pill">{p ? p.title : asin}</span>;
                  })}
                </div>
              </div>
              {d.type === 'SP' && <div className="coach-tip">Sponsored Products campaigns use the product detail page as the ad creative.</div>}
              {d.type === 'SB' && d.adFormat === 'Product collection' && d.products.length < 2 && (
                <div className="coach-tip" style={{ marginBottom: 8 }}>Product collection requires at least 2 selected products.</div>
              )}
              {d.type !== 'SP' && (
                <div className="card pad">
                  <div className="card-title"><h2>Creative</h2><span>Brand assets</span></div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Brand name</label>
                      <input className="input full" value={d.creative.brandName || ''} onChange={(e) => updateDraft('creative', { ...d.creative, brandName: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Headline</label>
                      <input className="input full" value={d.creative.headline || ''} onChange={(e) => updateDraft('creative', { ...d.creative, headline: e.target.value })} />
                    </div>
                  </div>
                  {d.type === 'SB' && (
                    <div className="field full">
                      <label>Landing page destination</label>
                      <select className="select full" value={(d.creative as any).destination || 'Product detail page'}
                        onChange={(e) => updateDraft('creative', { ...d.creative, destination: e.target.value })}>
                        <option>Product detail page</option>
                        <option>Brand Store</option>
                        <option>Custom URL</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {wizardStep === 4 && (
            <>
              <h2>Targeting</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Set targeting mode and keywords.</p>
              <div className="form-grid">
                <div className="field">
                  <label>Targeting mode</label>
                  <select className="select full" value={d.targetingMode} onChange={(e) => updateDraft('targetingMode', e.target.value)}>
                    {d.type === 'SP' && ['Automatic', 'Manual keyword', 'Manual product'].map((x) => <option key={x}>{x}</option>)}
                    {d.type === 'SB' && ['Keyword', 'Product', 'Category'].map((x) => <option key={x}>{x}</option>)}
                    {d.type === 'SD' && ['Contextual', 'Audiences - views remarketing', 'Audiences - purchases remarketing', 'Categories'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                {d.targetingMode === 'Automatic' && (
                  <div className="card pad full" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-title"><h2>Automatic targeting</h2><span>Amazon matches your ads</span></div>
                    <p className="muted" style={{ marginBottom: 10 }}>Amazon automatically targets your ads to relevant shopper searches and product pages. Your campaign will match against these four auto target types:</p>
                    <div className="pill-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      <span className="pill active">Close match</span>
                      <span className="pill active">Loose match</span>
                      <span className="pill orange">Substitutes</span>
                      <span className="pill orange">Complements</span>
                    </div>
                    <p className="muted" style={{ marginTop: 10, fontSize: 'var(--text-xs)' }}>
                      <strong>Close match</strong> — Shoppers searching closely related terms. &nbsp;
                      <strong>Loose match</strong> — Shoppers searching loosely related terms. &nbsp;
                      <strong>Substitutes</strong> — Product detail pages of similar products. &nbsp;
                      <strong>Complements</strong> — Product detail pages of complementary products.
                    </p>
                    <div className="coach-tip" style={{ marginTop: 10 }}>After running a simulation, check Search terms to discover which auto targets drive conversions — then harvest winners into manual campaigns.</div>
                  </div>
                )}
                {(d.targetingMode === 'Manual keyword' || d.targetingMode === 'Keyword') && (
                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div className="field full">
                      <label>Exact keywords (one per line)</label>
                      <textarea className="input full" rows={4} value={d.exactKeywords} onChange={(e) => updateDraft('exactKeywords', e.target.value)} placeholder="coffee filter" />
                    </div>
                    <div className="field full">
                      <label>Phrase keywords (one per line)</label>
                      <textarea className="input full" rows={4} value={d.phraseKeywords} onChange={(e) => updateDraft('phraseKeywords', e.target.value)} placeholder="coffee maker" />
                    </div>
                    <div className="field full">
                      <label>Broad keywords (one per line)</label>
                      <textarea className="input full" rows={4} value={d.broadKeywords} onChange={(e) => updateDraft('broadKeywords', e.target.value)} placeholder="coffee" />
                    </div>
                  </div>
                )}
                {(d.targetingMode === 'Manual product' || d.targetingMode === 'Product' || d.targetingMode === 'Contextual') && (
                  <div className="field full">
                    <label>ASIN targets (one per line)</label>
                    <textarea className="input full" rows={3} value={d.asinTargets} onChange={(e) => updateDraft('asinTargets', e.target.value)} />
                  </div>
                )}
                {d.type === 'SD' && d.targetingMode === 'Categories' && (
                  <div className="field full">
                    <label>Category targets (one per line)</label>
                    <textarea className="input full" rows={3} value={d.categoryTargets} onChange={(e) => updateDraft('categoryTargets', e.target.value)} placeholder="Coffee & Espresso" />
                  </div>
                )}
                {d.type === 'SD' && d.targetingMode.includes('Audiences') && (
                  <div className="field full">
                    <label>Audience lookback window</label>
                    <select className="select full" value={d.audienceLookback || '30'} onChange={(e) => updateDraft('audienceLookback', e.target.value)}>
                      <option value="7">Last 7 days</option>
                      <option value="14">Last 14 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                  </div>
                )}
                {d.type === 'SD' && d.targetingMode.includes('Audiences') && (
                  <div className="field full">
                    <label>Audience targets (one per line)</label>
                    <textarea className="input full" rows={3} value={d.audienceTargets} onChange={(e) => updateDraft('audienceTargets', e.target.value)} placeholder="Viewed your products in the last 30 days" />
                  </div>
                )}
                {d.type === 'SD' && d.targetingMode === 'Contextual' && (
                  <div className="field full">
                    <div className="coach-tip" style={{ marginBottom: 8 }}>Amazon will automatically match your ads to relevant placements based on your selected products.</div>
                    <label style={{ marginTop: 8 }}>Exclude ASINs (optional, one per line)</label>
                    <textarea className="input full" rows={2} placeholder="B0XXXXXXX" />
                  </div>
                )}
              </div>
            </>
          )}

          {wizardStep === 5 && (
            <>
              <h2>Bidding & budget</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Set bid strategy and placement adjustments.</p>
              <div className="form-grid">
                <div className="field">
                  <label>Bid strategy</label>
                  <select className="select full" value={d.bidStrategy} onChange={(e) => updateDraft('bidStrategy', e.target.value)}>
                    {d.type === 'SP' && ['Dynamic bids - down only', 'Dynamic bids - up and down', 'Fixed bids'].map((x) => <option key={x}>{x}</option>)}
                    {d.type === 'SB' && ['Cost per click'].map((x) => <option key={x}>{x}</option>)}
                    {d.type === 'SD' && (d.targetingMode.includes('Audiences')
                      ? ['Cost per click', 'Cost per thousand impressions']
                      : ['Cost per click']).map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Default bid</label>
                  <input className="input full" type="number" min="0.02" step="0.01" value={d.defaultBid} onChange={(e) => updateDraft('defaultBid', Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Top of Search (%)</label>
                  <input className="input full" type="number" min="0" max="900" value={d.placements.top} onChange={(e) => updateDraft('placements', { ...d.placements, top: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label>Product pages (%)</label>
                  <input className="input full" type="number" min="0" max="900" value={d.placements.product} onChange={(e) => updateDraft('placements', { ...d.placements, product: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label>Rest of Search (%)</label>
                  <input className="input full" type="number" min="0" max="900" value={d.placements.rest} onChange={(e) => updateDraft('placements', { ...d.placements, rest: Number(e.target.value) })} />
                </div>
              </div>
            </>
          )}

          {wizardStep === 6 && (
            <>
              <h2>Review & launch</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Review your campaign settings before launch.</p>
              <div className="card pad">
                <div className="review-box">
                  <div className="review-row"><span>Type</span><strong>{d.type}</strong></div>
                  <div className="review-row"><span>Name</span><strong>{d.name || '(not set)'}</strong></div>
                  <div className="review-row"><span>Portfolio</span><strong>{d.portfolio || '(not set)'}</strong></div>
                  <div className="review-row"><span>Budget</span><strong>${d.dailyBudget}/day</strong></div>
                  <div className="review-row"><span>Default bid</span><strong>${d.defaultBid}</strong></div>
                  <div className="review-row"><span>Targeting</span><strong>{d.targetingMode}</strong></div>
                  <div className="review-row"><span>Bid strategy</span><strong>{d.bidStrategy}</strong></div>
                  <div className="review-row"><span>Format</span><strong>{d.adFormat}</strong></div>
                  <div className="review-row"><span>Status</span><strong>{d.status}</strong></div>
                  <div className="review-row"><span>Products</span><strong>{d.products.length} selected</strong></div>
                  {d.keywords && <div className="review-row"><span>Keywords</span><strong>{d.keywords.split('\n').filter(Boolean).length} entered</strong></div>}
                  {d.exactKeywords && <div className="review-row"><span>Exact keywords</span><strong>{d.exactKeywords.split('\n').filter(Boolean).length} entered</strong></div>}
                  {d.phraseKeywords && <div className="review-row"><span>Phrase keywords</span><strong>{d.phraseKeywords.split('\n').filter(Boolean).length} entered</strong></div>}
                  {d.broadKeywords && <div className="review-row"><span>Broad keywords</span><strong>{d.broadKeywords.split('\n').filter(Boolean).length} entered</strong></div>}
                </div>
                {!d.name.trim() && <div className="coach-tip" style={{ marginTop: 10 }}>Campaign name is required before launch.</div>}
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
            <button className="btn" disabled={wizardStep === 1} onClick={() => setWizardStep(wizardStep - 1)}>Back</button>
            <div className="pill-row">
              <button className="btn" onClick={() => { resetDraft(); }}>Reset draft</button>
              {wizardStep < 6 ? (
                <button className="btn primary" onClick={() => setWizardStep(wizardStep + 1)}>Next</button>
              ) : (
                <button className="btn primary" onClick={() => {
                  if (!d.name.trim()) return;
                  launchCampaign();
                }}>Launch campaign</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

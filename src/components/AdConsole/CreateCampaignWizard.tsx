'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import type { CampaignType, TargetingMode } from '@/engine/ad-console/types';

const STEPS = ['Ad type', 'Basics', 'Products & creative', 'Targeting', 'Bidding', 'Review'];

export function CreateCampaignWizard() {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);
  const wizardStep = useAdConsoleStore((s) => s.wizardStep);
  const setWizardStep = useAdConsoleStore((s) => s.setWizardStep);
  const launchCampaign = useAdConsoleStore((s) => s.launchCampaign);
  const resetDraft = useAdConsoleStore((s) => s.resetDraft);
  const setView = useAdConsoleStore((s) => s.setView);

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
              <h2>Creative & products</h2>
              <p className="muted" style={{ marginBottom: 14 }}>Select products and set creative content.</p>
              {d.type !== 'SP' && (
                <div className="form-grid" style={{ marginBottom: 14 }}>
                  <div className="field">
                    <label>Brand name</label>
                    <input className="input full" value={d.creative.brandName || ''} onChange={(e) => updateDraft('creative', { ...d.creative, brandName: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Headline</label>
                    <input className="input full" value={d.creative.headline || ''} onChange={(e) => updateDraft('creative', { ...d.creative, headline: e.target.value })} />
                  </div>
                </div>
              )}
              {d.type === 'SP' && <div className="coach-tip">Sponsored Products standard campaigns use the product detail page as the ad creative.</div>}
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
                    {d.type === 'SD' && ['Contextual', 'Audiences - views remarketing', 'Audiences - purchases remarketing'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                {(d.targetingMode === 'Manual keyword' || d.targetingMode === 'Keyword') && (
                  <div className="field full">
                    <label>Keywords (one per line)</label>
                    <textarea className="input full" rows={4} value={d.keywords} onChange={(e) => updateDraft('keywords', e.target.value)} placeholder="coffee filter&#10;coffee cone filter&#10;paper coffee filters" />
                  </div>
                )}
                {(d.targetingMode === 'Manual product' || d.targetingMode === 'Product' || d.targetingMode === 'Contextual') && (
                  <div className="field full">
                    <label>ASIN targets (one per line)</label>
                    <textarea className="input full" rows={3} value={d.asinTargets} onChange={(e) => updateDraft('asinTargets', e.target.value)} />
                  </div>
                )}
                {d.type === 'SD' && (
                  <div className="field full">
                    <label>Audience targets</label>
                    <textarea className="input full" rows={3} value={d.audienceTargets} onChange={(e) => updateDraft('audienceTargets', e.target.value)} placeholder="Viewed advertised products 30 days" />
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
                    {['SB', 'SD'].includes(d.type) && ['Cost per click', 'Cost per thousand impressions'].map((x) => <option key={x}>{x}</option>)}
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
                  {d.keywords && <div className="review-row"><span>Keywords</span><strong>{d.keywords.split('\n').filter(Boolean).length} entered</strong></div>}
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

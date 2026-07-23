'use client';

import { useState } from 'react';
import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS, BRANDS } from '@/engine/ad-console/core/scenarios';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

const HEADLINE_MAX = 50;

interface Step3ProductsCreativeSBProps {
  isActive: boolean;
  isComplete: boolean;
}

function ProductRow({ asin }: { asin: string }) {
  const p = PRODUCTS.find((x) => x.asin === asin);
  const draft = useAdConsoleStore((s) => s.draft);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);
  const selected = draft.products.includes(asin);
  return (
    <tr
      key={asin}
      style={{
        cursor: 'pointer',
        background: selected ? 'var(--accent-soft)' : undefined,
      }}
      onClick={() =>
        selected ? removeProductAction(asin) : selectProductAction(asin)
      }
    >
      <td>
        <input type="checkbox" checked={selected} readOnly aria-label={`Select ${asin}`} />
      </td>
      <td className="mono">{p?.asin || asin}</td>
      <td style={{ maxWidth: 240 }}>
        <Text type="body" weight="medium" maxLines={1} hasTruncateTooltip>
          {p ? `${p.image} ${p.title}` : asin}
        </Text>
      </td>
      <td className="money">${p ? p.price.toFixed(2) : '0.00'}</td>
      <td>{p?.category || ''}</td>
      <td>
        {p ? `${p.rating} (${p.reviews.toLocaleString()})` : ''}
      </td>
      <td>
        {p && (
          <Badge
            variant={p.status === 'In stock' ? 'success' : 'warning'}
            label={p.status}
          />
        )}
      </td>
    </tr>
  );
}

export function Step3ProductsCreativeSB({ isActive, isComplete }: Step3ProductsCreativeSBProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const updateDraft = useAdConsoleStore((s) => s.updateDraft);

  const [storeUrl, setStoreUrl] = useState(draft.creative.destination || '');
  const [brand, setBrand] = useState(draft.creative.brandName || '');
  const [logo, setLogo] = useState(draft.creative.logo || '');
  const [headline, setHeadline] = useState(draft.creative.headline || '');
  const [image, setImage] = useState(draft.creative.image || '');
  const [video, setVideo] = useState(draft.creative.video || '');

  const headlineFull = draft.creative.headline || '';

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Products & creative</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Select products to advertise and configure creative.
      </p>

      <Stack gap={4}>
        {!(draft.adFormat === 'Store spotlight') && (
          <Card padding={5} variant="default">
            <Stack gap={3}>
              <HStack justify="between" vAlign="baseline">
                <Text
                  type="large"
                  weight="semibold"
                  maxLines={1}
                  hasTruncateTooltip
                  as="h3"
                >
                  Product catalog
                </Text>
                <Text type="supporting" size="sm" maxLines={1}>
                  {draft.products.length} selected
                </Text>
              </HStack>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>ASIN</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.map((p) => (
                      <ProductRow key={p.asin} asin={p.asin} />
                    ))}
                  </tbody>
                </table>
              </div>
              {draft.products.length === 0 && (
                <Card padding={3} variant="red">
                  <Stack gap={1}>
                    <Text type="body" weight="semibold">
                      ⚠️ Select at least one product
                    </Text>
                    <Text type="supporting" size="sm">
                      Campaigns require at least one product to advertise.
                    </Text>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Card>
        )}

        {draft.adFormat === 'Store spotlight' && (
          <Card padding={5} variant="default">
            <Stack gap={3}>
              <Text
                type="large"
                weight="semibold"
                maxLines={1}
                hasTruncateTooltip
                as="h3"
              >
                Store spotlight
              </Text>
              <div className="field full">
                <label htmlFor="sb3-store-url">Store URL</label>
                <input
                  id="sb3-store-url"
                  className="input full"
                  type="text"
                  placeholder="https://www.amazon.com/stores/YourStore"
                  value={storeUrl}
                  onChange={(e) => {
                    setStoreUrl(e.target.value);
                    updateDraft('creative', { ...draft.creative, destination: e.target.value });
                  }}
                />
                <p className="muted" style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>
                  Visitors see your Store page. No product targeting needed.
                </p>
              </div>
            </Stack>
          </Card>
        )}

        {draft.adFormat === 'Product collection' && (
          <Card padding={5} variant="default">
            <Stack gap={3}>
              <Text
                type="large"
                weight="semibold"
                maxLines={1}
                hasTruncateTooltip
                as="h3"
              >
                Product collection creative
              </Text>
              <Stack gap={3}>
                <div className="field">
                  <label htmlFor="sb3-pc-brand">Brand</label>
                  <select
                    id="sb3-pc-brand"
                    className="select full"
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      const b = BRANDS.find((x) => x.id === e.target.value);
                      updateDraft('creative', {
                        ...draft.creative,
                        brandName: b?.name || e.target.value,
                        logo: b?.logo || '',
                      });
                    }}
                  >
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="sb3-pc-logo">Logo</label>
                  <input
                    id="sb3-pc-logo"
                    className="input full"
                    type="text"
                    value={logo}
                    onChange={(e) => {
                      setLogo(e.target.value);
                      updateDraft('creative', { ...draft.creative, logo: e.target.value });
                    }}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="sb3-pc-headline">
                    Headline <span className="muted">({headline.length}/{HEADLINE_MAX})</span>
                  </label>
                  <input
                    id="sb3-pc-headline"
                    className="input full"
                    type="text"
                    value={headline}
                    maxLength={HEADLINE_MAX}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      updateDraft('creative', { ...draft.creative, headline: e.target.value });
                    }}
                    placeholder="Discover your perfect brew"
                    style={headline.length >= HEADLINE_MAX ? { borderColor: 'var(--danger)' } : {}}
                    title={headlineFull}
                  />
                  {headline.length >= HEADLINE_MAX && (
                    <small style={{ color: 'var(--danger)' }}>
                      Maximum {HEADLINE_MAX} characters.
                    </small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="sb3-pc-destination">Destination</label>
                  <input
                    id="sb3-pc-destination"
                    className="input full"
                    type="text"
                    value={storeUrl}
                    onChange={(e) => {
                      setStoreUrl(e.target.value);
                      updateDraft('creative', { ...draft.creative, destination: e.target.value });
                    }}
                    placeholder="Brand Store URL"
                  />
                </div>
                <div className="field">
                  <label htmlFor="sb3-pc-image">Image</label>
                  <input
                    id="sb3-pc-image"
                    className="input full"
                    type="text"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      updateDraft('creative', { ...draft.creative, image: e.target.value });
                    }}
                    placeholder="Auto generated or custom"
                  />
                </div>
              </Stack>
            </Stack>
          </Card>
        )}

        {draft.adFormat === 'Video' && (
          <Card padding={5} variant="default">
            <Stack gap={3}>
              <Text
                type="large"
                weight="semibold"
                maxLines={1}
                hasTruncateTooltip
                as="h3"
              >
                Video creative
              </Text>
              <Stack gap={3}>
                <div className="field">
                  <label htmlFor="sb3-vid-brand">Brand</label>
                  <select
                    id="sb3-vid-brand"
                    className="select full"
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      const b = BRANDS.find((x) => x.id === e.target.value);
                      updateDraft('creative', {
                        ...draft.creative,
                        brandName: b?.name || e.target.value,
                        logo: b?.logo || '',
                      });
                    }}
                  >
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="sb3-vid-logo">Logo</label>
                  <input
                    id="sb3-vid-logo"
                    className="input full"
                    type="text"
                    value={logo}
                    onChange={(e) => {
                      setLogo(e.target.value);
                      updateDraft('creative', { ...draft.creative, logo: e.target.value });
                    }}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="sb3-vid-headline">
                    Headline <span className="muted">({headline.length}/{HEADLINE_MAX})</span>
                  </label>
                  <input
                    id="sb3-vid-headline"
                    className="input full"
                    type="text"
                    value={headline}
                    maxLength={HEADLINE_MAX}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      updateDraft('creative', { ...draft.creative, headline: e.target.value });
                    }}
                    placeholder="Discover your perfect brew"
                    style={headline.length >= HEADLINE_MAX ? { borderColor: 'var(--danger)' } : {}}
                    title={headlineFull}
                  />
                  {headline.length >= HEADLINE_MAX && (
                    <small style={{ color: 'var(--danger)' }}>
                      Maximum {HEADLINE_MAX} characters.
                    </small>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="sb3-vid-destination">Destination</label>
                  <input
                    id="sb3-vid-destination"
                    className="input full"
                    type="text"
                    value={storeUrl}
                    onChange={(e) => {
                      setStoreUrl(e.target.value);
                      updateDraft('creative', { ...draft.creative, destination: e.target.value });
                    }}
                    placeholder="Product detail page or Store URL"
                  />
                </div>
                <div className="field full">
                  <label htmlFor="sb3-vid-video">Video URL</label>
                  <input
                    id="sb3-vid-video"
                    className="input full"
                    type="text"
                    value={video}
                    onChange={(e) => {
                      setVideo(e.target.value);
                      updateDraft('creative', { ...draft.creative, video: e.target.value });
                    }}
                    placeholder="https://..."
                  />
                </div>
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
}

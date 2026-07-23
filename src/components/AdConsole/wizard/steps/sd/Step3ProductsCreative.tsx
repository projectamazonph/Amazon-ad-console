'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Step3ProductsCreativeSDProps {
  isActive: boolean;
  isComplete: boolean;
}

export function Step3ProductsCreativeSD({ isActive, isComplete }: Step3ProductsCreativeSDProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const selectedProducts = draft.products;
  const availableProducts = PRODUCTS.filter((p) => !selectedProducts.includes(p.asin));

  function ProductActionRow({ asin, action }: { asin: string; action: 'Add' | 'Remove' }) {
    const p = PRODUCTS.find((x) => x.asin === asin);
    return (
      <Card padding={3} variant="default" style={{ flex: 1, minWidth: 200 }}>
        <HStack gap={2} vAlign="center" style={{ minWidth: 0 }}>
          <Text type="body" size="lg">
            {p?.image || '📦'}
          </Text>
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Text type="body" weight="medium" maxLines={1} hasTruncateTooltip>
              {p?.title || asin}
            </Text>
            {p && (
              <Text type="supporting" size="sm" maxLines={1}>
                ${p.price} · {p.category}
              </Text>
            )}
          </div>
          <button
            className={action === 'Add' ? 'btn small primary' : 'btn small danger'}
            style={{ marginLeft: 'auto' }}
            onClick={() => (action === 'Add' ? selectProductAction(asin) : removeProductAction(asin))}
          >
            {action}
          </button>
        </HStack>
      </Card>
    );
  }

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Products & creative</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Select products to advertise. SD uses product detail page or video creative.
      </p>

      <Stack gap={4}>
        <Card padding={5} variant="default">
          <Stack gap={3}>
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h3">
              Selected products ({selectedProducts.length})
            </Text>
            {selectedProducts.length === 0 ? (
              <Text type="supporting" color="secondary" maxLines={1}>
                No products selected
              </Text>
            ) : (
              <Stack gap={2}>
                {selectedProducts.map((asin) => (
                  <ProductActionRow key={asin} asin={asin} action="Remove" />
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        <Card padding={5} variant="default">
          <Stack gap={3}>
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h3">
              Available products
            </Text>
            <Stack gap={2}>
              {availableProducts.map((p) => (
                <ProductActionRow key={p.asin} asin={p.asin} action="Add" />
              ))}
            </Stack>
          </Stack>
        </Card>

        <div className="coach-tip">
          Sponsored Display supports both product detail page and video creative placements.
        </div>
      </Stack>
    </div>
  );
}

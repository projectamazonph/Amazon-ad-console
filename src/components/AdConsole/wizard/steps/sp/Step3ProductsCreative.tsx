'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { PRODUCTS } from '@/engine/ad-console/core/scenarios';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Stack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface Step3ProductsCreativeProps {
  isActive: boolean;
  isComplete: boolean;
}

function ProductCard({
  product,
  asin,
  isSelected,
  onSelect,
  onRemove,
  action,
}: {
  product?: (typeof PRODUCTS)[number];
  asin: string;
  isSelected: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  action: 'Add' | 'Remove';
}) {
  return (
    <Card padding={3} variant="default" style={{ flex: 1, minWidth: 200 }}>
      <HStack gap={2} vAlign="center" style={{ minWidth: 0 }}>
        <Text type="body" size="lg">
          {product?.image || '📦'}
        </Text>
        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <Text type="body" weight="medium" maxLines={1} hasTruncateTooltip>
            {product?.title || asin}
          </Text>
          {product && (
            <Text type="supporting" size="sm" maxLines={1}>
              ${product.price} · {product.category}
            </Text>
          )}
        </div>
        <Button
          variant={action === 'Add' ? 'primary' : 'destructive'}
          size="sm"
          label={action}
          onClick={action === 'Add' ? onSelect : onRemove}
        />
      </HStack>
    </Card>
  );
}

export function Step3ProductsCreativeSP({ isActive, isComplete }: Step3ProductsCreativeProps) {
  const draft = useAdConsoleStore((s) => s.draft);
  const selectProductAction = useAdConsoleStore((s) => s.selectProduct);
  const removeProductAction = useAdConsoleStore((s) => s.removeProduct);

  const selectedProducts = draft.products;
  const availableProducts = PRODUCTS.filter((p) => !selectedProducts.includes(p.asin));

  return (
    <div
      className="wizard-step"
      style={{ display: isActive || isComplete ? 'block' : 'none' }}
    >
      <h2>Products & creative</h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Select products to advertise.
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
                {selectedProducts.map((asin) => {
                  const p = PRODUCTS.find((x) => x.asin === asin);
                  return (
                    <ProductCard
                      key={asin}
                      asin={asin}
                      product={p}
                      isSelected
                      onRemove={() => removeProductAction(asin)}
                      action="Remove"
                    />
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Card>

        <Card padding={5} variant="default">
          <Stack gap={3}>
            <Text type="large" weight="semibold" maxLines={1} hasTruncateTooltip as="h3">
              Add products
            </Text>
            <Stack gap={2}>
              {availableProducts.map((p) => (
                <ProductCard
                  key={p.asin}
                  asin={p.asin}
                  product={p}
                  isSelected={false}
                  onSelect={() => selectProductAction(p.asin)}
                  action="Add"
                />
              ))}
            </Stack>
          </Stack>
        </Card>

        <div className="coach-tip">
          Sponsored Products campaigns use the product detail page as the ad creative.
        </div>
      </Stack>
    </div>
  );
}

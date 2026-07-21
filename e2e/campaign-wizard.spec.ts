import { test, expect } from '@playwright/test';

test.describe('Create Campaign Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Create campaign")');
  });

  test('shows 6-step wizard with step 1 active', async ({ page }) => {
    await expect(page.locator('.wizard .step')).toHaveCount(6);
    await expect(page.locator('.wizard .step.active')).toContainText('1');
    await expect(page.locator('.wizard-panel')).toContainText('Choose campaign type');
  });

  test('step 1: shows SP, SB, SD choices', async ({ page }) => {
    await expect(page.locator('.choice')).toHaveCount(3);
    await expect(page.locator('.choice')).toContainText(['Sponsored Products', 'Sponsored Brands', 'Sponsored Display']);
  });

  test('step 1: selecting SP highlights it', async ({ page }) => {
    await page.click('.choice:has-text("Sponsored Products")');
    await expect(page.locator('.choice.active')).toContainText('Sponsored Products');
  });

  test('full wizard flow: create SP campaign', async ({ page }) => {
    // Step 1: Select SP
    await page.click('.choice:has-text("Sponsored Products")');
    await page.click('button:has-text("Next")');

    // Step 2: Basics
    await expect(page.locator('.wizard-panel')).toContainText('Campaign basics');
    await page.fill('input[placeholder*="SP | Manual"]', 'E2E Test Campaign');
    await page.fill('input[type="number"][min="1"]', '25');
    await page.click('button:has-text("Next")');

    // Step 3: Products
    await expect(page.locator('.wizard-panel')).toContainText('Products & creative');
    await page.click('button:has-text("Next")');

    // Step 4: Targeting
    await expect(page.locator('.wizard-panel')).toContainText('Targeting');
    await page.click('button:has-text("Next")');

    // Step 5: Bidding
    await expect(page.locator('.wizard-panel')).toContainText('Bidding');
    await page.click('button:has-text("Next")');

    // Step 6: Review
    await expect(page.locator('.wizard-panel')).toContainText('Review');
    await expect(page.locator('.review-row:has-text("Name")')).toContainText('E2E Test Campaign');
  });

  test('Back button returns to previous step', async ({ page }) => {
    await page.click('.choice:has-text("Sponsored Products")');
    await page.click('button:has-text("Next")');
    await expect(page.locator('.wizard-panel')).toContainText('Campaign basics');

    await page.click('button:text-is("Back")');
    await expect(page.locator('.wizard-panel')).toContainText('Choose campaign type');
  });

  test('Reset draft clears the form', async ({ page }) => {
    await page.click('.choice:has-text("Sponsored Products")');
    await page.click('button:has-text("Next")');
    await page.fill('input[placeholder*="SP | Manual"]', 'Test');
    await page.click('button:has-text("Reset draft")');

    // Should return to step 1
    await expect(page.locator('.wizard-panel')).toContainText('Choose campaign type');
  });

  test('Back to campaigns returns to campaign manager', async ({ page }) => {
    await page.click('button:has-text("Back to campaigns")');
    await expect(page.locator('h1')).toContainText('Campaign manager');
  });

  test('full launch flow: create and launch SP campaign', async ({ page }) => {
    // Step 1: Select SP
    await page.click('.choice:has-text("Sponsored Products")');
    await page.click('button:has-text("Next")');

    // Step 2: Basics
    await page.fill('input[placeholder*="SP | Manual"]', 'E2E Launch Test');
    await page.click('button:has-text("Next")');

    // Step 3: Products
    await page.click('button:has-text("Next")');

    // Step 4: Targeting
    await page.click('button:has-text("Next")');

    // Step 5: Bidding
    await page.click('button:has-text("Next")');

    // Step 6: Review — verify summary
    await expect(page.locator('.wizard-panel')).toContainText('Review');
    await expect(page.locator('.review-row:has-text("Name")')).toContainText('E2E Launch Test');

    // Launch campaign
    await page.click('button:has-text("Launch campaign")');

    // Should navigate to campaign detail view
    await expect(page.locator('.breadcrumb')).toContainText('E2E Launch Test');
    await expect(page.locator('.detail-header h1')).toContainText('E2E Launch Test');
    await expect(page.locator('.detail-meta')).toContainText('SP');
    await expect(page.locator('.detail-actions button:has-text("Pause")')).toBeVisible();
    await expect(page.locator('.detail-actions button:has-text("Duplicate")')).toBeVisible();
    await expect(page.locator('.detail-actions button:has-text("Archive")')).toBeVisible();

    // Detail tabs should be present (SP has 8 tabs including Placements)
    const tabCount = await page.locator('.tabs .tab').count();
    expect(tabCount).toBeGreaterThanOrEqual(7);
  });
});

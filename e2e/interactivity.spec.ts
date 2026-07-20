import { test, expect } from '@playwright/test';

// Verifies the "every entity is clickable & editable" behaviour: manager-level
// tables link through to the campaign's matching detail tab, and negatives can
// be enabled/disabled/removed.
test.describe('Cross-page interactivity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('.nav-section:has-text("Campaign Manager")');
    // Seed performance data so targets/search terms exist.
    await page.click('button:has-text("Run 7-day sim")');
    await page.waitForTimeout(700);
  });

  test('clicking a target in the manager Targeting tab opens its campaign detail', async ({ page }) => {
    await page.click('.tab:has-text("Targeting")');
    const firstTarget = page.locator('table tbody tr').first().locator('.row-link').first();
    await expect(firstTarget).toBeVisible();
    await firstTarget.click();
    // Landed on the campaign detail view, Targeting tab active.
    await expect(page.locator('.detail-header h1')).toBeVisible();
    await expect(page.locator('.tab.active')).toContainText('Targeting');
  });

  test('manager Targeting rows expose bid and status actions', async ({ page }) => {
    await page.click('.tab:has-text("Targeting")');
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow.locator('button:has-text("+10%")')).toBeVisible();
    await expect(firstRow.locator('button:has-text("Pause"), button:has-text("Enable")')).toBeVisible();
  });

  test('a negative can be disabled and re-enabled in the detail view', async ({ page }) => {
    // Open the first campaign and add a negative.
    await page.locator('table tbody tr').first().locator('.row-link').first().click();
    await page.click('.tab:has-text("Negatives")');
    await page.fill('.tab-toolbar input', 'clearance');
    await page.click('.tab-toolbar button:has-text("Add")');

    const negRow = page.locator('table tbody tr', { hasText: 'clearance' });
    await expect(negRow.locator('.pill')).toContainText('Enabled');
    await negRow.locator('button:has-text("Disable")').click();
    await expect(negRow.locator('.pill')).toContainText('Paused');
    await negRow.locator('button:has-text("Enable")').click();
    await expect(negRow.locator('.pill')).toContainText('Enabled');
  });
});

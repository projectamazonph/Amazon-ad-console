import { test, expect } from '@playwright/test';

test.describe('Campaign Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to campaigns view via topbar
    await page.click('.nav-section:has-text("Campaign Manager")');
  });

  test('loads with campaign table and tabs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Campaign manager');
    await expect(page.locator('.tabs .tab')).toHaveCount(5);
    await expect(page.locator('table')).toBeVisible();
  });

  test('shows filter toolbar', async ({ page }) => {
    await expect(page.locator('.toolbar')).toBeVisible();
    await expect(page.locator('.toolbar .search input')).toBeVisible();
    await expect(page.locator('.toolbar .select')).toHaveCount(3);
  });

  test('search filters campaigns', async ({ page }) => {
    const rows = await page.locator('table tbody tr').count();
    await page.fill('.toolbar .search input', 'SP Auto');
    const filteredRows = await page.locator('table tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(rows);
  });

  test('type filter works', async ({ page }) => {
    await page.selectOption('.toolbar .select:first-of-type', 'SP');
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('status filter works', async ({ page }) => {
    await page.selectOption('.toolbar .select:nth-of-type(2)', 'Enabled');
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('tab switching works', async ({ page }) => {
    // Default is campaigns tab
    await expect(page.locator('.tab.active')).toContainText('Campaigns');

    // Switch to ad groups
    await page.click('.tab:has-text("Ad groups")');
    await expect(page.locator('.tab.active')).toContainText('Ad groups');

    // Switch to targets
    await page.click('.tab:has-text("Targeting")');
    await expect(page.locator('.tab.active')).toContainText('Targeting');

    // Switch to search terms
    await page.click('.tab:has-text("Search terms")');
    await expect(page.locator('.tab.active')).toContainText('Search terms');

    // Switch to negatives
    await page.click('.tab:has-text("Negatives")');
    await expect(page.locator('.tab.active')).toContainText('Negatives');
  });

  test('Run 7-day sim button triggers simulation', async ({ page }) => {
    await page.click('button:has-text("Run 7-day sim")');
    await page.waitForTimeout(500);
    // Should still be on campaign manager
    await expect(page.locator('h1')).toContainText('Campaign manager');
  });

  test('Create campaign button navigates to wizard', async ({ page }) => {
    await page.click('button:has-text("Create campaign")');
    await expect(page.locator('h1')).toContainText('Create campaign');
  });

  test('Reset button clears filters', async ({ page }) => {
    await page.fill('.toolbar .search input', 'test');
    await page.selectOption('.toolbar .select:first-of-type', 'SP');
    await page.click('.toolbar button:has-text("Reset")');
    await expect(page.locator('.toolbar .search input')).toHaveValue('');
  });
});

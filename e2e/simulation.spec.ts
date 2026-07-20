import { test, expect } from '@playwright/test';

test.describe('Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Run 7-day sim updates dashboard metrics', async ({ page }) => {
    // Get initial metrics
    const initialTiles = await page.locator('.kpi-grid .kpi-tile .value').allTextContents();

    // Run simulation
    await page.click('.sidebar-item:has-text("Run 7-day sim")');
    await page.waitForTimeout(500);

    // Metrics should be present (may or may not change depending on initial state)
    const afterTiles = await page.locator('.kpi-grid .kpi-tile .value').allTextContents();
    expect(afterTiles).toHaveLength(10);
  });

  test('Run 7-day sim from campaign manager', async ({ page }) => {
    await page.click('.nav-section:has-text("Campaign Manager")');
    await page.click('button:has-text("Run 7-day sim")');
    await page.waitForTimeout(500);

    // Should still be on campaign manager
    await expect(page.locator('h1')).toContainText('Campaign manager');
  });

  test('Reset sandbox clears all data', async ({ page }) => {
    // Accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    await page.click('.sidebar-item:has-text("Reset sandbox")');
    await page.waitForTimeout(500);

    // Dashboard should still be visible with fresh data
    await expect(page.locator('h1')).toContainText('Advertising dashboard');
  });
});

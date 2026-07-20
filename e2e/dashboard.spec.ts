import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads with KPI tiles and campaign table', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Advertising dashboard');
    await expect(page.locator('.kpi-grid .kpi-tile')).toHaveCount(10);
    await expect(page.locator('table')).toBeVisible();
  });

  test('shows campaign count in table header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.section-head h2').first()).toContainText('Campaigns');
  });

  test('shows operator alerts', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.insight-list')).toBeVisible();
    await expect(page.locator('.insight')).toHaveCount(3);
  });

  test('shows training coverage pills', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pill-row .pill')).toHaveCount(7);
  });

  test('Create campaign button navigates to wizard', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Create campaign")');
    await expect(page.locator('h1')).toContainText('Create campaign');
    await expect(page.locator('.wizard')).toBeVisible();
  });
});

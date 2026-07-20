import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('topbar navigation switches views', async ({ page }) => {
    await page.goto('/');

    // Dashboard is default
    await expect(page.locator('h1')).toContainText('Advertising dashboard');

    // Navigate to campaigns via topbar
    await page.click('.nav-section:has-text("Campaign Manager")');
    await expect(page.locator('h1')).toContainText('Campaign manager');

    // Navigate to portfolios via topbar
    await page.click('.nav-section:has-text("Portfolios")');
    await expect(page.locator('h1')).toContainText('Portfolio');

    // Navigate back to dashboard via topbar
    await page.click('.nav-section:has-text("Measurement")');
    await expect(page.locator('h1')).toContainText('Advertising dashboard');
  });

  test('topbar shows global nav sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-section')).toHaveCount(3);
    await expect(page.locator('.nav-section')).toContainText(['Campaign Manager', 'Portfolios', 'Measurement']);
  });

  test('sidebar shows section items on campaigns view', async ({ page }) => {
    await page.goto('/');
    await page.click('.nav-section:has-text("Campaign Manager")');
    // Sidebar should show campaign-related items
    // 5 campaign items + 6 training-tools items + Run 7-day sim + Reset sandbox
    await expect(page.locator('.sidebar-item')).toHaveCount(13);
  });

  test('sidebar has simulation controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sidebar-item:has-text("Run 7-day sim")')).toBeVisible();
    await expect(page.locator('.sidebar-item:has-text("Reset sandbox")')).toBeVisible();
  });

  test('topbar has Create campaign button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-navbar button:has-text("Create campaign")')).toBeVisible();
  });
});

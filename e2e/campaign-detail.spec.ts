import { test, expect } from '@playwright/test';

test.describe('Campaign Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to campaign manager
    await page.click('.nav-section:has-text("Campaign Manager")');
    // Click the first campaign name to open detail
    await page.locator('.row-link').first().click();
    await expect(page.locator('.detail-header h1')).toBeVisible();
  });

  test('shows campaign detail with header and tabs', async ({ page }) => {
    await expect(page.locator('.breadcrumb')).toContainText('Campaign manager');
    await expect(page.locator('.detail-meta')).toBeVisible();
    await expect(page.locator('.detail-actions button:has-text("Pause")')).toBeVisible();
    await expect(page.locator('.detail-actions button:has-text("Duplicate")')).toBeVisible();
    await expect(page.locator('.detail-actions button:has-text("Archive")')).toBeVisible();
    await expect(page.locator('.detail-actions button:has-text("Run 7-day sim")')).toBeVisible();
    // Default tab is Ad groups
    await expect(page.locator('.tab.active')).toContainText('Ad groups');
  });

  test('tab switching works in detail view', async ({ page }) => {
    // Default active tab is Ad groups
    await expect(page.locator('.tab.active')).toContainText('Ad groups');

    // Switch to Overview
    await page.click('.tab:has-text("Overview")');
    await expect(page.locator('.tab.active')).toContainText('Overview');

    // Switch to Targeting
    await page.click('.tab:has-text("Targeting")');
    await expect(page.locator('.tab.active')).toContainText('Targeting');

    // Switch back to Ad groups
    await page.click('.tab:has-text("Ad groups")');
    await expect(page.locator('.tab.active')).toContainText('Ad groups');
  });

  test('Overview tab shows campaign settings', async ({ page }) => {
    // Default tab is Ad groups, click into Overview
    await page.click('.tab:has-text("Overview")');
    await expect(page.locator('.tab.active')).toContainText('Overview');
    await expect(page.locator('.card-title:has-text("Campaign settings")')).toBeVisible();
    await expect(page.locator('.card-title:has-text("Products")')).toBeVisible();
  });

  test('duplicate campaign creates a copy', async ({ page }) => {
    const originalName = await page.locator('.detail-header h1').textContent();
    await page.click('button:has-text("Duplicate")');

    // Wait a beat for the store update
    await page.waitForTimeout(300);
    await page.click('.breadcrumb button:has-text("Campaign manager")');
    await expect(page.locator('h1')).toContainText('Campaign manager');

    // The copied campaign should be in the list
    await expect(page.locator(`text="${originalName} (copy)"`).first()).toBeVisible();
  });

  test('Run 7-day sim works from detail view', async ({ page }) => {
    await page.click('button:has-text("Run 7-day sim")');
    await page.waitForTimeout(300);
    // Should still be on detail view
    await expect(page.locator('.detail-header h1')).toBeVisible();
  });

  test('toggle pause/enable works', async ({ page }) => {
    const pauseBtn = page.locator('button:has-text("Pause"), button:has-text("Enable")').first();
    const currentText = await pauseBtn.textContent();
    await pauseBtn.click();
    await page.waitForTimeout(300);

    // Button text should have changed
    const expected = currentText === 'Pause' ? 'Enable' : 'Pause';
    await expect(page.locator('.detail-actions button:has-text("Enable")').first()).toBeVisible({ timeout: 3000 });
  });

  test('Back button returns to campaign manager', async ({ page }) => {
    await page.click('button:has-text("Back")');
    await expect(page.locator('h1')).toContainText('Campaign manager');
  });

  test('budget rules tab shows add form', async ({ page }) => {
    await page.click('.tab:has-text("Budget rules")');
    await expect(page.locator('.tab.active')).toContainText('Budget rules');
    await expect(page.locator('button:has-text("Add rule")')).toBeVisible();
  });

  test('change history tab shows event log', async ({ page }) => {
    await page.click('.tab:has-text("Change history")');
    await expect(page.locator('.tab.active')).toContainText('Change history');
    // Should have log entries (table rows in the history tab)
    const historyRows = await page.locator('.table-wrap tbody tr').count();
    expect(historyRows).toBeGreaterThan(0);
  });

  test('placements tab visible for SP campaigns', async ({ page }) => {
    // SP campaign should have Placements tab
    await expect(page.locator('.tab:has-text("Placements")')).toBeVisible();
    await page.click('.tab:has-text("Placements")');
    await expect(page.locator('.tab.active')).toContainText('Placements');
  });
});

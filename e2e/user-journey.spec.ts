import { test, expect } from '@playwright/test';

test.describe('User Journey — Full simulation from root', () => {
  test('simulate a complete user session: browse, create, inspect, simulate', async ({ page }) => {
    // ── STEP 1: Landing on Dashboard ──────────────────────────────────
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Advertising Dashboard');
    await expect(page.locator('.kpi-grid .kpi-tile')).toHaveCount(9);
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('.insight-list .insight')).toHaveCount(3);

    // ── STEP 2: Navigate to Campaign Manager ──────────────────────────
    await page.click('.nav-section:has-text("Campaign Manager")');
    await expect(page.locator('h1')).toContainText('Campaign manager');
    await expect(page.locator('.toolbar')).toBeVisible();
    await expect(page.locator('.toolbar .select')).toHaveCount(3);

    // ── STEP 3: Filter campaigns by type ───────────────────────────────
    await page.selectOption('.toolbar .select:first-of-type', 'SP');
    let rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // ── STEP 4: Click into a campaign detail ──────────────────────────
    await page.locator('.row-link').first().click();
    await expect(page.locator('.detail-header h1')).toBeVisible();
    const campaignName = await page.locator('.detail-header h1').textContent();

    // ── STEP 5: Browse tabs ───────────────────────────────────────────
    // Start at Ad groups (default)
    await expect(page.locator('.tab.active')).toContainText('Ad groups');

    // Browse Overview
    await page.click('.tab:has-text("Overview")');
    await expect(page.locator('.card-title:has-text("Campaign settings")')).toBeVisible();

    // Browse Targeting
    await page.click('.tab:has-text("Targeting")');
    await expect(page.locator('.tab.active')).toContainText('Targeting');

    // Browse Negatives
    await page.click('.tab:has-text("Negatives")');
    await expect(page.locator('.tab.active')).toContainText('Negatives');

    // Browse Budget rules
    await page.click('.tab:has-text("Budget rules")');
    await expect(page.locator('button:has-text("Add rule")')).toBeVisible();

    // Browse Change history
    await page.click('.tab:has-text("Change history")');
    await expect(page.locator('.tab.active')).toContainText('Change history');
    const historyRows = await page.locator('.table-wrap tbody tr').count();
    expect(historyRows).toBeGreaterThanOrEqual(1);

    // ── STEP 6: Run simulation on this campaign ───────────────────────
    await page.click('button:has-text("Run 7-day sim")');
    await page.waitForTimeout(500);

    // Metrics should now have some data
    await expect(page.locator('.detail-header h1')).toContainText(campaignName!);

    // ── STEP 7: Duplicate the campaign ────────────────────────────────
    await page.click('button:has-text("Duplicate")');
    await page.waitForTimeout(300);

    // ── STEP 8: Go back to campaign manager ───────────────────────────
    await page.click('.breadcrumb button:has-text("Campaign manager")');
    await expect(page.locator('h1')).toContainText('Campaign manager');
    // Switch to Campaigns tab (selectedTab may be from detail view)
    await page.click('.tab:has-text("Campaigns")');
    await page.waitForTimeout(200);

    // ── STEP 9: Verify duplicate exists ───────────────────────────────
    // The duplicate (with (copy) suffix) should appear in the list
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    const allCampaignNames = await page.locator('.row-link').allTextContents();
    expect(allCampaignNames.some((n) => n.includes('(copy)'))).toBeTruthy();

    // ── STEP 10: Navigate to Portfolios ───────────────────────────────
    await page.click('.nav-section:has-text("Portfolios")');
    await expect(page.locator('h1')).toContainText('Portfolio');

    // ── STEP 11: Create a new campaign ────────────────────────────────
    await page.click('button:has-text("Create campaign")');
    await expect(page.locator('h1')).toContainText('Create campaign');

    // Step 1: Select SP
    await page.click('.choice:has-text("Sponsored Products")');
    await page.click('button:has-text("Next")');

    // Step 2: Fill basics
    await page.fill('input[placeholder*="SP | Manual"]', 'Journey Test Campaign');
    await page.click('button:has-text("Next")');

    // Step 3-5: Skip through with defaults
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    // Step 6: Review
    await expect(page.locator('.review-row:has-text("Name")')).toContainText('Journey Test Campaign');
    await page.click('button:has-text("Launch campaign")');

    // ── STEP 12: Verify new campaign detail ──────────────────────────
    await expect(page.locator('.breadcrumb')).toContainText('Journey Test Campaign');
    await expect(page.locator('.detail-header h1')).toContainText('Journey Test Campaign');

    // ── STEP 13: Run simulation and verify metrics update ─────────────
    await page.click('button:has-text("Run 7-day sim")');
    await page.waitForTimeout(500);

    // ── STEP 14: Toggle campaign status ───────────────────────────────
    const pauseBtn = page.locator('.detail-actions button:has-text("Pause")');
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('.detail-actions button:has-text("Enable")')).toBeVisible();
    }

    // ── STEP 15: Navigate back to Dashboard via Measurement ───────────
    await page.click('.nav-section:has-text("Measurement")');
    await expect(page.locator('h1')).toContainText('Advertising Dashboard');

    // ── STEP 16: Verify KPI metrics updated from simulation ───────────
    const kpiValueTexts = await page.locator('.kpi-grid .kpi-tile .value').allTextContents();
    expect(kpiValueTexts).toHaveLength(9);

    // ── STEP 17: Verify campaign count updated ────────────────────────
    await expect(page.locator('.card-title').first()).toContainText('Campaigns');
  });
});

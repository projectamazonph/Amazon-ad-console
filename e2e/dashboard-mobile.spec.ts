/**
 * Mobile-viewport e2e checks for the Amazon Ads Dashboard.
 *
 * Per MOBILE_REDESIGN_PLAN Phase 1 + Phase 4:
 *  - At <768px the dashboard must render CampaignCard articles, not a <table>
 *  - KPI grid must collapse to 1 column at <480px
 *  - No horizontal scroll on the campaign list region
 *  - Touch targets (44px minimum) on the action buttons when expanded
 *  - The .skip-link skip-to-main-content link remains functional at all widths
 *
 * These tests run against the mobile-chromium project (iPhone SE viewport
 * 375x800) to mirror the at-risk device class in MOBILE_REDESIGN_PLAN.
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard @ mobile (375px)', () => {
  // First compile in the dev server is slow under cold cache. Bump the
  // per-test timeout to 90s so the first test does not race cold-start.
  test.setTimeout(90000);
  test('renders CampaignCard articles instead of a table', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText('Advertising');
    await expect(page.locator('.campaign-card-list')).toBeVisible();
    const cards = page.locator('.campaign-card');
    expect(await cards.count()).toBeGreaterThan(0);
    await expect(page.locator('.app-content table')).toHaveCount(0);
  });

  test('every campaign card shows the campaign name and status', async ({ page }) => {
    await page.goto('/dashboard');
    const cards = page.locator('.campaign-card');
    // Wait for the first card to mount before counting (auto-wait on
    // .count() does not exist; await expect.poll is the explicit pattern).
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.campaign-card__name')).toBeVisible();
      // Status is rendered as a pill ('pill green' / 'pill orange' / etc.).
      // Match by accessible text content instead of class.
      await expect(card.getByText(/^(Enabled|Paused|Archived|Draft)$/)).toBeVisible();
    }
  });

  test('shows the primary metrics on each card (Spend, Sales, ROAS)', async ({ page }) => {
    await page.goto('/dashboard');
    const firstCard = page.locator('.campaign-card').first();
    await expect(firstCard).toContainText('Spend');
    await expect(firstCard).toContainText('Sales');
    await expect(firstCard).toContainText('ROAS');
  });

  test('expand toggle reveals ACOS, CPC, Orders + Pause/Archive', async ({ page }) => {
    await page.goto('/dashboard');
    const firstCard = page.locator('.campaign-card').first();
    const toggle = firstCard.locator('.campaign-card__toggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(firstCard.locator('text=CPC')).toBeVisible();
    await expect(firstCard.locator('text=ACOS')).toBeVisible();
    await expect(firstCard.locator('text=Orders')).toBeVisible();
    await expect(firstCard.locator('button:has-text("Pause")')).toBeVisible();
    await expect(firstCard.locator('button:has-text("Archive")')).toBeVisible();
  });

  test('Pause and Archive touch targets are at least 44px tall', async ({ page }) => {
    await page.goto('/dashboard');
    const firstCard = page.locator('.campaign-card').first();
    await firstCard.locator('.campaign-card__toggle').click();
    const pauseBtn = firstCard.locator('button:has-text("Pause")');
    const pauseBox = await pauseBtn.boundingBox();
    expect(pauseBox).not.toBeNull();
    expect(pauseBox!.height).toBeGreaterThanOrEqual(44);
    const archiveBtn = firstCard.locator('button:has-text("Archive")');
    const archiveBox = await archiveBtn.boundingBox();
    expect(archiveBox).not.toBeNull();
    expect(archiveBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('no horizontal scroll on the campaign list region', async ({ page }) => {
    await page.goto('/dashboard');
    const cardList = page.locator('.campaign-card-list').first();
    await expect(cardList).toBeVisible();
    const box = await cardList.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test('skip-to-main-content link remains functional', async ({ page }) => {
    await page.goto('/dashboard');
    const skip = page.locator('a.skip-link');
    await expect(skip).toHaveAttribute('href', '#main-content');
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('KPI grid is single-column at 375px', async ({ page }) => {
    await page.goto('/dashboard');
    const grid = page.locator('.kpi-grid');
    await expect(grid).toBeVisible();
    const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    const colCount = cols.trim().split(/\s+/).length;
    expect(colCount).toBe(1);
  });
});

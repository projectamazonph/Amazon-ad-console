import { test, expect } from '@playwright/test';

// Locks in the UI-AUDIT.md fixes: reachable feature pages, working measurement
// rail, and a wizard that gates garbage from launching.
test.describe('UI audit fixes', () => {
  test('training-tools rail reaches the previously-unreachable feature pages', async ({ page }) => {
    await page.goto('/');
    for (const [label, heading] of [
      ['Drills', /drill/i],
      ['Missions', /mission/i],
      ['Reports', /report/i],
      ['Bulk operations', /bulk/i],
      ['Trainer', /trainer|certification/i],
      ['Integrity', /integrity/i],
    ] as const) {
      await page.click(`.sidebar-item:has-text("${label}")`);
      await expect(page.locator('h1, h2').first()).toContainText(heading);
    }
  });

  test('Measurement rail routes Sponsored Products into a filtered Campaign Manager', async ({ page }) => {
    await page.goto('/');
    await page.click('.nav-section:has-text("Measurement")');
    await page.click('.sidebar-item:has-text("Sponsored Products")');
    await expect(page.locator('h1')).toContainText('Campaign manager');
    // Type filter is set to SP.
    await expect(page.locator('.toolbar .select').first()).toHaveValue('SP');
  });

  test('wizard blocks launching a campaign with a blank name / bad budget', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Create campaign")');
    // Step 1 → 2
    await page.click('.wizard button:has-text("Next")');
    // Step 2: clear the name → Next should disable
    const nameInput = page.locator('.wizard input').first();
    await nameInput.fill('');
    await expect(page.locator('.wizard button:has-text("Next")')).toBeDisabled();
    // Give it a name but a bad (below-minimum) budget → Next stays disabled
    await nameInput.fill('My test campaign');
    const budgetInput = page.locator('.wizard input[type="number"]').first();
    await budgetInput.fill('0');
    await expect(page.locator('.wizard button:has-text("Next")')).toBeDisabled();
    // Valid budget → Next enables
    await budgetInput.fill('25');
    await expect(page.locator('.wizard button:has-text("Next")')).toBeEnabled();
  });
});

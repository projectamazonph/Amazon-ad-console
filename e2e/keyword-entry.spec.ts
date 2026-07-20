import { test, expect } from '@playwright/test';

// One keyword box + match-type checkboxes: a single keyword can be launched
// under several match types at once.
test('one keyword launches under all three selected match types', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Create campaign")');

  // Step 1 → 2
  await page.click('.wizard button:has-text("Next")');
  // Step 2: name + budget
  await page.locator('.wizard input').first().fill('Keyword rework test');
  await page.click('.wizard button:has-text("Next")');
  // Step 3 → 4
  await page.click('.wizard button:has-text("Next")');

  // Step 4: switch to Manual keyword targeting
  await page.selectOption('.wizard select', 'Manual keyword');

  // Single keyword box + three checkboxes
  const box = page.locator('.wizard textarea');
  await expect(box).toBeVisible();
  await box.fill('coffee filter');
  const checks = page.locator('.wizard input[type="checkbox"]');
  await expect(checks).toHaveCount(3);
  // Enable all three match types (Exact is on by default)
  await checks.nth(1).check();
  await checks.nth(2).check();

  // Advance to review + launch
  await page.click('.wizard button:has-text("Next")'); // → 5
  await page.click('.wizard button:has-text("Next")'); // → 6
  await page.click('.wizard button:has-text("Launch campaign")');

  // Landed on the campaign detail; open Targeting and expect 3 rows for the one keyword
  await expect(page.locator('.detail-header h1')).toContainText('Keyword rework test');
  await page.click('.tab:has-text("Targeting")');
  const targetRows = page.locator('table tbody tr', { hasText: 'coffee filter' });
  await expect(targetRows).toHaveCount(3);
  await expect(page.locator('table tbody tr', { hasText: 'coffee filter' }).filter({ hasText: 'Exact' })).toHaveCount(1);
  await expect(page.locator('table tbody tr', { hasText: 'coffee filter' }).filter({ hasText: 'Phrase' })).toHaveCount(1);
  await expect(page.locator('table tbody tr', { hasText: 'coffee filter' }).filter({ hasText: 'Broad' })).toHaveCount(1);
});

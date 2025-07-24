import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -800)); // Auto-recorded scroll
  await page.locator('a.category-name:nth-of-type(1)').click();
  await page.evaluate(() => window.scrollBy(0, 587)); // Auto-recorded scroll
});
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 587)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('a.category-card > div.cat-image > img').click();
  await page.locator('div:text("AMD restaurant")').click();
  await page.locator('a:has-text("sandwiches  2")').click();
  await page.locator('a:has-text("idli stall 2")').click();
  await page.locator('a:has-text("vada 2")').click();
  await page.locator('a:has-text("dosaz 2")').click();
  await page.locator('a:has-text("ice creams  2")').click();
  await page.locator('a:has-text("dosa 2")').click();
  await page.locator('a:has-text("pizza 2")').click();
  await page.locator('a:has-text("vadapav 1")').click();
  await page.locator('a:has-text("sandwich 1")').click();
});
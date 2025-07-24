import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 500)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -500)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 587)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('.category-title').click();
  await page.locator('.res-name').click();
  await page.locator('text="a:has-text("sandwiches  2")"').click();
  await page.locator('text="a:has-text("idli stall 2")"').click();
  await page.locator('text="a:has-text("vada 2")"').click();
  await page.locator('text="a:has-text("dosaz 2")"').click();
  await page.locator('text="a:has-text("ice creams  2")"').click();
  await page.locator('text="a:has-text("dosa 2")"').click();
  await page.locator('text="a:has-text("pizza 2")"').click();
  await page.locator('text="a:has-text("vadapav 1")"').click();
  await page.locator('text="a:has-text("sandwich 1")"').click();
});
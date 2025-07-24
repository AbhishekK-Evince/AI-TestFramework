import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.locator('DIV').click();
  await page.locator('DIV').click();
  await page.locator('A').click();
  await page.locator('A').click();
  await page.locator('A').click();
  await page.locator('A').click();
  await page.locator('A').click();
  await page.locator('A').click();
  await page.locator('UL').click();
  await page.locator('A').click();
  await page.locator('A').click();
  await page.locator('UL').click();
  await page.locator('A').click();
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -100)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 647)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
});
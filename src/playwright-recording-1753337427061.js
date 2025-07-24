import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mrpdemo.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 600)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 400)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -900)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 600)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 700)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 600)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 500)); // Auto-recorded scroll
  await page.waitForSelector(`button:has-text("Add")`);
  await page.locator(`button:has-text("Add")`).click();
  await page.waitForSelector(`a[onclick="checkResStat();"]`);
  await page.locator(`a[onclick="checkResStat();"]`).click();
});
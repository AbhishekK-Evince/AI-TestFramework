import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mrpdemo.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 500)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 400)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -600)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
});
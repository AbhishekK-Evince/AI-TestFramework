import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mrpdemo.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 600)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -500)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.locator(`div:nth-of-type(3).accordion-item > div.accordion-collapse > div.accordion-body > div:nth-of-type(1) > div:nth-of-type(1)`).click();
  await page.locator(`button:has-text("Add")`).click();
  await page.locator(`a[onclick="checkResStat();"]`).click();
});
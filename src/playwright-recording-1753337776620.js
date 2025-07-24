import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mrpdemo.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 500)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.waitForSelector(`div:nth-of-type(1).col-xl-4 > a.box-restaurant > div.p-4 > h6.transition`);
  await page.locator(`div:nth-of-type(1).col-xl-4 > a.box-restaurant > div.p-4 > h6.transition`).click();
  await page.evaluate(() => window.scrollBy(0, -600)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 400)); // Auto-recorded scroll
  await page.waitForSelector(`div.accordion-body > div:nth-of-type(1) > div:nth-of-type(2) > button.addtocart-392`);
  await page.locator(`div.accordion-body > div:nth-of-type(1) > div:nth-of-type(2) > button.addtocart-392`).click();
  await page.waitForSelector(`a[onclick="checkResStat();"]`);
  await page.locator(`a[onclick="checkResStat();"]`).click();
});
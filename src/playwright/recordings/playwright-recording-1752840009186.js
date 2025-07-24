import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').click();
  await page.evaluate(() => window.scrollBy(0, -200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a').click();
  await page.evaluate(() => window.scrollBy(0, 547)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a').click();
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(10).menu-category > a').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(11).menu-category > a').click();
  await page.evaluate(() => window.scrollBy(0, -540)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -589)); // Auto-recorded scroll
  await page.locator('img[width="180"]:nth-of-type(1)').click();
});
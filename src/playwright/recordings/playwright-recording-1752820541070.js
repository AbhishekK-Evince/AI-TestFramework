import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').click();
  await page.evaluate(() => window.scrollBy(0, -300)); // Auto-recorded scroll
  await page.locator('div').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 647)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name').click();
});
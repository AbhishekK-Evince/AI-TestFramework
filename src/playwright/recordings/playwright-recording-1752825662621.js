import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').click();
  await page.evaluate(() => window.scrollBy(0, -200)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, -100)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 587)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name').click();
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name').click();
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.locator('path[d="M107.297 27.1543H100.616V15.0484C100.616 12.4878 99.2702 11.5777 97.188 11.5777C95.1059 11.5777 93.8907 12.6625 93.1098 13.6169V27.1556H86.4277V6.19564H93.1098V8.75635C94.368 7.28039 96.8412 5.67542 100.357 5.67542C105.129 5.67542 107.299 8.45256 107.299 12.3144V27.1543H107.297Z"]:nth-of-type(1)').click();
  await page.evaluate(() => window.scrollBy(0, -1069)); // Auto-recorded scroll
});
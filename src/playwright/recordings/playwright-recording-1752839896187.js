import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://eatanceweb.eatanceapp.com/');
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
  await page.locator('path[d="M110.215 16.6534C110.215 10.1018 115.119 5.67542 121.671 5.67542C126.183 5.67542 129.003 7.67154 130.263 9.53729L125.924 13.5725C125.1 12.3574 123.755 11.5764 121.975 11.5764C119.197 11.5764 117.07 13.4852 117.07 16.6534C117.07 19.8216 119.197 21.7735 121.975 21.7735C123.755 21.7735 125.098 20.9052 125.924 19.7344L130.263 23.8126C129.005 25.6353 126.184 27.6745 121.671 27.6745C115.119 27.6745 110.215 23.2481 110.215 16.6534Z"]:nth-of-type(1)').click();
  await page.evaluate(() => window.scrollBy(0, -1069)); // Auto-recorded scroll
});
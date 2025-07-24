import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.waitForLoadState('networkidle'); // Wait for page to be fully loaded
  await page.waitForTimeout(2000); // Added longer pause for visibility
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, -300)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.evaluate(() => window.scrollBy(0, -100)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 587)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 122)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 120)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.evaluate(() => window.scrollBy(0, -700)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.evaluate(() => window.scrollBy(0, -369)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('img[width="180"]:nth-of-type(1)').waitFor({ state: 'visible' });
  await page.locator('img[width="180"]:nth-of-type(1)').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 300)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(2).swiper-slide-next > a.category-card > span.cat-label > span.category-title').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(2).swiper-slide-next > a.category-card > span.cat-label > span.category-title').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, -300)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:has-text("Moti Mahal")').waitFor({ state: 'visible' });
  await page.locator('div:has-text("Moti Mahal")').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 200)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate(() => window.scrollBy(0, 447)); // Auto-recorded scroll
  await page.waitForTimeout(1000); // Added pause for visibility after scroll
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').waitFor({ state: 'visible' });
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').click();
  await page.waitForTimeout(2500); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.waitForTimeout(3000); // Final pause before ending test
});
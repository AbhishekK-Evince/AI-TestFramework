import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  await page.locator('#username').click();
  await page.locator('#username').fill('s');
  await page.locator('#username').fill('st');
  await page.locator('#username').fill('stu');
  await page.locator('#username').fill('stud');
  await page.locator('#username').fill('stude');
  await page.locator('#username').fill('studen');
  await page.locator('#username').fill('student');
  await page.locator('#password').click();
  await page.locator('#password').fill('P');
  await page.locator('#password').fill('Pa');
  await page.locator('#password').fill('Pas');
  await page.locator('#password').fill('Pass');
  await page.locator('#password').fill('Passw');
  await page.locator('#password').fill('Passwo');
  await page.locator('#password').fill('Passwor');
  await page.locator('#password').fill('Password');
  await page.locator('#password').fill('Password1');
  await page.locator('#password').fill('Password12');
  await page.locator('#password').fill('Password123');
  await page.evaluate(() => window.scrollBy(0, 400)); // Auto-recorded scroll
  await page.locator('#submit').click();
  await page.locator('div.post-content:nth-of-type(1)').click();
  await page.locator('a.wp-block-button__link:nth-of-type(1)').click();
  await page.evaluate(() => window.scrollBy(0, -100)); // Auto-recorded scroll
  await page.evaluate(() => window.scrollBy(0, 100)); // Auto-recorded scroll
});
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.getByRole('link', { name: 'North Indian North Indian' }).click();
  await page.getByText('Pick UpDine In AMD').click();
  await page.getByRole('heading', { name: 'MIX VEG. GRILLED' }).click();
});
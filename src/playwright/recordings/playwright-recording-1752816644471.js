import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.getByRole('link', { name: 'Indian Sweets Indian Sweets' }).click();
  await page.getByText('Moti Mahal').click();
  await page.getByRole('link', { name: 'Book Table' }).click();
  await page.getByRole('heading', { name: 'Sign In / Sign Up' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});
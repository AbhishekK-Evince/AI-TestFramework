import { test, expect } from '@playwright/test';

test('login test with optimized steps', async ({ page }) => {
  // Step 1: Navigate to the page
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  
  // Step 2: Fill login form (using fill directly without separate clicks)
  await page.getByRole('textbox', { name: 'Username' }).fill('student');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password123');
  
  // Step 3: Submit form using Enter key (adding back the missing event)
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  
  // Alternative submission method (commenting out as we're using Enter key above)
  // await page.getByRole('button', { name: 'Submit' }).click();
  
  // Step 4: Verify successful login (adding verification)
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
  
  // Step 5: Log out
  await page.getByRole('link', { name: 'Log out' }).click();
  
  // Step 6: Verify logged out successfully (adding verification)
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
});
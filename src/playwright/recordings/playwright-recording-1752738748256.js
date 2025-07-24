const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://eatanceapp.com/');
  const page1Promise = page.waitForEvent('popup');
  await page.locator('#container').getByRole('link', { name: 'Contact Us' }).click();
  const page1 = await page1Promise;
  await page1.locator('span').filter({ hasText: 'Yes' }).nth(2).click();
  await page1.getByRole('radio', { name: 'Yes' }).check();
  await page1.getByRole('textbox', { name: 'First Name' }).click();
  await page1.getByRole('textbox', { name: 'First Name' }).fill('efwwewef');
  await page1.getByRole('textbox', { name: 'Last Name' }).click();
  await page1.getByRole('textbox', { name: 'Last Name' }).fill('wfwefffw');
  await page1.getByRole('textbox', { name: 'example@example.com' }).click();
  await page1.getByRole('textbox', { name: 'example@example.com' }).fill('ef@sdf.vtb');
  await page1.getByRole('textbox', { name: 'Phone Number' }).click();
  await page1.getByRole('textbox', { name: 'Phone Number' }).fill('32424422');
  await page1.getByRole('textbox', { name: 'Restaurant / Food Business' }).click();
  await page1.getByRole('textbox', { name: 'Restaurant / Food Business' }).fill('3');
  await page1.getByRole('textbox', { name: 'Phone Number' }).click();
  await page1.getByRole('textbox', { name: 'Phone Number' }).fill('3242442233');
  await page1.getByRole('textbox', { name: 'Phone Number' }).click();
  await page1.getByRole('textbox', { name: 'Restaurant / Food Business' }).click();
  await page1.getByRole('textbox', { name: 'Restaurant / Food Business' }).fill('3safsf');
  await page1.getByRole('textbox', { name: 'Select Country' }).click();
  await page1.getByRole('option', { name: 'Afghanistan' }).click();
  await page1.getByRole('textbox', { name: 'Postal Code' }).click();
  await page1.getByRole('textbox', { name: 'Postal Code' }).fill('wefw');
  await page1.getByRole('textbox', { name: 'Select Inquiry' }).click();
  await page1.getByRole('option', { name: 'Multi Restaurant Pro (MRP)' }).click();
  await page1.getByRole('textbox', { name: 'Write Your comment or query' }).click();
  await page1.getByRole('textbox', { name: 'Write Your comment or query' }).fill('wfwfwfe');
  await page1.close();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();
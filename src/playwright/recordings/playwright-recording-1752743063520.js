const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://eatanceapp.com/');
  await page.locator('#header').getByRole('link', { name: 'Contact Us' }).click();
  await page.getByRole('textbox', { name: 'First Name' }).click();
  await page.getByRole('textbox', { name: 'First Name' }).fill('scvcwef');
  await page.getByRole('textbox', { name: 'Last Name' }).click();
  await page.getByRole('textbox', { name: 'Last Name' }).fill('wfewfwf');
  await page.getByRole('textbox', { name: 'example@example.com' }).click();
  await page.getByRole('textbox', { name: 'example@example.com' }).fill('fwefw@sfer.vfe');
  await page.getByRole('textbox', { name: 'Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Phone Number' }).fill('324243242432');
  await page.getByRole('combobox', { name: 'Select Country' }).click();
  await page.getByRole('option', { name: 'Albania' }).click();
  await page.getByRole('textbox', { name: 'Select Inquiry' }).click();
  await page.getByRole('option', { name: 'Multi Restaurant Pro (MRP)' }).click();
  await page.getByRole('textbox', { name: 'Write Your comment or query' }).click();
  await page.getByRole('textbox', { name: 'Write Your comment or query' }).fill('fwafwafewaf');
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();
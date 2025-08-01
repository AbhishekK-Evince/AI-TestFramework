import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mrpdemo.eatanceapp.com/');
  await page.waitForSelector(`a.text-nowrap`);
  await page.locator(`a.text-nowrap`).click();
  await page.waitForSelector(`div.iti__selected-dial-code`);
  await page.locator(`div.iti__selected-dial-code`).click();
  await page.waitForSelector(`div.iti__flag-container > ul.iti__country-list > li:nth-of-type(10).iti__highlight > span:nth-of-type(1).iti__country-name`);
  await page.locator(`div.iti__flag-container > ul.iti__country-list > li:nth-of-type(10).iti__highlight > span:nth-of-type(1).iti__country-name`).click();
  await page.waitForSelector(`#phone_number_inp`);
  await page.locator(`#phone_number_inp`).click();
  await page.locator(`#phone_number_inp`).fill(`6`);
  await page.locator(`#phone_number_inp`).fill(`60`);
  await page.locator(`#phone_number_inp`).fill(`604`);
  await page.locator(`#phone_number_inp`).fill(`6046`);
  await page.locator(`#phone_number_inp`).fill(`60460`);
  await page.locator(`#phone_number_inp`).fill(`604604`);
  await page.locator(`#phone_number_inp`).fill(`6046045`);
  await page.locator(`#phone_number_inp`).fill(`60460455`);
  await page.locator(`#phone_number_inp`).fill(`604604555`);
  await page.locator(`#phone_number_inp`).fill(`6046045555`);
  await page.waitForSelector(`#submit_page`);
  await page.locator(`#submit_page`).click();
  await page.waitForSelector(`#digit-1`);
  await page.locator(`#digit-1`).click();
  await page.locator(`#digit-1`).fill(`1`);
  await page.locator(`#digit-2`).fill(`2`);
  await page.locator(`#digit-3`).fill(`3`);
  await page.locator(`#digit-4`).fill(`4`);
  await page.locator(`#digit-5`).fill(`5`);
  await page.locator(`#digit-6`).fill(`6`);
  await page.waitForSelector(`#verifyotp_submit_page`);
  await page.locator(`#verifyotp_submit_page`).click();
});
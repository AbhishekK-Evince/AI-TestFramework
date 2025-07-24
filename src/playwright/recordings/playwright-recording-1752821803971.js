import { test, expect } from '@playwright/test';

// Helper function to highlight elements before interacting with them
async function highlightElement(page, selector) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      const originalBackground = element.style.backgroundColor;
      const originalBorder = element.style.border;
      const originalTransition = element.style.transition;
      element.style.backgroundColor = '#ff000044';
      element.style.border = '3px solid red';
      element.style.transition = 'all 0.5s';
      setTimeout(() => {
        element.style.backgroundColor = originalBackground;
        element.style.border = originalBorder;
        element.style.transition = originalTransition;
      }, 1000);
    }
  }, selector);
}

test('test', async ({ page }) => {
  // Force browser to stay open for debugging
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Add visual debugging to the page
  await page.addInitScript(() => {
    window.testDebug = {
      log: (message) => {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '10px';
        div.style.left = '10px';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        div.style.color = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.zIndex = '9999';
        div.style.maxWidth = '80%';
        div.style.fontSize = '16px';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
      }
    };
  });

  await page.goto('http://eatanceweb.eatanceapp.com/');
  await page.evaluate(() => window.testDebug.log('Test started: Loading homepage'));
  await page.waitForLoadState('networkidle'); // Wait for page to be fully loaded
  await page.waitForTimeout(2000); // Added longer pause for visibility
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by 300 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled down by 300px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, 300); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 1: Clicking on element');
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title');
  await page.locator('div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).swiper-slide-active > a.category-card > span.cat-label > span.category-title');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by -300 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled up by 300px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, -300); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 2: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(1).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by 587 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled down by 587px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, 587); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 3: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(2).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 4: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(3).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by 122 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled down by 122px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, 122); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 5: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(4).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 6: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(5).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by 120 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled down by 120px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, 120); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 7: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(6).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 8: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(7).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by 120 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled down by 120px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, 120); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 9: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(8).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 10: Clicking on element');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name');
  await page.locator('div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'div:nth-of-type(1).left-bar > ul.menu-category-lists > li:nth-of-type(9).menu-category > a.category-name');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by 120 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled down by 120px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, 120); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate((msg) => window.testDebug.log(msg), 'Step 11: Clicking on element');
  await page.locator('path[d="M107.297 27.1543H100.616V15.0484C100.616 12.4878 99.2702 11.5777 97.188 11.5777C95.1059 11.5777 93.8907 12.6625 93.1098 13.6169V27.1556H86.4277V6.19564H93.1098V8.75635C94.368 7.28039 96.8412 5.67542 100.357 5.67542C105.129 5.67542 107.299 8.45256 107.299 12.3144V27.1543H107.297Z"]:nth-of-type(1)').waitFor({ state: 'visible', timeout: 10000 }).catch(e => console.log('Element may not be visible yet'));
  await highlightElement(page, 'path[d="M107.297 27.1543H100.616V15.0484C100.616 12.4878 99.2702 11.5777 97.188 11.5777C95.1059 11.5777 93.8907 12.6625 93.1098 13.6169V27.1556H86.4277V6.19564H93.1098V8.75635C94.368 7.28039 96.8412 5.67542 100.357 5.67542C105.129 5.67542 107.299 8.45256 107.299 12.3144V27.1543H107.297Z"]:nth-of-type(1)');
  await page.locator('path[d="M107.297 27.1543H100.616V15.0484C100.616 12.4878 99.2702 11.5777 97.188 11.5777C95.1059 11.5777 93.8907 12.6625 93.1098 13.6169V27.1556H86.4277V6.19564H93.1098V8.75635C94.368 7.28039 96.8412 5.67542 100.357 5.67542C105.129 5.67542 107.299 8.45256 107.299 12.3144V27.1543H107.297Z"]:nth-of-type(1)').click({ force: true, timeout: 10000 }).catch(async e => {
    console.log('Click failed, trying alternate approach');
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) element.click();
    }, 'path[d="M107.297 27.1543H100.616V15.0484C100.616 12.4878 99.2702 11.5777 97.188 11.5777C95.1059 11.5777 93.8907 12.6625 93.1098 13.6169V27.1556H86.4277V6.19564H93.1098V8.75635C94.368 7.28039 96.8412 5.67542 100.357 5.67542C105.129 5.67542 107.299 8.45256 107.299 12.3144V27.1543H107.297Z"]:nth-of-type(1)');
  });
  await page.waitForTimeout(3000); // Added pause for visibility
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) { console.log('Navigation may have completed already'); }
  await page.evaluate((msg) => window.testDebug.log(msg), 'Scrolling by -1069 pixels');
  await page.evaluate((px) => {
    window.scrollBy(0, px);
    // Add a visual indicator for scrolling
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.right = '10px';
    indicator.style.top = '50%';
    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Scrolled up by 1069px';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
  }, -1069); // Auto-recorded scroll
  await page.waitForTimeout(1500); // Added pause for visibility after scroll
  await page.evaluate(() => window.testDebug.log('Test completed successfully'));
  await page.waitForTimeout(5000); // Final pause before ending test
});
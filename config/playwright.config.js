// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './generated/exports',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
    trace: 'on',
    // Lower timeout for faster feedback
    actionTimeout: 20000,
    // Don't fail on console errors
    bypassCSP: true,
  },

  /* Configure projects for browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  /* Maximum time one test can run */
  timeout: 30000,
  
  /* Look for test files with test.js extension or generated scripts */
  testMatch: ['**/*.test.js', '**/generated-script-*.js', 'generated-script-*.js', '*.js'],
  
  /* More output for debugging */
  quiet: false,
  globalSetup: require.resolve('./playwright-global-setup.js'),
}); 
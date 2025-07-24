// @ts-check
/**
 * Global setup file for Playwright tests
 * This runs once before all the tests
 */

async function globalSetup() {
  console.log('Starting global setup for Playwright tests');
  
  // Create any necessary global state here if needed
  global.testStartTime = new Date().toISOString();
  
  console.log(`Global setup complete at ${global.testStartTime}`);
  return {};
}

module.exports = globalSetup; 
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files in the exports directory
const specFiles = glob.sync(path.join(__dirname, 'exports', '*.spec.js'));
console.log(`Found ${specFiles.length} spec files to process.`);

// Process each file
let processedCount = 0;
specFiles.forEach(specFilePath => {
  try {
    const nodeFilePath = specFilePath.replace('.spec.js', '.node.js');
    console.log(`Processing ${path.basename(specFilePath)}...`);
    
    // Read the spec file content (the original test with all actions)
    const specContent = fs.readFileSync(specFilePath, 'utf8');
    
    // Generate a proper node.js test file
    const nodeContent = generateNodeJsFile(specContent, nodeFilePath);
    
    // Write the modified content back to the file
    fs.writeFileSync(nodeFilePath, nodeContent, 'utf8');
    processedCount++;
    console.log(`  Fixed test file: ${path.basename(nodeFilePath)}`);
  } catch (error) {
    console.error(`Error processing ${specFilePath}:`, error);
  }
});

console.log(`\nFinished processing ${processedCount} files.`);
console.log('All test files have been fixed.');

/**
 * Generates a proper Node.js test file from a Playwright spec file
 * @param {string} specContent The content of the spec file
 * @param {string} nodeFilePath The path to save the node.js file
 * @returns {string} The generated Node.js test file content
 */
function generateNodeJsFile(specContent, nodeFilePath) {
  const logFilePath = nodeFilePath.replace('.node.js', '.log');
  
  // Extract the test code inside the test function
  const testCodeMatch = specContent.match(/test\(['"]test['"],\s*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{([\s\S]*?)\}\);/) || 
                        specContent.match(/test\(['"].*?['"],\s*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{([\s\S]*?)\}\);/) ||
                        specContent.match(/async\s*\(\{\s*page\s*\}\)\s*=>\s*\{([\s\S]*?)\}\);/);
  let testActions = '';
  
  if (testCodeMatch && testCodeMatch[1]) {
    testActions = testCodeMatch[1].trim();
  } else {
    console.warn('Could not extract test actions, using empty test');
  }
  
  // Create a full Node.js script with proper setup and the extracted test actions
  return `// Converted from Playwright recording
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const logFile = '${logFilePath.replace(/\\/g, '\\\\')}';

// Clear the log file
fs.writeFileSync(logFile, '');

// Redirect console to both terminal and file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  const args = Array.from(arguments);
  originalConsoleLog.apply(console, args);
  fs.appendFileSync(logFile, args.join(' ') + '\\n');
};

console.error = function() {
  const args = Array.from(arguments);
  originalConsoleError.apply(console, args);
  fs.appendFileSync(logFile, 'ERROR: ' + args.join(' ') + '\\n');
};

// Add detailed logging to show each step with minimal spacing
const logStep = (stepNumber, description) => {
  console.log('-'.repeat(50));
  console.log("Step " + stepNumber + ": " + description);
  console.log('-'.repeat(50));
};

// Utility functions for scrolling
async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  console.log('✅ Scrolled to bottom of page');
}

async function scrollToTop(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  console.log('✅ Scrolled to top of page');
}

async function scrollByAmount(page, pixels) {
  await page.evaluate((px) => window.scrollBy(0, px), pixels);
  console.log('✅ Scrolled by ' + pixels + ' pixels');
}

async function scrollToElement(page, selector) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
    return false;
  }, selector);
  console.log('✅ Scrolled to element: ' + selector);
}

// Set up test timing
const testStartTime = new Date();

console.log('📊 TEST EXECUTION REPORT');
console.log('-'.repeat(50));
console.log("🕒 Test started at " + testStartTime.toLocaleString());
console.log("📂 Test file: " + path.basename('${nodeFilePath.replace(/\\/g, '\\\\')}'));
console.log('-'.repeat(50));

// Force stdout to be synchronous to avoid buffering issues
process.stdout._handle.setBlocking(true); 

(async () => {
  logStep(1, 'Setting up browser');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300 // Slow down execution by 300ms between each action
  });
  console.log('✅ Browser launched successfully');
  console.log('🌐 Browser version: ' + await browser.version());
  
  logStep(2, 'Creating browser context');
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'AI Test Framework Browser'
  });
  console.log('✅ Browser context created');
  
  logStep(3, 'Opening new page');
  const page = await context.newPage();
  console.log('✅ New page opened');
  
  try {
    logStep(4, 'Starting test execution');

    // Process each line of the test actions to add logging
    let stepCount = 5;
    const lines = testActions.split('\\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//')) continue;
      
      if (trimmedLine.includes('page.goto')) {
        const urlMatch = trimmedLine.match(/['"]([^'"]+)['"]/);
        const url = urlMatch ? urlMatch[1] : 'unknown url';
        console.log(\`    logStep(\${stepCount++}, "Navigating to \${url}");\`);
        console.log(\`    \${trimmedLine}\`);
        console.log(\`    console.log('✅ Action completed successfully');\`);
      }
      else if (trimmedLine.includes('page.waitForTimeout')) {
        const timeMatch = trimmedLine.match(/waitForTimeout\\(([^)]+)\\)/);
        const time = timeMatch ? timeMatch[1] : '500';
        console.log(\`    logStep("WAIT", "Waiting for \${time} milliseconds");\`);
        console.log(\`    \${trimmedLine}\`);
        console.log(\`    console.log('✅ Wait completed');\`);
      }
      else if (trimmedLine.includes('page.evaluate') && trimmedLine.includes('scrollBy')) {
        const scrollMatch = trimmedLine.match(/scrollBy\\(([^)]+)\\)/);
        const scrollParams = scrollMatch ? scrollMatch[1] : '0, 0';
        console.log(\`    logStep(\${stepCount++}, "Scrolling by \${scrollParams}");\`);
        console.log(\`    \${trimmedLine}\`);
        console.log(\`    console.log('✅ Scroll completed');\`);
      }
      else if (trimmedLine.includes('page.locator') && trimmedLine.includes('.click')) {
        const selectorMatch = trimmedLine.match(/locator\\(([^)]+)\\)/);
        const selector = selectorMatch ? selectorMatch[1] : 'unknown element';
        console.log(\`    logStep(\${stepCount++}, "Clicking on element \${selector}");\`);
        console.log(\`    \${trimmedLine}\`);
        console.log(\`    console.log('✅ Click completed');\`);
      }
      else if (trimmedLine.includes('page.')) {
        console.log(\`    logStep(\${stepCount++}, "Performing action: \${trimmedLine}");\`);
        console.log(\`    \${trimmedLine}\`);
        console.log(\`    console.log('✅ Action completed successfully');\`);
      }
    }

    ${testActions}
    
    // All test steps are done - now we can add the completion message
    console.log('-'.repeat(50));
    console.log("✅ TEST COMPLETED SUCCESSFULLY");
    console.log("🕒 Test ended at " + new Date().toLocaleString());
    console.log("⏱️ Total duration: " + ((new Date()) - testStartTime) / 1000 + " seconds");
    console.log('-'.repeat(50));
    
    logStep('FINAL', 'Test verification');
    console.log('✅ All test steps completed successfully');
    
    // Print a summary of what was done
    console.log('-'.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('-'.repeat(50));
    console.log('🌐 Browser: Chromium');
    console.log("🕒 Started at: " + testStartTime.toLocaleString());
    console.log("⏱️ Duration: " + ((new Date()) - testStartTime) / 1000 + " seconds");
    console.log('✅ Status: PASSED');
    console.log('-'.repeat(50));
  } catch (error) {
    console.error('❌ TEST FAILED');
    console.error("Error details: " + error.message);
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Make sure the browser cleanup happens last
    logStep('CLEANUP', 'Closing browser');
    
    // Add a final wait before closing the browser to ensure everything is visible
    console.log('Waiting 3 seconds before closing the browser...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await browser.close();
    console.log('✅ Browser closed');
    
    const testEndTime = new Date();
    console.log('-'.repeat(50));
    console.log("🏁 TEST EXECUTION COMPLETE");
    console.log("🕒 Test finished at: " + testEndTime.toLocaleString());
    console.log("⏱️ Total duration: " + (testEndTime - testStartTime) / 1000 + " seconds");
    console.log('-'.repeat(50));
    
    // Ensure output is flushed before exit
    process.stdout.write('', () => {
      console.log('Test execution complete!');
    });
  }
})();`
} 
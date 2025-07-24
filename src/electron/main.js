const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { startRecording, stopRecording, getInitialUrl } = require('../playwright/recorder');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const { exec, spawn } = require('child_process');
const glob = require('glob');
const os = require('os');
require('dotenv').config({ path: './config/.env' });
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { LangChainTracer } = require('langchain/callbacks');
const { MongoClient } = require('mongodb');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const winston = require('winston');
require('winston-mongodb');

// Add Sentry for error tracking
const Sentry = require('@sentry/electron/main');
Sentry.init({
  dsn: 'https://73705e67134cfefe6e6ac28ac9f00a66@o4509711455420416.ingest.us.sentry.io/4509711457452032',
});
// Express API error tracking
const SentryNode = require('@sentry/node');
SentryNode.init({
  dsn: 'https://73705e67134cfefe6e6ac28ac9f00a66@o4509711455420416.ingest.us.sentry.io/4509711457452032',
});

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
    ...(process.env.MONGODB_URI && process.env.MONGODB_DB ? [
      new winston.transports.MongoDB({
        db: process.env.MONGODB_URI,
        options: { useUnifiedTopology: true },
        collection: 'winston_logs',
        tryReconnect: true,
        metaKey: 'meta',
        level: 'info',
      })
    ] : [])
  ]
});

// Store recording data between sessions
const Store = require('electron-store');
const store = new Store({
  name: 'ai-test-framework-data'
});

// Main window reference
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'renderer', 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../frontend/assets/icon.svg')
  });
  
  // Update Electron window load path
  mainWindow.loadFile(path.join(__dirname, '../frontend/index.html'));
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Helper function to fix CSS selectors
function fixCssSelector(selector) {
  try {
    // Fix classes that start with numbers
    selector = selector.replace(/\.([\d])/g, '.\\3$1 ');
    
    // Fix class names with spaces like "rating4. 0251"
    selector = selector.replace(/(\.[a-zA-Z\d_-]+)\.\s*(\d+)/g, (match, prefix, number) => {
      return `${prefix}.\\3${number[0]} ${number.slice(1)}`;
    });
    
    return selector;
  } catch (error) {
    console.error('Error fixing CSS selector:', error);
    return selector;
  }
}

// Convert Playwright codegen script to proper test format
async function convertCodegenToTestFormat(filePath) {
  console.log('Converting file to Node.js compatible format: ' + filePath);
  try {
    // Read the original file
    const originalContent = await fs.readFile(filePath, 'utf8');
    
    // Create a test version of the file with proper format
    const testFilePath = filePath.replace('.spec.js', '.node.js');
    const logFilePath = filePath.replace('.spec.js', '.log');
    
    // Log the original content for debugging
    console.log('Original content:', originalContent.substring(0, 500) + '...');
    
    // Check if the content already looks like valid Playwright code
    if (originalContent.includes('const { chromium }') || originalContent.includes('const browser =')) {
      // Already in the right format, just add logging
      const modifiedContent = `// Modified Playwright script with logging
const fs = require('fs');
const path = require('path');
const logFile = '${logFilePath.replace(/\\/g, '\\\\')}';

// Clear the log file
fs.writeFileSync(logFile, '');

// Set up test timing
const testStartTime = new Date();

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
  // Use only one line of equal signs
  console.log('-'.repeat(50));
  console.log("Step " + stepNumber + ": " + description);
};

// Update how we display the test execution report
console.log('📊 TEST EXECUTION REPORT');
console.log('-'.repeat(50));
console.log("🕒 Test started at " + testStartTime.toLocaleString());
console.log("📂 Test file: " + path.basename('${testFilePath.replace(/\\/g, '\\\\')}'));
console.log('-'.repeat(50));

logStep(1, "Initializing browser");

// Add utility functions for scrolling
// These will be available in the generated tests
const scrollFunctions = `
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

`;

// Main script content with logging injected for navigation steps
${originalContent
  // Improve browser launch configuration for better visibility
  .replace(/chromium\.launch\(\{[^}]*\}\)/g, 
    `chromium.launch({
    headless: false,
    slowMo: 500, // Slow down execution for better visibility
    args: [
      '--start-maximized', 
      '--window-position=0,0',
      '--window-size=1920,1080'
    ]
  })`)
  // Improve context viewport size
  .replace(/browser\.newContext\(\{[^}]*\}\)/g,
    `browser.newContext({
    viewport: { width: 1600, height: 900 },
    userAgent: 'AI Test Framework Browser'
  })`)
  // Add logging for page navigation
  .replace(/await page\.goto\(['"]([^'"]+)['"]\)/g, 
    (match, url) => `logStep(2, "Navigating to ${url.replace(/"/g, '\\"')}");\n${match}`
  )
  // Add logging for waitForTimeout
  .replace(/await page\.waitForTimeout\((\d+)\)/g,
    (match, timeout) => `logStep("WAIT", "Waiting for ${timeout} milliseconds");\n${match}`
  )
  // Add logging for waitFor* operations
  .replace(/await page\.(waitForSelector|waitForNavigation|waitForLoadState)\(([^)]+)\)/g,
    (match, waitType, params) => `logStep("WAIT", "Waiting for ${waitType.replace('waitFor', '')} ${params.replace(/"/g, '\\"')}");\n${match}`
  )
  // Add logging for complex click operations
  .replace(/await page\.(getByRole|getByText|getByTestId|getByLabel|getByPlaceholder|getByAltText|getByTitle|getByDisplayValue|locator)\(([^)]*)\)\.click\(([^)]*)\)/g,
    (match, locatorType, locatorParams, clickParams) => {
      let description = `Clicking on ${locatorType} element`;
      if (locatorParams.includes("name:")) {
        const nameMatch = locatorParams.match(/name: ['"]([^'"]+)['"]/);
        if (nameMatch) description = `Clicking on ${locatorType} '${nameMatch[1]}'`;
      } else if (locatorParams.match(/['"]([^'"]+)['"]/)) {
        const textMatch = locatorParams.match(/['"]([^'"]+)['"]/);
        if (textMatch) description = `Clicking on '${textMatch[1]}'`;
        
        // Fix CSS selectors if this is a locator with CSS
        if (locatorType === 'locator' && textMatch) {
          // Get the selector and fix it
          const selector = textMatch[1];
          const fixedSelector = fixCssSelector(selector);
          
          // Replace the selector in the match if needed
          if (selector !== fixedSelector) {
            match = match.replace(`'${selector}'`, `'${fixedSelector}'`);
          }
        }
      }
      return `logStep("ACTION", "${description.replace(/"/g, '\\"')}");\n${match}`;
    }
  )
  // Add logging for complex other operations
  .replace(/await page\.(getByRole|getByText|getByTestId|getByLabel|getByPlaceholder|getByAltText|getByTitle|getByDisplayValue|locator)\(([^)]*)\)\.(fill|type|check|uncheck|selectOption|setInputFiles|press|hover|dblclick)\(([^)]*)\)/g,
    (match, locatorType, locatorParams, actionType, actionParams) => {
      let description = `${actionType} action on ${locatorType} element`;
      if (locatorParams.includes("name:")) {
        const nameMatch = locatorParams.match(/name: ['"]([^'"]+)['"]/);
        if (nameMatch) description = `${actionType} action on ${locatorType} '${nameMatch[1]}'`;
      } else if (locatorParams.match(/['"]([^'"]+)['"]/)) {
        const textMatch = locatorParams.match(/['"]([^'"]+)['"]/);
        if (textMatch) description = `${actionType} action on '${textMatch[1]}'`;
      }
      return `logStep("ACTION", "${description.replace(/"/g, '\\"')}");\n${match}`;
    }
  )
  // Add logging for simple page actions
  .replace(/await page\.(click|fill|check|uncheck|selectOption|setInputFiles|press|hover|dblclick)\(([^)]+)\)/g,
    (match, action, params) => `logStep("ACTION", "Performing ${action} operation with params: ${params.replace(/"/g, '\\"')}");\n${match}`
  )
  // Add logging for evaluate operations
  .replace(/await page\.evaluate\(\(\) => window\.scrollBy\(([^)]+)\)\)/g,
    (match, scrollParams) => `logStep("SCROLL", "Scrolling by ${scrollParams}");\n${match}`
  )
}

// Define a function to log the test completion
async function logTestCompletion() {
  console.log('-'.repeat(50));
  console.log("✅ TEST COMPLETED SUCCESSFULLY");
  console.log("🕒 Test ended at " + new Date().toLocaleString());
  console.log("⏱️ Total duration: " + ((new Date()) - testStartTime) / 1000 + " seconds");
}

// Add the completion call at the end of the script
// Look for browser.close() and add our completion call before it
${originalContent.includes('browser.close') ? 
  `// Add completion call before browser close
process.on('beforeExit', logTestCompletion);` : 
  `// Add completion call at the end
logTestCompletion();`}
`;
      
      await fs.writeFile(testFilePath, modifiedContent, 'utf8');
      console.log('Modified original script with logging');
      return { 
        scriptPath: testFilePath, 
        logPath: logFilePath 
      };
    }
    
    // Otherwise create a simple script that can be executed directly
    let testContent = `// Converted from Playwright recording
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
console.log("📂 Test file: " + path.basename('${testFilePath.replace(/\\/g, '\\\\')}'));
console.log('-'.repeat(50));

// Force stdout to be synchronous to avoid buffering issues
process.stdout._handle.setBlocking(true); 

(async () => {
  logStep(1, 'Setting up browser');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down execution for better visibility
    args: [
      '--start-maximized', 
      '--window-position=0,0',
      '--window-size=1920,1080'
    ]
  });
  console.log('✅ Browser launched successfully');
  console.log('🌐 Browser version: ' + await browser.version());
  
  logStep(2, 'Creating browser context');
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    userAgent: 'AI Test Framework Browser'
  });
  console.log('✅ Browser context created');
  
  logStep(3, 'Opening new page');
  const page = await context.newPage();
  console.log('✅ New page opened');
  
  try {
    logStep(4, 'Starting test execution');

`;
  
    // Extract code between test('test', async ({ page }) => { and });
    const testCodeMatch = originalContent.match(/test\([^{]+{\s*([\s\S]+?)\s*}\s*\);/);
    
    if (testCodeMatch && testCodeMatch[1]) {
      // We found the test code, now extract all the commands
      const testCode = testCodeMatch[1].trim();
      
      // Split into lines and process each action
      const lines = testCode.split('\n');
      let stepCount = 5;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines or comments
        if (!trimmedLine || trimmedLine.startsWith('//')) {
          continue;
        }
        
        // Process based on action type
        if (trimmedLine.includes('page.goto')) {
          // Handle page.goto action
          const urlMatch = trimmedLine.match(/['"]([^'"]+)['"]/);
          const url = urlMatch ? urlMatch[1] : 'unknown-url';
          testContent += `    logStep(${stepCount++}, "Navigating to ${url}");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Action completed successfully');\n\n`;
        }
        else if (trimmedLine.includes('page.waitForTimeout')) {
          // Handle waitForTimeout action
          const timeoutMatch = trimmedLine.match(/waitForTimeout\((\d+)\)/);
          const timeout = timeoutMatch ? timeoutMatch[1] : '500';
          testContent += `    logStep(${stepCount++}, "Waiting for ${timeout} milliseconds");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Action completed successfully');\n\n`;
        }
        else if (trimmedLine.includes('page.evaluate') && trimmedLine.includes('scrollBy')) {
          // Handle scroll action
          const scrollMatch = trimmedLine.match(/scrollBy\(([^)]+)\)/);
          const scrollParams = scrollMatch ? scrollMatch[1] : '0, 0';
          testContent += `    logStep(${stepCount++}, "Scrolling by ${scrollParams}");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Scroll completed successfully');\n\n`;
        }
        else if (trimmedLine.includes('page.locator') && trimmedLine.includes('.click')) {
          // Handle click action using locator
          const selectorMatch = trimmedLine.match(/locator\(([^)]+)\)/);
          const selector = selectorMatch ? selectorMatch[1] : 'unknown-element';
          // Properly escape quotes for the log message
          const escapedSelector = selector.replace(/"/g, '\\"');
          testContent += `    logStep(${stepCount++}, "Clicking on element ${escapedSelector}");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Click completed successfully');\n\n`;
        }
        else if (trimmedLine.includes('page.locator') && trimmedLine.includes('.fill')) {
          // Handle fill action using locator
          const selectorMatch = trimmedLine.match(/locator\(([^)]+)\)/);
          const valueMatch = trimmedLine.match(/fill\(([^)]+)\)/);
          const selector = selectorMatch ? selectorMatch[1] : 'unknown-element';
          const value = valueMatch ? valueMatch[1] : 'unknown-value';
          // Properly escape quotes for the log message
          const escapedSelector = selector.replace(/"/g, '\\"');
          const escapedValue = value.replace(/"/g, '\\"');
          testContent += `    logStep(${stepCount++}, "Filling ${escapedSelector} with ${escapedValue}");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Fill completed successfully');\n\n`;
        }
        else if (trimmedLine.includes('page.')) {
          // Handle any other page actions
          const actionMatch = trimmedLine.match(/page\.([a-zA-Z]+)/);
          const action = actionMatch ? actionMatch[1] : 'unknown-action';
          testContent += `    logStep(${stepCount++}, "Performing ${action} action");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Action completed successfully');\n\n`;
        }
        else if (trimmedLine.includes('await')) {
          // Handle any other await statements
          const escapedLine = trimmedLine.replace(/"/g, '\\"');
          testContent += `    logStep(${stepCount++}, "Executing: ${escapedLine}");\n`;
          testContent += `    ${trimmedLine}\n`;
          testContent += `    console.log('✅ Execution completed');\n\n`;
        }
      }
    } else {
      // If we don't find any Playwright code, create a simple test
      console.log('No Playwright code found, creating a simple test');
      testContent += `    logStep(5, "Navigating to example.com");
    await page.goto('https://example.com');
    console.log('✅ Navigation completed');
    
    logStep(6, "Capturing screenshot");
    await page.screenshot({ path: '${path.join(path.dirname(logFilePath), 'screenshot.png').replace(/\\/g, '\\\\')}' });
    console.log('📸 Screenshot captured');
`;
    }
  
    // Add success message and cleanup
    testContent += `
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
})();
`;
    
    // Write the new test file
    await fs.writeFile(testFilePath, testContent, 'utf8');
    
    // Log the converted content
    console.log('Converted test content:', testContent.substring(0, 500) + '...');
    console.log('Converted test file written to: ' + testFilePath);
    
    return { 
      scriptPath: testFilePath, 
      logPath: logFilePath 
    };
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
}

// Process scroll data and add it to the test script
async function processScrollData(scriptPath, scrollData) {
  console.log('Processing scroll data for', scriptPath);
  
  try {
    // Read the script file
    const content = await fs.readFile(scriptPath, 'utf8');
    
    // Find all goto operations to determine where to insert scroll commands
    const pageGotoMatches = content.match(/page\.goto\([^)]+\)/g) || [];
    
    if (pageGotoMatches.length === 0) {
      console.log('No page.goto found in script, cannot add scroll commands');
      return content;
    }
    
    // Find the end of the first goto statement
    const gotoIndex = content.indexOf(pageGotoMatches[0]);
    if (gotoIndex === -1) {
      console.log('Could not locate goto statement in content');
      return content;
    }
    
    const gotoEndIndex = content.indexOf(';', gotoIndex);
    if (gotoEndIndex === -1) {
      console.log('Could not find end of goto statement');
      return content;
    }
    
    // Generate scroll commands with waits
    let scrollCommands = '';
    if (scrollData && scrollData.length > 0) {
      scrollData.forEach(data => {
        if (data.type === 'scroll' && data.x !== undefined && data.y !== undefined) {
          scrollCommands += `\n  await page.evaluate(() => window.scrollBy(${data.x}, ${data.y})); // Auto-recorded scroll`;
          scrollCommands += `\n  await page.waitForTimeout(500); // Default wait after scrolling`;
        }
      });
    }
    
    // Insert the scroll commands after the goto statement
    let modifiedContent = content.slice(0, gotoEndIndex + 1) + 
                          scrollCommands + 
                          content.slice(gotoEndIndex + 1);
    
    // Ensure all page actions have wait times
    modifiedContent = modifiedContent.replace(
      /(await page\.[^;]*;)(?!\s*await page\.waitForTimeout)/g,
      (match, action) => {
        // Don't add wait after an existing waitForTimeout
        if (action.includes('waitForTimeout(')) {
          return match;
        }
        return `${action}\n  await page.waitForTimeout(500); // Auto-added wait`;
      }
    );
    
    return modifiedContent;
  } catch (error) {
    console.error('Error processing scroll data:', error);
    return content; // Return original content if there's an error
  }
}

// Start Playwright codegen recording
ipcMain.handle('start-codegen', async (event, url) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting Playwright codegen with URL:', url);
      // Log the current working directory
      console.log('Current working directory:', process.cwd());
      
      // Log user home directory for debugging
      console.log('User home directory:', os.homedir());
      
      // Run playwright codegen with explicit output path
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const outputFilePath = path.join(__dirname, `../playwright/recordings/playwright-recording-${Date.now()}.js`);
      console.log('Setting output path to:', outputFilePath);
      
      // Check if we should use our custom recorder (with scroll tracking)
      const useCustomRecorder = true;
      
      if (useCustomRecorder) {
        // Use our custom recorder with scroll tracking
        try {
          const recorder = require('../playwright/recorder');
          
          // Start the recording in background
          console.log('Starting custom recording with scroll tracking');
          
          (async () => {
            try {
              await recorder.startRecording(url);
              
              // Wait for user to close the browser window manually
              // This is handled by the exportCodegenBtn.onclick in the renderer
            } catch (err) {
              console.error('Custom recording error:', err);
            }
          })();
          
          // Store the timestamp for later when exporting
          global.lastRecordingTimestamp = Date.now();
          global.lastRecordingUrl = url;
          global.recordingOutputPath = null; // Reset the path until recording is finished
          
          // Return success so UI can continue
          resolve({ 
            success: true,
            outputPath: outputFilePath,
            customRecording: true
          });
        } catch (recErr) {
          console.error('Failed to use custom recorder:', recErr);
          console.log('Falling back to standard Playwright codegen');
          useCustomRecorder = false;
        }
      }
      
      if (!useCustomRecorder) {
        // Standard Playwright codegen approach
        const childProcess = exec(`npx playwright codegen ${url} --output "${outputFilePath}"`);
        
        // Log standard output and error for debugging
        childProcess.stdout.on('data', (data) => {
          console.log('Codegen stdout:', data);
        });
        
        childProcess.stderr.on('data', (data) => {
          console.log('Codegen stderr:', data);
        });
        
        childProcess.on('close', (code) => {
          console.log('Playwright codegen process exited with code:', code);
          if (code === 0) {
            resolve({ 
              success: true,
              outputPath: outputFilePath
            });
          } else {
            reject(new Error('Playwright codegen exited with code ' + code));
          }
        });
        
        childProcess.on('error', (err) => {
          console.error('Failed to start Playwright codegen:', err);
          reject(new Error('Failed to start Playwright codegen: ' + err.message));
        });
      }
    } catch (error) {
      console.error('Failed to execute Playwright codegen:', error);
      reject(new Error('Failed to execute Playwright codegen: ' + error.message));
    }
  });
});

// Export the recording file
ipcMain.handle('export-codegen', async (event, lastRecordingPath) => {
  try {
    console.log('Exporting codegen to spec file, source:', lastRecordingPath || 'unknown');
    
    // Look for the most recent recording file if none specified
    let sourcePath = lastRecordingPath;
    if (!sourcePath) {
      // Check if we have a global recording path from our custom recorder
      if (global.recordingOutputPath && await fs.pathExists(global.recordingOutputPath)) {
        console.log('Using stored recording path:', global.recordingOutputPath);
        sourcePath = global.recordingOutputPath;
      } else {
        // Fall back to file system search
        const recordingFiles = await glob(path.join(__dirname, '../playwright/recordings/playwright-recording-*.js'));
        if (recordingFiles.length > 0) {
          // Sort files by modification time (newest first)
          recordingFiles.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime);
          sourcePath = recordingFiles[0];
        }
      }
    }
    
    if (!sourcePath || !await fs.pathExists(sourcePath)) {
      console.error('No recording file found to export');
      return {
        success: false,
        error: 'No recording file found to export'
      };
    }
    
    console.log('Using source file:', sourcePath);
    
    // Create timestamp-based filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const exportPath = path.join(__dirname, '../../generated/exports', `test-${timestamp}.spec.js`);
    console.log('Export path:', exportPath);
    
    // Create exports directory if it doesn't exist
    await fs.ensureDir(path.dirname(exportPath));
    
    // Read the recording file
    const scriptContent = await fs.readFile(sourcePath, 'utf8');
    
    // Modify content to fix paths and add any necessary imports
    let modifiedContent = scriptContent;
    
    // Add imports if not present
    if (!modifiedContent.includes('@playwright/test')) {
      modifiedContent = `import { test, expect } from '@playwright/test';\n\n${modifiedContent}`;
    }
    
    // Fix headless setting if present - make sure tests open a visible browser
    modifiedContent = modifiedContent.replace(
      /chromium\.launch\(\s*{(\s*headless:\s*true\s*,?|\s*)}/g, 
      'chromium.launch({ headless: false }'
    );
    
    // Create the spec file
    const tempOutputPath = path.join(path.dirname(exportPath), 'temp-output.js');
    await fs.writeFile(tempOutputPath, modifiedContent, 'utf8');
    
    // Now check for scroll data
    let scrollDataPath = sourcePath + '.scroll.json';
    if (await fs.pathExists(scrollDataPath)) {
      console.log('Found scroll data, incorporating into test');
      try {
        const scrollData = JSON.parse(await fs.readFile(scrollDataPath, 'utf8'));
        console.log('Scroll data loaded, events:', scrollData.length);
        
        let updatedContent = await processScrollData(tempOutputPath, scrollData);
        await fs.writeFile(exportPath, updatedContent, 'utf8');
      } catch (scrollError) {
        console.error('Error processing scroll data:', scrollError);
        await fs.copy(tempOutputPath, exportPath);
      }
    } else {
      // Just use the unmodified file
      await fs.copy(tempOutputPath, exportPath);
    }
    
    // Clean up temp file
    try {
      await fs.remove(tempOutputPath);
    } catch (e) {
      console.error('Failed to remove temp file:', e);
    }
    
    // Add this test to the list of recordings
    const recordings = store.get('recordings', []);
    recordings.unshift({
      name: path.basename(exportPath),
      path: exportPath,
      date: new Date().toISOString()
    });
    
    // Keep only the 20 most recent recordings
    store.set('recordings', recordings.slice(0, 20));
    
    console.log('Export completed successfully:', exportPath);
    
    // Make sure we add wait times to the generated script
    await ensureWaitTimesInScript(exportPath);
    
    // Add this test to the list of codegen recordings in MongoDB
    if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
      try {
        const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
        await client.connect();
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection('codegen_recordings');
        await collection.insertOne({
          name: path.basename(exportPath),
          path: exportPath,
          date: new Date().toISOString(),
          content: scriptContent
        });
        await client.close();
      } catch (mongoErr) {
        console.error('MongoDB insert error (codegen_recordings):', mongoErr);
      }
    }
    
    return {
      success: true,
      path: exportPath
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Get recent recordings
ipcMain.handle('get-recent-recordings', async () => {
  try {
    const recordings = store.get('recordings', []);
    
    // Filter out recordings that no longer exist on disk
    const validRecordings = recordings.filter(recording => {
      return fs.existsSync(recording.path);
    });
    
    // Update store if some recordings were removed
    if (validRecordings.length !== recordings.length) {
      store.set('recordings', validRecordings);
    }
    
    return validRecordings;
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
});

// Open a recording in the default editor
ipcMain.handle('open-recording', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error opening file:', error);
    return { success: false, error: error.message };
  }
});

// Add scroll command to test file
ipcMain.handle('add-scroll-command', async (event, testOutput, scrollCommand, description) => {
  try {
    console.log('Adding scroll command:', scrollCommand, 'Description:', description);
    
    // Try to find the most recent test file from exports directory
    const exportsDir = path.join(__dirname, '../../generated/exports');
    const files = await fs.readdir(exportsDir);
    
    // Get .node.js files and sort by modification time (newest first)
    const nodeJsFiles = files
      .filter(file => file.endsWith('.node.js'))
      .map(file => path.join(exportsDir, file))
      .filter(file => fs.existsSync(file));
    
    if (nodeJsFiles.length === 0) {
      console.error('No test files found in exports directory');
      return { success: false, error: 'No test files found in exports directory' };
    }
    
    nodeJsFiles.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime);
    const mostRecentTest = nodeJsFiles[0];
    console.log('Most recent test file:', mostRecentTest);
    
    // Read the file content
    const content = await fs.readFile(mostRecentTest, 'utf8');
    
    // Find a good insertion point - right before the completion message
    const insertPoint = content.indexOf('    // All test steps are done');
    if (insertPoint === -1) {
      // Alternative insertion point
      const altInsertPoint = content.indexOf('    console.log("-".repeat(50));');
      if (altInsertPoint === -1) {
        console.error('Could not find insertion point in test file');
        return { success: false, error: 'Could not find insertion point in test file' };
      }
    }
    
    // Get the next step number
    const stepMatches = content.match(/logStep\((\d+),/g);
    let nextStep = 5;
    if (stepMatches && stepMatches.length > 0) {
      const lastStepMatch = stepMatches[stepMatches.length - 1];
      // Extract the number from logStep(X,
      const stepNumStr = lastStepMatch.replace('logStep(', '').replace(',', '');
      const lastStepNum = parseInt(stepNumStr, 10);
      if (!isNaN(lastStepNum)) {
        nextStep = lastStepNum + 1;
      }
    }
    console.log('Next step number:', nextStep);
    
    // Create the new command with step logging
    const newCommand = `
    logStep(${nextStep}, "${description}");
    await ${scrollCommand}
    console.log('✅ Action completed successfully');\n\n`;
    
    // Insert the command at the insertion point
    let newContent;
    if (insertPoint !== -1) {
      newContent = content.slice(0, insertPoint) + newCommand + content.slice(insertPoint);
    } else {
      // Find the try/catch block
      const tryIndex = content.lastIndexOf('  try {');
      const catchIndex = content.lastIndexOf('  } catch (error) {');
      
      if (tryIndex !== -1 && catchIndex !== -1 && tryIndex < catchIndex) {
        // Insert before the catch block
        newContent = content.slice(0, catchIndex) + newCommand + content.slice(catchIndex);
      } else {
        // Insert at the end of the file as a fallback
        const lastBrace = content.lastIndexOf('}');
        if (lastBrace !== -1) {
          newContent = content.slice(0, lastBrace) + newCommand + content.slice(lastBrace);
        } else {
          newContent = content + newCommand;
        }
      }
    }
    
    console.log('Writing updated content to file');
    // Write the updated content back to the file
    await fs.writeFile(mostRecentTest, newContent, 'utf8');
    
    console.log('Scroll command added successfully');
    return { success: true };
  } catch (error) {
    console.error('Error adding scroll command:', error);
    return { success: false, error: error.message };
  }
});

// Function to ensure that any generated test script has wait times
async function ensureWaitTimesInScript(scriptPath) {
  console.log('Ensuring wait times are present in script:', scriptPath);
  
  try {
    // Read the file content
    let content = await fs.readFile(scriptPath, 'utf8');
    
    // Check if the script already has wait statements
    if (content.includes('await page.waitForTimeout(')) {
      console.log('Script already has wait times.');
      return;
    }
    
    // Add wait statements after each page action
    const modifiedContent = content.replace(
      /(await page\.[^;]*;)(?!\s*await page\.waitForTimeout)/g,
      (match, action) => {
        // Don't add wait after an existing waitForTimeout
        if (action.includes('waitForTimeout(')) {
          return match;
        }
        return `${action}\n  await page.waitForTimeout(500); // Auto-added wait`
      }
    );
    
    // Write the modified content back to the file
    await fs.writeFile(scriptPath, modifiedContent, 'utf8');
    console.log('Added wait times to script:', scriptPath);
  } catch (error) {
    console.error('Error adding wait times to script:', error);
  }
}

// Run a test using Playwright
ipcMain.handle('run-test', async (event, filePath) => {
  try {
    console.log('Running test file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Test file does not exist: ${filePath}`
      };
    }
    
    // Convert the file to a node.js compatible format if it's a spec file
    let testOutput;
    if (filePath.endsWith('.spec.js')) {
      const converted = await convertCodegenToTestFormat(filePath);
      testOutput = converted.scriptPath;
    } else if (filePath.endsWith('.node.js')) {
      // Already converted, use as is
      testOutput = filePath;
    } else {
      return {
        success: false,
        error: `Unsupported file type: ${path.extname(filePath)}`
      };
    }
    
    console.log('Running node', JSON.stringify(testOutput));
    
    // Set environment variables to control browser visibility
    const env = {
      ...process.env,
      // PWDEBUG: '1', // Remove debug mode by default
      HEADLESS: 'false',
      SLOWMO: '500' // Slow down by 500ms between actions for visibility
    };
    
    // Run the test with node
    return new Promise((resolve) => {
      const testProcess = spawn('node', [testOutput], {
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      testProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log('Test stdout:', chunk);
      });
      
      testProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        error += chunk;
        console.error('Test stderr:', chunk);
      });
      
      testProcess.on('close', (code) => {
        console.log(`Test exited with code ${code}, duration: ${Date.now() - startTime}ms`);
        console.log(`Output captured: ${output.length} chars`);
        console.log(`Final output length: ${output.length}`);
        console.log(`First 100 chars of output: ${output.substring(0, 100)}`);
        
        resolve({
          success: code === 0,
          code,
          output: output || error,
          error: error || null,
          duration: Date.now() - startTime
        });
      });
      
      const startTime = Date.now();
    });
    
  } catch (error) {
    console.error('Error running test:', error);
    return {
      success: false,
      error: error.message
    };
  }
}); 

ipcMain.handle('stop-recording', async (event) => {
  try {
    console.log('Stopping custom recording');
    const recorder = require('../playwright/recorder');
    const result = await recorder.stopRecording();
    
    if (result && result.outputPath) {
      console.log('Recording stopped and saved to:', result.outputPath);
      global.recordingOutputPath = result.outputPath;
      return { 
        success: true, 
        outputPath: result.outputPath 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error stopping recording:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}); 

// --- AI Test Case Generation API (Node.js, Express) ---
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const upload = multer({ dest: 'uploads/' });

let serverStarted = false;
function startApiServer() {
  if (serverStarted) return;
  const app = express();
  // SentryNode request handler (removed in v8+)
  // app.use(SentryNode.Handlers.requestHandler());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Add Sentry context for each request (IP, URL, headers, body)
  app.use((req, res, next) => {
    SentryNode.getCurrentScope().setContext('request', {
      ip: req.ip,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
    });
    // Example: set a static user (replace with real user info if available)
    SentryNode.getCurrentScope().setUser({ id: 'anonymous', ip_address: req.ip });
    next();
  });

  // Winston logging middleware for all API requests
  app.use((req, res, next) => {
    logger.info({
      message: 'API Request',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      headers: req.headers,
      body: req.body
    });
    next();
  });

  // Add Winston error logging for API errors
  app.use((err, req, res, next) => {
    logger.error({
      message: 'API Error',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      headers: req.headers,
      body: req.body,
      error: err.stack || err.message || err
    });
    next(err);
  });

  // OpenAI setup
  const tracer = new LangChainTracer({ projectName: process.env.LANGCHAIN_PROJECT || 'ai-test-case-generation' });
  const llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
    callbacks: [tracer],
  });

  const baseConfigs = {
    dashboard_functional: {
      prefix: 'TC_FUNC',
      description: 'functional test cases focusing on valid inputs and expected behaviors',
      count: 20
    },
    dashboard_negative: {
      prefix: 'TC_NEG',
      description: 'negative test cases focusing on invalid inputs, error handling, and edge cases',
      count: 20
    },
    dashboard_ui: {
      prefix: 'TC_UI',
      description: 'UI test cases focusing on visual elements and layout',
      count: 15
    },
    dashboard_ux: {
      prefix: 'TC_UX',
      description: 'user experience test cases focusing on user interaction and workflow',
      count: 15
    },
    dashboard_compatibility: {
      prefix: 'TC_COMPAT',
      description: 'compatibility test cases across different browsers and platforms',
      count: 15
    },
    dashboard_performance: {
      prefix: 'TC_PERF',
      description: 'performance test cases focusing on load times and responsiveness',
      count: 15
    }
  };

  app.post('/api/generate-test-cases', upload.single('imageFile'), async (req, res) => {
    try {
      let data = req.body;
      let sourceType = data.sourceType;
      let testCaseTypes = data.testCaseTypes || [];
      if (typeof testCaseTypes === 'string') testCaseTypes = [testCaseTypes];
      let testCases = '';
      let userInput = { ...data, testCaseTypes };
      if (sourceType === 'jira') {
        // --- Fetch Jira issue details ---
        const jiraUrl = data.jiraUrl;
        const jiraUser = data.jiraUser;
        const jiraToken = data.jiraToken;
        const itemIds = (data.itemId || '').split(',').map(id => id.trim()).filter(Boolean);
        let jiraContent = '';
        for (const itemId of itemIds) {
          try {
            const apiUrl = jiraUrl.replace(/\/$/, '') + '/rest/api/3/issue/' + itemId;
            const resp = await axios.get(apiUrl, {
              auth: { username: jiraUser, password: jiraToken },
              headers: { 'Accept': 'application/json' }
            });
            const issue = resp.data;
            jiraContent += `Jira Issue: ${itemId}\nSummary: ${issue.fields.summary}\nDescription: ${issue.fields.description && issue.fields.description.content ? JSON.stringify(issue.fields.description.content) : ''}\n`;
          } catch (jiraErr) {
            return res.json({ success: false, error: `Failed to fetch Jira issue ${itemId}: ${jiraErr.response && jiraErr.response.data && jiraErr.response.data.errorMessages ? jiraErr.response.data.errorMessages.join('; ') : jiraErr.message}` });
          }
        }
        if (!jiraContent) {
          return res.json({ success: false, error: 'No Jira issue data found.' });
        }
        let allTestCases = [];
        for (const type of testCaseTypes) {
          const config = baseConfigs[type];
          if (!config) continue;
          const prompt = `Task Title: ${itemIds.join(', ')}\nTask Description: ${jiraContent}\n\nGenerate EXACTLY ${config.count} ${config.description}.\n\nFor each test case:\n1. Use the prefix ${config.prefix}\n2. Focus exclusively on ${type} scenarios\n3. Include detailed steps\n4. Specify expected results\n5. Do not mix with other test types\n\nUse this EXACT format for each test case:\n\nTitle: ${config.prefix}_[Number]_[Brief_Title]\nScenario: [Detailed scenario description]\nSteps to reproduce:\n1. [Step 1]\n2. [Step 2]\n...\nExpected Result: [What should happen]\nActual Result: [To be filled during execution]\nPriority: [High/Medium/Low]`;
          const fullPrompt = 'You are a helpful QA test case generator.\n\n' + prompt;
          const tracer = new LangChainTracer({ projectName: process.env.LANGCHAIN_PROJECT || 'ai-test-case-generation' });
          const response = await llm.invoke(fullPrompt, { callbacks: [tracer] });
          if (response.content) {
            allTestCases.push(`TEST TYPE: ${type}\n\n${response.content}`);
          }
        }
        testCases = allTestCases.join('\n\n');
      } else if (sourceType === 'azure') {
        // --- Fetch Azure DevOps work item details ---
        const azureOrg = data.azureOrg;
        const azureProject = data.azureProject;
        const azurePat = data.azurePat;
        const itemIds = (data.itemId || '').split(',').map(id => id.trim()).filter(Boolean);
        let azureContent = '';
        for (const itemId of itemIds) {
          try {
            const apiUrl = `https://dev.azure.com/${azureOrg}/${azureProject}/_apis/wit/workitems/${itemId}?api-version=7.0`;
            const resp = await axios.get(apiUrl, {
              headers: {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(':' + azurePat).toString('base64')
              }
            });
            const workItem = resp.data;
            azureContent += `Azure Work Item: ${itemId}\nTitle: ${workItem.fields['System.Title']}\nDescription: ${workItem.fields['System.Description'] || ''}\n`;
          } catch (azureErr) {
            return res.json({ success: false, error: `Failed to fetch Azure work item ${itemId}: ${azureErr.response && azureErr.response.data && azureErr.response.data.message ? azureErr.response.data.message : azureErr.message}` });
          }
        }
        if (!azureContent) {
          return res.json({ success: false, error: 'No Azure work item data found.' });
        }
        let allTestCases = [];
        for (const type of testCaseTypes) {
          const config = baseConfigs[type];
          if (!config) continue;
          const prompt = `Task Title: ${itemIds.join(', ')}\nTask Description: ${azureContent}\n\nGenerate EXACTLY ${config.count} ${config.description}.\n\nFor each test case:\n1. Use the prefix ${config.prefix}\n2. Focus exclusively on ${type} scenarios\n3. Include detailed steps\n4. Specify expected results\n5. Do not mix with other test types\n\nUse this EXACT format for each test case:\n\nTitle: ${config.prefix}_[Number]_[Brief_Title]\nScenario: [Detailed scenario description]\nSteps to reproduce:\n1. [Step 1]\n2. [Step 2]\n...\nExpected Result: [What should happen]\nActual Result: [To be filled during execution]\nPriority: [High/Medium/Low]`;
          const fullPrompt = 'You are a helpful QA test case generator.\n\n' + prompt;
          const tracer = new LangChainTracer({ projectName: process.env.LANGCHAIN_PROJECT || 'ai-test-case-generation' });
          const response = await llm.invoke(fullPrompt, { callbacks: [tracer] });
          if (response.content) {
            allTestCases.push(`TEST TYPE: ${type}\n\n${response.content}`);
          }
        }
        testCases = allTestCases.join('\n\n');
      } else if (sourceType === 'manual') {
        let allTestCases = [];
        for (const type of testCaseTypes) {
          const config = baseConfigs[type];
          if (!config) continue;
          const prompt = `Task Title: Manual Test Case\nTask Description: ${data.manualDescription}\nSteps: ${data.manualSteps}\nExpected: ${data.manualExpected}\n\nGenerate EXACTLY ${config.count} ${config.description}.\n\nFor each test case:\n1. Use the prefix ${config.prefix}\n2. Focus exclusively on ${type} scenarios\n3. Include detailed steps\n4. Specify expected results\n5. Do not mix with other test types\n\nUse this EXACT format for each test case:\n\nTitle: ${config.prefix}_[Number]_[Brief_Title]\nScenario: [Detailed scenario description]\nSteps to reproduce:\n1. [Step 1]\n2. [Step 2]\n...\nExpected Result: [What should happen]\nActual Result: [To be filled during execution]\nPriority: [High/Medium/Low]`;
          const fullPrompt = 'You are a helpful QA test case generator.\n\n' + prompt;
          const tracer = new LangChainTracer({ projectName: process.env.LANGCHAIN_PROJECT || 'ai-test-case-generation' });
          const response = await llm.invoke(fullPrompt, { callbacks: [tracer] });
          if (response.content) {
            allTestCases.push(`TEST TYPE: ${type}\n\n${response.content}`);
          }
        }
        testCases = allTestCases.join('\n\n');
      } else if (sourceType === 'image') {
        // --- OCR with Tesseract.js ---
        if (!req.file) {
          return res.json({ success: false, error: 'No image file uploaded.' });
        }
        const imagePath = req.file.path;
        let extractedText = '';
        try {
          const ocrResult = await Tesseract.recognize(imagePath, 'eng');
          extractedText = ocrResult.data.text;
        } catch (ocrErr) {
          return res.json({ success: false, error: 'OCR failed: ' + ocrErr.message });
        } finally {
          // Clean up uploaded file
          fs.unlink(imagePath, () => {});
        }
        if (!extractedText.trim()) {
          return res.json({ success: false, error: 'No text found in image.' });
        }
        let allTestCases = [];
        for (const type of testCaseTypes) {
          const config = baseConfigs[type];
          if (!config) continue;
          const prompt = `Task Title: Image-based Test Case\nTask Description: ${extractedText}\n\nGenerate EXACTLY ${config.count} ${config.description}.\n\nFor each test case:\n1. Use the prefix ${config.prefix}\n2. Focus exclusively on ${type} scenarios\n3. Include detailed steps\n4. Specify expected results\n5. Do not mix with other test types\n\nUse this EXACT format for each test case:\n\nTitle: ${config.prefix}_[Number]_[Brief_Title]\nScenario: [Detailed scenario description]\nSteps to reproduce:\n1. [Step 1]\n2. [Step 2]\n...\nExpected Result: [What should happen]\nActual Result: [To be filled during execution]\nPriority: [High/Medium/Low]`;
          const fullPrompt = 'You are a helpful QA test case generator.\n\n' + prompt;
          const tracer = new LangChainTracer({ projectName: process.env.LANGCHAIN_PROJECT || 'ai-test-case-generation' });
          const response = await llm.invoke(fullPrompt, { callbacks: [tracer] });
          if (response.content) {
            allTestCases.push(`TEST TYPE: ${type}\n\n${response.content}`);
          }
        }
        testCases = allTestCases.join('\n\n');
      }
      // --- Store in MongoDB ---
      if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
        try {
          const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
          await client.connect();
          const db = client.db(process.env.MONGODB_DB);
          const collection = db.collection('testcase_generator');
          await collection.insertOne({
            sourceType,
            testCaseTypes,
            userInput,
            generatedTestCases: testCases,
            codegenFile: req.body.codegenFile || '',
            timestamp: new Date()
          });
          await client.close();
        } catch (mongoErr) {
          console.error('MongoDB insert error:', mongoErr);
        }
      }
      res.json({ success: true, testCases });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // --- Test Case History API ---
  app.get('/api/testcase-history', async (req, res) => {
    if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
      return res.json({ success: false, error: 'MongoDB not configured.' });
    }
    try {
      const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB);
      const collection = db.collection('testcase_generator');
      const history = await collection.find({}).sort({ timestamp: -1 }).limit(500).toArray();
      await client.close();
      res.json({ success: true, history });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // --- List available codegen files ---
  app.get('/api/list-codegen-files', async (req, res) => {
    try {
      const codegenDirs = [path.join(__dirname, '../../generated/exports'), path.join(__dirname, '../playwright')];
      let files = [];
      for (const dir of codegenDirs) {
        if (fs.existsSync(dir)) {
          files = files.concat(fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => path.join(path.basename(dir), f)));
        }
      }
      res.json({ success: true, files });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });
  // --- Get codegen file content ---
  app.get('/api/get-codegen-file', async (req, res) => {
    try {
      const file = req.query.file;
      if (!file) return res.json({ success: false, error: 'No file specified.' });

      let filePath = file;
      // If file looks like a MongoDB ObjectId, look up the path in codegen_recordings
      if (/^[a-fA-F0-9]{24}$/.test(file)) {
        const { MongoClient, ObjectId } = require('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
        await client.connect();
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection('codegen_recordings');
        const doc = await collection.findOne({ _id: new ObjectId(file) });
        await client.close();
        if (!doc || !doc.path) return res.json({ success: false, error: 'Codegen file not found in DB.' });
        filePath = doc.path;
      }

      // Try absolute path first
      if (!fs.existsSync(filePath)) {
        // Try relative to project root (__dirname)
        const path = require('path');
        const relPath = path.isAbsolute(filePath) ? path.relative(process.cwd(), filePath) : filePath;
        const tryPath = path.join(__dirname, relPath);
        if (fs.existsSync(tryPath)) {
          filePath = tryPath;
        } else {
          // Try to fetch content from MongoDB by path
          if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
            await client.connect();
            const db = client.db(process.env.MONGODB_DB);
            const collection = db.collection('codegen_recordings');
            const doc = await collection.findOne({ path: filePath });
            await client.close();
            if (doc && doc.content) {
              return res.json({ success: true, content: doc.content });
            }
          }
          return res.json({ success: false, error: 'File not found.' });
        }
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ success: true, content });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });
  // --- Generate Playwright Script API ---
  app.post('/api/generate-automation-script', async (req, res) => {
    try {
      const { testCases, userInput, codegenContent, framework } = req.body;
      if (!testCases || !framework) {
        return res.json({ success: false, error: 'Missing test cases or framework.' });
      }
      let allScripts = '';
      if (framework === 'playwright') {
        // Split testCases into individual cases (by 'Title:' marker)
        const cases = testCases.split(/\n\s*Title:/).map((c, i) => (i === 0 ? c : 'Title:' + c)).filter(c => c.includes('Title:'));
        for (const testCase of cases) {
          const prompt = `You are an expert Playwright automation engineer.\nGiven the following test case and a Playwright codegen file, generate a Playwright test function in JavaScript.\n\n- Only include the steps from the codegen file that are required to execute the test case.\n- Omit any unrelated or extra steps.\n- Do not include steps for actions not mentioned in the test case.\n- Use the selectors and structure from the codegen file wherever possible.\n- Use best practices, correct selectors, and realistic locators.\n- Use comments to indicate where selectors may need to be updated.\n\nTest Case:\n${testCase}\n\nPlaywright Codegen File:\n${codegenContent}\n\nOutput ONLY the Playwright test function, nothing else.`;
          // Create a new tracer for each LLM call to avoid LangSmith 409 Conflict
          const tracer = new LangChainTracer({ projectName: process.env.LANGCHAIN_PROJECT || 'ai-test-case-generation' });
          const response = await llm.invoke(prompt, { callbacks: [tracer] });
          if (response.content) {
            allScripts += response.content + '\n\n';
          }
        }
      } else {
        return res.json({ success: false, error: 'Unsupported framework.' });
      }
      // Store in MongoDB as before...
      if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
        try {
          const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
          await client.connect();
          const db = client.db(process.env.MONGODB_DB);
          const collection = db.collection('generated_scripts');
          await collection.insertOne({
            sourceType: req.body.sourceType || '',
            testCaseTypes: req.body.testCaseTypes || [],
            userInput: userInput,
            script: allScripts,
            codegenFile: req.body.codegenFile || '',
            timestamp: new Date()
          });
          await client.close();
        } catch (mongoErr) {
          console.error('MongoDB insert error (scripts):', mongoErr);
        }
      }
      res.json({ success: true, script: allScripts });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });
  // --- Fetch all generated scripts ---
  app.get('/api/generated-scripts', async (req, res) => {
    if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
      return res.json({ success: false, error: 'MongoDB not configured.' });
    }
    try {
      const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB);
      const collection = db.collection('generated_scripts');
      const scripts = await collection.find({}).sort({ timestamp: -1 }).limit(500).toArray();
      await client.close();
      res.json({ success: true, scripts });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // Place this after all routes, before any error-handling middleware
  SentryNode.setupExpressErrorHandler(app);

  app.listen(3000, () => {
    console.log('AI Test Case Generation API running on http://localhost:3000');
  });
  serverStarted = true;
}

startApiServer(); 
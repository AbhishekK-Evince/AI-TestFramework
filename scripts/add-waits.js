const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files in the exports directory
const testFiles = glob.sync(path.join(__dirname, 'exports', '*.spec.js'));
console.log(`Found ${testFiles.length} test files to process.`);

// Process each file
let processedCount = 0;
testFiles.forEach(filePath => {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file already has wait statements
    if (content.includes('await page.waitForTimeout(')) {
      console.log(`  File already has wait statements, skipping.`);
      return;
    }
    
    // Add wait statements after each action
    const modifiedContent = content.replace(
      /(await page\.[^;]*;)\s*/g, 
      (match, action) => {
        // Don't add wait after an existing waitForTimeout
        if (action.includes('waitForTimeout(')) {
          return match;
        }
        return `${action}\n  await page.waitForTimeout(500);\n  \n  `;
      }
    );
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    processedCount++;
    console.log(`  Added wait times to ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log(`\nFinished processing ${processedCount} files.`);
console.log('Wait times have been added to all test scripts.'); 
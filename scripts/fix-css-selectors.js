/**
 * Fix CSS Selectors Script
 * 
 * This script finds and fixes problematic CSS selectors in test files:
 * - Selectors with spaces in class names
 * - Numeric classes that need escaping
 * - Other invalid CSS syntax
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Utility to fix CSS selectors
function fixCssSelector(selector) {
  try {
    // Fix 1: Classes that start with numbers need escaping
    // Replace patterns like ".4rating" with ".\\34 rating"
    selector = selector.replace(/\.([\d])/g, '.\\3$1 ');
    
    // Fix 2: Handle spaces in class names like "rating4. 0251"
    // which should be "rating4.\\30 251"
    selector = selector.replace(/(\.[a-zA-Z\d_-]+)\.\s*(\d+)/g, (match, prefix, number) => {
      return `${prefix}.\\3${number[0]} ${number.slice(1)}`;
    });
    
    return selector;
  } catch (error) {
    console.error('Error fixing CSS selector:', error);
    return selector;
  }
}

// Process a single file
async function processFile(filePath) {
  console.log(`Processing file: ${filePath}`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Find locator calls with CSS selectors
    const locatorRegex = /page\.locator\(['"]([^'"]+)['"]\)/g;
    let match;
    let modified = false;
    let newContent = content;
    
    while ((match = locatorRegex.exec(content)) !== null) {
      const originalSelector = match[1];
      const fixedSelector = fixCssSelector(originalSelector);
      
      // If the selector was fixed, update it in the content
      if (originalSelector !== fixedSelector) {
        console.log(`\nFIXED SELECTOR in ${filePath}:`);
        console.log(`  Original: ${originalSelector}`);
        console.log(`  Fixed:    ${fixedSelector}`);
        
        // Replace the original selector with the fixed one
        newContent = newContent.replace(
          `page.locator('${originalSelector}')`,
          `page.locator('${fixedSelector}')`
        );
        modified = true;
      }
    }
    
    // Save the file if modifications were made
    if (modified) {
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log(`✅ Updated file: ${filePath}`);
      return true;
    } else {
      console.log(`✓ No selector issues found in: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Searching for test files...');
  
  try {
    // Find all test files in the exports directory
    const testFiles = glob.sync('exports/**/*.{node.js,spec.js,test.js}');
    console.log(`Found ${testFiles.length} test files`);
    
    if (testFiles.length === 0) {
      console.log('No test files found. Exiting.');
      return;
    }
    
    let fixedCount = 0;
    
    // Process each file
    for (const file of testFiles) {
      const wasFixed = await processFile(file);
      if (wasFixed) fixedCount++;
    }
    
    console.log('\n✅ CSS Selector Fix Summary:');
    console.log(`- Processed ${testFiles.length} test files`);
    console.log(`- Fixed selectors in ${fixedCount} files`);
    console.log(`- ${testFiles.length - fixedCount} files were already good`);
    
  } catch (error) {
    console.error('❌ Error searching for test files:', error);
  }
}

// Run the script
main().then(() => {
  console.log('✅ CSS selector fixing completed');
}).catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
}); 
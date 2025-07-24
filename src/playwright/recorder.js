const { chromium, devices } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

// Global recording state
let browser, page, context;
let steps = [];
let initialUrl = '';
let scrollPositions = [];
let lastScrollY = 0;
const scrollThreshold = 100; // Minimum pixels scrolled before recording a new event

/**
 * Start recording a Playwright session with scroll tracking
 * @param {string} url - The URL to navigate to
 * @param {string} device - Optional device emulation
 */
async function startRecording(url = 'https://example.com', device = null) {
  initialUrl = url;
  browser = await chromium.launch({ headless: false });
  context = device ? await browser.newContext({ ...devices[device] }) : await browser.newContext();
  page = await context.newPage();
  steps = [];
  scrollPositions = [];

  // Expose recordStep function to the page context
  await page.exposeFunction('recordStep', (step) => {
    console.log('Recording step:', step);
    steps.push(step);
  });

  // Expose recordScroll function to the page context
  await page.exposeFunction('recordScroll', (scrollY, timestamp) => {
    // Only record if we've scrolled past the threshold
    if (Math.abs(scrollY - lastScrollY) >= scrollThreshold) {
      console.log('Recording scroll:', scrollY);
      scrollPositions.push({ scrollY, timestamp });
      lastScrollY = scrollY;
    }
  });

  // Add a helper function to generate better selectors
  await page.addInitScript(() => {
    // Helper to get the best selector for an element
    window.getBestSelector = (element) => {
      if (!element) return null;
      
      // Verify uniqueness of a selector
      const isUnique = (selector) => {
        try {
          const elements = document.querySelectorAll(selector);
          return elements.length === 1 && elements[0] === element;
        } catch (e) {
          return false;
        }
      };

      // Try ID first - most specific
      if (element.id) {
        const idSelector = `#${element.id}`;
        if (isUnique(idSelector)) return idSelector;
      }
      
      // Try data attributes which are often used for testing
      for (const attr of ['data-testid', 'data-test', 'data-cy', 'data-qa']) {
        if (element.getAttribute(attr)) {
          const dataSelector = `[${attr}="${element.getAttribute(attr)}"]`;
          if (isUnique(dataSelector)) return dataSelector;
        }
      }
      
      // Try by aria attributes
      if (element.getAttribute('aria-label')) {
        const ariaSelector = `[aria-label="${element.getAttribute('aria-label')}"]`;
        if (isUnique(ariaSelector)) return ariaSelector;
      }
      
      // Try with alt text for images
      if (element.tagName === 'IMG' && element.alt) {
        const imgSelector = `img[alt="${element.alt}"]`;
        if (isUnique(imgSelector)) return imgSelector;
      }
      
      // If it's a button or link with text content, use that with role
      if ((element.tagName === 'BUTTON' || element.tagName === 'A') && element.textContent.trim()) {
        const text = element.textContent.trim();
        const roleSelector = `${element.tagName.toLowerCase()}:has-text("${text}")`;
        if (isUnique(roleSelector)) return roleSelector;
      }
      
      // If element has text content, create a text-based selector
      if (element.textContent && element.textContent.trim()) {
        const text = element.textContent.trim();
        if (text.length < 50) {
          // Use text content combined with tag for uniqueness
          const textSelector = `${element.tagName.toLowerCase()}:has-text("${text}")`;
          if (isUnique(textSelector)) return textSelector;
        }
      }
      
      // Try to create a unique selector with both tag and class
      if (element.className && typeof element.className === 'string' && element.className.trim()) {
        const classes = element.className.trim().split(/\s+/);
        
        // Try each class for uniqueness
        for (const cls of classes) {
          const classSelector = `.${cls}`;
          
          // If element has text content and class, combine them for specificity
          if (element.textContent && element.textContent.trim()) {
            const text = element.textContent.trim();
            if (text.length < 30) {
              const combinedSelector = `${classSelector}:has-text("${text}")`;
              if (isUnique(combinedSelector)) return combinedSelector;
            }
          }
          
          // Check if this single class is unique enough
          if (isUnique(`${element.tagName.toLowerCase()}${classSelector}`)) {
            return `${element.tagName.toLowerCase()}${classSelector}`;
          }
        }
        
        // Try with position-based selector using a specific class
        const classSelector = `.${classes[0]}`;
        const sameClassElements = document.querySelectorAll(`${element.tagName.toLowerCase()}${classSelector}`);
        if (sameClassElements.length > 1 && sameClassElements.length < 10) {
          // Find the index of this element among siblings with same class
          let index = 0;
          for (let i = 0; i < sameClassElements.length; i++) {
            if (sameClassElements[i] === element) {
              index = i;
              break;
            }
          }
          // Use nth-of-type for better specificity
          const nthSelector = `${element.tagName.toLowerCase()}${classSelector}:nth-of-type(${index + 1})`;
          if (isUnique(nthSelector)) return nthSelector;
        }
      }
      
      // Try by position if we have a parent with ID or unique class
      const parent = element.parentElement;
      if (parent) {
        // Try to get a good parent selector recursively (limited depth)
        const getParentSelector = (el, depth = 0) => {
          if (!el || depth > 2) return null;
          
          // Try parent ID
          if (el.id) {
            const parentIdSelector = `#${el.id}`;
            if (isUnique(parentIdSelector)) return parentIdSelector;
          }
          
          // Try parent with class
          if (el.className && typeof el.className === 'string' && el.className.trim()) {
            const parentClasses = el.className.trim().split(/\s+/);
            for (const cls of parentClasses) {
              const parentClassSelector = `${el.tagName.toLowerCase()}.${cls}`;
              if (isUnique(parentClassSelector)) return parentClassSelector;
            }
          }
          
          // Try parent with text content
          if (el.textContent && el.textContent.trim()) {
            const text = el.textContent.trim();
            if (text.length < 30) {
              const parentTextSelector = `${el.tagName.toLowerCase()}:has-text("${text}")`;
              if (isUnique(parentTextSelector)) return parentTextSelector;
            }
          }
          
          // Try with grandparent
          return getParentSelector(el.parentElement, depth + 1);
        };
        
        const parentSelector = getParentSelector(parent);
        if (parentSelector) {
          // Find position among siblings
          const siblings = Array.from(parent.children).filter(child => 
            child.tagName === element.tagName
          );
          
          if (siblings.length > 0) {
            const index = siblings.indexOf(element);
            if (index !== -1) {
              const childSelector = `${parentSelector} > ${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
              if (isUnique(childSelector)) return childSelector;
            }
          }
        }
      }
      
      // Use a combination of attributes to create a unique selector
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        if (attr.name !== 'class' && attr.name !== 'style' && attr.name !== 'id') {
          const attrSelector = `${element.tagName.toLowerCase()}[${attr.name}="${attr.value}"]`;
          if (isUnique(attrSelector)) return attrSelector;
        }
      }
      
      // Fall back to a CSS path with classes and position info
      let path = [];
      let current = element;
      let i = 0;
      
      while (current && current.nodeType === Node.ELEMENT_NODE && i < 4) {
        let selector = current.tagName.toLowerCase();
        
        // Add position to make selector more specific
        const siblings = current.parentElement ? Array.from(current.parentElement.children).filter(
          node => node.tagName === current.tagName
        ) : [];
        
        if (siblings.length > 1) {
          const position = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${position})`;
        }
        
        // Add class if available and not too complex
        if (current.className && typeof current.className === 'string' && current.className.trim()) {
          const classes = current.className.trim().split(/\s+/);
          if (classes.length === 1) {
            selector += `.${classes[0]}`;
          } else if (classes.length > 1) {
            // Try to pick a class that seems most specific/unique
            const mostSpecificClass = classes.find(cls => document.querySelectorAll(`.${cls}`).length < 10);
            if (mostSpecificClass) {
              selector += `.${mostSpecificClass}`;
            }
          }
        }
        
        path.unshift(selector);
        current = current.parentElement;
        i++;
      }
      
      const cssPath = path.join(' > ');
      if (isUnique(cssPath)) return cssPath;
      
      // Final fallback: use a position-based selector for the element directly
      const positionSelector = getPositionBasedSelector(element);
      if (isUnique(positionSelector)) return positionSelector;
      
      // If all else fails, return the tag name with index
      return element.tagName.toLowerCase();
    };
    
    // Helper function to create position-based selectors
    function getPositionBasedSelector(element) {
      // Get the element's position in the DOM
      const allElementsOfType = document.querySelectorAll(element.tagName);
      let index = 0;
      for (let i = 0; i < allElementsOfType.length; i++) {
        if (allElementsOfType[i] === element) {
          index = i;
          break;
        }
      }
      
      return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
    }
  });

  // Add event tracking to the page
  await page.addInitScript(() => {
    // Record clicks
    document.addEventListener('click', (e) => {
      // First try to get the exact element that was clicked
      let targetElement = e.target;
      let selector = window.getBestSelector(targetElement);
      
      // If the selector is too generic (just a tag name like 'div', 'span'), try to find a better one
      if (selector && (selector === targetElement.tagName.toLowerCase() || 
                      selector === `${targetElement.tagName.toLowerCase()}:nth-of-type(1)`)) {
        // Try to use nearest parent with a better selector
        let parent = targetElement.parentElement;
        let depth = 0;
        
        // Look up to 3 levels up for a better selector
        while (parent && depth < 3) {
          const parentSelector = window.getBestSelector(parent);
          // Check if the parent selector is good (not just a tag name)
          if (parentSelector && 
              parentSelector !== parent.tagName.toLowerCase() && 
              parentSelector.includes('.') || parentSelector.includes('#') || 
              parentSelector.includes(':has-text')) {
            // Create a selector that combines parent with child position
            const childElements = Array.from(parent.children).filter(child => 
              child.tagName === targetElement.tagName
            );
            if (childElements.length > 0) {
              const childIndex = childElements.indexOf(targetElement);
              if (childIndex !== -1) {
                selector = `${parentSelector} > ${targetElement.tagName.toLowerCase()}:nth-of-type(${childIndex + 1})`;
                break;
              }
            }
          }
          parent = parent.parentElement;
          depth++;
        }
        
        // If we still have a generic selector, try to add more context from attributes and content
        if (selector === targetElement.tagName.toLowerCase() || 
            selector === `${targetElement.tagName.toLowerCase()}:nth-of-type(1)`) {
          
          // Try using innerText if it's short and meaningful
          if (targetElement.innerText && targetElement.innerText.trim().length > 0 && 
              targetElement.innerText.trim().length < 30) {
            selector = `${targetElement.tagName.toLowerCase()}:has-text("${targetElement.innerText.trim()}")`;
          }
          // If no innerText, try using position of this element among all elements of same type on the page
          else {
            const allSameElements = document.querySelectorAll(targetElement.tagName);
            const elementIndex = Array.from(allSameElements).indexOf(targetElement);
            selector = `${targetElement.tagName.toLowerCase()}:nth-of-type(${elementIndex + 1})`;
          }
        }
      }
      
      window.recordStep({ 
        action: 'click', 
        selector: selector || e.target.tagName,
        x: e.clientX, 
        y: e.clientY,
        timestamp: Date.now()
      });
    }, true);
    
    // Record inputs
    document.addEventListener('input', (e) => {
      const selector = window.getBestSelector(e.target);
      window.recordStep({ 
        action: 'input', 
        selector: selector || e.target.tagName,
        value: e.target.value,
        timestamp: Date.now()
      });
    }, true);
    
    // Record scroll events using a debounced approach
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        window.recordScroll(window.scrollY, Date.now());
      }, 100); // Debounce scrolling
    });
  });

  await page.goto(url);
  
  return { page, browser, context };
}

/**
 * Stop recording and close the browser
 */
async function stopRecording() {
  if (browser) {
    // Generate scroll steps based on recorded scroll positions
    const scrollSteps = generateScrollSteps(scrollPositions);
    
    // Save the recording to a file
    const timestamp = Date.now();
    const outputPath = path.join(__dirname, '..', `playwright-recording-${timestamp}.js`);
    
    // Generate script content
    const scriptContent = generateScriptFromRecording(steps, scrollSteps, initialUrl);
    
    // Write the script to a file
    try {
      await fs.writeFile(outputPath, scriptContent, 'utf8');
      console.log('Recording saved to:', outputPath);
      
      // Also save the scroll data
      await exportScrollPositions(outputPath);
    } catch (err) {
      console.error('Failed to save recording:', err);
    }
    
    // Close browser resources
    await browser.close();
    
    // Return both regular steps and scroll steps
    return { steps, scrollSteps, outputPath };
  }
  return { steps: [], scrollSteps: [] };
}

/**
 * Convert raw scroll positions into Playwright scrollByAmount commands
 */
function generateScrollSteps(scrollPositions) {
  if (!scrollPositions || scrollPositions.length === 0) {
    return [];
  }
  
  const steps = [];
  let previousY = 0;
  
  for (const position of scrollPositions) {
    const diffY = position.scrollY - previousY;
    
    if (Math.abs(diffY) >= scrollThreshold) {
      steps.push({
        action: 'scroll',
        pixels: diffY,
        command: `scrollByAmount(page, ${diffY});`,
        description: `Scroll by ${diffY} pixels`,
        timestamp: position.timestamp
      });
      previousY = position.scrollY;
    }
  }
  
  return steps;
}

/**
 * Get the initial URL used for recording
 */
function getInitialUrl() {
  return initialUrl;
}

/**
 * Export recorded scroll positions to a file alongside Playwright recording
 */
async function exportScrollPositions(outputPath) {
  try {
    const scrollData = {
      url: initialUrl,
      timestamp: Date.now(),
      positions: scrollPositions,
      scrollSteps: generateScrollSteps(scrollPositions)
    };
    
    const scrollDataPath = outputPath.replace('.js', '.scroll.json');
    await fs.writeFile(scrollDataPath, JSON.stringify(scrollData, null, 2));
    
    return {
      success: true,
      path: scrollDataPath
    };
  } catch (error) {
    console.error('Failed to save scroll data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a Playwright test script from recorded steps and scrolls
 */
function generateScriptFromRecording(steps, scrollSteps, url) {
  const scriptLines = [
    `import { test, expect } from '@playwright/test';`,
    ``,
    `test('test', async ({ page }) => {`,
    `  await page.goto('${url}');`
  ];
  
  // Add scroll steps at their appropriate positions based on timestamps
  let allSteps = [];
  
  // Add regular steps
  if (steps && steps.length > 0) {
    steps.forEach(step => {
      if (step.action === 'click' && step.selector) {
        // Debug log the raw selector
        console.log('Selector being checked:', JSON.stringify(step.selector));
        // Clean the selector of hidden characters
        let cleanSelector = step.selector.replace(/[\r\n]+/g, '').trim();
        // Skip malformed selectors
        if (
          typeof cleanSelector !== 'string' ||
          cleanSelector === '' ||
          cleanSelector.includes('\n')
        ) {
          console.warn('Skipping malformed selector:', cleanSelector);
          return;
        }
        // Properly escape backticks in the selector
        let safeSelector = cleanSelector.replace(/`/g, '\`');
        allSteps.push({
          type: 'regular',
          command: `  await page.waitForSelector(\`${safeSelector}\`);\n  await page.locator(\`${safeSelector}\`).click();`,
          timestamp: step.timestamp || 0
        });
      }
      if (step.action === 'input' && step.selector) {
        // Debug log the raw selector
        console.log('Selector being checked:', JSON.stringify(step.selector));
        // Clean the selector of hidden characters
        let cleanSelector = step.selector.replace(/[\r\n]+/g, '').trim();
        // Skip malformed selectors
        if (
          typeof cleanSelector !== 'string' ||
          cleanSelector === '' ||
          cleanSelector.includes('\n')
        ) {
          console.warn('Skipping malformed selector:', cleanSelector);
          return;
        }
        let safeSelector = cleanSelector.replace(/`/g, '\`');
        let safeValue = (step.value || '').replace(/`/g, '\`');
        allSteps.push({
          type: 'regular',
          command: `  await page.locator(\`${safeSelector}\`).fill(\`${safeValue}\`);`,
          timestamp: step.timestamp || 0
        });
      }
    });
  }
  
  // Add scroll steps
  if (scrollSteps && scrollSteps.length > 0) {
    scrollSteps.forEach(step => {
      allSteps.push({
        type: 'scroll',
        command: `  await page.evaluate(() => window.scrollBy(0, ${step.pixels})); // Auto-recorded scroll`,
        timestamp: step.timestamp || 0
      });
    });
  }
  
  // Sort all steps by timestamp
  allSteps.sort((a, b) => a.timestamp - b.timestamp);
  
  // Add steps to script
  allSteps.forEach(step => {
    scriptLines.push(step.command);
  });
  
  // Close the test
  scriptLines.push(`});`);
  
  return scriptLines.join('\n');
}

module.exports = { 
  startRecording, 
  stopRecording, 
  getInitialUrl,
  exportScrollPositions,
  generateScriptFromRecording

};

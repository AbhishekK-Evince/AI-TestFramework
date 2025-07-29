// Frontend JavaScript for AI Test Framework Recorder

// Global variables
let currentTab = 'recorder';
let testCaseHistory = [];
let generatedScripts = [];

// DOM elements
const tabButtons = document.querySelectorAll('[data-target]');
const sections = document.querySelectorAll('.data-section');
const testCaseHistoryTable = document.getElementById('testcase-history-table');
const generatedScriptsTable = document.getElementById('generated-scripts-table');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Test Framework Recorder initialized');
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadAppInfo();
    
    // Show recorder tab by default
    showTab('recorder');
});

// Tab navigation
function setupTabNavigation() {
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            showTab(target);
        });
    });
}

function showTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-target') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide sections
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(tabName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    currentTab = tabName;
    
    // Load data for the tab
    if (tabName === 'testcase-history') {
        loadTestCaseHistory();
    } else if (tabName === 'generated-scripts') {
        loadGeneratedScripts();
    }
}

// Event listeners
function setupEventListeners() {
    // Refresh buttons
    const refreshHistoryBtn = document.getElementById('refresh-history');
    const refreshScriptsBtn = document.getElementById('refresh-scripts');
    
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', loadTestCaseHistory);
    }
    
    if (refreshScriptsBtn) {
        refreshScriptsBtn.addEventListener('click', loadGeneratedScripts);
    }
    
    // Settings button
    const settingsBtn = document.querySelector('.settings-icon-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    // Close settings
    const closeSettingsBtn = document.getElementById('close-settings');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', hideSettings);
    }
}

// API calls
async function makeApiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Load test case history
async function loadTestCaseHistory() {
    try {
        console.log('Loading test case history...');
        const result = await makeApiCall('/api/testcase-history');
        
        if (result.success) {
            testCaseHistory = result.history || [];
            displayTestCaseHistory(testCaseHistory);
        } else {
            throw new Error(result.error || 'Failed to load test case history');
        }
    } catch (error) {
        console.error('Error loading test case history:', error);
        displayError('Failed to fetch test case history: ' + error.message);
    }
}

// Display test case history
function displayTestCaseHistory(history) {
    if (!testCaseHistoryTable) return;
    
    if (history.length === 0) {
        testCaseHistoryTable.innerHTML = '<p class="no-data">No test cases found. Create some test cases to see them here.</p>';
        return;
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Source Type</th>
                    <th>Test Types</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${history.map(item => `
                    <tr>
                        <td>${new Date(item.timestamp).toLocaleString()}</td>
                        <td>${item.sourceType || 'N/A'}</td>
                        <td>${(item.testCaseTypes || []).join(', ') || 'N/A'}</td>
                        <td>
                            <button class="btn btn-small btn-primary" onclick="viewTestCase('${item._id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    testCaseHistoryTable.innerHTML = table;
}

// Load generated scripts
async function loadGeneratedScripts() {
    try {
        console.log('Loading generated scripts...');
        const result = await makeApiCall('/api/generated-scripts');
        
        if (result.success) {
            generatedScripts = result.scripts || [];
            displayGeneratedScripts(generatedScripts);
        } else {
            throw new Error(result.error || 'Failed to load generated scripts');
        }
    } catch (error) {
        console.error('Error loading generated scripts:', error);
        displayError('Failed to fetch generated scripts: ' + error.message);
    }
}

// Display generated scripts
function displayGeneratedScripts(scripts) {
    if (!generatedScriptsTable) return;
    
    if (scripts.length === 0) {
        generatedScriptsTable.innerHTML = '<p class="no-data">No generated scripts found. Generate some scripts to see them here.</p>';
        return;
    }
    
    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Source Type</th>
                    <th>Test Types</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${scripts.map(item => `
                    <tr>
                        <td>${new Date(item.timestamp).toLocaleString()}</td>
                        <td>${item.sourceType || 'N/A'}</td>
                        <td>${(item.testCaseTypes || []).join(', ') || 'N/A'}</td>
                        <td>
                            <button class="btn btn-small btn-primary" onclick="viewScript('${item._id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    generatedScriptsTable.innerHTML = table;
}

// Load app info
async function loadAppInfo() {
    try {
        const result = await makeApiCall('/api/test');
        if (result.success) {
            console.log('App info loaded:', result);
        }
    } catch (error) {
        console.error('Error loading app info:', error);
    }
}

// Display error
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e63946;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        text-align: center;
    `;
    
    // Find the appropriate container and add the error
    const container = document.querySelector('.data-section:not([style*="display: none"])');
    if (container) {
        const existingError = container.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        container.insertBefore(errorDiv, container.firstChild);
    }
}

// Settings functions
function showSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.style.display = 'block';
    }
}

function hideSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
}

// View functions (to be implemented)
function viewTestCase(id) {
    console.log('View test case:', id);
    // TODO: Implement test case viewing
}

function viewScript(id) {
    console.log('View script:', id);
    // TODO: Implement script viewing
}

// Global functions for onclick handlers
window.viewTestCase = viewTestCase;
window.viewScript = viewScript;

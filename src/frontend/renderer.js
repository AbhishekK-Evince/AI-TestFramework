const { ipcRenderer } = require('electron');

// --- Constants ---
const API_BASE_URL = 'http://localhost:3000/api';
const API_ENDPOINTS = {
  GENERATE_TEST_CASES: `${API_BASE_URL}/generate-test-cases`,
  LIST_CODEGEN_FILES: `${API_BASE_URL}/list-codegen-files`,
  GET_CODEGEN_FILE: `${API_BASE_URL}/get-codegen-file`,
  GENERATE_AUTOMATION_SCRIPT: `${API_BASE_URL}/generate-automation-script`,
  TESTCASE_HISTORY: `${API_BASE_URL}/testcase-history`,
  GENERATED_SCRIPTS: `${API_BASE_URL}/generated-scripts`,
};

// --- DOM Element Cache ---
const DOMElements = {
  // Main page
  startCodegenBtn: document.getElementById('start-codegen'),
  codegenUrlInput: document.getElementById('codegen-url'),
  exportCodegenBtn: document.getElementById('export-codegen'),
  infoElement: document.getElementById('info'),
  recentRecordingsContainer: document.getElementById('recent-recordings'),
  mainContent: document.getElementById('main-content'),

  // Tabs
  navTabs: document.querySelector('.nav-tabs'),
  tabButtons: document.querySelectorAll('.nav-tabs .btn'),
  tabSections: document.querySelectorAll('.data-section, #main-content'),

  // AI Test Case Modal
  testcaseModal: document.getElementById('testcase-modal'),
  closeTestcaseModalBtn: document.getElementById('close-testcase-modal'),
  closeTestcaseFormBtn: document.getElementById('close-testcase-form'),
  testcaseForm: document.getElementById('testcase-form'),
  sourceTypeSelect: document.getElementById('source-type'),
  sourceFieldsDiv: document.getElementById('source-fields'),
  testcaseResultDiv: document.getElementById('testcase-result'),
  resetTestcaseFormBtn: document.getElementById('reset-testcase-form'),
  testcaseSpinner: document.getElementById('testcase-spinner'),
  generateTestcaseBtn: document.querySelector('#testcase-form button[type="submit"]'),
  selectedCodegenFileDiv: document.getElementById('selected-codegen-file'),

  // History Section
  historyTableDiv: document.getElementById('testcase-history-table'),
  refreshHistoryBtn: document.getElementById('refresh-history'),
  exportHistoryBtn: document.getElementById('export-history'),
  historySearchInput: document.getElementById('history-search'),
  historyFilterSource: document.getElementById('history-filter-source'),
  historyFilterType: document.getElementById('history-filter-type'),

  // Scripts Section
  scriptsTableDiv: document.getElementById('generated-scripts-table'),
  refreshScriptsBtn: document.getElementById('refresh-scripts'),
  exportScriptsBtn: document.getElementById('export-scripts'),
  scriptsSearchInput: document.getElementById('scripts-search'),
  scriptsFilterSource: document.getElementById('scripts-filter-source'),
  scriptsFilterType: document.getElementById('scripts-filter-type'),

  // Detail Modals
  historyDetailsModal: document.getElementById('history-details-modal'),
  closeHistoryDetailsBtn: document.getElementById('close-history-details'),
  historyDetailsTitle: document.getElementById('history-details-title'),
  historyDetailsContent: document.getElementById('history-details-content'),
  scriptModal: document.getElementById('script-modal'),
  closeScriptModalBtn: document.getElementById('close-script-modal'),
  scriptModalContent: document.getElementById('script-modal-content'),
  copyScriptBtn: document.getElementById('copy-script-btn'),
};

// --- State ---
let lastRecordingPath = null;
let selectedCodegenFile = '';

// --- Utility Functions ---
const toCapitalizedUnderscore = (str) =>
  str.split(/[_\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('_');

const setInfoMessage = (message, type = '') => {
  DOMElements.infoElement.innerHTML = message;
  DOMElements.infoElement.className = `info-box ${type}`;
};

const toggleButtonLoading = (btn, isLoading, originalContent) => {
  btn.disabled = isLoading;
  if (isLoading) {
    const loadingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon"><circle cx="12" cy="12" r="10"></circle></svg>`;
    btn.innerHTML = `${loadingIcon} ${btn.dataset.loadingText || 'Loading...'}`;
  } else {
    btn.innerHTML = originalContent;
  }
};

/**
 * Formats the raw test output from the runner for display in the UI.
 * Now includes a special check for common syntax errors to guide the user.
 * @param {string} output - The raw string output from the test runner process.
 * @returns {string} - Formatted HTML string.
 */
const formatTestOutput = (output) => {
    if (!output || output.length === 0) return 'No output available';

    let formattedOutput = output;


    // Apply existing formatting rules
    return formattedOutput
      .replace(/\n/g, '<br>')
      .replace(/-{50}/g, '<hr style="border-top: 1px dotted #ccc; margin: 0.5rem 0;">')
      .replace(/Step ([0-9A-Z]+): (.*?)(?=<br>|$)/g, '<h3 style="margin: 5px 0; color: #4361ee;">Step $1: $2</h3>')
      .replace(/TEST EXECUTION REPORT/g, '<h2 style="color: #4361ee;">TEST EXECUTION REPORT</h2>')
      .replace(/TEST SUMMARY/g, '<h2 style="color: #4361ee;">TEST SUMMARY</h2>')
      .replace(/TEST EXECUTION COMPLETE/g, '<h2 style="color: #06d6a0;">TEST EXECUTION COMPLETE</h2>')
      .replace(/✅(.*)/g, '<span style="color: #06d6a0; font-weight: bold;">✅$1</span>')
      .replace(/❌(.*)/g, '<span style="color: #e63946; font-weight: bold;">❌$1</span>')
      .replace(/(Syntax)?Error:(.*?)(?=<br>|$)/g, '<span style="color: #e63946; font-weight: bold;">$1Error:$2</span>')
      .replace(/\[90m/g, '<span style="color: #6c757d;">').replace(/\[39m/g, '</span>');
};

// --- Tab Management ---
const switchTab = (targetId) => {
  // Hide all sections
  DOMElements.tabSections.forEach(section => {
    section.style.display = 'none';
  });
  // Show the target section
  const activeSection = document.getElementById(targetId);
  if (activeSection) {
    activeSection.style.display = 'flex'; // Use flex for main-content layout
    if(targetId !== 'main-content') { // Adjust for non-main sections
        activeSection.style.display = 'block';
    }
  }

  // Update button styles
  DOMElements.tabButtons.forEach(button => {
    button.classList.toggle('btn-primary', button.dataset.target === targetId);
    button.classList.toggle('btn-secondary', button.dataset.target !== targetId);
  });

  // Fetch data for relevant tabs
  if (targetId === 'testcase-history-section') fetchAndRenderHistory();
  if (targetId === 'generated-scripts-section') fetchAndRenderScripts();
};


// --- AI Test Case Modal ---
const showTestcaseModal = (codegenFile = '') => {
  DOMElements.testcaseForm.reset();
  renderSourceFields();
  DOMElements.testcaseResultDiv.style.display = 'none';
  DOMElements.testcaseResultDiv.innerHTML = '';
  DOMElements.testcaseModal.style.display = 'flex';

  selectedCodegenFile = codegenFile;
  if (selectedCodegenFile) {
    DOMElements.selectedCodegenFileDiv.style.display = 'block';
    DOMElements.selectedCodegenFileDiv.textContent = `Linked Codegen File: ${selectedCodegenFile}`;
  } else {
    DOMElements.selectedCodegenFileDiv.style.display = 'none';
  }
};

const hideTestcaseModal = () => {
  DOMElements.testcaseModal.style.display = 'none';
};

function renderSourceFields() {
  const type = DOMElements.sourceTypeSelect.value;
  let html = '';
  if (type === 'jira') {
    html = `
      <input type="text" name="jiraUrl" placeholder="Jira URL" required />
      <input type="text" name="jiraUser" placeholder="Jira User" required />
      <input type="password" name="jiraToken" placeholder="Jira API Token" required />
      <input type="text" name="itemId" placeholder="Item ID(s) (comma separated)" required />`;
  } else if (type === 'azure') {
    html = `
      <input type="text" name="azureOrg" placeholder="Azure Org" required />
      <input type="text" name="azureProject" placeholder="Azure Project" required />
      <input type="password" name="azurePat" placeholder="Azure PAT" required />
      <input type="text" name="itemId" placeholder="Item ID(s) (comma separated)" required />`;
  } else if (type === 'image') {
    html = `<input type="file" name="imageFile" accept="image/*" required />`;
  } else if (type === 'manual') {
    html = `
      <textarea name="manualDescription" placeholder="Description" required></textarea>
      <textarea name="manualSteps" placeholder="Steps"></textarea>
      <textarea name="manualExpected" placeholder="Expected Results"></textarea>`;
  }
  DOMElements.sourceFieldsDiv.innerHTML = html;
}

DOMElements.testcaseForm.onsubmit = async (e) => {
  e.preventDefault();
  DOMElements.testcaseResultDiv.style.display = 'block';
  DOMElements.testcaseResultDiv.innerHTML = '';
  DOMElements.testcaseSpinner.style.display = 'block';
  DOMElements.generateTestcaseBtn.disabled = true;

  const formData = new FormData(DOMElements.testcaseForm);
  const sourceType = formData.get('sourceType');
  const testCaseTypes = Array.from(DOMElements.testcaseForm.querySelectorAll('input[name="testCaseTypes"]:checked')).map(cb => cb.value);

  if (testCaseTypes.length === 0) {
    DOMElements.testcaseSpinner.style.display = 'none';
    DOMElements.generateTestcaseBtn.disabled = false;
    DOMElements.testcaseResultDiv.innerHTML = '<span style="color:red;">Please select at least one test case type.</span>';
    return;
  }

  try {
    let result;
    if (sourceType === 'image') {
      const imgForm = new FormData();
      imgForm.append('sourceType', sourceType);
      imgForm.append('imageFile', DOMElements.testcaseForm.querySelector('input[name="imageFile"]').files[0]);
      testCaseTypes.forEach(t => imgForm.append('testCaseTypes', t));
      if (selectedCodegenFile) imgForm.append('codegenFile', selectedCodegenFile);
      const resp = await fetch(API_ENDPOINTS.GENERATE_TEST_CASES, { method: 'POST', body: imgForm });
      result = await resp.json();
    } else {
      const payload = { sourceType, testCaseTypes };
      if (selectedCodegenFile) payload.codegenFile = selectedCodegenFile;
      for (const [key, value] of formData.entries()) {
        if (key !== 'testCaseTypes' && key !== 'sourceType') payload[key] = value;
      }
      const resp = await fetch(API_ENDPOINTS.GENERATE_TEST_CASES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      result = await resp.json();
    }

    if (result && result.success) {
      DOMElements.testcaseResultDiv.innerHTML = `<pre style="max-height: 200px; overflow-y: auto;">${result.testCases}</pre>`;
      setTimeout(() => {
        const historyButton = document.getElementById('tab-history');
        if (historyButton) historyButton.click();
      }, 1200);
    } else {
      DOMElements.testcaseResultDiv.innerHTML = `<span style="color:red;">${result.error || 'Failed to generate test cases.'}</span>`;
    }
  } catch (err) {
    DOMElements.testcaseResultDiv.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
  } finally {
    DOMElements.testcaseSpinner.style.display = 'none';
    DOMElements.generateTestcaseBtn.disabled = false;
  }
};


// --- Main Recorder Functionality ---
DOMElements.startCodegenBtn.onclick = async () => {
  const url = DOMElements.codegenUrlInput.value || 'https://example.com';
  const originalContent = DOMElements.startCodegenBtn.innerHTML;
  DOMElements.startCodegenBtn.dataset.loadingText = "Recording...";

  toggleButtonLoading(DOMElements.startCodegenBtn, true);
  setInfoMessage('<strong>Recording in progress...</strong> Navigate through the site to record your test steps.');

  try {
    const result = await ipcRenderer.invoke('start-codegen', url);
    if (result.outputPath) {
      lastRecordingPath = result.outputPath;
      setInfoMessage(`<strong>Recording complete!</strong> <p>Test file saved to: ${lastRecordingPath}</p><p>You can now close the browser window. Click "Export Recording" to save the file to your exports folder.</p>`, 'success');
    } else {
      setInfoMessage('<strong>Recording complete!</strong><p>You can now close the browser window. Click "Export Recording" to save the generated file.</p>', 'success');
    }
    loadRecentRecordings();
  } catch (error) {
    setInfoMessage(`<strong>Error during recording:</strong> ${error.message}`, 'error');
  } finally {
    toggleButtonLoading(DOMElements.startCodegenBtn, false, originalContent);
  }
};

DOMElements.exportCodegenBtn.onclick = async () => {
  const originalContent = DOMElements.exportCodegenBtn.innerHTML;
  DOMElements.exportCodegenBtn.dataset.loadingText = "Exporting...";
  toggleButtonLoading(DOMElements.exportCodegenBtn, true);

  try {
    // Attempt to stop any active recording first, to capture the file path.
    try {
      const stopResult = await ipcRenderer.invoke('stop-recording');
      if (stopResult?.success && stopResult.outputPath) {
        lastRecordingPath = stopResult.outputPath;
      }
    } catch (recorderErr) {
      console.log('No active recording to stop or recorder error:', recorderErr);
    }

    const result = await ipcRenderer.invoke('export-codegen', lastRecordingPath);
    if (result.success) {
      setInfoMessage(`<strong>Successfully exported!</strong><p>Recording saved to: ${result.path}</p>`, 'success');
      loadRecentRecordings();
    } else {
      setInfoMessage(`<strong>Failed to export:</strong> ${result.error}`, 'error');
    }
  } catch (error) {
    setInfoMessage(`<strong>Error exporting file:</strong> ${error.message}`, 'error');
  } finally {
    toggleButtonLoading(DOMElements.exportCodegenBtn, false, originalContent);
  }
};

// --- Recent Recordings ---
async function loadRecentRecordings() {
  const container = DOMElements.recentRecordingsContainer;
  try {
    const recordings = await ipcRenderer.invoke('get-recent-recordings');
    if (!recordings || recordings.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No recent recordings available</p></div>`;
      return;
    }

    const list = document.createElement('ul');
    recordings.forEach(rec => {
      const item = document.createElement('li');
      item.innerHTML = `
        <span>${rec.name}</span>
        <span class="recording-date">${new Date(rec.date).toLocaleString()}</span>
        <div class="recording-actions">
          <button class="btn btn-sm btn-warning" data-action="run" data-path="${rec.path}">Run Test</button>
          <button class="btn btn-sm btn-secondary" data-action="open" data-path="${rec.path}">Open</button>
          <button class="btn btn-sm btn-primary" data-action="ai-generate" data-path="${rec.path}">Create Test Cases</button>
        </div>`;
      list.appendChild(item);
    });
    container.innerHTML = '';
    container.appendChild(list);
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><p>Error loading recent recordings: ${error.message}</p></div>`;
  }
}

DOMElements.recentRecordingsContainer.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const path = button.dataset.path;

    if (action === 'ai-generate') {
        showTestcaseModal(path);
    } else if (action === 'open') {
        ipcRenderer.invoke('open-recording', path);
    } else if (action === 'run') {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Running...';

        setInfoMessage('<strong>Running test...</strong> Please wait while the test executes.');
        try {
            const result = await ipcRenderer.invoke('run-test', path);
            const formattedOutput = formatTestOutput(result.output); // Use the updated formatter

            if (result.success) {
                setInfoMessage(`
                    <strong>Test executed successfully!</strong>
                    <p>Duration: ${result.duration}ms</p>
                    <details open><summary>Test Output</summary><div class="output-container">${formattedOutput}</div></details>`,
                    'success'
                );
            } else {
                setInfoMessage(`
                    <strong>Test failed:</strong>
                    ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
                    <details open><summary>Error Details</summary><div class="output-container">${formattedOutput}</div></details>`,
                    'error'
                );
            }
        } catch (error) {
            setInfoMessage(`<strong>Error running test:</strong> <p>${error.message}</p>`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
});


// --- Generic Data Fetching & Rendering ---
const fetchAndRenderTable = async (options) => {
  options.tableDiv.innerHTML = 'Loading...';
  try {
    const resp = await fetch(options.endpoint);
    const data = await resp.json();
    if (!data.success) {
      options.tableDiv.innerHTML = `<span style="color:red;">${data.error || `Failed to load ${options.dataType}.`}</span>`;
      return;
    }
    const items = data[options.dataKey] || [];
    renderTable(items, options);
  } catch (err) {
    options.tableDiv.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
  }
};

const renderTable = (data, options) => {
  const searchVal = (options.searchInput?.value || '').toLowerCase();
  const filterSource = options.filterSource?.value || '';
  const filterType = options.filterType?.value || '';

  const filtered = data.filter(row => {
    if (filterSource && row.sourceType !== filterSource) return false;
    if (filterType && (!row.testCaseTypes || !row.testCaseTypes.includes(filterType))) return false;
    if (searchVal && !JSON.stringify(row).toLowerCase().includes(searchVal)) return false;
    return true;
  });

  if (!filtered.length) {
    options.tableDiv.innerHTML = `<em>No ${options.dataType} found.</em>`;
    return;
  }

  const headers = options.headers.map(h => `<th>${h}</th>`).join('');
  const rows = filtered.map(row => options.rowRenderer(row)).join('');

  options.tableDiv.innerHTML = `
    <table class="data-table">
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
};

// --- Test Case History ---
const fetchAndRenderHistory = () => fetchAndRenderTable({
  endpoint: API_ENDPOINTS.TESTCASE_HISTORY,
  dataType: 'test cases',
  dataKey: 'history',
  tableDiv: DOMElements.historyTableDiv,
  searchInput: DOMElements.historySearchInput,
  filterSource: DOMElements.historyFilterSource,
  filterType: DOMElements.historyFilterType,
  headers: ['Date', 'Source', 'Types', 'View Details', 'Generate Script'],
  rowRenderer: renderHistoryRow
});

const renderHistoryRow = (row) => {
  const userInput = { ...(row.userInput || {}) };
  if (userInput.jiraToken) userInput.jiraToken = '***';
  if (userInput.azurePat) userInput.azurePat = '***';
  const codegenFile = row.codegenFile;

  return `
    <tr>
      <td>${new Date(row.timestamp).toLocaleString()}</td>
      <td>${toCapitalizedUnderscore(row.sourceType || '')}</td>
      <td>${(row.testCaseTypes || []).map(toCapitalizedUnderscore).join(', ')}</td>
      <td><button class="action-btn btn-info" data-action="view-details" data-content="${encodeURIComponent(row.generatedTestCases)}">View Details</button></td>
      <td>
        ${codegenFile
          ? `<button class="action-btn btn-link"
                data-action="generate-script"
                data-testcases="${encodeURIComponent(row.generatedTestCases)}"
                data-userinput="${encodeURIComponent(JSON.stringify(userInput, null, 2))}"
                data-codegenfile="${encodeURIComponent(codegenFile)}"
                data-sourcetype="${row.sourceType || ''}"
                data-testcasetypes="${encodeURIComponent(JSON.stringify(row.testCaseTypes || []))}">
                Generate Script
              </button>`
          : '<span style="color:#aaa;">No codegen file</span>'
        }
      </td>
    </tr>`;
};

DOMElements.historyTableDiv.addEventListener('click', async (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    if (action === 'view-details') {
        const content = decodeURIComponent(button.dataset.content);
        renderTestCasesInModal(content);
        DOMElements.historyDetailsModal.style.display = 'flex';
    } else if (action === 'generate-script') {
        await generatePlaywrightScript(button.dataset);
    }
});

const generatePlaywrightScript = async (dataset) => {
    DOMElements.scriptModalContent.textContent = 'Generating Playwright script...';
    DOMElements.scriptModal.style.display = 'flex';

    try {
        const fileResp = await fetch(`${API_ENDPOINTS.GET_CODEGEN_FILE}?file=${encodeURIComponent(decodeURIComponent(dataset.codegenfile))}`);
        const fileData = await fileResp.json();
        if (!fileData.success) throw new Error('Failed to load codegen file.');

        const payload = {
            testCases: decodeURIComponent(dataset.testcases),
            userInput: decodeURIComponent(dataset.userinput),
            codegenContent: fileData.content,
            framework: 'playwright',
            sourceType: dataset.sourcetype,
            testCaseTypes: JSON.parse(decodeURIComponent(dataset.testcasetypes)),
            codegenFile: decodeURIComponent(dataset.codegenfile)
        };

        const resp = await fetch(API_ENDPOINTS.GENERATE_AUTOMATION_SCRIPT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        DOMElements.scriptModalContent.textContent = data.success ? data.script : `Error: ${data.error || 'Failed to generate script.'}`;
    } catch (err) {
        DOMElements.scriptModalContent.textContent = `Error: ${err.message}`;
    }
};

const renderTestCasesInModal = (testCasesText) => {
    DOMElements.historyDetailsTitle.textContent = 'Generated Test Cases';
    const cases = testCasesText.split(/\n\s*Title:/).filter(c => c.trim()).map(c => 'Title:' + c);

    let html = `<table class="data-table"><thead><tr><th>Title</th><th>Scenario</th><th>Steps</th><th>Expected</th></tr></thead><tbody>`;
    for (const c of cases) {
        const title = (c.match(/Title: ([^\n]+)/) || [])[1] || '';
        const scenario = (c.match(/Scenario: ([^\n]+)/) || [])[1] || '';
        const steps = (c.match(/Steps to reproduce:([\s\S]*?)(?=Expected Result:|$)/) || [])[1]?.trim() || '';
        const expected = (c.match(/Expected Result: ([^\n]+)/) || [])[1] || '';
        html += `
            <tr>
                <td>${title}</td><td>${scenario}</td>
                <td><pre style="white-space:pre-wrap; margin:0;">${steps}</pre></td>
                <td>${expected}</td>
            </tr>`;
    }
    html += '</tbody></table>';
    DOMElements.historyDetailsContent.innerHTML = html;
};

// --- Generated Scripts ---
const fetchAndRenderScripts = () => fetchAndRenderTable({
  endpoint: API_ENDPOINTS.GENERATED_SCRIPTS,
  dataType: 'scripts',
  dataKey: 'scripts',
  tableDiv: DOMElements.scriptsTableDiv,
  searchInput: DOMElements.scriptsSearchInput,
  filterSource: DOMElements.scriptsFilterSource,
  filterType: DOMElements.scriptsFilterType,
  headers: ['Date', 'Source', 'Types', 'Actions'],
  rowRenderer: renderScriptsRow
});

const renderScriptsRow = (row) => `
  <tr>
    <td>${new Date(row.timestamp).toLocaleString()}</td>
    <td>${toCapitalizedUnderscore(row.sourceType || '')}</td>
    <td>${(row.testCaseTypes || []).map(toCapitalizedUnderscore).join(', ')}</td>
    <td>
      <button class="action-btn btn-primary" data-action="view-script" data-script="${encodeURIComponent(row.script)}">View</button>
      <button class="action-btn btn-warning" data-action="copy-script" data-script="${encodeURIComponent(row.script)}">📋</button>
    </td>
  </tr>`;

DOMElements.scriptsTableDiv.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const script = decodeURIComponent(button.dataset.script);

    if (action === 'view-script') {
        DOMElements.scriptModalContent.textContent = script;
        DOMElements.scriptModal.style.display = 'flex';
    } else if (action === 'copy-script') {
        navigator.clipboard.writeText(script);
        button.textContent = '✔';
        setTimeout(() => { button.textContent = '📋'; }, 1200);
    }
});


// --- Export to CSV ---
const exportToCsv = (filename, headers, data, rowMapper) => {
    if (!data.length) {
      alert('No data to export.');
      return;
    }
    const csvRows = [headers.join(',')];
    for (const row of data) {
        csvRows.push(rowMapper(row));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const exportHistory = async () => {
    const resp = await fetch(API_ENDPOINTS.TESTCASE_HISTORY);
    const data = await resp.json();
    if (!data.success) return alert(data.error || 'Failed to load history.');

    exportToCsv('testcase_history.csv',
      ['Date', 'Source', 'Types', 'User Input', 'Generated Test Cases'],
      data.history || [],
      row => [
        `"${new Date(row.timestamp).toLocaleString()}"`,
        `"${row.sourceType || ''}"`,
        `"${(row.testCaseTypes || []).join('; ')}"`,
        `"${JSON.stringify(row.userInput || {}).replace(/"/g, '""')}"`,
        `"${(row.generatedTestCases || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(',')
    );
};

const exportScripts = async () => {
    const resp = await fetch(API_ENDPOINTS.GENERATED_SCRIPTS);
    const data = await resp.json();
    if (!data.success) return alert(data.error || 'Failed to load scripts.');

    exportToCsv('generated_scripts.csv',
      ['Date', 'Source', 'Types', 'Script'],
      data.scripts || [],
      row => [
        `"${new Date(row.timestamp).toLocaleString()}"`,
        `"${row.sourceType || ''}"`,
        `"${(row.testCaseTypes || []).join('; ')}"`,
        `"${(row.script || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(',')
    );
};

// --- Event Listeners ---
const setupEventListeners = () => {
  // Tab navigation
  DOMElements.navTabs.addEventListener('click', (e) => {
    const button = e.target.closest('.btn');
    if (button && button.dataset.target) {
      switchTab(button.dataset.target);
    }
  });

  // AI Modal
  DOMElements.closeTestcaseModalBtn.onclick = hideTestcaseModal;
  DOMElements.closeTestcaseFormBtn.onclick = hideTestcaseModal;
  DOMElements.testcaseModal.onclick = (e) => { if (e.target === DOMElements.testcaseModal) hideTestcaseModal(); };
  DOMElements.resetTestcaseFormBtn.onclick = () => {
    DOMElements.testcaseForm.reset();
    renderSourceFields();
    DOMElements.testcaseResultDiv.style.display = 'none';
    DOMElements.testcaseResultDiv.innerHTML = '';
  };
  DOMElements.sourceTypeSelect.onchange = renderSourceFields;

  // Detail Modals
  DOMElements.closeHistoryDetailsBtn.onclick = () => { DOMElements.historyDetailsModal.style.display = 'none'; };
  DOMElements.closeScriptModalBtn.onclick = () => { DOMElements.scriptModal.style.display = 'none'; };
  DOMElements.copyScriptBtn.onclick = () => {
    navigator.clipboard.writeText(DOMElements.scriptModalContent.textContent);
    DOMElements.copyScriptBtn.textContent = '✔ Copied';
    setTimeout(() => { DOMElements.copyScriptBtn.textContent = '📋 Copy'; }, 1200);
  };

  // History & Scripts Actions
  DOMElements.refreshHistoryBtn.onclick = fetchAndRenderHistory;
  DOMElements.refreshScriptsBtn.onclick = fetchAndRenderScripts;
  DOMElements.exportHistoryBtn.onclick = exportHistory;
  DOMElements.exportScriptsBtn.onclick = exportScripts;

  // Filters
  [DOMElements.historySearchInput, DOMElements.historyFilterSource, DOMElements.historyFilterType].forEach(el => { if(el) el.oninput = fetchAndRenderHistory });
  [DOMElements.scriptsSearchInput, DOMElements.scriptsFilterSource, DOMElements.scriptsFilterType].forEach(el => { if(el) el.oninput = fetchAndRenderScripts });

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      DOMElements.startCodegenBtn.click();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      DOMElements.exportCodegenBtn.click();
    }
  });
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadRecentRecordings();
  renderSourceFields();
  switchTab('main-content'); // Set the initial active tab
});
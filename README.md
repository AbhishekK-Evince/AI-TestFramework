
# AI Test Framework

## Overview
AI Test Framework is an Electron-based application for recording, generating, and managing automated test cases using Playwright, AI (LangChain/OpenAI), and OCR (Tesseract.js). It supports test case creation from manual input, images, Jira, and Azure DevOps, and provides robust logging, error tracking, and export features.

---

## Features
- **AI-powered test case generation** (manual, image, Jira, Azure)
- **Playwright recording and playback**
- **OCR support** for image-based test case extraction
- **Export and manage test scripts and logs**
- **Winston + MongoDB logging** for audit trails
- **Sentry integration** for real-time error tracking
- **Modern Electron/Node.js/Express architecture**

---

## Folder Structure

```
AI-TestFramework_Final/
├── assets/                  # (reserved for global assets)
├── config/                  # Configuration files (.env, Playwright config, etc.)
│   ├── playwright.config.js
│   └── playwright-global-setup.js
├── package.json             # Node.js dependencies and scripts
├── package-lock.json
├── README.md                # Project documentation
├── requirements.txt         # Python requirements (if any)
├── scripts/                 # Utility scripts
│   ├── set-secrets.js       # CLI for setting secrets in production
│   ├── fix-test-files.js    # Test file utilities
│   ├── fix-css-selectors.js # Selector utilities
│   ├── add-waits.js         # Add waits to tests
│   └── ...
├── src/
│   ├── backend/             # (reserved for backend modules)
│   ├── electron/            # Electron main process
│   │   ├── main.js          # Main Electron entry point
│   │   └── renderer/
│   │       └── renderer.js  # Electron renderer process
│   ├── frontend/            # Frontend UI
│   │   ├── index.html
│   │   ├── renderer.js
│   │   └── assets/
│   │       └── icon.svg
│   └── playwright/
│       ├── recorder.js      # Playwright recorder logic
│       └── recordings/      # Playwright recording files (.js, .json)
├── tests/                   # Test files and sample data
│   ├── test-steps.xlsx
│   └── test.spec.js
└── ...
```

---

## Environment Variables & Secrets

### Development
- Create a `config/.env` file with the following variables:

```
OPENAI_API_KEY=your-openai-api-key
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_test_framework
SENTRY_DSN=your-sentry-dsn
LANGCHAIN_PROJECT=ai-test-case-generation
# JIRA_URL=...
# JIRA_USER=...
# JIRA_TOKEN=...
# AZURE_ORG=...
# AZURE_PROJECT=...
# AZURE_PAT=...
```

### Production
- **Secrets are NOT bundled in the `.exe`.** 
- Secrets are stored securely using the system credential store via [keytar](https://github.com/atom/node-keytar).
- On first run, you must enter secrets using the CLI script:

```
node scripts/set-secrets.js
```

This will prompt you for required secrets (API keys, DB URIs, etc.) and store them securely. The app will retrieve them automatically on launch.

### Managing Settings After Setup

After the initial setup, you can manage your API keys and configuration settings in two ways:

#### 1. Using the Settings Tab (Recommended)
- Open the AI Test Framework application
- Click on the **"Settings"** tab in the navigation
- View and update your current configuration
- Use the **"Load Current Settings"** button to populate the form with existing values
- Use the **"Test Connection"** button to verify your settings work correctly
- Click **"Save Settings"** to update your configuration

#### 2. Using the Command Line Script
- Run the setup script again to update specific values:
```
node scripts/set-secrets.js
```
- The script will show your current values and allow you to update them

### Available Settings

#### Required Settings
- **OPENAI_API_KEY**: Your OpenAI API key (starts with `sk-`)
- **MONGODB_URI**: MongoDB connection string
- **MONGODB_DB**: MongoDB database name

#### Optional Settings
- **LANGCHAIN_TRACKING_V2**: Enable LangChain tracking (`true`/`false`)
- **LANGCHAIN_API_KEY**: LangChain API key for enhanced tracking
- **LANGCHAIN_PROJECT**: Project name for LangChain tracking
- **LANGSMITH_ENDPOINT**: LangSmith API endpoint URL

---

## Setup & Installation

1. **Clone the repository:**
    ```sh
    git clone <repo-url>
    cd AI-TestFramework_Final
    ```
2. **Install dependencies:**
    ```sh
    npm install
    ```
3. **Set up environment variables (development):**
    - Copy `config/.env.example` to `config/.env` and update as needed.
4. **Set up secrets (production):**
    - Run `node scripts/set-secrets.js` and follow the prompts.
5. **Run the app:**
    ```sh
    npm start
    ```

---

## Usage
- **Record a test:** Use the UI to start a Playwright recording.
- **Generate test cases:** Use the AI-powered modal for manual, image, Jira, or Azure-based generation.
- **Export scripts/logs:** Find them in `generated/exports/` (if applicable).
- **Run Playwright tests:**
    ```sh
    npm test
    ```
- **View logs:**
    - Console/file logs: `app.log`
    - MongoDB logs: `winston_logs` collection
- **OCR:** Place `eng.traineddata` in the project root for image-based test case generation.

---

## Utility Scripts
- `scripts/set-secrets.js`: CLI for entering and storing secrets in production (uses keytar)
- `scripts/fix-test-files.js`: Fixes and updates test files
- `scripts/fix-css-selectors.js`: Updates/fixes CSS selectors in tests
- `scripts/add-waits.js`: Adds waits to Playwright test scripts
- `scripts/prepare-tests.bat`, `scripts/fix-selectors.bat`: Batch scripts for test preparation and selector fixing

---

## Contributing
1. Fork the repo and create a feature branch.
2. Make your changes and add tests if needed.
3. Run all tests and ensure the app works.
4. Submit a pull request with a clear description.

---

## License
MIT License

---

## Credits
- [Playwright](https://playwright.dev/)
- [LangChain](https://js.langchain.com/)
- [OpenAI](https://openai.com/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [Winston](https://github.com/winstonjs/winston)
- [Sentry](https://sentry.io/)
- [keytar](https://github.com/atom/node-keytar)


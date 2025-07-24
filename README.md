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

## Environment Variables (.env)
Create a `config/.env` file with the following variables:

```

# OpenAI API Key for LangChain

OPENAI\_API\_KEY=your-openai-api-key

# MongoDB connection for logging and history

MONGODB\_URI=mongodb://localhost:27017
MONGODB\_DB=ai\_test\_framework

# (Optional) Sentry DSN for error tracking

SENTRY\_DSN=your-sentry-dsn

# (Optional) LangChain project name

LANGCHAIN\_PROJECT=ai-test-case-generation

# (Optional) Other service credentials (e.g., Jira, Azure)

# JIRA\_URL=https://your-jira-instance

# JIRA\_USER=your-jira-username

# JIRA\_TOKEN=your-jira-api-token

# AZURE\_ORG=your-azure-org

# AZURE\_PROJECT=your-azure-project

# AZURE\_PAT=your-azure-pat

```

---

## Folder Structure
```

├── config/              \# Configuration files (.env, Playwright config, etc.)
├── generated/
│   ├── exports/         \# Exported test logs/scripts
│   ├── uploads/         \# Uploaded files
│   └── test-results/    \# Playwright test results
├── scripts/             \# Utility scripts
├── src/
│   ├── backend/         \# (future) Backend modules (API, OCR, etc.)
│   ├── electron/        \# Electron main process
│   ├── frontend/        \# Frontend UI (index.html, renderer.js, assets)
│   └── playwright/
│       ├── recorder.js  \# Playwright recorder
│       └── recordings/  \# Playwright recordings
├── tests/               \# Test files and sample data
├── eng.traineddata      \# Tesseract OCR English data
├── requirements.txt     \# All dependencies (for reference)
├── package.json         \# Node.js dependencies and scripts
└── README.md            \# Project documentation

````

---

## Setup & Installation
1.  **Clone the repository:**
    ```sh
    git clone <repo-url>
    cd AI-TestFramework-21-July
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up environment variables:**
    -   Copy `config/.env.example` to `config/.env` and update as needed.
4.  **Run the app:**
    ```sh
    npm start
    ```

---

## Usage
-   **Record a test:** Use the UI to start a Playwright recording.
-   **Generate test cases:** Use the AI-powered modal for manual, image, Jira, or Azure-based generation.
-   **Export scripts/logs:** Find them in `generated/exports/`.
-   **Run Playwright tests:**
    ```sh
    npm test
    ```
-   **View logs:**
    -   Console/file logs: `app.log`
    -   MongoDB logs: `winston_logs` collection
-   **OCR:** Place `eng.traineddata` in the project root for image-based test case generation.

---

## Contributing
1.  Fork the repo and create a feature branch.
2.  Make your changes and add tests if needed.
3.  Run all tests and ensure the app works.
4.  Submit a pull request with a clear description.

---

## License
MIT License

---

## Credits
-   [Playwright](https://playwright.dev/)
-   [LangChain](https://js.langchain.com/)
-   [OpenAI](https://openai.com/)
-   [Tesseract.js](https://tesseract.projectnaptha.com/)
-   [Winston](https://github.com/winstonjs/winston)
-   [Sentry](https://sentry.io/)

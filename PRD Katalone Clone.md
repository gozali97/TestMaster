

# TestMaster: Katalon Clone Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Phase 1: Foundation & Setup](#phase-1-foundation--setup)
5. [Phase 2: Desktop IDE Development](#phase-2-desktop-ide-development)
6. [Phase 3: Backend API Development](#phase-3-backend-api-development)
7. [Phase 4: Web Portal Development](#phase-4-web-portal-development)
8. [Phase 5: Integration & Deployment](#phase-5-integration--deployment)
9. [Phase 6: Advanced Features](#phase-6-advanced-features)

---

## Project Overview

**Project Name**: TestMaster (Katalon Clone)
**Description**: AI-augmented test automation platform combining desktop application, web services, and cloud infrastructure
**Architecture**: Monorepo with multiple packages (Desktop IDE, Backend API, Web Portal)

---

## Technology Stack

### Frontend Stack
- **Desktop IDE**: Electron.js with React
- **Web Portal (TestOps)**: Next.js 14 (App Router) with React 18
- **State Management**: Zustand
- **UI Components**: shadcn/ui + Tailwind CSS
- **Code Editor**: Monaco Editor
- **Data Visualization**: Recharts
- **Icons**: Lucide React

### Backend Stack
- **API Server**: Node.js with Express.js
- **Test Engine**: Playwright
- **API Testing**: Axios with custom assertion library
- **Mobile Testing**: Appium
- **Database**: MySQL 8.0 (primary) + MongoDB (logs/artifacts)
- **ORM**: Sequelize + Mongoose
- **Cache**: Redis
- **Message Queue**: BullMQ
- **File Storage**: AWS S3 SDK (MinIO for local)
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.io

### DevOps & Infrastructure
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Playwright
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript (strict mode)
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions

### AI Integration
- **LLM Provider**: OpenAI API (GPT-4) or Anthropic Claude API
- **Use Cases**:
  - Natural language to test case conversion
  - Smart code completion
  - Self-healing test suggestions
  - Test case generation from requirements

---

## Project Structure

```
testmaster/
├── packages/
│   ├── desktop/                    # Electron Desktop App
│   │   ├── src/
│   │   │   ├── main/              # Electron main process
│   │   │   │   ├── index.ts
│   │   │   │   ├── ipc/           # IPC handlers
│   │   │   │   ├── menu/          # App menu
│   │   │   │   └── windows/       # Window management
│   │   │   ├── renderer/          # Electron renderer (React)
│   │   │   │   ├── components/
│   │   │   │   │   ├── Editor/    # Test case editor
│   │   │   │   │   ├── Recorder/  # Record & playback
│   │   │   │   │   ├── ObjectRepo/ # Object repository
│   │   │   │   │   ├── TestRunner/ # Execution panel
│   │   │   │   │   └── Debugger/  # Debug panel
│   │   │   │   ├── pages/
│   │   │   │   ├── store/         # Zustand stores
│   │   │   │   ├── hooks/
│   │   │   │   └── utils/
│   │   │   └── preload/           # Preload scripts
│   │   ├── playwright/            # Playwright engine integration
│   │   ├── package.json
│   │   └── electron-builder.json
│   │
│   ├── api/                        # Backend API Server
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # Authentication
│   │   │   │   ├── projects/      # Project management
│   │   │   │   ├── tests/         # Test cases CRUD
│   │   │   │   ├── executions/    # Test execution
│   │   │   │   ├── objects/       # Object repository
│   │   │   │   ├── reports/       # Reports & analytics
│   │   │   │   ├── integrations/  # CI/CD, Jira, etc.
│   │   │   │   └── ai/            # AI features
│   │   │   ├── services/
│   │   │   │   ├── test-engine/   # Playwright wrapper
│   │   │   │   ├── scheduler/     # Test scheduling
│   │   │   │   ├── storage/       # File storage
│   │   │   │   └── llm/           # LLM integration
│   │   │   ├── database/
│   │   │   │   ├── models/        # Sequelize models
│   │   │   │   └── migrations/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── web/                        # Web Portal (TestOps)
│   │   ├── src/
│   │   │   ├── app/               # Next.js app directory
│   │   │   │   ├── (dashboard)/   # Dashboard routes
│   │   │   │   ├── (auth)/        # Auth routes
│   │   │   │   ├── api/           # API routes
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── TestCases/
│   │   │   │   ├── Executions/
│   │   │   │   ├── Reports/
│   │   │   │   └── Settings/
│   │   │   ├── lib/               # Utilities
│   │   │   └── store/             # Zustand stores
│   │   └── package.json
│   │
│   ├── shared/                     # Shared code
│   │   ├── src/
│   │   │   ├── types/             # TypeScript types
│   │   │   ├── constants/
│   │   │   ├── utils/
│   │   │   └── validation/        # Zod schemas
│   │   └── package.json
│   │
│   ├── test-engine/                # Test Execution Engine
│   │   ├── src/
│   │   │   ├── playwright/        # Playwright runner
│   │   │   ├── appium/            # Appium runner (mobile)
│   │   │   ├── api/               # API testing
│   │   │   ├── reporters/         # Custom reporters
│   │   │   └── self-healing/      # Self-healing logic
│   │   └── package.json
│   │
│   └── cli/                        # CLI Tool (Runtime Engine)
│       ├── src/
│       │   ├── commands/
│       │   ├── runner/
│       │   └── index.ts
│       └── package.json
│
├── docs/                           # Documentation
├── scripts/                        # Build & deployment scripts
├── .github/workflows/              # CI/CD workflows
├── turbo.json                      # Turborepo config
├── package.json                    # Root package.json
└── README.md
```

---

## Phase 1: Foundation & Setup

### 1.1 Project Initialization

Initialize a monorepo project for TestMaster with the following requirements:

1. Create the complete folder structure as specified above
2. Setup Turborepo for monorepo management
3. Initialize packages:
   - `@testmaster/desktop` (Electron + React + TypeScript)
   - `@testmaster/api` (Express + TypeScript)
   - `@testmaster/web` (Next.js 14 + TypeScript)
   - `@testmaster/shared` (TypeScript library)
   - `@testmaster/test-engine` (Playwright wrapper)
   - `@testmaster/cli` (Commander.js CLI)

4. Setup configuration files:
   - `tsconfig.json` (root and per package with proper extends)
   - `.eslintrc.json` (with TypeScript, React, and Node rules)
   - `.prettierrc` (consistent code formatting)
   - `.gitignore` (comprehensive)
   - `.env.example` (environment variables template)

5. Setup package.json scripts in root:
   - `dev`: Run all packages in dev mode
   - `build`: Build all packages
   - `lint`: Lint all packages
   - `test`: Test all packages
   - `clean`: Clean all build artifacts

6. Install core dependencies:
   - Shared: typescript, zod, dayjs
   - Desktop: electron, electron-builder, react, react-dom, zustand, monaco-editor
   - API: express, sequelize, mysql2, mongoose, redis, bullmq, passport, jsonwebtoken, socket.io
   - Web: next, react, zustand, recharts, tailwindcss
   - Test Engine: @playwright/test, appium

7. Setup TypeScript with strict mode and proper path aliases

### 1.2 Database Schema Design

Create a comprehensive MySQL database schema for TestMaster with the following entities:

#### Users & Authentication
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('SUPER_ADMIN', 'ORG_ADMIN', 'TESTER', 'VIEWER'),
    organization_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_organization(organization_id)
);

CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    plan ENUM('FREE', 'PROFESSIONAL', 'ENTERPRISE') DEFAULT 'FREE',
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token(token),
    INDEX idx_user_id(user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Projects & Tests
```sql
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id INT NOT NULL,
    settings JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_organization(organization_id),
    INDEX idx_created_by(created_by),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE test_cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('WEB', 'MOBILE', 'API', 'DESKTOP'),
    steps JSON,
    data_bindings JSON,
    tags JSON,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('ACTIVE', 'DRAFT', 'DEPRECATED') DEFAULT 'ACTIVE',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_project(project_id),
    INDEX idx_type(type),
    INDEX idx_status(status),
    FULLTEXT idx_name_description(name, description),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE test_suites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_case_ids JSON,
    execution_order ENUM('SEQUENTIAL', 'PARALLEL') DEFAULT 'SEQUENTIAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE test_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_case_id INT NOT NULL,
    order_index INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    parameters JSON,
    expected_result TEXT,
    timeout INT DEFAULT 30000,
    screenshot_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_test_case(test_case_id),
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);
```

#### Object Repository
```sql
CREATE TABLE test_objects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('WEB_ELEMENT', 'MOBILE_ELEMENT', 'API_ENDPOINT'),
    locators JSON,
    properties JSON,
    screenshot_url VARCHAR(500),
    parent_id INT NULL,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    INDEX idx_name(name),
    INDEX idx_parent(parent_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES test_objects(id) ON DELETE SET NULL
);

CREATE TABLE locator_strategies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_object_id INT NOT NULL,
    strategy ENUM('XPATH', 'CSS', 'ID', 'NAME', 'CLASS', 'TAG_NAME', 'LINK_TEXT', 'PARTIAL_LINK_TEXT', 'ROLE', 'TEST_ID') NOT NULL,
    value TEXT NOT NULL,
    priority TINYINT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_object(test_object_id),
    FOREIGN KEY (test_object_id) REFERENCES test_objects(id) ON DELETE CASCADE
);
```

#### Test Execution
```sql
CREATE TABLE test_runs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    test_suite_id INT,
    environment VARCHAR(100),
    status ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'STOPPED', 'ERROR') DEFAULT 'PENDING',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    triggered_by INT,
    execution_config JSON,
    total_tests INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    failed_tests INT DEFAULT 0,
    skipped_tests INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    INDEX idx_suite(test_suite_id),
    INDEX idx_status(status),
    INDEX idx_started_at(started_at),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id),
    FOREIGN KEY (triggered_by) REFERENCES users(id)
);

CREATE TABLE test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_run_id INT NOT NULL,
    test_case_id INT NOT NULL,
    status ENUM('PASSED', 'FAILED', 'SKIPPED', 'ERROR') NOT NULL,
    duration INT,
    error_message TEXT,
    error_stack TEXT,
    screenshots JSON,
    video_url VARCHAR(500),
    logs_url VARCHAR(500),
    retry_count INT DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_run(test_run_id),
    INDEX idx_test_case(test_case_id),
    INDEX idx_status(status),
    FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
);

CREATE TABLE execution_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR') NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    INDEX idx_result(test_result_id),
    INDEX idx_level(level),
    INDEX idx_timestamp(timestamp),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE
);
```

#### Environments & Configuration
```sql
CREATE TABLE environments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500),
    variables JSON,
    credentials JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    UNIQUE KEY unique_project_env(project_id, name),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE execution_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    browser ENUM('CHROMIUM', 'FIREFOX', 'WEBKIT', 'CHROME', 'EDGE') DEFAULT 'CHROMIUM',
    device VARCHAR(100),
    parallel_sessions INT DEFAULT 1,
    timeout_settings JSON,
    headless BOOLEAN DEFAULT FALSE,
    video_recording BOOLEAN DEFAULT TRUE,
    screenshot_on_failure BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### Integrations
```sql
CREATE TABLE integrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    type ENUM('JIRA', 'GITHUB', 'GITLAB', 'SLACK', 'TEAMS', 'JENKINS', 'AZURE_DEVOPS') NOT NULL,
    config JSON NOT NULL,
    credentials_encrypted TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_organization(organization_id),
    INDEX idx_type(type),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE webhooks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSON,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### Analytics & Reporting
```sql
CREATE TABLE test_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    date DATE NOT NULL,
    total_tests INT DEFAULT 0,
    passed INT DEFAULT 0,
    failed INT DEFAULT 0,
    skipped INT DEFAULT 0,
    avg_duration DECIMAL(10,2),
    flaky_tests INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_date(project_id, date),
    UNIQUE KEY unique_project_date(project_id, date),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### AI Features
```sql
CREATE TABLE ai_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_case_id INT,
    suggestion_type ENUM('CODE_COMPLETION', 'TEST_GENERATION', 'SELF_HEALING', 'OPTIMIZATION') NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_test_case(test_case_id),
    INDEX idx_type(suggestion_type),
    INDEX idx_applied(applied),
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

CREATE TABLE self_healing_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    object_id INT NOT NULL,
    old_locator JSON NOT NULL,
    new_locator JSON NOT NULL,
    healing_strategy VARCHAR(100),
    confidence DECIMAL(3,2),
    auto_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_result(test_result_id),
    INDEX idx_object(object_id),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id),
    FOREIGN KEY (object_id) REFERENCES test_objects(id)
);
```

#### API Keys (for CI/CD)
```sql
CREATE TABLE api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user(user_id),
    INDEX idx_organization(organization_id),
    INDEX idx_key_hash(key_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

---

## Phase 2: Desktop IDE Development

### 2.1 Electron Main Process Setup

Create the Electron main process for TestMaster Desktop IDE with the following features:

#### Main Window Configuration
- Size: 1400x900 (minimum: 1024x768)
- Frame: custom (frameless with custom title bar)
- Web preferences: nodeIntegration disabled, contextIsolation enabled
- DevTools: enabled in development, disabled in production

#### Menu System
- **File**: New Project, Open Project, Save, Save All, Recent Projects, Exit
- **Edit**: Undo, Redo, Cut, Copy, Paste, Find, Replace
- **View**: Toggle Sidebar, Toggle Console, Toggle Object Repository, Zoom In/Out
- **Test**: Record Test, Run Test, Debug Test, Stop Execution
- **Tools**: Object Spy, Data Editor, Settings
- **Help**: Documentation, Keyboard Shortcuts, Check Updates, About

#### Window Management
- Handle multiple project windows
- Remember window state (size, position)
- Handle window close events (prompt to save unsaved changes)

#### IPC Handlers
- File system operations (read/write test files)
- Project management (create, open, save)
- Test execution (start, stop, status updates)
- Object repository operations
- Settings management

#### Additional Features
- Auto-updater integration (using electron-updater)
- Deep linking support (testmaster://)
- Native notifications for test completion
- Crash reporting and error handling

### 2.2 Test Recorder Implementation

Implement the Test Recorder feature that records user interactions in a browser and converts them to test steps.

#### Recorder UI
- Start/Stop recording button
- Pause/Resume recording
- Browser selection (Chromium, Firefox, WebKit)
- Recording status indicator (red dot when recording)
- Recorded steps list with real-time updates
- Element picker tool

#### Recording Capabilities
- Click events (identify element and position)
- Text input (capture input value)
- Keyboard events (enter, tab, escape)
- Navigation (page load, back, forward)
- Assertions (verify text, element present, URL)
- Wait conditions (wait for element, wait for navigation)
- Scroll events
- Hover events
- Drag and drop

#### Smart Element Detection
- Generate multiple locator strategies (id, css, xpath, text, role)
- Prioritize stable locators (id > class > xpath)
- Detect dynamic elements (auto-generated IDs)
- Suggest data-testid attributes
- Generate readable element names

#### Playwright Integration
- Launch browser with CDP (Chrome DevTools Protocol)
- Inject recorder script into pages
- Capture DOM snapshots
- Take screenshots for each step
- Handle iframes and shadow DOM

#### Test Case Generation
- Convert recorded actions to test steps
- Generate Playwright test code
- Create object repository entries
- Add comments for clarity
- Format code with Prettier

### 2.3 Test Case Editor (Manual View)

Create a visual test case editor with drag-and-drop interface for building tests without coding.

#### Test Step Library (draggable items)

**Web Actions:**
- Navigate to URL
- Click Element
- Type Text
- Select Option
- Check/Uncheck Checkbox
- Upload File
- Switch Frame
- Switch Window
- Execute JavaScript

**Verifications:**
- Verify Element Present
- Verify Text Equals
- Verify Text Contains
- Verify Element Visible
- Verify Element Enabled
- Verify Element Checked
- Verify URL
- Verify Title

**Wait Actions:**
- Wait for Element
- Wait for URL
- Wait for Condition
- Wait (Sleep)

**Control Flow:**
- If Condition
- Loop (For Each)
- Try-Catch
- Break
- Continue

#### Test Step Editor Interface
- Drag-and-drop area for steps
- Step reordering (up/down arrows or drag)
- Step configuration panel:
  - Action selection dropdown
  - Target element selector (with object spy button)
  - Input values
  - Expected results
  - Timeout settings
- Step enable/disable toggle
- Step description/comment field
- Screenshot preview for element steps

#### Object Spy Integration
- Click "Select Element" button
- Overlay on target application
- Hover highlight elements
- Click to select element
- Show element details (tag, attributes, text)
- Generate and show multiple locators
- Save to object repository option

#### Data Binding
- Variable dropdown for input fields
- Support for ${variables} syntax
- Link to test data sources (CSV, Excel, JSON)
- Parameter dialog for data-driven tests

### 2.4 Script View with Monaco Editor

Implement the Script View with Monaco Editor for advanced users to write test code directly.

#### Monaco Editor Integration
- Language: JavaScript/TypeScript
- Theme: VS Dark (with light mode option)
- Syntax highlighting for Playwright API
- Auto-completion for Playwright methods
- Inline error detection
- Code folding
- Minimap
- Line numbers with breakpoint gutter

#### Playwright IntelliSense
- Auto-complete for page.* methods
- Auto-complete for locator methods
- Signature help (parameter hints)
- Hover documentation
- Go to definition (for custom keywords)
- Import suggestions

#### Custom Keywords Support
- Define reusable keywords/functions
- Keyword library panel
- Drag keyword into editor
- Auto-import custom keywords

#### Test Template Snippets
- Basic test structure
- Page Object Model template
- API test template
- Data-driven test template
- Common patterns (login, form fill, etc.)

#### Code Actions
- Format code (Prettier)
- Organize imports
- Extract to custom keyword
- Quick fix for common errors

#### Features
- Split view (edit multiple files)
- Find and replace (with regex support)
- Multi-cursor editing
- Command palette (Cmd/Ctrl + Shift + P)
- Breadcrumb navigation
- Go to line
- Bracket matching

#### Debugging Integration
- Set breakpoints (click line gutter)
- Debug toolbar (step over, step into, continue)
- Variable inspection panel
- Watch expressions
- Call stack view

### 2.5 Object Repository Manager

Create the Object Repository feature for centralized element management.

#### Object Repository UI
- Tree view of objects (hierarchical with folders)
- Toolbar: Add Object, Add Folder, Import, Export, Search
- List view with columns: Name, Type, Locators, Tags, Last Modified
- Detail panel showing object properties

#### Object Creation/Editing
- Object name (required, unique)
- Object type (Web Element, Mobile Element, API Endpoint)
- Locator strategies (multiple per object):
  - XPath (with builder tool)
  - CSS Selector
  - ID
  - Name
  - Class
  - Tag Name
  - Link Text / Partial Link Text
  - Role (accessibility)
  - Test ID (data-testid)
- Priority for each locator (Primary, Secondary, Tertiary)
- Element properties (tag, attributes, text)
- Parent object (for hierarchical objects)
- Tags for categorization
- Description/notes
- Screenshot of element

#### Locator Builder Tool
- Visual XPath/CSS builder
- Locator tester (test if element found)
- Locator validator (check uniqueness)
- Suggestions for improvements
- Relative locator support (above, below, near, etc.)

#### Object Spy (integrated)
- Launch target application
- Select element visually
- Capture all possible locators
- Show element hierarchy
- View computed styles
- Save to repository

#### Self-Healing Configuration
- Enable/disable per object
- Healing strategies (try all locators, similarity matching)
- Confidence threshold
- Fallback locators

#### Bulk Operations
- Import objects from file (JSON, Excel)
- Export objects
- Bulk edit (tags, properties)
- Bulk delete
- Find unused objects

### 2.6 Test Execution Panel

Implement the test execution panel with real-time progress, logs, and results.

#### Execution Controls
- Run button (start execution)
- Debug button (run with debugging)
- Stop button (terminate execution)
- Pause button (pause execution)
- Browser selection dropdown
- Execution profile selection
- Headless mode toggle
- Video recording toggle

#### Progress Display
- Overall progress bar
- Current test case name
- Current step description
- Step progress indicator
- Elapsed time
- Estimated remaining time

#### Real-time Logs
- Log viewer with auto-scroll
- Log levels: DEBUG, INFO, WARN, ERROR
- Timestamps
- Color-coded by level
- Filter by log level
- Search logs
- Export logs

#### Test Results Tree
- Hierarchical view (Suite > Test Case > Steps)
- Status icons (✓ Passed, ✗ Failed, ⊘ Skipped)
- Expandable tree nodes
- Click to view details
- Summary counts (passed, failed, skipped)

#### Step Details Panel
- Step name and action
- Status and duration
- Input parameters
- Expected vs actual results
- Error message (if failed)
- Stack trace (if error)
- Screenshot (before/after)
- Video clip (for failed steps)

#### Screenshot Gallery
- Thumbnail view of all screenshots
- Click to enlarge
- Before/after comparison
- Download screenshot

#### Video Player
- Embedded video player
- Play/pause controls
- Timeline with step markers
- Jump to specific step in video
- Download video

#### Failure Analysis
- Root cause suggestions (AI-powered)
- Similar failures in history
- Self-healing suggestions
- Quick fix actions

#### Execution Statistics
- Total duration
- Tests passed/failed/skipped
- Pass rate percentage
- Average step duration
- Browser/environment info

#### Actions
- Re-run failed tests
- Generate test report
- Share results
- Export to TestOps
- Create bug report (Jira integration)

---

## Phase 3: Backend API Development

### 3.1 Authentication & Authorization

Implement a complete authentication and authorization system for the TestMaster API.

#### User Registration
- Email validation (RFC 5322 compliant)
- Password requirements (min 8 chars, uppercase, lowercase, number, special char)
- Password hashing (bcrypt with salt rounds: 12)
- Email verification flow (send verification token)
- Organization creation (user becomes admin)

#### User Login
- Email/password authentication
- JWT token generation (access token + refresh token)
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Store refresh token in database
- Return user profile with tokens

#### Token Management
- Refresh token endpoint
- Token revocation (logout)
- Invalidate all user tokens (logout all devices)
- JWT payload: { userId, email, role, organizationId }

#### Password Management
- Forgot password flow
- Send reset password email
- Reset password with token
- Change password (authenticated)

#### Social Authentication (OAuth)
- Google OAuth 2.0
- GitHub OAuth
- Callback handlers
- Link social account to existing user

#### Role-Based Access Control (RBAC)
- Roles: SUPER_ADMIN, ORG_ADMIN, TESTER, VIEWER
- Permission system:
  - CREATE_PROJECT, EDIT_PROJECT, DELETE_PROJECT
  - CREATE_TEST, EDIT_TEST, DELETE_TEST, EXECUTE_TEST
  - MANAGE_USERS, MANAGE_INTEGRATIONS
  - VIEW_REPORTS, VIEW_ANALYTICS
- Middleware: requireAuth, requireRole, requirePermission

#### Organization Management
- Create organization (during signup)
- Update organization settings
- Invite users to organization (send invite email)
- Accept/decline invite
- Remove user from organization
- Transfer organization ownership

#### API Key Management
- Generate API key (for CI/CD)
- List API keys
- Revoke API key
- API key authentication middleware

#### Session Management
- Track active sessions
- Store in Redis
- Session timeout
- Force logout (admin action)

#### Security Features
- Rate limiting (express-rate-limit)
- Account lockout after failed attempts
- CORS configuration
- Helmet.js security headers
- XSS protection
- CSRF protection for web clients

### 3.2 Project & Test Case Management

Create comprehensive API endpoints for project and test case management.

#### Projects API

**CRUD Operations:**
- POST /api/projects - Create project
- GET /api/projects - List projects (with pagination, search, filter)
- GET /api/projects/:id - Get project details
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project (soft delete)

**Project Model:**
- name (string, required)
- description (text)
- organization_id (foreign key)
- settings (JSONB): { baseUrl, defaultBrowser, timeout, retries, screenshots }
- created_by (user_id)
- created_at, updated_at, deleted_at

**Project Settings:**
- PUT /api/projects/:id/settings - Update settings
- Default execution configuration
- Environment variables
- Notification preferences

**Team Management:**
- POST /api/projects/:id/members - Add member
- GET /api/projects/:id/members - List members
- DELETE /api/projects/:id/members/:userId - Remove member
- PUT /api/projects/:id/members/:userId/role - Change member role

#### Test Cases API

**CRUD Operations:**
- POST /api/projects/:projectId/tests - Create test case
- GET /api/projects/:projectId/tests - List test cases
- GET /api/tests/:id - Get test case details
- PUT /api/tests/:id - Update test case
- DELETE /api/tests/:id - Delete test case
- POST /api/tests/:id/duplicate - Duplicate test case

**Test Case Model:**
- name (string, required)
- description (text)
- type (enum: WEB, MOBILE, API, DESKTOP)
- steps (JSON array of step objects)
- data_bindings (JSON object for data-driven testing)
- tags (JSON array)
- priority (enum: LOW, MEDIUM, HIGH, CRITICAL)
- status (enum: ACTIVE, DRAFT, DEPRECATED)
- project_id (foreign key)
- created_by (user_id)
- created_at, updated_at, deleted_at

**Query Features:**
- Pagination (page, limit)
- Sorting (by name, created_at, updated_at, priority)
- Search (full-text search on name and description)
- Filter by type, status, tags, priority
- Filter by date range

**Test Case Operations:**
- Get test case with all steps
- Get test case execution history
- Get test case statistics (total runs, pass rate, avg duration)
- Clone test case (duplicate with new name)
- Export test case (JSON format)
- Import test case (from JSON)

#### Test Suites API

**CRUD Operations:**
- POST /api/projects/:projectId/suites - Create test suite
- GET /api/projects/:projectId/suites - List test suites
- GET /api/suites/:id - Get suite details
- PUT /api/suites/:id - Update suite
- DELETE /api/suites/:id - Delete suite

**Test Suite Model:**
- name (string, required)
- description (text)
- project_id (foreign key)
- test_case_ids (JSON array)
- execution_order (enum: SEQUENTIAL, PARALLEL)

**Suite Operations:**
- POST /api/suites/:id/tests - Add test cases to suite
- DELETE /api/suites/:id/tests/:testId - Remove test case from suite
- PUT /api/suites/:id/reorder - Reorder test cases
- POST /api/suites/:id/execute - Execute test suite

#### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 3.3 Test Execution Engine

Create a robust test execution engine that runs Playwright tests and manages execution lifecycle.

#### Execution Manager

**Test Runner:**
- Parse test case JSON to Playwright code
- Execute tests in isolated browser contexts
- Support parallel execution (multiple workers)
- Handle execution profiles (browser, device, headless)
- Capture screenshots and videos
- Generate execution logs
- Real-time progress updates via WebSocket

**Step Executor:**
- Navigate to URL
- Click element (with retry logic)
- Type text (with optional delay)
- Select dropdown option
- Check/uncheck checkbox/radio
- Upload file
- Switch frame/window
- Execute JavaScript
- Wait for element/condition
- Assertions (text, visibility, value, URL, etc.)
- API calls (for API testing)

**Element Locator:**
- Try locator strategies in priority order
- Fallback to alternative locators on failure
- Self-healing: try similar locators
- Wait for element with timeout
- Handle dynamic elements
- Shadow DOM support

**Error Handling:**
- Retry failed steps (configurable retry count)
- Screenshot on failure
- Detailed error messages
- Stack trace capture
- Continue on error (optional)

**Execution Context:**
- Manage browser lifecycle
- Context isolation per test
- Shared state between steps (variables)
- Data-driven execution (loop through data sets)
- Environment variables

**Reporting:**
- JUnit XML format
- HTML report
- JSON report
- Custom format support

#### API Endpoints

1. POST /api/executions - Start test execution
   ```json
   {
     "projectId": 1,
     "suiteId": 10,
     "environment": "staging",
     "profile": "chrome-headless",
     "parallelSessions": 3
   }
   ```

2. GET /api/executions/:id - Get execution status
3. POST /api/executions/:id/stop - Stop execution
4. GET /api/executions/:id/logs - Stream execution logs (WebSocket)
5. GET /api/executions/:id/results - Get execution results

#### Real-time Updates

**WebSocket Events:**
- execution.started
- execution.progress (% complete, current test)
- execution.step (step started/completed)
- execution.screenshot (screenshot captured)
- execution.completed
- execution.failed
- execution.log (log message)

**Socket.io Implementation:**
```javascript
io.on('connection', (socket) => {
  socket.on('subscribe:execution', (executionId) => {
    socket.join(`execution:${executionId}`);
  });
});

// Emit from execution engine
io.to(`execution:${executionId}`).emit('execution.progress', data);
```

#### Job Queue (BullMQ)

1. Queue: test-execution-queue
2. Job Data: { executionId, projectId, suiteId, config }
3. Worker: Process test execution jobs
4. Concurrency: Based on available resources
5. Job Events: completed, failed, progress
6. Retry Logic: Retry failed jobs with exponential backoff

#### Self-Healing

1. When locator fails:
   - Try alternative locators from object repository
   - Try AI-based similar element detection (visual similarity)
   - Generate new locator suggestions
   - Log healing attempt with confidence score
   - Auto-update object if confidence > 0.8

2. Healing Strategies:
   - Locator similarity matching
   - Visual appearance matching (screenshot comparison)
   - Text content matching
   - Position-based matching (relative locators)

### 3.4 Object Repository API

Implement API endpoints for managing test objects and object repository.

#### Object Repository API

**CRUD Operations:**
- POST /api/projects/:projectId/objects - Create test object
- GET /api/projects/:projectId/objects - List objects (tree structure)
- GET /api/objects/:id - Get object details
- PUT /api/objects/:id - Update object
- DELETE /api/objects/:id - Delete object
- POST /api/objects/:id/duplicate - Duplicate object

**Test Object Model:**
- name (string, required, unique within project)
- type (enum: WEB_ELEMENT, MOBILE_ELEMENT, API_ENDPOINT)
- locators (JSON array of locator strategies)
- properties (JSON object: tag, attributes, text, etc.)
- screenshot_url (string)
- parent_id (for hierarchical organization)
- tags (JSON array)
- project_id (foreign key)

**Locator Strategies Model:**
- test_object_id (foreign key)
- strategy (enum: XPATH, CSS, ID, NAME, CLASS, TAG_NAME, LINK_TEXT, PARTIAL_LINK_TEXT, ROLE, TEST_ID)
- value (text)
- priority (integer, 0 = highest)
- is_primary (boolean)

**Object Operations:**
- POST /api/objects/bulk - Bulk create objects
- POST /api/objects/import - Import from JSON/Excel
- GET /api/objects/export - Export to JSON/Excel
- POST /api/objects/:id/locators - Add locator strategy
- PUT /api/objects/:id/locators/:locatorId - Update locator
- DELETE /api/objects/:id/locators/:locatorId - Delete locator
- POST /api/objects/:id/test - Test locator (find element on page)

**Object Search & Filter:**
- Search by name (full-text)
- Filter by type
- Filter by tags
- Filter by usage (used/unused)
- Filter by last modified date

**Object Usage Tracking:**
- GET /api/objects/:id/usage - Get test cases using this object
- Track last used timestamp
- Track usage frequency
- Identify unused objects

**Object Validation:**
- POST /api/objects/:id/validate - Validate locators against page
- Check if locators are unique
- Check if locators find elements
- Return validation report

#### Hierarchical Structure
Support folder-like organization:
```
Project
├── Login Page
│   ├── Username Input
│   ├── Password Input
│   └── Login Button
├── Dashboard Page
│   ├── Menu
│   └── Content Area
└── API Endpoints
    ├── Auth API
    └── User API
```

#### Object Sync Service
1. Real-time sync between desktop app and backend
2. Conflict resolution (last-write-wins or manual merge)
3. Version history for objects
4. Rollback to previous version

#### Response Example
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "loginButton",
    "type": "WEB_ELEMENT",
    "locators": [
      {
        "id": 1,
        "strategy": "ID",
        "value": "login-btn",
        "priority": 0,
        "is_primary": true
      },
      {
        "id": 2,
        "strategy": "CSS",
        "value": "button[type='submit']",
        "priority": 1,
        "is_primary": false
      }
    ],
    "properties": {
      "tag": "button",
      "type": "submit",
      "text": "Login"
    },
    "screenshot_url": "https://s3.../object-123.png",
    "usageCount": 5,
    "lastUsed": "2025-10-20T10:30:00Z"
  }
}
```

### 3.5 Analytics & Reporting API

Create comprehensive analytics and reporting API for test insights and dashboards.

#### Dashboard API

1. GET /api/dashboard/overview
   - Total tests (all time)
   - Total test runs (last 30 days)
   - Pass rate (last 30 days)
   - Average execution time
   - Most active projects
   - Recent test runs

2. GET /api/dashboard/trends
   - Daily test execution trends (last 30 days)
   - Pass rate trends
   - Execution time trends
   - Test coverage trends

3. GET /api/dashboard/project/:id
   - Project-specific metrics
   - Test case distribution by type
   - Test execution frequency
   - Team activity

#### Test Execution Reports API

1. GET /api/reports/executions
   - List test executions with filters
   - Pagination and sorting
   - Filter by date range, project, status

2. GET /api/reports/executions/:id
   - Detailed execution report
   - Test results tree
   - Execution timeline
   - Screenshots and videos

3. GET /api/reports/executions/:id/pdf
   - Generate PDF report
   - Include summary, charts, and details
   - Customizable templates

4. GET /api/reports/executions/:id/html
   - Generate HTML report
   - Interactive charts
   - Expandable test results

#### Analytics API

1. GET /api/analytics/pass-rate
   - Pass rate by project
   - Pass rate by test suite
   - Pass rate trends over time
   - Pass rate by browser/device

2. GET /api/analytics/flaky-tests
   - Identify flaky tests (inconsistent results)
   - Flakiness score calculation
   - Recommendations to improve stability

3. GET /api/analytics/execution-time
   - Average execution time by test
   - Slowest tests
   - Execution time trends
   - Performance regression detection

4. GET /api/analytics/coverage
   - Test coverage metrics
   - Uncovered application areas
   - Coverage by feature/module

5. GET /api/analytics/failure-analysis
   - Common failure patterns
   - Failure by error type
   - Failure by step type
   - Root cause analysis

#### Custom Reports API

1. POST /api/reports/custom
   - Create custom report configuration
   - Define metrics, filters, and visualizations
   - Save report templates

2. GET /api/reports/custom/:id
   - Generate custom report
   - Apply saved configuration
   - Export in various formats

3. GET /api/reports/templates
   - List available report templates
   - Predefined templates for common use cases

#### Data Aggregation
1. Daily metrics aggregation job
2. Weekly trend calculations
3. Monthly performance summaries
4. Real-time dashboard updates

#### Response Format
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalTests": 1250,
      "totalRuns": 5420,
      "passRate": 87.5,
      "avgExecutionTime": 45.2
    },
    "trends": [
      { "date": "2025-06-01", "passRate": 85.2, "executions": 120 },
      { "date": "2025-06-02", "passRate": 87.5, "executions": 135 }
    ],
    "charts": {
      "passRateChart": "dataURL",
      "executionTrendChart": "dataURL"
    }
  }
}
```

### 3.6 AI Integration Service

Implement AI integration service for test automation enhancements.

#### Natural Language to Test Case

1. POST /api/ai/generate-test
   - Convert natural language description to test steps
   - Input: "Test login functionality with valid credentials"
   - Output: Structured test case with steps
   - Support for complex scenarios

2. POST /api/ai/enhance-test
   - Improve existing test cases
   - Add missing assertions
   - Optimize wait conditions
   - Suggest alternative locators

#### Smart Code Completion

1. POST /api/ai/code-complete
   - Auto-complete test code
   - Context-aware suggestions
   - Learn from project patterns
   - Support for custom keywords

#### Self-Healing Suggestions

1. POST /api/ai/heal-test
   - Analyze failed test
   - Suggest locator fixes
   - Provide confidence scores
   - Auto-apply if confidence > threshold

2. GET /api/ai/healing-history
   - Track healing suggestions
   - Success rate metrics
   - Feedback loop for improvement

#### Test Case Generation

1. POST /api/ai/generate-from-requirements
   - Parse requirements document
   - Generate test cases
   - Identify test scenarios
   - Create test data

2. POST /api/ai/generate-from-ui
   - Analyze application UI
   - Generate test cases for each screen
   - Identify testable elements
   - Create object repository entries

#### Test Optimization

1. POST /api/ai/optimize-test
   - Analyze test execution time
   - Suggest optimizations
   - Identify redundant steps
   - Recommend parallel execution

2. POST /api/ai/identify-flaky-tests
   - Analyze test execution history
   - Identify flaky patterns
   - Suggest stabilization techniques

#### Implementation

1. LLM Provider Integration:
   - OpenAI GPT-4 API
   - Anthropic Claude API
   - Fallback mechanism
   - Rate limiting and cost management

2. Prompt Engineering:
   - Carefully crafted prompts for each use case
   - Context injection (project-specific information)
   - Output format control (JSON schema validation)
   - Temperature and token settings optimization

3. Response Processing:
   - Parse LLM responses
   - Validate against schemas
   - Post-processing for accuracy
   - Error handling and retries

4. Caching Strategy:
   - Cache similar requests
   - Reduce API costs
   - Improve response times
   - Cache invalidation rules

5. Usage Tracking:
   - Track AI feature usage
   - Monitor costs
   - Measure effectiveness
   - User feedback collection

#### Security
1. API key management
2. Request sanitization
3. Response filtering
4. Rate limiting per user
5. Audit logging

#### Response Format
```json
{
  "success": true,
  "data": {
    "testSteps": [
      {
        "action": "Navigate to URL",
        "parameters": { "url": "https://example.com/login" },
        "description": "Open login page"
      },
      {
        "action": "Type Text",
        "parameters": { "locator": "#username", "text": "${username}" },
        "description": "Enter username"
      }
    ],
    "confidence": 0.92,
    "suggestions": [
      "Add assertion for successful login",
      "Consider testing with invalid credentials"
    ]
  }
}
```

---

## Phase 4: Web Portal Development

### 4.1 Next.js Setup & Authentication

Setup Next.js 14 web portal with authentication and basic layout.

#### Next.js Configuration
1. Setup Next.js 14 with App Router
2. TypeScript configuration with strict mode
3. Tailwind CSS for styling
4. Environment variables setup
5. Absolute imports configuration

#### Authentication
1. Login page (/login)
   - Email/password form
   - Social login buttons (Google, GitHub)
   - Remember me option
   - Forgot password link
   - Sign up link

2. Sign up page (/signup)
   - Registration form
   - Organization creation
   - Email verification
   - Terms and conditions

3. Auth middleware
   - Protect routes
   - Redirect unauthenticated users
   - JWT token handling
   - Refresh token mechanism

4. Auth context
   - User state management
   - Login/logout functions
   - Token refresh
   - Session persistence

#### Layout
1. App layout (app/layout.tsx)
   - Navigation sidebar
   - Top header with user menu
   - Footer
   - Theme provider (dark/light mode)

2. Dashboard layout (app/(dashboard)/layout.tsx)
   - Breadcrumb navigation
   - Page title
   - Actions toolbar

3. Navigation Structure:
   - Dashboard
   - Projects
   - Test Cases
   - Test Executions
   - Reports
   - Object Repository
   - Settings
   - Team Management

#### UI Components
1. Using shadcn/ui components
2. Custom components for specific needs
3. Responsive design
4. Loading states
5. Error boundaries

#### State Management
1. Zustand stores
   - Auth store
   - UI store
   - Project store
   - Test store

#### API Integration
1. Axios instance with interceptors
2. Request/response handling
3. Error handling
4. Loading states

### 4.2 Dashboard & Analytics

Create comprehensive dashboard with analytics and visualizations.

#### Dashboard Overview

1. Key Metrics Cards:
   - Total tests
   - Test executions (last 30 days)
   - Pass rate
   - Average execution time
   - Active projects
   - Team members

2. Charts and Visualizations:
   - Test execution trend (line chart)
   - Pass rate trend (area chart)
   - Test distribution by type (pie chart)
   - Execution time by project (bar chart)
   - Browser usage distribution (donut chart)

3. Recent Activity:
   - Recent test executions
   - Recent test case changes
   - Team activity feed
   - System notifications

4. Quick Actions:
   - Run test suite
   - Create new test case
   - Schedule execution
   - Generate report

#### Project Dashboard
1. Project-specific metrics
2. Test case distribution
3. Execution history
4. Team activity

#### Test Execution Dashboard
1. Real-time execution status
2. Progress indicators
3. Live logs
4. Results summary

#### Analytics Pages

1. Test Analytics (/analytics/tests)
   - Test execution trends
   - Pass rate analysis
   - Flaky test identification
   - Test coverage metrics

2. Performance Analytics (/analytics/performance)
   - Execution time analysis
   - Slowest tests
   - Performance trends
   - Bottleneck identification

3. Failure Analytics (/analytics/failures)
   - Common failure patterns
   - Error categorization
   - Failure trends
   - Root cause analysis

#### Implementation Details
1. Use Recharts for data visualization
2. Responsive design for mobile/tablet
3. Interactive charts with tooltips
4. Date range filters
5. Export functionality for charts
6. Real-time updates with WebSocket
7. Caching for performance

#### Data Fetching
1. Server-side rendering for initial data
2. Client-side data fetching with SWR or React Query
3. Optimistic updates
4. Error handling with retry

#### Response Format
```typescript
interface DashboardData {
  metrics: {
    totalTests: number;
    totalExecutions: number;
    passRate: number;
    avgExecutionTime: number;
    activeProjects: number;
    teamMembers: number;
  };
  trends: {
    executions: Array<{ date: string; count: number }>;
    passRate: Array<{ date: string; rate: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'execution' | 'test_change' | 'team_activity';
    message: string;
    timestamp: string;
    user?: string;
  }>;
}
```

### 4.3 Project & Test Case Management

Implement project and test case management pages for the web portal.

#### Projects Management

1. Projects List (/projects)
   - Table with project details
   - Search and filter
   - Pagination
   - Sort by name, created date, last activity
   - Actions: View, Edit, Delete

2. Project Details (/projects/[id])
   - Project information
   - Test cases list
   - Test suites
   - Team members
   - Settings tab
   - Activity feed

3. Create/Edit Project (/projects/new, /projects/[id]/edit)
   - Project form
   - Team member management
   - Settings configuration

#### Test Cases Management

1. Test Cases List (/projects/[id]/tests)
   - Table with test case details
   - Filter by type, status, priority, tags
   - Search functionality
   - Bulk actions (delete, change status, add tags)
   - Pagination
   - Sort options

2. Test Case Details (/projects/[id]/tests/[testId])
   - Test case information
   - Test steps (visual view)
   - Script view
   - Execution history
   - Usage statistics
   - Comments/discussion

3. Create/Edit Test Case (/projects/[id]/tests/new, /projects/[id]/tests/[testId]/edit)
   - Test case form
   - Visual test builder
   - Script editor
   - Object repository integration
   - Data binding configuration

4. Test Case Builder
   - Drag-and-drop interface
   - Step library
   - Step configuration panel
   - Preview functionality

#### Test Suites Management

1. Test Suites List (/projects/[id]/suites)
   - Table with suite details
   - Actions: Run, Edit, Delete

2. Create/Edit Test Suite (/projects/[id]/suites/new, /projects/[id]/suites/[suiteId]/edit)
   - Suite form
   - Test case selection
   - Execution order configuration

#### Object Repository
1. Object Repository (/projects/[id]/objects)
   - Tree view of objects
   - Search and filter
   - Add/edit/delete objects
   - Locator management

#### Implementation Details
1. Use React Hook Form for form handling
2. Zod for validation
3. TanStack Query for data fetching
4. Optimistic updates
5. Error handling
6. Loading states
7. Confirmation dialogs for destructive actions

#### UI Components
1. Data tables with sorting/filtering
2. Forms with validation
3. Modal dialogs
4. Confirmation prompts
5. Loading skeletons
6. Empty states
7. Error states

#### Response Format
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  settings: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  testCasesCount: number;
  lastExecutionAt?: string;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'WEB' | 'MOBILE' | 'API' | 'DESKTOP';
  steps: TestStep[];
  dataBindings: Record<string, any>;
  tags: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  projectId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  executionHistory: Execution[];
}
```

### 4.4 Test Execution & Reports

Implement test execution management and reporting features for the web portal.

#### Test Executions

1. Executions List (/projects/[id]/executions)
   - Table with execution details
   - Filter by status, date range, environment
   - Search functionality
   - Pagination
   - Actions: View, Stop, Rerun, Delete

2. Execution Details (/projects/[id]/executions/[executionId])
   - Execution summary
   - Progress indicator
   - Real-time logs
   - Test results tree
   - Screenshots and videos
   - Failure analysis

3. New Execution (/projects/[id]/executions/new)
   - Test suite selection
   - Environment configuration
   - Execution profile settings
   - Schedule options
   - Notification settings

4. Execution Monitoring
   - Real-time progress updates
   - Live logs streaming
   - Step-by-step progress
   - Resource usage monitoring

#### Test Reports

1. Reports List (/projects/[id]/reports)
   - Table with report details
   - Filter by type, date range
   - Actions: View, Download, Delete

2. Report Viewer (/projects/[id]/reports/[reportId])
   - Interactive report display
   - Charts and visualizations
   - Test results details
   - Export options

3. Report Builder (/projects/[id]/reports/new)
   - Report type selection
   - Metrics configuration
   - Filters and parameters
   - Visualization options
   - Scheduling options

4. Report Templates
   - Predefined templates
   - Custom template creation
   - Template sharing

#### Implementation Details
1. WebSocket integration for real-time updates
2. File upload/download for reports
3. Chart rendering with Recharts
4. PDF generation capability
5. Email report delivery
6. Report scheduling

#### UI Components
1. Execution status indicators
2. Progress bars
3. Log viewer with syntax highlighting
4. Test results tree
5. Screenshot gallery
6. Video player
7. Chart components
8. Filter panels

#### Response Format
```typescript
interface Execution {
  id: string;
  projectId: string;
  suiteId?: string;
  environment: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'STOPPED' | 'ERROR';
  startedAt?: string;
  completedAt?: string;
  triggeredBy: string;
  executionConfig: Record<string, any>;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  createdAt: string;
}

interface TestResult {
  id: string;
  executionId: string;
  testCaseId: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  screenshots: string[];
  videoUrl?: string;
  logsUrl?: string;
  retryCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
```

---

## Phase 5: Integration & Deployment

### 5.1 CI/CD Pipeline

Create GitHub Actions CI/CD pipeline for TestMaster application.

#### CI Pipeline (.github/workflows/ci.yml)

**Triggers:**
- Push to main/develop branches
- Pull requests

**Jobs:**
- Lint and format check
- Type checking
- Unit tests
- Integration tests
- E2E tests
- Build artifacts
- Security scan

**Steps:**
- Checkout code
- Setup Node.js
- Cache dependencies
- Install dependencies
- Run linting
- Run type checking
- Run unit tests
- Run integration tests
- Run E2E tests
- Build packages
- Upload artifacts

#### CD Pipeline (.github/workflows/cd.yml)

**Triggers:**
- Release to main branch
- Manual workflow dispatch

**Jobs:**
- Build application packages
- Deploy to staging
- Run smoke tests
- Deploy to production
- Notify team

**Steps:**
- Checkout code
- Setup Node.js
- Install dependencies
- Build packages
- Deploy to staging
- Run smoke tests
- Deploy to production
- Send notifications

#### Release Pipeline (.github/workflows/release.yml)

**Triggers:**
- Git tags (v*.*.*)

**Jobs:**
- Create release
- Build desktop app
- Build CLI tool
- Generate changelog
- Upload release assets

**Steps:**
- Checkout code
- Setup Node.js
- Install dependencies
- Build packages
- Build desktop app (Electron)
- Build CLI tool
- Generate changelog
- Create GitHub release
- Upload release assets

#### Security Scanning (.github/workflows/security.yml)

**Triggers:**
- Schedule (weekly)
- Manual workflow dispatch

**Jobs:**
- Dependency vulnerability scan
- Code security scan

**Steps:**
- Checkout code
- Run npm audit
- Run Snyk security scan
- Run CodeQL analysis

#### Workflow Configuration
1. Environment variables
2. Secrets management
3. Conditional execution
4. Parallel jobs
5. Job dependencies
6. Artifact retention
7. Caching strategies

#### Notification Setup
1. Slack notifications
2. Email notifications
3. GitHub status checks
4. Deployment status updates

---

## Phase 6: Advanced Features

### 6.1 Self-Healing Tests

Implement self-healing test functionality to automatically fix failing tests.

#### Self-Healing Engine

**Failure Detection:**
- Identify locator failures
- Detect element not found errors
- Recognize timeout errors
- Identify assertion failures

**Healing Strategies:**
- Alternative locators from object repository
- Dynamic locator generation
- Visual similarity matching
- Text content matching
- Position-based matching
- AI-powered suggestions

**Healing Process:**
- Analyze failure context
- Generate healing options
- Calculate confidence scores
- Apply healing if confidence > threshold
- Log healing attempt
- Update object repository if successful

**Visual Matching:**
- Screenshot comparison
- Element visual features extraction
- Similarity scoring
- Position verification

**AI-Powered Healing:**
- Use LLM to suggest fixes
- Context-aware suggestions
- Learning from successful healings
- Feedback loop for improvement

#### Implementation
1. SelfHealingEngine class
2. HealingStrategy interface
3. VisualMatcher class
4. AIHealingService class
5. HealingLogger class
6. HealingConfig interface

#### Configuration
1. Enable/disable self-healing
2. Confidence threshold settings
3. Healing strategy priorities
4. Auto-apply settings
5. Logging preferences

#### Reporting
1. Healing attempts log
2. Success rate metrics
3. Healing suggestions
4. Manual review queue

#### Integration
1. Integration with test execution engine
2. Object repository updates
3. Test case modifications
4. Healing analytics

### 6.2 Visual Testing

Implement visual testing capabilities for UI validation.

#### Visual Testing Engine

**Screenshot Capture:**
- Full page screenshots
- Element screenshots
- Viewport-specific screenshots
- Multiple device screenshots
- Before/after action screenshots

**Visual Comparison:**
- Pixel-by-pixel comparison
- Layout comparison
- Content comparison
- Ignore regions configuration
- Comparison tolerance settings

**Visual Regression Detection:**
- Detect UI changes
- Categorize differences (critical, minor)
- Highlight differences
- Generate diff reports

**Baseline Management:**
- Create baseline images
- Update baselines
- Version control for baselines
- Baseline approval workflow

**Cross-Browser Testing:**
- Visual comparison across browsers
- Responsive design validation
- Device-specific testing

#### Implementation
1. VisualTestingEngine class
2. ScreenshotCapture class
3. ImageComparator class
4. BaselineManager class
5. DiffReporter class

#### Configuration
1. Screenshot settings
2. Comparison thresholds
3. Ignore regions
4. Baseline management
5. Reporting options

#### Integration
1. Integration with test steps
2. Visual assertion commands
3. Test execution hooks
4. Reporting integration

#### AI Enhancement
1. AI-powered difference analysis
2. Smart ignore regions
3. Visual change categorization
4. Automated baseline updates

### 6.3 API Testing

Implement comprehensive API testing capabilities.

#### API Testing Engine

**HTTP Request Support:**
- GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- Request headers management
- Request body (JSON, XML, form-data, raw)
- Query parameters
- Authentication (Basic, Bearer, OAuth, API Key)

**Response Validation:**
- Status code validation
- Response headers validation
- Response body validation (JSON schema)
- Response time validation
- Custom assertions

**API Test Steps:**
- Send request
- Validate response
- Extract values from response
- Chain requests (use response data)
- File upload/download

**API Test Case Management:**
- Create API test cases
- Organize in collections
- Environment variables
- Global variables
- Data-driven testing

**API Documentation Integration:**
- Import from OpenAPI/Swagger
- Generate test cases from API spec
- Validate API compliance

#### Implementation
1. APITestingEngine class
2. HTTPClient class
3. ResponseValidator class
4. VariableManager class
5. APITestCase class

#### Configuration
1. Request settings
2. Validation rules
3. Environment variables
4. Authentication methods
5. Timeout settings

#### Integration
1. Integration with test execution engine
2. API test step types
3. Mixed web/API test scenarios
4. Reporting integration

#### Advanced Features
1. API mocking
2. Contract testing
3. Performance testing basics
4. API security testing

---

## Conclusion

This comprehensive implementation guide provides a detailed roadmap for building TestMaster, a Katalon clone application. The modular architecture allows for incremental development and testing of each component. The technology stack chosen (Node.js, Playwright, Electron, React, Next.js, PostgreSQL, Redis) provides a solid foundation for a robust test automation platform.

The AI integration features enhance the platform with natural language to test case conversion, smart code completion, and self-healing capabilities, making it a modern, intelligent test automation solution.

This implementation would result in a comprehensive test automation platform comparable to Katalon, with both desktop and web interfaces, supporting web, mobile, and API testing.

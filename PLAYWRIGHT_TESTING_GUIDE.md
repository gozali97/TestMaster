# TestMaster E2E Testing Guide dengan Playwright

## Overview

TestMaster menggunakan **Playwright** sebagai framework E2E testing, mengadopsi pendekatan serupa dengan **Katalon Studio** untuk automation testing. Playwright dipilih karena:

- 🚀 **Modern & Fast** - Built oleh Microsoft, support multi-browser (Chromium, Firefox, WebKit)
- 🎯 **Auto-waiting** - Smart wait untuk elemen, mirip Katalon's Smart Wait
- 📸 **Screenshot & Video** - Capture otomatis saat test failure
- 🔧 **Developer-friendly** - TypeScript support dengan IntelliSense lengkap
- 🌐 **Cross-browser** - Test di multiple browsers secara parallel

## Struktur Testing (Katalon-style)

TestMaster mengorganisir tests dengan struktur mirip Katalon Studio:

```
packages/
├── api/
│   └── tests/
│       ├── test-cases/          # Test Cases (seperti Test Cases di Katalon)
│       │   ├── auth/            # Grouped by feature
│       │   │   ├── login.spec.ts
│       │   │   └── register.spec.ts
│       │   ├── projects/
│       │   │   └── projects.spec.ts
│       │   └── test-cases/
│       │       └── test-cases.spec.ts
│       ├── test-suites/         # Test Suites (seperti Test Suites di Katalon)
│       ├── fixtures/            # Test Fixtures & Base Tests
│       │   └── base-test.ts
│       ├── helpers/             # Custom Keywords (seperti di Katalon)
│       │   └── api-helpers.ts
│       └── data/                # Test Data Files
│
└── desktop/
    └── tests/
        ├── test-cases/          # Test Cases untuk Desktop App
        │   ├── app/
        │   │   └── window-management.spec.ts
        │   ├── test-recorder/
        │   │   └── recorder.spec.ts
        │   └── object-repository/
        │       └── object-spy.spec.ts
        ├── test-suites/
        ├── fixtures/
        │   └── electron-test.ts
        ├── helpers/
        └── object-repository/   # Object Repository (seperti di Katalon)
```

## Instalasi & Setup

### 1. Dependencies Sudah Terinstall

Playwright sudah terinstall di:
- ✅ `packages/api` - untuk API & Web E2E tests
- ✅ `packages/desktop` - untuk Desktop App tests

### 2. Browser Binaries

Browsers sudah terinstall:
- ✅ Chromium 141.0.7390.37
- ✅ Firefox 142.0.1
- ✅ WebKit 26.0

## Menjalankan Tests

### API Tests

```bash
# Dari root project
cd packages/api

# Run semua tests
npm test

# Run dengan UI mode (interactive)
npm run test:ui

# Run dengan debug mode
npm run test:debug

# Run dengan headed mode (lihat browser)
npm run test:headed

# Show test report
npm run test:report

# Run specific test file
npx playwright test tests/test-cases/auth/login.spec.ts

# Run tests dengan tag tertentu
npx playwright test --grep "@smoke"
```

### Desktop Tests

```bash
# Dari root project
cd packages/desktop

# Run semua tests
npm test

# Run dengan UI mode
npm run test:ui

# Run dengan debug mode
npm run test:debug

# Run dengan headed mode
npm run test:headed

# Show test report
npm run test:report
```

## Konfigurasi Playwright

### API Configuration (`packages/api/playwright.config.ts`)

```typescript
{
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporters (mirip Katalon's reporting)
  reporter: [
    ['html'],      // HTML report
    ['json'],      // JSON report  
    ['junit'],     // JUnit XML
    ['list']       // Console output
  ],
  
  // Execution profiles (mirip Katalon's Execution Profiles)
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' }
  ]
}
```

### Desktop Configuration (`packages/desktop/playwright.config.ts`)

```typescript
{
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,  // Sequential untuk Electron tests
  workers: 1,            // Single worker untuk stability
  
  projects: [
    { name: 'electron' }
  ]
}
```

## Test Cases yang Tersedia

### API Tests

#### Authentication Tests
- **TC001** - Login dengan valid credentials ✅
- **TC002** - Login dengan invalid email ✅
- **TC003** - Login dengan invalid password ✅
- **TC004** - Login tanpa email ✅
- **TC005** - Login tanpa password ✅
- **TC006** - Login dengan empty credentials ✅
- **TC007** - Register user baru ✅
- **TC008** - Register dengan email yang sudah ada ✅
- **TC009** - Register dengan invalid email format ✅
- **TC010** - Register dengan weak password ✅
- **TC011** - Register tanpa required fields ✅

#### Project Management Tests
- **TC012** - Create new project ✅
- **TC013** - List all projects ✅
- **TC014** - Get project by ID ✅
- **TC015** - Update project ✅
- **TC016** - Delete project ✅
- **TC017** - Unauthorized project creation ✅
- **TC018** - Search projects by name ✅

#### Test Case Management Tests
- **TC019** - Create new test case ✅
- **TC020** - List all test cases ✅
- **TC021** - Filter test cases by type ✅
- **TC022** - Filter test cases by tags ✅
- **TC023** - Update test case ✅
- **TC024** - Duplicate test case ✅
- **TC025** - Delete test case ✅

### Desktop Tests

#### Window Management Tests
- **TC026** - Launch Electron app ✅
- **TC027** - Verify window title ✅
- **TC028** - Verify window size ✅
- **TC029** - Minimize and restore window ✅
- **TC030** - Display main menu bar ✅

#### Test Recorder Tests
- **TC031** - Display record button ✅
- **TC032** - Start recording session ✅
- **TC033** - Stop recording session ✅
- **TC034** - Select browser for recording ✅
- **TC035** - Display recorded steps ✅
- **TC036** - Pause recording ✅

#### Object Spy Tests
- **TC037** - Open Object Spy tool ✅
- **TC038** - Display element properties ✅
- **TC039** - Show multiple locator strategies ✅
- **TC040** - Save object to repository ✅
- **TC041** - Validate locator uniqueness ✅

## Writing Tests (Katalon-style)

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/base-test';

test.describe('Feature Name', () => {
  test('TC001 - Test description', async ({ request }) => {
    // Test Steps (seperti Test Steps di Katalon)
    
    // Step 1: Send request
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'Test@123'
      }
    });
    
    // Verifications (seperti Verification Points di Katalon)
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('token');
  });
});
```

### Using Custom Keywords (Helpers)

```typescript
import { APIHelpers } from '../helpers/api-helpers';

test.describe('Project Tests', () => {
  let apiHelpers: APIHelpers;
  
  test.beforeEach(async ({ request }) => {
    apiHelpers = new APIHelpers(request);
  });
  
  test('TC012 - Create project', async () => {
    // Login using custom keyword
    const token = await apiHelpers.login('test@example.com', 'Test@123');
    
    // Create project using custom keyword
    const project = await apiHelpers.createProject(token, {
      name: 'My Project',
      description: 'Test project'
    });
    
    expect(project.data.name).toBe('My Project');
  });
});
```

### Data-Driven Testing (seperti Katalon's DDT)

```typescript
const testData = [
  { email: 'user1@test.com', password: 'Pass@123', expected: 200 },
  { email: 'user2@test.com', password: 'Pass@456', expected: 200 },
  { email: 'invalid@test.com', password: 'Wrong', expected: 401 },
];

testData.forEach(({ email, password, expected }) => {
  test(`Login with ${email}`, async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email, password }
    });
    
    expect(response.status()).toBe(expected);
  });
});
```

## Best Practices (Katalon-inspired)

### 1. Test Organization
- ✅ Group tests by feature/module
- ✅ Use descriptive test IDs (TC001, TC002, etc.)
- ✅ One test case per test function
- ✅ Keep test cases independent

### 2. Custom Keywords (Helpers)
- ✅ Create reusable helper functions
- ✅ Encapsulate common operations
- ✅ Use meaningful function names
- ✅ Add proper error handling

### 3. Object Repository
- ✅ Store test objects centrally
- ✅ Use multiple locator strategies
- ✅ Prioritize stable locators (ID > CSS > XPath)
- ✅ Add fallback locators

### 4. Assertions
- ✅ Use descriptive assertion messages
- ✅ Test both positive and negative scenarios
- ✅ Verify response structure
- ✅ Check error messages

### 5. Test Data
- ✅ Use unique data for each test run
- ✅ Clean up test data after execution
- ✅ Use fixtures for setup/teardown
- ✅ Separate test data from test logic

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run API Tests
        run: cd packages/api && npm test
      
      - name: Run Desktop Tests
        run: cd packages/desktop && npm test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: packages/*/test-results/
```

## Debugging Tests

### 1. Debug Mode
```bash
npm run test:debug
```
- Opens Playwright Inspector
- Step through test execution
- Inspect DOM
- View network requests

### 2. UI Mode
```bash
npm run test:ui
```
- Interactive test runner
- Watch mode
- Time travel debugging
- Visual test explorer

### 3. Headed Mode
```bash
npm run test:headed
```
- See browser actions in real-time
- Useful for visual debugging

### 4. Screenshots & Videos
Otomatis diambil saat test failure:
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: `test-results/`

## Test Reports

### HTML Report
```bash
npm run test:report
```
Opens interactive HTML report dengan:
- Test execution timeline
- Screenshots & videos
- Network requests
- Console logs
- Error traces

### Report Locations
- API: `packages/api/test-results/html-report/`
- Desktop: `packages/desktop/test-results/html-report/`

## Troubleshooting

### Error: "Cannot find module playwright"
**Solution:**
```bash
cd packages/api  # atau packages/desktop
npm install
```

### Error: "Browsers not installed"
**Solution:**
```bash
npx playwright install
```

### Error: "API server not running"
**Solution:**
```bash
# Start API server di terminal lain
cd packages/api
npm run dev
```

### Error: "Electron app failed to launch"
**Solution:**
```bash
# Build desktop app terlebih dahulu
cd packages/desktop
npm run build:main
```

## Next Steps

### Immediate Tasks
1. ✅ Playwright setup complete
2. ✅ Test structure created
3. ✅ Sample tests written
4. 🔄 Implement actual API endpoints
5. 🔄 Implement Desktop app UI
6. 🔄 Run and validate tests

### Future Enhancements
- [ ] Add visual regression testing
- [ ] Integrate with Katalon TestOps (alternative)
- [ ] Add performance testing
- [ ] Create custom test recorder
- [ ] Implement self-healing tests
- [ ] Add AI-powered test generation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Katalon Studio Comparison](https://katalon.com/resources-center/blog/playwright-vs-selenium)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Testing Guide](https://playwright.dev/docs/api-testing)
- [Electron Testing](https://playwright.dev/docs/api/class-electron)

## Contact & Support

Untuk pertanyaan atau issues terkait testing:
1. Check dokumentasi di atas
2. Review test examples di `tests/test-cases/`
3. Open GitHub issue dengan label `testing`

---

**Happy Testing! 🎭**

*Built with Playwright - Inspired by Katalon Studio*

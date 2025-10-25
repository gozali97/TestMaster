# Test Execution Debug Guide - TestMaster

## 🔍 Analisis Error: Test Execution #4 FAILED

**Error:** Test execution queued, Passed: 0 | Failed: 1
**Issue:** Meskipun list test ada banyak dan jelas, test execution gagal

---

## 📊 Hasil Analisis Kode

### ✅ Yang Sudah Diimplementasikan

1. **Test Engine (packages/test-engine):**
   - ✅ PlaywrightRunner - Browser automation runner
   - ✅ StepExecutor - Individual step execution
   - ✅ Support untuk berbagai action types
   - ✅ Error handling dan logging
   - ✅ Screenshot capture on failure

2. **API Execution Controller (packages/api):**
   - ✅ POST /api/executions - Start execution
   - ✅ GET /api/executions/:runId - Get status
   - ✅ GET /api/projects/:projectId/executions - List executions
   - ✅ POST /api/executions/:runId/stop - Stop execution

3. **Database Models:**
   - ✅ TestCase model dengan steps (JSON)
   - ✅ TestRun model untuk tracking execution
   - ✅ Proper relationships

---

## 🐛 Kemungkinan Root Causes

### 1. **Test Steps Format Mismatch** ⭐ MOST LIKELY

**Problem:**
TestCase.steps dalam database mungkin tidak sesuai format yang diharapkan oleh StepExecutor.

**Expected Format (dari test-engine/types):**
```typescript
interface TestStep {
  id: string;              // ❌ Required
  orderIndex: number;      // ❌ Required  
  actionType: string;      // ✅ Ada
  parameters: Record<string, any>;  // ✅ Ada
  expectedResult?: string;
  timeout?: number;
}
```

**Actual Format (kemungkinan dari UI):**
```json
{
  "action": "click",       // ❌ Harusnya "actionType"
  "target": "#button",     // ❌ Harusnya "parameters.locator"
  "value": ""
}
```

**Solution:**
```typescript
// Transform steps sebelum execution
const transformedSteps = testCase.steps.map((step, index) => ({
  id: step.id || `step-${index}`,
  orderIndex: step.orderIndex || index,
  actionType: step.actionType || step.action || 'unknown',
  parameters: step.parameters || {
    locator: step.target,
    text: step.value,
    url: step.url
  },
  expectedResult: step.expectedResult,
  timeout: step.timeout || 30000
}));
```

### 2. **PlaywrightRunner Not Initialized**

**Problem:**
PlaywrightRunner.initialize() mungkin gagal tapi error tidak ter-log dengan baik.

**Check:**
```typescript
// Di ExecutionsController.executeTests()
try {
  await runner.initialize(config);
  console.log('✅ Runner initialized successfully');
} catch (error) {
  console.error('❌ Runner initialization failed:', error);
  throw error;
}
```

### 3. **Empty or Invalid Steps**

**Problem:**
Test case mungkin punya steps array kosong atau null.

**Check:**
```typescript
if (!testCase.steps || testCase.steps.length === 0) {
  console.error('❌ Test case has no steps:', testCase.id);
  // Skip atau fail dengan message yang jelas
}
```

### 4. **Browser Launch Failure**

**Problem:**
Playwright gagal launch browser (missing dependencies, permissions, etc).

**Common Issues:**
- Browser binaries tidak terinstall
- Port conflict
- Insufficient permissions
- Missing system dependencies

### 5. **Async Execution Error Not Caught**

**Problem:**
Error di `executeTests()` tidak ter-catch karena method dipanggil async tanpa await.

**Current Code:**
```typescript
// executionsController.ts line 35
this.executeTests(testRun.id, testCaseIds, config).catch((error) => {
  console.error('Execution failed:', error);  // ❌ Error logged tapi tidak update DB
});
```

**Should Be:**
```typescript
this.executeTests(testRun.id, testCaseIds, config).catch(async (error) => {
  console.error('❌ Execution failed:', error);
  await TestRun.update(
    {
      status: 'ERROR',
      completedAt: new Date(),
    },
    { where: { id: testRun.id } }
  );
});
```

### 6. **TestCase.steps Not Properly Serialized**

**Problem:**
JSON.stringify/parse issue dengan steps data.

**Check:**
```typescript
console.log('Steps type:', typeof testCase.steps);
console.log('Steps content:', JSON.stringify(testCase.steps, null, 2));
```

---

## 🔧 Debugging Steps

### Step 1: Enable Detailed Logging

**Edit:** `packages/api/src/modules/executions/executions.controller.ts`

```typescript
private async executeTests(
  runId: number,
  testCaseIds: string[],
  config: any
): Promise<void> {
  console.log('🚀 Starting test execution:', {
    runId,
    testCaseIds,
    config
  });

  const runner = new PlaywrightRunner();

  try {
    await TestRun.update(
      { status: 'RUNNING', startedAt: new Date() },
      { where: { id: runId } }
    );
    console.log('✅ Test run status updated to RUNNING');

    console.log('🔧 Initializing Playwright runner...');
    await runner.initialize(config);
    console.log('✅ Playwright runner initialized');

    let passed = 0;
    let failed = 0;

    for (const testCaseId of testCaseIds) {
      console.log(`📝 Loading test case: ${testCaseId}`);
      const testCase = await TestCase.findByPk(testCaseId);
      
      if (!testCase) {
        console.warn(`⚠️ Test case not found: ${testCaseId}`);
        continue;
      }

      console.log(`📋 Test case loaded:`, {
        id: testCase.id,
        name: testCase.name,
        type: testCase.type,
        stepsCount: testCase.steps?.length || 0
      });

      // Check steps validity
      if (!testCase.steps || !Array.isArray(testCase.steps)) {
        console.error(`❌ Invalid steps for test case ${testCase.id}:`, testCase.steps);
        failed++;
        continue;
      }

      if (testCase.steps.length === 0) {
        console.warn(`⚠️ Test case ${testCase.id} has no steps`);
        failed++;
        continue;
      }

      console.log(`🔍 Steps to execute:`, JSON.stringify(testCase.steps, null, 2));

      try {
        console.log(`▶️ Executing test: ${testCase.name}`);
        const result = await runner.executeTest(testCase.steps, config);
        console.log(`📊 Execution result:`, result);

        if (result.status === 'PASSED') {
          passed++;
          console.log(`✅ Test PASSED: ${testCase.name}`);
        } else {
          failed++;
          console.log(`❌ Test FAILED: ${testCase.name}`, {
            error: result.errorMessage,
            stack: result.errorStack
          });
        }
      } catch (error: any) {
        failed++;
        console.error(`💥 Exception executing test ${testCase.name}:`, error);
      }
    }

    const finalStatus = failed > 0 ? 'FAILED' : 'PASSED';
    console.log(`🏁 Execution completed:`, {
      status: finalStatus,
      passed,
      failed
    });

    await TestRun.update(
      {
        status: finalStatus,
        completedAt: new Date(),
        passedTests: passed,
        failedTests: failed,
      },
      { where: { id: runId } }
    );

    console.log('✅ Test run status updated');
  } catch (error: any) {
    console.error('💥 Fatal error during execution:', error);
    await TestRun.update(
      {
        status: 'ERROR',
        completedAt: new Date(),
      },
      { where: { id: runId } }
    );
  } finally {
    console.log('🔒 Closing browser...');
    await runner.close();
    console.log('✅ Browser closed');
  }
}
```

### Step 2: Add Step Validation & Transformation

**Create:** `packages/api/src/utils/testStepTransformer.ts`

```typescript
import { TestStep } from '@testmaster/test-engine';

export function transformTestSteps(rawSteps: any[]): TestStep[] {
  if (!rawSteps || !Array.isArray(rawSteps)) {
    throw new Error('Invalid steps: must be an array');
  }

  return rawSteps.map((step, index) => {
    // Handle different step formats
    const actionType = step.actionType || step.action || step.command;
    
    if (!actionType) {
      throw new Error(`Step ${index} missing actionType/action/command`);
    }

    // Transform parameters
    let parameters: Record<string, any> = {};

    if (step.parameters) {
      parameters = step.parameters;
    } else {
      // Legacy format transformation
      parameters = {
        locator: step.target || step.selector || step.element,
        text: step.value || step.text,
        url: step.url,
        duration: step.wait || step.timeout,
        script: step.script,
        expected: step.expected,
        type: step.assertType,
      };

      // Remove undefined values
      Object.keys(parameters).forEach(key => {
        if (parameters[key] === undefined) {
          delete parameters[key];
        }
      });
    }

    return {
      id: step.id || `step-${index}`,
      orderIndex: step.orderIndex ?? index,
      actionType: actionType.toLowerCase(),
      parameters,
      expectedResult: step.expectedResult || step.expected,
      timeout: step.timeout || 30000,
    };
  });
}

export function validateTestStep(step: TestStep): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!step.id) errors.push('Missing step.id');
  if (step.orderIndex === undefined) errors.push('Missing step.orderIndex');
  if (!step.actionType) errors.push('Missing step.actionType');
  if (!step.parameters) errors.push('Missing step.parameters');

  // Validate action-specific parameters
  switch (step.actionType) {
    case 'navigate':
      if (!step.parameters.url) errors.push('navigate action requires parameters.url');
      break;
    case 'click':
    case 'type':
    case 'waitForElement':
      if (!step.parameters.locator) errors.push(`${step.actionType} action requires parameters.locator`);
      break;
    case 'type':
      if (!step.parameters.text) errors.push('type action requires parameters.text');
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Use in Controller:**

```typescript
import { transformTestSteps, validateTestStep } from '../../utils/testStepTransformer';

// In executeTests method
try {
  const transformedSteps = transformTestSteps(testCase.steps);
  
  // Validate each step
  for (const step of transformedSteps) {
    const validation = validateTestStep(step);
    if (!validation.valid) {
      console.error(`❌ Invalid step in test ${testCase.id}:`, validation.errors);
      throw new Error(`Invalid step: ${validation.errors.join(', ')}`);
    }
  }
  
  const result = await runner.executeTest(transformedSteps, config);
  // ...
} catch (error: any) {
  // ...
}
```

### Step 3: Check API Server Console

**Run API server dengan logs:**

```bash
cd packages/api
npm run dev
```

**Watch for:**
- "🚀 Starting test execution" - Execution started
- "✅ Playwright runner initialized" - Runner OK
- "📝 Loading test case" - Test case loaded
- "🔍 Steps to execute" - Steps data
- Any "❌" or "💥" errors

### Step 4: Test Simple Execution

**Create test script:** `packages/api/test-execution.js`

```javascript
const { PlaywrightRunner } = require('./dist/test-engine');

async function testExecution() {
  const runner = new PlaywrightRunner();
  
  try {
    console.log('Initializing runner...');
    await runner.initialize({
      browser: 'chromium',
      headless: false,  // Show browser for debugging
      timeout: 30000
    });
    console.log('✅ Runner initialized');

    const testSteps = [
      {
        id: 'step-1',
        orderIndex: 0,
        actionType: 'navigate',
        parameters: { url: 'https://example.com' },
        timeout: 30000
      },
      {
        id: 'step-2',
        orderIndex: 1,
        actionType: 'waitForElement',
        parameters: { locator: 'h1' },
        timeout: 10000
      },
      {
        id: 'step-3',
        orderIndex: 2,
        actionType: 'assert',
        parameters: {
          type: 'titleContains',
          expected: 'Example'
        },
        timeout: 5000
      }
    ];

    console.log('Executing test steps...');
    const result = await runner.executeTest(testSteps, {});
    console.log('✅ Test result:', result);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await runner.close();
  }
}

testExecution();
```

**Run:**
```bash
cd packages/api
node test-execution.js
```

### Step 5: Check Database

**Query TestRun:**
```sql
SELECT * FROM test_runs ORDER BY created_at DESC LIMIT 5;
```

**Query TestCase steps:**
```sql
SELECT id, name, steps FROM test_cases WHERE id IN (
  SELECT DISTINCT test_case_id FROM test_results
  WHERE test_run_id = 4
);
```

---

## 🛠️ Quick Fixes

### Fix 1: Add Step Transformation (RECOMMENDED)

**File:** `packages/api/src/modules/executions/executions.controller.ts`

```typescript
// Import transformer
import { transformTestSteps } from '../../utils/testStepTransformer';

// In executeTests method, before runner.executeTest():
const transformedSteps = transformTestSteps(testCase.steps);
const result = await runner.executeTest(transformedSteps, config);
```

### Fix 2: Better Error Handling

```typescript
this.executeTests(testRun.id, testCaseIds, config).catch(async (error) => {
  console.error('❌ Execution failed:', error);
  await TestRun.update(
    {
      status: 'ERROR',
      completedAt: new Date(),
    },
    { where: { id: testRun.id } }
  );
});
```

### Fix 3: Validate Before Execution

```typescript
// In startExecution method, before creating TestRun:
const testCases = await TestCase.findAll({
  where: { id: testCaseIds }
});

for (const tc of testCases) {
  if (!tc.steps || tc.steps.length === 0) {
    return res.status(400).json({
      success: false,
      error: `Test case "${tc.name}" has no steps`
    });
  }
}
```

### Fix 4: Add Headless Config

**Problem:** Browser mungkin tidak bisa launch headlessly di environment tertentu.

**Fix:**
```typescript
// In executionConfig, set headless properly
const config = {
  ...req.body.config,
  headless: process.env.NODE_ENV === 'production' ? true : false,
  browser: req.body.config?.browser || 'chromium'
};
```

---

## 📝 Checklist untuk Debugging

- [ ] API server running dan responding
- [ ] Database connected
- [ ] Test cases exist dengan proper steps
- [ ] Steps format sesuai dengan TestStep interface
- [ ] PlaywrightRunner builds successfully
- [ ] Browser binaries terinstall (`npx playwright install`)
- [ ] Logs menunjukkan initialization success
- [ ] No permission/port conflicts
- [ ] Config valid (browser type, timeouts, etc)
- [ ] Error messages ter-log dengan jelas

---

## 🎯 Expected Steps Format

**Correct Format:**
```json
[
  {
    "id": "step-1",
    "orderIndex": 0,
    "actionType": "navigate",
    "parameters": {
      "url": "https://example.com"
    },
    "timeout": 30000
  },
  {
    "id": "step-2",
    "orderIndex": 1,
    "actionType": "click",
    "parameters": {
      "locator": "#login-button"
    },
    "timeout": 5000
  },
  {
    "id": "step-3",
    "orderIndex": 2,
    "actionType": "type",
    "parameters": {
      "locator": "#username",
      "text": "testuser"
    },
    "timeout": 5000
  }
]
```

---

## 📞 Next Actions

1. **Add detailed logging** - Implement Step 1 logging
2. **Create step transformer** - Implement Step 2 transformer
3. **Run test execution** - Follow Step 4
4. **Check logs** - Look for specific errors
5. **Fix identified issue** - Apply appropriate fix
6. **Retest** - Verify fix works

---

## 🔗 Related Files

- `packages/api/src/modules/executions/executions.controller.ts`
- `packages/test-engine/src/playwright/PlaywrightRunner.ts`
- `packages/test-engine/src/playwright/StepExecutor.ts`
- `packages/test-engine/src/types/index.ts`
- `packages/api/src/database/models/TestCase.ts`
- `packages/api/src/database/models/TestRun.ts`

---

**Last Updated:** 2025-10-25
**Status:** Debugging Guide Created
**Priority:** HIGH - Test execution not working

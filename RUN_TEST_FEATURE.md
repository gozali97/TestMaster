# ▶️ Run Test Feature - Desktop & Backend Integration

## 🎯 Overview

Menambahkan fitur **Run Test** di Desktop IDE yang terintegrasi dengan backend Playwright execution engine.

## ✅ Features Implemented

### 1. **Desktop - Run Test Button** ✅

**File**: `packages/desktop/src/renderer/components/Editor/TestEditorAPI.tsx`

**Added**:
- ✅ "Run Test" button in toolbar (green color)
- ✅ Execute test via API
- ✅ Real-time execution status display
- ✅ Polling for execution results
- ✅ Visual feedback (PASSED = green, FAILED = red, RUNNING = blue)
- ✅ Close button to dismiss results
- ✅ Validation (must save test first, must have steps)

**Button Features**:
```typescript
<button 
  className="btn-success" 
  onClick={handleRunTest}
  disabled={running || !testCaseId}
>
  {running ? '▶️ Running...' : '▶️ Run Test'}
</button>
```

**Execution Flow**:
```
1. User clicks "Run Test"
2. Validation: testCaseId exists? steps exist?
3. Call API: POST /api/executions
4. Get runId from response
5. Poll status every 1 second
6. Show results: PASSED/FAILED/ERROR
7. Stop polling when complete
```

### 2. **API Service Update** ✅

**File**: `packages/desktop/src/renderer/services/api.service.ts`

**Before**:
```typescript
static async executeTest(projectId: number, testId: number, config?: any)
```

**After**:
```typescript
static async executeTest(
  projectId: number,
  testCaseIds: number | number[], // Support single or multiple
  config?: any
)
```

**Endpoint**: `POST /api/executions`

**Request Body**:
```json
{
  "projectId": 1,
  "testCaseIds": [1, 2, 3],
  "config": {}
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "runId": 123,
    "status": "PENDING",
    "message": "Test execution queued"
  }
}
```

### 3. **Backend Execution API** ✅

**File**: `packages/api/src/modules/executions/executions.controller.ts`

**Features**:
- ✅ Start test execution: `POST /executions`
- ✅ Get execution status: `GET /executions/:runId`
- ✅ List project executions: `GET /projects/:projectId/executions`
- ✅ Stop execution: `POST /executions/:runId/stop`

**Integration**:
- Uses `@testmaster/test-engine` (Playwright)
- Creates TestRun record in database
- Executes tests asynchronously
- Updates status in real-time
- Stores results (passed/failed counts)

**Execution States**:
- `PENDING` - Queued, waiting to run
- `RUNNING` - Currently executing
- `PASSED` - All tests passed
- `FAILED` - Some tests failed
- `ERROR` - Execution error
- `STOPPED` - Manually stopped

### 4. **Web Projects Fix** ✅

**File**: `packages/web/src/app/(dashboard)/projects/page.tsx`

**Issues Fixed**:
1. ✅ No error handling/logging
2. ✅ No empty state UI
3. ✅ Silent failures

**Added**:
- ✅ Console logging for debugging
- ✅ Empty state with helpful message
- ✅ "Create Your First Project" button
- ✅ Better error visibility

**Empty State UI**:
```
        📁
   No Projects Yet
Create your first project to get started
   [Create Your First Project]
```

## 🎨 UI/UX

### Run Test Button States:

**Normal State** (Ready to run):
```
[▶️ Run Test] - Green background
```

**Running State**:
```
[▶️ Running...] - Gray background, disabled
```

**Disabled State** (no test case):
```
[▶️ Run Test] - Gray, cursor: not-allowed
```

### Execution Result Banner:

**PASSED** (Green):
```
┌─────────────────────────────────────────────────┐
│ Test Execution #123        [PASSED]         [×] │
│ All tests completed successfully               │
│ Passed: 5 | Failed: 0                          │
└─────────────────────────────────────────────────┘
```

**FAILED** (Red):
```
┌─────────────────────────────────────────────────┐
│ Test Execution #124        [FAILED]         [×] │
│ Some tests failed - check logs                 │
│ Passed: 3 | Failed: 2                          │
└─────────────────────────────────────────────────┘
```

**RUNNING** (Blue):
```
┌─────────────────────────────────────────────────┐
│ Test Execution #125        [RUNNING]        [×] │
│ Execution in progress...                       │
└─────────────────────────────────────────────────┘
```

## 🔄 Complete Workflow

### Desktop Run Test:

```
1. User opens test case in editor
2. User edits/adds test steps
3. User clicks "Save" button
   → Test saved to database via API
4. User clicks "Run Test" button
   → Validation: test exists? steps exist?
5. API Call: POST /api/executions
   → Backend queues test execution
   → Returns runId and status = PENDING
6. Desktop polls: GET /api/executions/:runId
   → Every 1 second
   → Updates UI with current status
7. Backend executes test with Playwright
   → Opens browser
   → Runs each step
   → Collects results
8. Backend updates status:
   → RUNNING → PASSED/FAILED
9. Desktop receives final status
   → Stops polling
   → Shows results banner
10. User reviews results
    → Green = passed ✅
    → Red = failed ❌
    → Can click × to close
```

### Backend Execution:

```
ExecutionsController.startExecution()
├── Validate project exists
├── Create TestRun record (status=PENDING)
├── Return runId immediately
└── Execute asynchronously:
    ├── Update status to RUNNING
    ├── Initialize PlaywrightRunner
    ├── For each test case:
    │   ├── Load test steps
    │   ├── Execute with Playwright
    │   └── Collect results
    ├── Update status to PASSED/FAILED
    └── Close browser
```

## 📁 Files Modified/Created

### Desktop:
```
packages/desktop/src/renderer/
├── services/
│   └── api.service.ts              ✅ Updated executeTest method
└── components/Editor/
    └── TestEditorAPI.tsx           ✅ Added run button + polling
```

### Web:
```
packages/web/src/app/(dashboard)/
└── projects/
    └── page.tsx                    ✅ Fixed empty state + logging
```

### Backend (Already Exists):
```
packages/api/src/modules/
└── executions/
    ├── executions.controller.ts    ✅ Already implemented
    └── executions.routes.ts        ✅ Already implemented
```

## 🧪 Testing

### Test Desktop Run:

1. **Start Backend:**
```bash
cd packages/api
npm run start:fresh
```

2. **Start Desktop:**
```bash
cd packages/desktop
npm run dev
```

3. **Create & Run Test:**
```
- Login
- Select project
- Select test case (or create new)
- Add test steps:
  1. Navigate: https://example.com
  2. Assert: Page title exists
- Click "Save"
- Click "Run Test" ▶️
- Watch execution banner update
- See PASSED/FAILED result
```

### Expected Behavior:

✅ Button turns gray with "Running..." text
✅ Blue banner appears: "Test Execution #X - RUNNING"
✅ Backend opens Playwright browser
✅ Test executes step by step
✅ Banner updates to green PASSED or red FAILED
✅ Shows passed/failed counts
✅ Can close banner with × button
✅ Can run test again

### Test Web Projects:

1. **Login to Web:**
```
http://localhost:3000/login
```

2. **Navigate to Projects:**
```
http://localhost:3000/projects
```

3. **Check**:
- ✅ If no projects: See empty state with icon
- ✅ If has projects: See grid of project cards
- ✅ Console shows debugging logs
- ✅ Can create new project

## 🐛 Troubleshooting

### Issue: "Please save the test case before running"
**Cause**: testCaseId is null
**Solution**: Click "Save" button first to save test case

### Issue: "Please add test steps before running"
**Cause**: No steps in test case
**Solution**: Add at least one test step before running

### Issue: Run button is disabled (gray)
**Cause**: No test case loaded
**Solution**: Select or create a test case first

### Issue: Execution stays PENDING forever
**Cause**: Backend not running or crashed
**Solution**: 
- Check backend is running: `npm run start` in packages/api
- Check backend logs for errors

### Issue: Execution timeout after 60 seconds
**Cause**: Test taking too long or backend hung
**Solution**:
- Check test steps are valid
- Check backend logs
- May need to increase timeout in pollExecutionStatus

### Issue: Web projects page empty
**Cause**: Different organizationId between desktop and web
**Debug**:
1. Open browser console
2. Check logs: "Projects count: 0"
3. Check which user is logged in
4. Check organizationId in database

**Solution**: Use same user account in desktop and web

## 🎯 Benefits

### For Users:
- ✅ Run tests directly from IDE
- ✅ No need to switch to terminal
- ✅ Real-time execution feedback
- ✅ Visual pass/fail indicators
- ✅ Quick iteration on test development

### For Developers:
- ✅ Centralized execution API
- ✅ Async execution (non-blocking)
- ✅ Status tracking in database
- ✅ Scalable architecture
- ✅ Easy to extend

## 📊 API Endpoints Summary

### Desktop Uses:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/executions` | Start test execution |
| GET | `/api/executions/:runId` | Get execution status |

### Available (Not Used Yet):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects/:projectId/executions` | List all executions for project |
| POST | `/api/executions/:runId/stop` | Stop running test |

## 🚀 Future Enhancements

### Possible Additions:
- [ ] View execution logs/screenshots
- [ ] Pause/resume execution
- [ ] Run multiple tests at once
- [ ] Schedule test runs
- [ ] Email notifications on failure
- [ ] Integration with CI/CD
- [ ] Test execution history
- [ ] Performance metrics
- [ ] Video recording of execution
- [ ] Parallel test execution
- [ ] Custom execution configs (browser, viewport, etc)
- [ ] Execution analytics/reporting

## 📝 Technical Details

### Polling Strategy:

```typescript
const pollExecutionStatus = async (runId: number) => {
  const maxAttempts = 60; // 60 seconds timeout
  let attempts = 0;

  const poll = setInterval(async () => {
    attempts++;

    if (attempts > maxAttempts) {
      // Timeout after 60 seconds
      clearInterval(poll);
      setExecutionResult({ status: 'TIMEOUT', ... });
      return;
    }

    // Fetch current status
    const result = await ApiService.getExecutionResults(runId);
    
    // Update UI
    setExecutionResult(result.data);

    // Stop polling if execution complete
    if (['PASSED', 'FAILED', 'ERROR', 'STOPPED'].includes(status)) {
      clearInterval(poll);
    }
  }, 1000); // Poll every 1 second
};
```

**Why Polling?**
- Simple to implement
- No WebSocket setup needed
- Works with existing REST API
- Reliable

**Alternative**: WebSocket for real-time updates (future enhancement)

### Execution State Machine:

```
PENDING → RUNNING → PASSED
               ↓
            FAILED
               ↓
            ERROR
               ↓
            STOPPED
```

## ✅ Checklist

- [x] Add run test button to desktop
- [x] Update ApiService.executeTest method
- [x] Add execution status polling
- [x] Add execution result display
- [x] Add validation (test must exist, steps must exist)
- [x] Add loading states
- [x] Add visual feedback (colors)
- [x] Fix web projects empty state
- [x] Add console logging for debugging
- [x] Test complete workflow
- [x] Document the feature

---

## 🎉 Result

**Desktop**:
- ✅ Run Test button works
- ✅ Connects to backend Playwright
- ✅ Shows real-time execution status
- ✅ Visual feedback with colors
- ✅ Poll for results automatically

**Web**:
- ✅ Projects list fixed with empty state
- ✅ Better error handling
- ✅ Console logging for debugging

**Backend**:
- ✅ Execution API already implemented
- ✅ Playwright integration working
- ✅ Status tracking in database

**Status**: ✅ FULLY IMPLEMENTED

User dapat run test case langsung dari Desktop IDE dengan feedback real-time! 🚀

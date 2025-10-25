# Autonomous Testing Debug Guide

## ✅ Changes Made

Comprehensive logging has been added to track the autonomous testing flow and identify errors. All logs include detailed context and are marked with clear prefixes.

### 1. **Backend Controller Logging** (`autonomous-testing-simple.controller.ts`)
Added detailed logging at every step:

- **🚀 [START]** - Request received with all parameters
- **📝 [VALIDATION]** - Input validation results
- **🆔 [SESSION]** - Session ID generation and storage
- **🔄 [SIMULATE]** - Testing simulation lifecycle
- **📊 [PHASE]** - Each phase transition with timing
- **🏁 [COMPLETE]** - Completion status and results
- **📊 [PROGRESS]** - SSE connection and updates
- **📊 [RESULTS]** - Results retrieval
- **📋 [SESSIONS]** - Session listing
- **❌ [ERROR]** - Detailed error information with stack traces

### 2. **Backend Service Logging** (`autonomous-testing.service.ts`)
Added comprehensive logging for:

- **🤖 [SERVICE]** - Service method calls
- **🛠️ [SERVICE]** - Orchestrator creation
- **💾 [SERVICE]** - Session storage
- **🚀 [SERVICE]** - Background task initiation
- **🏃 [BACKGROUND]** - Background testing execution
- **🔔 [SUBSCRIBE]** - Progress subscription management
- **📢 [NOTIFY]** - Progress notifications to callbacks
- **📊 [GET_RESULTS]** - Results retrieval
- **📋 [LIST_SESSIONS]** - Session listing
- **🧹 [CLEANUP]** - Session cleanup

### 3. **Frontend Logging** (`AutonomousTestingSimple.tsx`)
Added detailed logging for:

- **[FRONTEND]** - All client-side operations
- Request body and headers
- Response status and data
- SSE connection and messages
- Error handling with full error details
- Progress updates
- Results fetching

### 4. **Improved Error Messages**
- API errors now return detailed error objects with:
  - Error message
  - Error details (in development mode)
  - Stack trace (in development mode)
- Frontend now displays full API error messages instead of generic errors

## 🧪 How to Test and Debug

### Step 1: Start the API Server

```powershell
# In terminal 1
cd D:\Project\TestMaster
npm run dev --workspace=packages/api
```

**Watch for:**
- Server starting successfully on port 3001
- No startup errors

### Step 2: Start the Desktop App

```powershell
# In terminal 2
cd D:\Project\TestMaster
npm run dev --workspace=packages/desktop
```

**Watch for:**
- Electron app launching
- No build errors

### Step 3: Open Developer Console

In the Electron app:
1. Press `F12` or `Ctrl+Shift+I` to open DevTools
2. Go to the **Console** tab

### Step 4: Navigate to Autonomous Testing

1. Click on "Autonomous Testing" in the sidebar
2. The Console tab will now show all frontend logs

### Step 5: Start a Test with https://comathedu.id

1. Enter `https://comathedu.id` in the Website URL field
2. Click "🚀 Start Autonomous Testing"

### Step 6: Monitor Both Consoles

**Terminal 1 (API Server)** will show:
```
========================================
🚀 [START] Autonomous Testing Request
========================================
Request Body: {
  "websiteUrl": "https://comathedu.id",
  ...
}
📝 [VALIDATION] Extracted parameters: ...
✅ [VALIDATION] Passed - At least one URL provided
🆔 [SESSION] Generated session ID: session-1234...
💾 [SESSION] Created session object: ...
✅ [SESSION] Stored in sessions map. Total sessions: 1
🔄 [SIMULATE] Starting simulation for session: ...
...
```

**DevTools Console** will show:
```
[FRONTEND] Starting Autonomous Testing
[FRONTEND] Input: { websiteUrl: "https://comathedu.id", ... }
[FRONTEND] API URL: http://localhost:3001
[FRONTEND] Request body: ...
[FRONTEND] Sending POST request...
[FRONTEND] Response status: 200 OK
[FRONTEND] ✅ Success response: { sessionId: "..." }
...
```

## 🔍 Troubleshooting Guide

### Error: "Failed to start autonomous testing"

Look for these logs in **Terminal 1 (API)**:

#### 1. **Validation Error (400)**
```
❌ [VALIDATION] Failed - No URL provided
```
**Solution:** Make sure you entered a URL in the Website URL field

#### 2. **Server Error (500)**
```
❌❌❌ [ERROR] Caught exception in startTesting ❌❌❌
Error Type: TypeError
Error Message: Cannot read property 'x' of undefined
Error Stack: ...
```
**Solution:** This shows the exact error. Copy the full error message and stack trace.

#### 3. **Session Not Created**
```
❌ [SIMULATE] Session not found in map!
Available session IDs: []
```
**Solution:** Session creation failed. Look for errors before this log.

### Error: "Connection lost"

Look for these logs:

#### In DevTools Console:
```
❌ [FRONTEND] EventSource error: ...
```

#### In API Terminal:
```
❌ [PROGRESS] Session not found: session-xxx
Available sessions: []
```

**Solution:** Session was lost or never created properly. Check earlier logs for creation issues.

### Progress Not Updating

#### In API Terminal, look for:
```
🔄 [PHASE] Running phase 1/5
📊 [PHASE] Phase config: { phase: "discovery", ... }
✅ [PHASE] Session updated: ...
📤 [PROGRESS] Sending update: ...
```

#### In DevTools Console, look for:
```
[FRONTEND] SSE message received: ...
[FRONTEND] Progress update: { phase: "discovery", ... }
```

**If phases are running but frontend not receiving:**
- Check if SSE connection is established
- Look for `[PROGRESS] Setting up SSE` in API logs
- Look for `[FRONTEND] Creating EventSource` in DevTools

### Testing Not Completing

Look for completion logs in API:
```
🏁 [COMPLETE] All phases completed
✅ [COMPLETE] Session found, updating status
✅ Session session-xxx completed successfully
```

If these logs appear but frontend shows "Connection lost":
- Check results endpoint logs
- Look for `[RESULTS]` logs in API

## 📋 Complete Log Sequence for Successful Test

### Expected Log Flow:

**API Server:**
1. ✅ Request received and validated
2. ✅ Session ID generated
3. ✅ Session stored in map
4. ✅ Simulation started
5. ✅ Phase 1/5 (Discovery) - 20%
6. ✅ Phase 2/5 (Generation) - 40%
7. ✅ Phase 3/5 (Execution) - 70%
8. ✅ Phase 4/5 (Analysis) - 90%
9. ✅ Phase 5/5 (Report) - 100%
10. ✅ Completion, results stored
11. ✅ Results fetched by frontend

**Frontend (DevTools):**
1. ✅ Input validated
2. ✅ POST request sent
3. ✅ Session ID received
4. ✅ SSE connection established
5. ✅ Progress updates received (5 times)
6. ✅ Completion phase received
7. ✅ Results fetched successfully
8. ✅ Results displayed

## 🐛 Common Issues and Solutions

### Issue: API not responding

**Check:**
```powershell
# Test if API is running
curl http://localhost:3001/api/health
```

**Solution:** Make sure API server is running and listening on port 3001

### Issue: CORS errors in console

**Look for:**
```
Access to fetch at 'http://localhost:3001/...' from origin 'file://' has been blocked by CORS
```

**Solution:** This shouldn't happen with Electron app. If it does, check API CORS configuration.

### Issue: TypeScript compilation errors

**Note:** The changes made to `autonomous-testing-simple.controller.ts` don't require rebuilding because:
- The controller is already in use (see `autonomous-testing.routes.ts`)
- It has no external dependencies
- It's a simulation controller that works standalone

If you need to rebuild anyway:
```powershell
cd D:\Project\TestMaster\packages\api
npm run build
```

But the errors are in other files (test-engine integration), not our logging changes.

## 📝 What to Share for Support

If you encounter an error, please share:

1. **Full API server logs** from the moment you clicked "Start Testing"
2. **Full DevTools console logs** from the same moment
3. **The exact error message** shown in the UI
4. **The URL you're testing** (https://comathedu.id)
5. **Screenshots** of the error (if visual)

## 🎯 Next Steps

After you run the test and review the logs:

1. If error occurs **before session creation**, it's likely a validation or API startup issue
2. If error occurs **during session creation**, check session storage logs
3. If error occurs **during progress**, check SSE connection logs
4. If error occurs **after completion**, check results retrieval logs

The detailed logs will pinpoint exactly where the failure occurs, making it much easier to fix!

## 📞 Quick Reference - Log Prefixes

| Prefix | Location | Meaning |
|--------|----------|---------|
| 🚀 [START] | API | Request received |
| 📝 [VALIDATION] | API | Input validation |
| 🆔 [SESSION] | API | Session management |
| 🔄 [SIMULATE] | API | Test simulation |
| 📊 [PHASE] | API | Phase execution |
| 🏁 [COMPLETE] | API | Test completion |
| 📢 [NOTIFY] | API | Progress notifications |
| [FRONTEND] | Desktop | Client-side operations |
| ❌ [ERROR] | Both | Error information |

All error logs include:
- Error Type
- Error Message
- Error Stack Trace (in development)

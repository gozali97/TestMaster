# 🎯 HOW TO USE ERROR DETAIL FEATURE

## Quick Start Guide untuk menampilkan error details di UI

---

## 📦 WHAT YOU GOT

2 komponen React yang sudah siap pakai:

1. **`ErrorDetailModal`** - Modal untuk show detail error lengkap
2. **`AutonomousTestResults`** - Display results dengan error list

---

## 🚀 USAGE SCENARIO 1: Autonomous Testing Results

### **Your Current Code (Before):**
```typescript
// Somewhere in your autonomous testing UI
const [results, setResults] = useState(null);

// After test execution
console.log(`Passed: ${results.passed.length}`);
console.log(`Failed: ${results.failed.length}`);
console.log(`Healed: ${results.healed.length}`);
```

### **Enhanced Code (After):**
```typescript
import { AutonomousTestResults } from '@/components/Autonomous/AutonomousTestResults';

// In your component
return (
  <div>
    {/* Your existing code */}
    
    {/* ADD THIS: Beautiful results display with error details */}
    {results && (
      <AutonomousTestResults
        results={{
          passed: results.passed,
          failed: results.failed,
          healed: results.healed,
          totalDuration: results.totalDuration
        }}
        analyses={results.analysisResults}  // AI analysis jika ada
        generatedTests={results.generatedTests}  // All tests untuk get names
      />
    )}
  </div>
);
```

### **That's it!** 🎉

Now users can:
- ✅ See summary dashboard (total, pass rate, duration)
- ✅ Click any failed test
- ✅ View complete error details in modal
- ✅ See screenshots & video
- ✅ Read AI analysis & suggested fixes

---

## 🚀 USAGE SCENARIO 2: Manual Test Execution

### **Integrate into TestExecutionRunner:**

```typescript
// At the top of TestExecutionRunner.tsx
import { ErrorDetailModal } from './ErrorDetailModal';
import { useState } from 'react';

// Add state for error modal
const [selectedError, setSelectedError] = useState(null);

// In your execution result display section
{executionResult && executionResult.status === 'failed' && (
  <div className="error-section">
    {/* Your existing error display */}
    <div className="result-error">
      <strong>❌ Error:</strong>
      <pre>{executionResult.error}</pre>
    </div>
    
    {/* ADD THIS: Button to show detailed error */}
    <button
      className="btn-view-error-detail"
      onClick={() => setSelectedError({
        testId: executionResult.testCaseId.toString(),
        testName: testCases.find(t => t.id === executionResult.testCaseId)?.name || 'Test',
        status: 'failed',
        duration: executionResult.duration || 0,
        error: executionResult.error,
        screenshots: executionResult.screenshots,
        video: executionResult.video
      })}
    >
      🔍 View Detailed Error Analysis
    </button>
    
    {/* ADD THIS: Error modal */}
    {selectedError && (
      <ErrorDetailModal
        error={selectedError}
        onClose={() => setSelectedError(null)}
      />
    )}
  </div>
)}
```

---

## 🚀 USAGE SCENARIO 3: Execution List Page

### **Show error details from execution history:**

```typescript
// In your executions list component
import { ErrorDetailModal } from '@/components/Execution/ErrorDetailModal';
import { useState } from 'react';

const [selectedError, setSelectedError] = useState(null);

// For each failed execution in list
<div className="execution-item">
  <div className="execution-info">
    <span className="status failed">Failed</span>
    <span className="test-name">{execution.testName}</span>
    <span className="error-preview">{execution.error?.substring(0, 50)}...</span>
  </div>
  
  {/* ADD THIS: View details button */}
  <button
    onClick={() => setSelectedError({
      testId: execution.testId,
      testName: execution.testName,
      status: execution.status,
      duration: execution.duration,
      error: execution.error,
      screenshots: execution.screenshots,
      video: execution.video,
      analysis: execution.analysis  // If available
    })}
    className="btn-view-details"
  >
    View Details
  </button>
</div>

{/* ADD THIS: Modal outside loop */}
{selectedError && (
  <ErrorDetailModal
    error={selectedError}
    onClose={() => setSelectedError(null)}
  />
)}
```

---

## 💡 TIPS & TRICKS

### **1. Add AI Analysis (Optional but Recommended):**

If you have AI analysis results:
```typescript
<ErrorDetailModal
  error={{
    ...errorData,
    analysis: {
      category: 'APP_BUG',  // or TEST_ISSUE, ENVIRONMENT, FLAKY
      rootCause: 'Button selector changed in recent update',
      suggestedFix: {
        forDeveloper: 'Revert button ID to #submit-btn or update documentation',
        forQA: 'Update test locator to new button ID: #new-submit-btn'
      },
      confidence: 0.92  // 92% confident
    }
  }}
  onClose={...}
/>
```

### **2. Handle Missing Data Gracefully:**

```typescript
// Component handles missing data automatically:
error={{
  testId: test.id,
  testName: test.name,
  status: 'failed',
  duration: test.duration,
  error: test.error || 'Unknown error',  // Fallback
  screenshots: test.screenshots || [],  // Optional
  video: test.video || undefined,  // Optional
  analysis: test.analysis || undefined  // Optional
}}
```

### **3. Customize Button Styling:**

```css
/* Add to your CSS file */
.btn-view-error-detail {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

.btn-view-error-detail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

---

## 🎨 STYLING

### **The components use Tailwind CSS classes. If you don't use Tailwind:**

Option 1: **Add Tailwind to your project** (Recommended)
```bash
npm install -D tailwindcss
npx tailwindcss init
```

Option 2: **Convert to regular CSS** (Replace Tailwind classes with your own CSS)

---

## 🔧 CONFIGURATION

### **Electron IPC for Video Opening:**

The components use `window.electron.openPath()` for opening videos.

**Already configured** in your preload script:
```typescript
// packages/desktop/src/preload/index.ts
contextBridge.exposeInMainWorld('electron', {
  openPath: (path) => ipcRenderer.invoke('open-path', path)
});
```

**IPC Handler** in main process:
```typescript
// packages/desktop/src/main/ipc/index.ts
ipcMain.handle('open-path', async (_, path) => {
  try {
    await shell.openPath(path);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

✅ **Already set up** - Nothing to do!

---

## 📱 RESPONSIVE DESIGN

Components are fully responsive:
- ✅ Desktop: Full width modal
- ✅ Tablet: Adaptive layout
- ✅ Mobile: Stacked content

**No extra work needed!**

---

## 🎯 REAL WORLD EXAMPLE

### **Complete Integration Example:**

```typescript
// YourAutonomousTestingPage.tsx
import React, { useState } from 'react';
import { AutonomousTestResults } from '@/components/Autonomous/AutonomousTestResults';

export const AutonomousTestingPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runAutonomousTests = async () => {
    setIsRunning(true);
    
    try {
      // Your API call
      const response = await fetch('/api/autonomous-testing/start', {
        method: 'POST',
        body: JSON.stringify({
          websiteUrl: 'https://comathedu.id/',
          depth: 'deep'
        })
      });
      
      const data = await response.json();
      
      // Set results
      setResults({
        passed: data.executionResults.passed,
        failed: data.executionResults.failed,
        healed: data.executionResults.healed,
        totalDuration: data.executionResults.totalDuration,
        analysisResults: data.analysisResults,
        generatedTests: data.generatedTests
      });
      
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Autonomous Testing</h1>
      
      {/* Start button */}
      <button 
        onClick={runAutonomousTests}
        disabled={isRunning}
      >
        {isRunning ? 'Running...' : 'Start Tests'}
      </button>

      {/* Results display - THIS IS WHERE THE MAGIC HAPPENS */}
      {results && (
        <AutonomousTestResults
          results={results}
          analyses={results.analysisResults}
          generatedTests={results.generatedTests}
        />
      )}
      
      {/* Users can now click any failed test to see full details! */}
    </div>
  );
};
```

---

## 🐛 TROUBLESHOOTING

### **Modal not showing?**
- Check if `selectedError` state is set
- Verify component is imported correctly
- Check for CSS conflicts (z-index issues)

### **Video not opening?**
- Verify Electron IPC is configured
- Check video path is valid
- Ensure shell module is imported in main process

### **Screenshots not displaying?**
- Ensure screenshots are base64 encoded
- Check image data format: `data:image/png;base64,{data}`
- Verify array is not empty

### **AI Analysis not showing?**
- Verify `analysis` object structure matches interface
- Check if analysis tab is visible (only shows if data exists)
- Ensure confidence is between 0-1 (not percentage)

---

## ✅ CHECKLIST FOR INTEGRATION

- [ ] Import `ErrorDetailModal` or `AutonomousTestResults`
- [ ] Add state for selected error (`useState`)
- [ ] Pass correct data structure
- [ ] Handle click events to open modal
- [ ] Test with real error data
- [ ] Verify video opening works
- [ ] Check screenshots display correctly
- [ ] Test AI analysis display (if available)
- [ ] Verify mobile responsiveness
- [ ] Test close modal functionality

---

## 🎉 YOU'RE DONE!

Now your users can:
- 📊 See beautiful test results
- 🐛 Click to view detailed errors
- 📸 View screenshots
- 🎥 Play execution videos
- 🤖 Read AI analysis
- 💡 Get fix suggestions
- ⚡ Debug faster!

---

**Questions?** Check `ERROR_DETAIL_FEATURE_COMPLETE.md` for full documentation!

**Happy Debugging!** 🐛🔍✨

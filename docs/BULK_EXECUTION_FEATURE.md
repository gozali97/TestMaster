# Fitur Execute Test dengan Dropdown Menu

## Overview

Fitur baru untuk menu Execute yang sekarang memiliki dropdown dengan 2 opsi:
- **Execute Test** - Eksekusi single test case (existing functionality)
- **Execute All Tests** - Eksekusi multiple test cases dengan checklist

## Fitur Utama

### 1. **Dropdown Menu Execute** 🔽

Menu Execute di sidebar sekarang memiliki dropdown:
- Klik menu "▶️ Execute" untuk buka/tutup dropdown
- Pilih "▶️ Execute Test" untuk single test execution
- Pilih "⚡ Execute All Tests" untuk bulk test execution

### 2. **Execute Test (Single)** ▶️

Fitur existing untuk execute satu test case:
- Select project
- Select test case
- Configure options (video recording, screenshots)
- Execute test
- View results

### 3. **Execute All Tests (Bulk)** ⚡

Fitur baru untuk execute multiple test cases sekaligus:

#### Features:
- **Checklist per Test Case** ✅
  - Tampilan test cases grouped by project
  - Checkbox untuk select/deselect individual test
  - Checkbox untuk select/deselect all tests dalam satu project
  - Button "Select All" dan "Deselect All" untuk semua test

- **Execution Modes** 🔄
  - **Sequential** - Jalankan test satu per satu (lebih stabil)
  - **Parallel** - Jalankan semua test bersamaan (lebih cepat)

- **Real-time Progress** ⏳
  - Status per test: Pending, Running, Passed, Failed, Error
  - Test yang sedang dijalankan di-highlight
  - Duration per test
  - Live execution logs

- **Execution Summary** 📊
  - Total tests executed
  - Passed count
  - Failed count
  - Error count
  - Visual summary cards dengan warna

## Cara Menggunakan

### Execute All Tests (Bulk Execution)

1. **Navigasi ke Execute All Tests**
   ```
   Sidebar → ▶️ Execute (klik) → ⚡ Execute All Tests
   ```

2. **Select Tests**
   - Expand/collapse project dengan klik arrow (▶ / ▼)
   - Check/uncheck individual test cases
   - Atau klik checkbox di project header untuk select all tests in project
   - Atau gunakan button "✅ Select All" / "❌ Deselect All"

3. **Choose Execution Mode**
   - **🔄 Sequential**: Test dijalankan satu per satu
     - Lebih stabil
     - Mudah debug
     - Durasi = sum of all tests
   
   - **⚡ Parallel**: Test dijalankan bersamaan
     - Lebih cepat
     - Menggunakan multiple browser instances
     - Durasi ≈ longest test duration

4. **Execute**
   - Klik button "⚡ Execute X Test(s)"
   - Monitor progress di:
     - Test list (status per test)
     - Execution Summary (aggregate stats)
     - Execution Logs (detailed logs)

5. **View Results**
   - Status badge per test: ⏸️ Pending, ⏳ Running, ✅ Passed, ❌ Failed, ⚠️ Error
   - Duration per test
   - Summary cards:
     - Total tests
     - ✅ Passed
     - ❌ Failed
     - ⚠️ Error
     - ⏳ Running (during execution)

## UI Components

### Sidebar Dropdown
```
▶️ Execute ▼
  ├── ▶️ Execute Test
  └── ⚡ Execute All Tests
```

### Bulk Execution Screen Layout

```
┌────────────────────────────────────────┐
│  ⚡ Bulk Test Execution                │
│  Select and execute multiple test cases│
├────────────────────────────────────────┤
│  📋 Select Tests to Execute            │
│  [✅ Select All] [❌ Deselect All] 3 selected │
├────────────────────────────────────────┤
│  Execution Mode:                       │
│  ○ 🔄 Sequential  ● ⚡ Parallel        │
├────────────────────────────────────────┤
│  ▼ 📁 Project A (2/3)                  │
│     ☑️ Login Test                ✅ passed │
│     ☑️ Register Test             ❌ failed │
│     ☐ Logout Test                      │
│                                        │
│  ▶ 📁 Project B (1/2)                  │
├────────────────────────────────────────┤
│  [⚡ Execute 3 Test(s)]                │
├────────────────────────────────────────┤
│  📊 Execution Summary                  │
│  ┌──────┬──────┬──────┬──────┐        │
│  │  3   │  1   │  1   │  1   │        │
│  │Total │Passed│Failed│Error │        │
│  └──────┴──────┴──────┴──────┘        │
├────────────────────────────────────────┤
│  📝 Execution Logs                     │
│  ⏱️ 14:30:25  🚀 Starting bulk...     │
│  ⏱️ 14:30:26  ▶️ Executing: Login...  │
│  ⏱️ 14:30:32  ✅ Login: PASSED (5.2s) │
└────────────────────────────────────────┘
```

## Technical Implementation

### Components Created

1. **BulkTestExecutionRunner.tsx**
   - Main component for bulk execution
   - State management untuk selected tests, results, logs
   - Execute logic (sequential/parallel)
   - Real-time status updates

2. **Updated App.tsx**
   - Added `execution-bulk` view state
   - Added dropdown menu with sub-navigation
   - Route to BulkTestExecutionRunner

3. **Updated App.css**
   - Dropdown menu styles
   - Sub-menu item styles
   - Active state for dropdown items

4. **Updated TestExecutionRunner.css**
   - Bulk execution specific styles
   - Project group collapsible styles
   - Test checklist styles
   - Summary cards styles
   - Status badges and animations

### Key Functions

```typescript
// Select/Deselect functions
toggleTestSelection(testId: number)
toggleProjectTests(projectId: number)
selectAllTests()
deselectAllTests()

// Execution functions
executeTests() // Main execution handler
executeSequential(testIds: number[])
executeParallel(testIds: number[])
executeSingleTest(testId: number)

// UI functions
toggleProject(projectId: number) // Expand/collapse
getSummary() // Aggregate statistics
getStatusIcon(status: string)
getStatusColor(status: string)
```

### State Management

```typescript
const [selectedTests, setSelectedTests] = useState<Set<number>>()
const [executionResults, setExecutionResults] = useState<Map<number, BulkExecutionResult>>()
const [executionLogs, setExecutionLogs] = useState<string[]>()
const [expandedProjects, setExpandedProjects] = useState<Set<number>>()
const [executionMode, setExecutionMode] = useState<'sequential' | 'parallel'>()
const [currentExecuting, setCurrentExecuting] = useState<number | null>()
```

## Configuration

### Default Settings

- **Video Recording**: Disabled for bulk execution (untuk performa)
- **Screenshots**: Enabled
- **Headless Mode**: Enabled (browser tidak visible, lebih cepat)
- **Timeout per Test**: 120 seconds (2 minutes)
- **Expanded Projects**: All projects expanded by default

### Customization

Anda bisa customize di `BulkTestExecutionRunner.tsx`:

```typescript
// Line ~135
const execResult = await ApiService.executeTest(
  test.projectId,
  testId,
  {
    captureVideo: false,        // Set true untuk record video
    captureScreenshots: true,   // Set false untuk disable screenshots
    headless: true,             // Set false untuk visible browser
  }
);
```

## Performance Tips

### Sequential Mode
- ✅ Stable dan reliable
- ✅ Mudah debug jika ada error
- ✅ Resource usage rendah
- ❌ Durasi lebih lama (sum of all tests)

**Recommended untuk:**
- Test yang saling depend
- Test yang heavy (banyak data)
- Development/debugging

### Parallel Mode
- ✅ Sangat cepat (semua test bersamaan)
- ✅ Efficient untuk banyak test
- ❌ Resource intensive (CPU, Memory)
- ❌ Susah debug jika error

**Recommended untuk:**
- Independent tests
- Smoke testing
- CI/CD pipeline
- Production testing dengan server yang kuat

## Troubleshooting

### Test tidak muncul di list
**Solusi**: Pastikan project memiliki test cases. Cek di menu Tests.

### Execution timeout
**Solusi**: Test timeout after 2 minutes. Untuk test yang lama, increase timeout di code:
```typescript
const maxAttempts = 120; // Change to 240 for 4 minutes
```

### Parallel execution gagal
**Solusi**: 
- Gunakan Sequential mode
- Pastikan system resources cukup (RAM, CPU)
- Reduce jumlah test yang dijalankan sekaligus

### Status tetap "Running"
**Solusi**:
- Check API logs untuk error
- Restart desktop app
- Check test case steps (mungkin ada infinite loop)

## Best Practices

1. **Group Tests by Purpose**
   - Smoke tests in one project
   - Regression tests in another project
   - Feature-specific tests in dedicated projects

2. **Use Sequential for Development**
   - Easier to debug
   - Clear logs per test
   - See browser actions

3. **Use Parallel for CI/CD**
   - Faster feedback
   - Run on headless mode
   - Aggregate results quickly

4. **Regular Cleanup**
   - Archive old tests
   - Remove flaky tests
   - Update test data

5. **Monitor Results**
   - Check failed tests immediately
   - Review error patterns
   - Update tests based on failures

---

**Created**: October 28, 2025
**Version**: 1.0.0
**Feature**: Bulk Test Execution with Checklist

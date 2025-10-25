# 🔄 Desktop & Web Data Sync - Quick Guide

## 🎯 Problem & Solution

### ❌ Problem (Before):
- Desktop dan Web data **BERBEDA**
- Desktop data hanya di memory (hilang saat tutup app)
- Tidak ada sinkronisasi
- Buat test di Desktop → Tidak muncul di Web
- Buat project di Web → Tidak muncul di Desktop

### ✅ Solution (After):
- Desktop dan Web menggunakan **DATABASE YANG SAMA**
- Semua data **PERSISTENT** (tersimpan permanent)
- **REAL-TIME SYNC** antara Desktop dan Web
- Single source of truth
- Team collaboration ready

## 🚀 Quick Start

### 1. Start API Server
```bash
cd packages/api
npm run start:fresh
```

### 2. Use New Components in Desktop

#### Import Components:
```typescript
import { ApiService } from './services/api.service';
import { ProjectManager } from './components/Projects/ProjectManager';
import { TestEditorAPI } from './components/Editor/TestEditorAPI';
```

#### Basic Setup:
```typescript
function App() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [testId, setTestId] = useState<number | null>(null);

  // Step 1: Show project list
  if (!projectId) {
    return <ProjectManager onSelectProject={setProjectId} />;
  }

  // Step 2: Show test editor
  return (
    <TestEditorAPI 
      projectId={projectId} 
      testCaseId={testId} 
    />
  );
}
```

## 📁 New Files to Use

### Core Files Created:

```
packages/desktop/src/renderer/
├── services/
│   └── api.service.ts              ✅ API communication layer
│
├── components/
│   ├── Editor/
│   │   └── TestEditorAPI.tsx       ✅ Database-connected editor
│   │
│   └── Projects/
│       ├── ProjectManager.tsx      ✅ Project management with DB
│       └── ProjectManager.css      ✅ Styling
```

### Files to Replace:

```
❌ Old: TestEditor.tsx (local state only)
✅ New: TestEditorAPI.tsx (database connected)
```

## 🎨 Component Features

### 1. ProjectManager

**Features:**
- List all projects from database
- Create new project
- Delete project
- Select project to edit
- Auto-refresh

**Usage:**
```typescript
<ProjectManager 
  onSelectProject={(projectId) => {
    console.log('Selected project:', projectId);
    // Navigate to project editor
  }} 
/>
```

### 2. TestEditorAPI

**Features:**
- Load test case from database
- Save test case to database
- Edit steps
- Manage variables
- Generate script
- Real-time sync

**Usage:**
```typescript
<TestEditorAPI 
  projectId={1}           // Required
  testCaseId={5}          // Optional (for editing existing test)
/>
```

**Buttons:**
- 💾 **Save** - Save to database
- 🔄 **Reload** - Reload from database
- **+ Add Step** - Add test step
- **Variables** - Manage variables

### 3. ApiService

**Direct API Calls:**

```typescript
// Get all projects
const result = await ApiService.getProjects();
if (result.success) {
  console.log('Projects:', result.data);
}

// Create project
await ApiService.createProject({
  name: 'My Project',
  description: 'Test project'
});

// Create test case
await ApiService.createTestCase(projectId, {
  name: 'Login Test',
  description: 'Test login flow',
  steps: [
    { id: '1', action: 'navigate', value: 'https://example.com' },
    { id: '2', action: 'click', locator: '#login' }
  ],
  variables: []
});

// Update test case
await ApiService.updateTestCase(projectId, testId, {
  steps: updatedSteps
});
```

## 🔐 Authentication

### Login Required

Desktop app needs authentication:

```typescript
// Check if logged in
if (!ApiService.isAuthenticated()) {
  // Show login screen
  return <LoginPage />;
}

// After login
ApiService.storeTokens(accessToken, refreshToken);
```

### Auto Token Management

ApiService handles:
- Token storage (localStorage)
- Auto token refresh
- Redirect on unauthorized

## 🧪 Test Scenarios

### Scenario 1: Create in Desktop → View in Web

**Steps:**
1. Open Desktop app
2. Login with your account
3. Create new project "Test Sync"
4. Add test case with 3 steps
5. Click **💾 Save**
6. Open Web app (http://localhost:3000)
7. Login with same account
8. Navigate to Projects
9. See "Test Sync" project
10. Open test case
11. See exact same 3 steps

✅ **Result**: Data synced perfectly

### Scenario 2: Edit in Web → View in Desktop

**Steps:**
1. Open Web app
2. Edit test case, add 2 more steps
3. Save changes
4. Open Desktop app
5. Open same test case
6. Click **🔄 Reload**
7. See 5 steps total (3 original + 2 new)

✅ **Result**: Changes reflected

### Scenario 3: Multi-Device Sync

**Setup**: Same user on 2 computers

**Flow:**
1. Computer A (Desktop): Create project
2. Computer B (Web): See project immediately
3. Computer B (Web): Add test case
4. Computer A (Desktop): Reload, see test case
5. Both devices always show same data

✅ **Result**: Perfect synchronization

## 📊 Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  Desktop App    │         │    Web App      │
│                 │         │                 │
│  ProjectManager │         │  Projects Page  │
│  TestEditorAPI  │         │  Test Editor    │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │    API Service Layer      │
         │    (ApiService)           │
         │                           │
         └────────┬──────────────────┘
                  │
                  ↓
         ┌────────────────┐
         │   API Server   │
         │  Port: 3001    │
         └────────┬───────┘
                  │
                  ↓
         ┌────────────────┐
         │   Database     │
         │  MySQL/Postgres│
         └────────────────┘
         
    Single Source of Truth
```

## 🔄 Data Flow

### Creating Test Case:

```
User Action (Desktop)
    ↓
TestEditorAPI Component
    ↓
ApiService.createTestCase()
    ↓
POST http://localhost:3001/api/projects/{id}/tests
    ↓
API Server validates & saves
    ↓
Database INSERT
    ↓
Response with created test
    ↓
Desktop displays success
    ↓
Data now available to Web too! ✅
```

## 🎯 Benefits

### 1. Data Consistency
- Same data everywhere
- No conflicts
- No duplication

### 2. Persistence
- Data survives app restart
- Cloud storage ready
- Backup available

### 3. Collaboration
- Share projects with team
- Real-time updates
- Centralized repository

### 4. Multi-Device
- Access from anywhere
- Desktop, Web, Mobile (future)
- Always in sync

## ⚠️ Important Notes

### API Must Be Running

Desktop and Web both need API server:

```bash
# Terminal 1: API
cd packages/api
npm run start:fresh

# Terminal 2: Web (optional)
cd packages/web
npm run dev

# Terminal 3: Desktop
cd packages/desktop
npm run dev
```

### Authentication Required

Both apps need login:
- Use same account credentials
- Tokens stored in localStorage
- Auto-refresh when expired

### Network Connection

Apps need internet/network to reach API:
- Default: http://localhost:3001
- Can be changed to remote server
- Offline mode: planned for future

## 🛠️ Configuration

### Change API URL

**Desktop** - Edit service:
```typescript
// packages/desktop/src/renderer/services/api.service.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// For production
const API_URL = 'https://api.yourdomain.com';
```

**Web** - Edit service:
```typescript
// packages/web/src/lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

## 📝 Migration Guide

### For Users with Old Desktop Data

**Old data (memory only) cannot be migrated automatically.**

**Steps:**
1. Note down your test cases
2. Start using new API-connected components
3. Recreate tests using ProjectManager + TestEditorAPI
4. Data now saved to database
5. Accessible from both Desktop and Web

### For New Users

Just use the new components:
- Everything works out of the box
- All data automatically synced
- No migration needed

## 🔍 Troubleshooting

### Problem: "Failed to load projects"

**Check:**
1. API server running?
   ```bash
   cd packages/api
   npm run start:fresh
   ```

2. Correct API URL?
   - Default: http://localhost:3001

3. Logged in?
   - Check localStorage for accessToken

### Problem: Data not appearing

**Solutions:**
1. Click **🔄 Reload** button
2. Check network tab in DevTools
3. Verify API response
4. Check authentication status

### Problem: "Unauthorized" error

**Fix:**
1. Login again
2. Token might be expired
3. Check API server logs

## 📚 Example Integration

### Complete Desktop App.tsx

```typescript
import { useState, useEffect } from 'react';
import { ApiService } from './services/api.service';
import { ProjectManager } from './components/Projects/ProjectManager';
import { TestEditorAPI } from './components/Editor/TestEditorAPI';
import { LoginPage } from './components/Auth/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);

  useEffect(() => {
    setIsAuthenticated(ApiService.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={() => setIsAuthenticated(true)} 
      />
    );
  }

  if (currentView === 'projects' || !selectedProject) {
    return (
      <ProjectManager 
        onSelectProject={(id) => {
          setSelectedProject(id);
          setCurrentView('editor');
        }} 
      />
    );
  }

  return (
    <div className="app">
      <nav>
        <button onClick={() => {
          setCurrentView('projects');
          setSelectedProject(null);
        }}>
          ← Back to Projects
        </button>
      </nav>
      
      <TestEditorAPI 
        projectId={selectedProject} 
        testCaseId={selectedTest} 
      />
    </div>
  );
}

export default App;
```

## ✅ Checklist

Before using new components:

- [ ] API server running on port 3001
- [ ] Database configured and connected
- [ ] User registered/logged in
- [ ] Tokens stored in localStorage
- [ ] Network connection available

Using components:

- [ ] Import ApiService
- [ ] Import ProjectManager
- [ ] Import TestEditorAPI
- [ ] Add authentication check
- [ ] Handle loading states
- [ ] Handle errors

Testing:

- [ ] Create project in Desktop → See in Web
- [ ] Create test in Web → See in Desktop
- [ ] Edit test → Changes sync
- [ ] Delete project → Removed everywhere

## 🎓 Best Practices

1. **Always check authentication**
   ```typescript
   if (!ApiService.isAuthenticated()) {
     return <LoginPage />;
   }
   ```

2. **Handle errors gracefully**
   ```typescript
   const result = await ApiService.getProjects();
   if (!result.success) {
     alert('Error: ' + result.error);
   }
   ```

3. **Show loading states**
   ```typescript
   {loading && <div>Loading...</div>}
   ```

4. **Save frequently**
   - Auto-save on change (future)
   - Manual save button
   - Confirm before leaving

5. **Reload when needed**
   - After other user edits
   - On network reconnect
   - Periodic refresh

## 📞 Support

### Common Issues

1. **Data not syncing** → Check API connection
2. **Unauthorized** → Re-login
3. **404 Not Found** → Check API routes
4. **500 Server Error** → Check API logs

### Debug Mode

Enable console logs:

```typescript
// In ApiService
console.log('API Call:', endpoint, options);
console.log('Response:', result);
```

---

## ✅ Summary

**Before:**
- ❌ Desktop: Local data only (memory)
- ❌ Web: Database data
- ❌ NO SYNC

**After:**
- ✅ Desktop: Database via API
- ✅ Web: Database via API
- ✅ FULL SYNC

**Result:**
- Single source of truth (database)
- Data consistent everywhere
- Real-time synchronization
- Team collaboration ready

**Start using now!** 🚀

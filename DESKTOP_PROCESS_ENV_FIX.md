# 🔧 Desktop Process.env Error Fix

## 🐛 Error

```
Uncaught ReferenceError: process is not defined
    at api.service.ts:3:17
```

## 🔍 Root Cause

**Problem**: Using `process.env` in Electron renderer process

```typescript
// ❌ This causes error in Electron renderer
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

**Why**: 
- `process` is a Node.js global object
- Electron renderer process runs in browser context
- `process` is not available by default in renderer
- Even though Electron can expose it, it's not enabled by default for security

## ✅ Solution Implemented

### 1. Created API Configuration File

**File**: `packages/desktop/src/renderer/config/api.config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
    },
    PROJECTS: { ... },
    TESTS: { ... },
    EXECUTIONS: { ... },
  },
  
  TIMEOUT: 30000,
  
  TOKEN_STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
  },
};

// Helper to get base URL
export function getBaseUrl(): string {
  if (isProduction()) {
    return 'https://api.testmaster.com';
  }
  return 'http://localhost:3001';
}
```

### 2. Updated API Service

**File**: `packages/desktop/src/renderer/services/api.service.ts`

**Before:**
```typescript
// ❌ Error
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

**After:**
```typescript
// ✅ Fixed
import { getBaseUrl } from '../config/api.config';

const API_URL = getBaseUrl();
```

## 📁 Files Created/Modified

### Created:
```
packages/desktop/src/renderer/config/
└── api.config.ts          ✅ NEW - Configuration file
```

### Modified:
```
packages/desktop/src/renderer/services/
└── api.service.ts         ✅ FIXED - Removed process.env
```

## 🎯 Benefits

### 1. **No Runtime Errors**
- No more `process is not defined` error
- Works in Electron renderer process
- Browser-compatible code

### 2. **Centralized Configuration**
- All API config in one place
- Easy to change API URL
- Easy to switch between dev/prod
- Typed endpoints with TypeScript

### 3. **Better Organization**
- Separate config from logic
- Reusable configuration
- Clear structure

### 4. **Production Ready**
- `isProduction()` function to detect environment
- Easy to switch between dev and prod URLs
- Can be extended for more environments

## 🔧 Configuration Options

### Change API URL

**For Development:**
```typescript
// In api.config.ts
export function getBaseUrl(): string {
  return 'http://localhost:3001'; // Your local API
}
```

**For Production:**
```typescript
export function getBaseUrl(): string {
  if (isProduction()) {
    return 'https://api.yourdomain.com'; // Your production API
  }
  return 'http://localhost:3001';
}
```

**For Custom Port:**
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3002', // Different port
  // ...
};
```

## 🚀 Usage Examples

### Using Config Directly:
```typescript
import { API_CONFIG, getApiUrl } from '../config/api.config';

// Get full URL
const loginUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
// Result: 'http://localhost:3001/api/auth/login'

// Get base URL
const baseUrl = API_CONFIG.BASE_URL;
// Result: 'http://localhost:3001'
```

### Using in API Service:
```typescript
// ApiService already uses config internally
const result = await ApiService.login(email, password);
// Automatically uses correct API URL
```

## 🔍 Alternative Solutions (Not Used)

### Option 1: Enable nodeIntegration (NOT RECOMMENDED)
```typescript
// In main process
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true, // ❌ Security risk
    contextIsolation: false,
  },
});
```
**Why not**: Major security vulnerability

### Option 2: Use Preload Script
```typescript
// In preload.ts
contextBridge.exposeInMainWorld('config', {
  apiUrl: process.env.API_URL || 'http://localhost:3001',
});

// In renderer
const API_URL = window.config.apiUrl;
```
**Why not**: More complex, not needed for static config

### Option 3: Webpack DefinePlugin
```javascript
// In webpack config
plugins: [
  new webpack.DefinePlugin({
    'process.env.API_URL': JSON.stringify('http://localhost:3001'),
  }),
],
```
**Why not**: We use Vite, not Webpack

### Option 4: Vite Environment Variables
```typescript
// Using import.meta.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```
**Why not**: Simple config file is clearer and more flexible

## ✅ Why Our Solution is Best

1. **Simple** - Just a config file
2. **Safe** - No security risks
3. **Clear** - Easy to understand
4. **Flexible** - Easy to extend
5. **Typed** - TypeScript support
6. **No Build Tools** - No special build configuration needed

## 🧪 Testing

### Test the Fix:

1. **Start Desktop App:**
```bash
cd packages/desktop
npm run dev
```

2. **Check Console:**
- No `process is not defined` error ✅
- App loads successfully ✅

3. **Test API Calls:**
- Login works ✅
- Projects load ✅
- Data syncs with database ✅

### Verify Config:
```typescript
import { API_CONFIG, getBaseUrl } from './config/api.config';

console.log('Base URL:', getBaseUrl());
// Output: http://localhost:3001

console.log('Login endpoint:', API_CONFIG.ENDPOINTS.AUTH.LOGIN);
// Output: /api/auth/login
```

## 🎓 Best Practices

### 1. Always Use Config
```typescript
// ✅ GOOD
import { getBaseUrl } from '../config/api.config';
const API_URL = getBaseUrl();

// ❌ BAD
const API_URL = process.env.REACT_APP_API_URL;
```

### 2. Don't Hardcode URLs
```typescript
// ✅ GOOD
import { API_CONFIG, getApiUrl } from '../config/api.config';
const url = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);

// ❌ BAD
const url = 'http://localhost:3001/api/auth/login';
```

### 3. Use Typed Endpoints
```typescript
// ✅ GOOD - TypeScript will catch typos
API_CONFIG.ENDPOINTS.AUTH.LOGIN

// ❌ BAD - No type safety
'/api/auth/login'
```

## 🔐 Security Notes

### Our Solution:
- ✅ No nodeIntegration enabled
- ✅ contextIsolation remains true
- ✅ No process exposure to renderer
- ✅ Follows Electron security best practices

### What NOT to Do:
```typescript
// ❌ NEVER DO THIS
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
}
```

## 📝 Environment-Specific Configuration

### For Multiple Environments:

```typescript
// api.config.ts
export function getBaseUrl(): string {
  // Check window.location or other indicators
  const hostname = window.location.hostname;
  
  if (hostname.includes('production')) {
    return 'https://api.testmaster.com';
  } else if (hostname.includes('staging')) {
    return 'https://staging-api.testmaster.com';
  } else {
    return 'http://localhost:3001';
  }
}
```

### Using External Config:

```typescript
// config.json (can be loaded at runtime)
{
  "development": {
    "apiUrl": "http://localhost:3001"
  },
  "production": {
    "apiUrl": "https://api.testmaster.com"
  }
}

// Then load in code
import config from './config.json';
const env = isProduction() ? 'production' : 'development';
const API_URL = config[env].apiUrl;
```

## 🎉 Result

**Before:**
- ❌ Error: `process is not defined`
- ❌ App crashes on start
- ❌ Cannot make API calls

**After:**
- ✅ No errors
- ✅ App starts successfully
- ✅ API calls work perfectly
- ✅ Clean, maintainable code
- ✅ Easy to configure

## 📚 Related Documentation

- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Preload Scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)

## ✅ Checklist

- [x] Remove process.env from api.service.ts
- [x] Create api.config.ts
- [x] Update imports in api.service.ts
- [x] Test desktop app starts without errors
- [x] Test API calls work
- [x] Document the solution

---

**Status**: ✅ FIXED

Desktop app now runs without process.env errors!

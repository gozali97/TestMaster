# 🎯 Multi-Panel Autonomous Testing - Usage Guide

## 📋 Overview

The Multi-Panel Autonomous Testing feature allows you to test **three different panels** of your web application in a single comprehensive test run:

1. **📄 Landing Page (Public)** - Tests all publicly accessible pages
2. **👤 User Panel** - Tests user dashboard and user-specific features
3. **⚡ Admin Panel** - Tests admin dashboard and admin-specific features

Plus **🔒 RBAC Testing** - Verifies that users cannot access admin pages.

---

## 🚀 Getting Started

### Step 1: Access Multi-Panel Testing

**Desktop App:**
- Navigate to: **Autonomous Testing** → **Multi-Panel Testing**
- Or use the file: `packages/desktop/src/pages/AutonomousTestingMultiPanel.tsx`

**API Endpoint:**
```
POST http://localhost:3001/api/autonomous-testing/multi-panel/start
```

---

## ⚙️ Configuration

### Required Fields

#### 1. Landing Page URL **(Required)**
```
Example: https://myapp.com
```
The main website URL to test public pages.

#### 2. Admin Panel **(Required)**
```
URL: https://myapp.com/admin
Username: admin@example.com
Password: AdminPassword123
```
Admin credentials are **mandatory** for full testing.

### Optional Fields

#### 3. User Panel (Optional)
```
☑ Enable User Panel Testing
URL: https://myapp.com/dashboard (optional, defaults to landing page URL)
```

**Authentication Strategy:**
- **Auto-register (Recommended):** System will automatically register a new test user
- **Use provided credentials:** Provide existing user credentials

```
Username: user@example.com (if using provided strategy)
Password: UserPassword123
```

#### 4. Test Configuration
```
Test Depth: Deep (Shallow/Deep/Exhaustive)
☑ Enable Self-Healing
☑ Capture Video Recording
☑ Test Role-Based Access Control (RBAC)
☐ Test Data Consistency Across Panels
```

---

## 📝 Example Configurations

### Example 1: Basic (Landing + Admin)
```json
{
  "landingPage": {
    "url": "https://myapp.com"
  },
  "adminPanel": {
    "url": "https://myapp.com/admin",
    "credentials": {
      "username": "admin@example.com",
      "password": "AdminPassword123"
    }
  },
  "depth": "deep",
  "enableHealing": true,
  "captureVideo": true,
  "testRBAC": true
}
```

**What it does:**
- Tests all public pages
- Tests all admin pages
- Verifies admin access control
- Duration: ~15 minutes

### Example 2: Full (Landing + User + Admin)
```json
{
  "landingPage": {
    "url": "https://myapp.com"
  },
  "adminPanel": {
    "url": "https://myapp.com/admin",
    "credentials": {
      "username": "admin@example.com",
      "password": "AdminPassword123"
    }
  },
  "userPanel": {
    "enabled": true,
    "url": "https://myapp.com/dashboard",
    "authStrategy": "auto-register"
  },
  "depth": "deep",
  "enableHealing": true,
  "captureVideo": true,
  "testRBAC": true,
  "testDataConsistency": true
}
```

**What it does:**
- Tests all public pages
- Auto-registers a test user and tests user panel
- Tests all admin pages
- Tests RBAC (user cannot access admin pages)
- Tests data consistency across panels
- Duration: ~25 minutes

### Example 3: With Existing User Credentials
```json
{
  "landingPage": {
    "url": "https://myapp.com"
  },
  "adminPanel": {
    "url": "https://myapp.com/admin",
    "credentials": {
      "username": "admin@example.com",
      "password": "AdminPassword123"
    }
  },
  "userPanel": {
    "enabled": true,
    "url": "https://myapp.com/dashboard",
    "authStrategy": "provided",
    "credentials": {
      "username": "user@example.com",
      "password": "UserPassword123"
    }
  },
  "depth": "shallow",
  "enableHealing": true,
  "captureVideo": false,
  "testRBAC": true
}
```

**What it does:**
- Tests with existing user credentials
- Quick shallow test
- No video recording (faster)
- Duration: ~10 minutes

---

## 📊 Understanding the Results

### Summary Statistics
```
Total Tests: 245
✅ Passed: 228 (93.1%)
❌ Failed: 12 (4.9%)
🔧 Healed: 5 (2.0%)
📈 Coverage: 87%
Duration: 25 minutes
```

### Panel Breakdown
```
📄 Landing Page:
   - Pages: 15 | Tests: 45 | Passed: 43 | Failed: 2

👤 User Panel:
   - Pages: 35 | Tests: 95 | Passed: 89 | Failed: 6

⚡ Admin Panel:
   - Pages: 48 | Tests: 105 | Passed: 96 | Failed: 4

🔒 RBAC Tests:
   - Total Checks: 48 | Passed: 47 | Failed: 1
   - ❌ SECURITY ISSUE: User accessed /admin/logs
```

---

## 🔍 RBAC Testing Explained

### What is RBAC Testing?

RBAC (Role-Based Access Control) testing verifies that:
1. ✅ **Users CANNOT access admin pages** (should get 403/401 or redirect to login)
2. ✅ **Admins CAN access admin pages** (should get 200 OK)

### Example RBAC Results

**✅ Good (Secure):**
```
Test: User accessing /admin/dashboard
Expected: Access denied
Actual: 403 Forbidden
Result: ✅ PASSED - Access correctly denied
```

**❌ Bad (Security Issue):**
```
Test: User accessing /admin/logs
Expected: Access denied
Actual: 200 OK
Result: ❌ FAILED - SECURITY ISSUE: Unauthorized access granted!
```

### How to Fix RBAC Issues

If RBAC tests fail, you have a **security vulnerability**. Fix it by:

1. **Add authentication middleware:**
```javascript
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

app.get('/admin/*', requireAdmin, adminController);
```

2. **Check user role in route guards:**
```typescript
// React Router
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

---

## ⏱️ Test Duration Estimates

| Configuration | Duration | Tests Generated |
|--------------|----------|-----------------|
| Shallow (Landing + Admin) | ~5-10 min | 50-80 tests |
| Deep (Landing + Admin) | ~15-20 min | 150-200 tests |
| Deep (Landing + User + Admin) | ~20-30 min | 200-300 tests |
| Exhaustive (All panels) | ~40-60 min | 400-600 tests |

---

## 🐛 Troubleshooting

### Issue: "Admin credentials are required"
**Solution:** Make sure to fill in both admin username and password fields.

### Issue: "Session not found"
**Solution:** The session may have expired. Start a new test run.

### Issue: "Admin authentication failed"
**Solution:** 
- Verify admin credentials are correct
- Check if admin login page is accessible
- Check if admin URL is correct (e.g., `/admin/login` vs `/admin`)

### Issue: "User authentication failed"
**Solution:** 
- If using "auto-register": Check if registration is working on your site
- If using "provided": Verify user credentials are correct

### Issue: RBAC tests failing
**Solution:** This indicates a **security issue**. Review the failed URLs and add proper authentication middleware.

---

## 🎯 Best Practices

### 1. Start with Shallow Tests
First run a shallow test to verify everything works:
```
Depth: Shallow
Duration: ~10 minutes
```

### 2. Use Auto-Register for User Panel
Recommended for most cases:
```
User Panel: Enabled
Auth Strategy: Auto-register
```

### 3. Always Enable RBAC Testing
Critical for security:
```
☑ Test Role-Based Access Control (RBAC)
```

### 4. Use Deep Tests for Regular Testing
Good balance of coverage and speed:
```
Depth: Deep
Duration: ~20-25 minutes
Coverage: 80-90%
```

### 5. Use Exhaustive Tests Before Releases
Comprehensive testing before deployment:
```
Depth: Exhaustive
Duration: ~45-60 minutes
Coverage: 95-100%
```

---

## 📈 What Gets Tested?

### Landing Page (Public)
- Navigation between pages
- Public forms (contact, newsletter)
- Registration form
- Login form
- Content rendering
- Responsive design

### User Panel
- User dashboard
- Profile management
- User-specific CRUD operations
- Settings/preferences
- User navigation
- Logout functionality

### Admin Panel
- Admin dashboard
- User management
- System settings
- Admin CRUD operations
- Reports/analytics
- Admin navigation

### RBAC Tests
- User blocked from admin URLs
- Admin can access admin URLs
- Proper HTTP status codes (403, 401, 200)
- Redirect behavior

---

## 🎉 Benefits

### For QA Testers
✅ 3x more comprehensive testing in single run
✅ Automatic security (RBAC) testing
✅ Realistic user scenarios
✅ Saves 10+ hours of manual testing

### For Developers
✅ Catches security issues early
✅ Verifies authentication/authorization
✅ Tests user journeys end-to-end
✅ Confident releases

### For Business
✅ Higher quality releases
✅ Better security posture
✅ Faster time to market
✅ Reduced bug costs

---

## 🔗 API Usage (Advanced)

### Start Testing
```bash
curl -X POST http://localhost:3001/api/autonomous-testing/multi-panel/start \
  -H "Content-Type: application/json" \
  -d '{
    "landingPage": {
      "url": "https://myapp.com"
    },
    "adminPanel": {
      "url": "https://myapp.com/admin",
      "credentials": {
        "username": "admin@example.com",
        "password": "AdminPassword123"
      }
    },
    "depth": "deep",
    "enableHealing": true,
    "testRBAC": true
  }'
```

**Response:**
```json
{
  "sessionId": "MP-123e4567-e89b-12d3-a456-426614174000"
}
```

### Get Progress (SSE)
```bash
curl -N http://localhost:3001/api/autonomous-testing/multi-panel/progress/MP-123e4567-e89b-12d3-a456-426614174000
```

### Get Results
```bash
curl http://localhost:3001/api/autonomous-testing/multi-panel/results/MP-123e4567-e89b-12d3-a456-426614174000
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs
3. Open an issue on GitHub

---

## 🎓 Next Steps

1. ✅ Run your first shallow test
2. ✅ Review the RBAC results
3. ✅ Fix any security issues found
4. ✅ Run a deep test regularly
5. ✅ Integrate into CI/CD pipeline

---

**Happy Testing! 🚀**

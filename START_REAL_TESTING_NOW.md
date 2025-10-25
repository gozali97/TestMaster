# 🚀 START REAL TESTING NOW!

## ✅ Semua Sudah Siap!

- ✅ Playwright installed
- ✅ Chromium browser installed  
- ✅ Playwright tested & working
- ✅ Controller switched to REAL testing
- ✅ Authentication fixed (token in query params)
- ✅ Video recording configured

---

## 🔧 Step-by-Step Setup

### **Step 1: Restart API Server** ⚠️ PENTING!

**Tutup terminal API yang lama**, lalu:

```powershell
cd D:\Project\TestMaster
npm run dev --workspace=packages/api
```

**✅ Expected Log:**
```
🔧 [ROUTES] Autonomous Testing routes loaded (REAL Playwright Testing - Auth Required)
🔐 [AUTH] Middleware loaded
TestMaster API server is running on port 3001
```

**❌ Jika tidak muncul log di atas:**
- API tidak restart dengan benar
- Restart lagi atau `Ctrl+C` dulu baru run lagi

---

### **Step 2: Restart Desktop App** ⚠️ PENTING!

**Tutup Electron app yang lama**, lalu:

```powershell
cd D:\Project\TestMaster
npm run dev --workspace=packages/desktop
```

**✅ App harus restart fresh!**

---

### **Step 3: Verify Login**

Di Desktop app:
1. Buka DevTools (`F12`)
2. Console tab
3. Ketik: `localStorage.getItem('accessToken')`
4. **Harus ada token panjang!**

**Jika NULL:** Login ulang!

---

### **Step 4: Start Real Testing**

Di Autonomous Testing page:

#### **Input Configuration:**

1. **Website URL:** `https://comathedu.id/`

2. **Authentication:** ✅ **CENTANG!**
   - Username: `admin@comath.id`
   - Password: `password123`

3. **Test Depth:** `Deep` (50-100 tests, ~10-15 menit)

4. **Record Video:** ✅ **CENTANG!**

5. **Self-Healing:** ✅ **CENTANG!**

6. **Click:** 🚀 **Start Autonomous Testing**

---

## 📊 What Will Happen

### **Phase 1: Discovery (0-20%)**

**API Logs akan menampilkan:**
```
🚀 [START] REAL Autonomous Testing Request
✅ [VALIDATION] Passed - Starting real Playwright testing...
🤖 [SERVICE] Creating AutonomousTestingOrchestrator...
✅ [SERVICE] Orchestrator created successfully
🚀 [SERVICE] Starting background testing...
🏃 [BACKGROUND] Starting testing for session: xxx
🖼️ [BACKGROUND] Calling orchestrator.runAutonomousTesting...

🤖 Starting Autonomous Testing Session: xxx
🌐 [DISCOVERY] Launching Chromium browser...
✅ [BROWSER] Browser launched successfully
🔐 [AUTH] Attempting to login...
🔍 [CRAWLER] Starting website crawl...
📄 [CRAWLER] Discovered page: /
📄 [CRAWLER] Discovered page: /login
📄 [CRAWLER] Discovered page: /dashboard
...
```

**DevTools Console:**
```
[FRONTEND] Auth token: eyJhbGci...
[FRONTEND] Response status: 200 OK
[FRONTEND] Session ID: xxx
[FRONTEND] SSE message received: { phase: "discovery", progress: 10, ... }
[FRONTEND] SSE message received: { phase: "discovery", progress: 15, ... }
```

**UI akan show:**
```
🔍 Discovering website structure... (10%)
🔍 Discovering website structure... (15%)
```

---

### **Phase 2: Generation (20-40%)**

**API Logs:**
```
🧪 [GENERATOR] Starting test generation...
📝 [GENERATOR] Analyzing 15 pages
📝 [GENERATOR] Found 45 interactions
📝 [GENERATOR] Generating test cases...
✅ [GENERATOR] Generated 87 test cases
```

**UI:**
```
🧪 Generating test cases... (30%)
```

---

### **Phase 3: Execution (40-70%)**

**API Logs:**
```
▶️ [EXECUTOR] Starting test execution...
🎥 [VIDEO] Recording started
🧪 [TEST 1/87] Login form validation
✅ [TEST 1/87] PASSED
🧪 [TEST 2/87] Dashboard navigation  
✅ [TEST 2/87] PASSED
🧪 [TEST 3/87] Profile update
❌ [TEST 3/87] FAILED - Element not found
🔧 [HEALING] Attempting self-healing...
✅ [HEALING] Test healed with alternative locator
...
```

**UI:**
```
▶️ Executing tests (recording video)... (50%)
Progress updates setiap test selesai
```

---

### **Phase 4: Analysis (70-90%)**

**API Logs:**
```
🧠 [ANALYZER] Analyzing failures...
🔍 [AI] Analyzing test failure #3
📊 [AI] Category: APP_BUG
📊 [AI] Confidence: 95%
📊 [AI] Root cause: Missing validation on email field
💡 [AI] Suggested fix: Add email format validation
```

---

### **Phase 5: Report (90-100%)**

**API Logs:**
```
📊 [REPORT] Generating comprehensive report...
📝 [REPORT] Creating HTML report
📝 [REPORT] Creating JSON report  
🎥 [REPORT] Finalizing video recording
✅ [REPORT] Report generated successfully

✅✅✅ Session completed successfully ✅✅✅
```

**UI:**
```
✅ Autonomous Testing Completed!

Results:
- Total Tests: 87
- Passed: 79
- Failed: 6
- Healed: 2
- Coverage: 85%
- Duration: 12m 34s

🎥 Open Video Recording button appears
```

---

## 🎥 Video Location

```
C:\Users\{YourName}\Downloads\TestMaster-Videos\
  └── autonomous-test-2025-01-20-15-30-45-abc123.webm
```

**Video berisi:**
- ✅ Browser launch
- ✅ Login process
- ✅ All page navigations
- ✅ All interactions (clicks, inputs)
- ✅ Test failures dengan detail
- ✅ Self-healing attempts

---

## ⏱️ Expected Duration

**Deep Testing (50-100 tests):**
- Discovery: ~2 minutes
- Generation: ~1 minute
- Execution: ~10 minutes (tergantung website complexity)
- Analysis: ~1 minute
- Report: ~30 seconds

**Total: ~15 minutes**

---

## 🐛 Troubleshooting

### **Issue 1: API tidak start**

**Symptoms:**
```
Error: Port 3001 already in use
```

**Solution:**
1. Close semua terminal
2. Task Manager → Find `node.exe` → End Task
3. Start API lagi

---

### **Issue 2: Browser tidak launch**

**Check API logs untuk:**
```
❌ [BACKGROUND] Session xxx failed
Error: browserType.launch: ...
```

**Solutions:**

**A. Playwright not found:**
```powershell
cd D:\Project\TestMaster\packages\test-engine
npm install playwright
npx playwright install chromium
```

**B. Browser binary not found:**
```powershell
npx playwright install chromium --force
```

**C. Permission issue:**
- Run as Administrator
- Check antivirus not blocking

---

### **Issue 3: No progress updates**

**Check:**

**Frontend:**
```
[FRONTEND] ❌ EventSource error
```

**Solution:**
- API logs untuk error
- Verify token passed correctly
- Restart both API and Desktop

**API:**
```
❌ [BACKGROUND] Session xxx failed
Error: ...
```

**Solution:**
- Share full error stack
- Check if website accessible
- Try different website (https://example.com)

---

### **Issue 4: Login failed**

**API logs:**
```
🔐 [AUTH] Attempting to login...
❌ [AUTH] Login failed - Form not found
```

**Solutions:**
1. **Verify credentials** - test manual login first
2. **Check login form** - website structure might be different
3. **Update selectors** - login form selectors might need update

---

### **Issue 5: Testing stuck**

**If stuck at Discovery:**
```
🔍 [CRAWLER] Starting website crawl...
(stuck here)
```

**Solutions:**
1. **Check website accessible** - try open in browser manually
2. **Check firewall** - might be blocking Playwright
3. **Try simpler website** - test with https://example.com first
4. **Increase timeout** - website might be slow

---

## 📞 Debug Checklist

Before reporting issue, check:

**API Server:**
- [ ] Started with fresh restart?
- [ ] Port 3001 available?
- [ ] Log: "REAL Playwright Testing - Auth Required"?
- [ ] No errors during startup?

**Desktop App:**
- [ ] Restarted fresh?
- [ ] User logged in?
- [ ] Token exists in localStorage?
- [ ] DevTools Console open?

**Configuration:**
- [ ] Website URL correct?
- [ ] Authentication enabled for sites that need login?
- [ ] Credentials valid?
- [ ] Record video checked?

**During Testing:**
- [ ] API logs showing progress?
- [ ] Browser launching messages?
- [ ] SSE updates in DevTools?
- [ ] No 401 errors?

---

## 🎯 Success Indicators

**Testing berhasil jika:**

**API Logs:**
- ✅ Orchestrator created
- ✅ Browser launched
- ✅ Pages discovered
- ✅ Tests generated
- ✅ Tests executing
- ✅ Report generated

**DevTools:**
- ✅ Token found
- ✅ 200 OK responses
- ✅ Progress updates flowing
- ✅ Phases changing

**Results:**
- ✅ Real test counts (not fake 87)
- ✅ Video file exists
- ✅ Failures have real error messages
- ✅ Duration realistic (~15 min for Deep)

---

## 🚨 Known Limitations

1. **First run slower** - browser initialization
2. **Needs stable internet** - for crawling website
3. **Memory intensive** - ~500MB-1GB RAM
4. **CPU intensive** - browser + video recording
5. **Website dependent** - complex sites take longer

---

## 💡 Tips for Better Results

### **1. Start with Shallow**
- Test dengan `Shallow` dulu (5-10 tests, 2-3 min)
- Verify everything working
- Then try `Deep`

### **2. Use Simple Website First**
- Try https://example.com
- No authentication needed
- Fast & simple
- Verify Playwright working

### **3. Monitor API Logs**
- Keep API terminal visible
- Watch for errors
- Check browser launch messages

### **4. Check Video After**
- Open video immediately
- Verify recording worked
- See what tests did

---

## 📋 What to Share if Issue

**If error occurs, share:**

1. **Full API Server logs**
   - From startup
   - Including all 🚀 🌐 🧪 ▶️ logs
   - Error stack if any

2. **DevTools Console logs**
   - All [FRONTEND] logs
   - Network tab for 401 errors

3. **Configuration used**
   - Website URL
   - Authentication enabled?
   - Credentials (don't share password)
   - Depth selected

4. **Screenshots**
   - Error messages
   - UI state
   - API logs

5. **Environment**
   - Windows version
   - Node version: `node --version`
   - Playwright version: `npx playwright --version`

---

## 🎉 Ready to Test!

**Everything is configured!**

```powershell
# 1. Restart API
cd D:\Project\TestMaster
npm run dev --workspace=packages/api

# 2. Restart Desktop (new terminal)
npm run dev --workspace=packages/desktop

# 3. Test dengan:
# URL: https://comathedu.id/
# Auth: admin@comath.id / password123
# Depth: Deep
# Video: ON

# 4. Click: 🚀 Start Autonomous Testing

# 5. Watch API logs for progress!
```

**Happy Real Testing!** 🎭🤖🚀🎥

---

## ⚡ Quick Commands

```powershell
# Test Playwright working
cd D:\Project\TestMaster\packages\test-engine
node test-playwright.js

# Reinstall Playwright browsers if needed
npx playwright install chromium --force

# Check Playwright version
npx playwright --version

# Kill node processes if stuck
taskkill /F /IM node.exe
```

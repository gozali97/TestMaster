# How to Start TestMaster Desktop App

## ⚠️ IMPORTANT: If you see "export named 'default'" error

This error happens when Vite cache is corrupted. Follow these steps:

## 🔧 Solution: Clean Restart

### Step 1: Stop Everything
```powershell
# Kill all processes
Get-Process | Where-Object {$_.ProcessName -like "*electron*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force
```

### Step 2: Use the Restart Script (RECOMMENDED)
```powershell
cd packages\desktop
.\restart-clean.ps1
```

The script will:
1. ✅ Kill all electron and node processes
2. ✅ Clean all Vite cache directories
3. ✅ Build main process
4. ✅ Start dev server with all processes

### Step 3: Wait for App to Load
You should see in order:
```
[0] 12:13:51 PM - Found 0 errors. Watching for file changes.
[1] ➜  Local:   http://localhost:5175/
[2] (Electron window opens)
```

## 🚀 Alternative: Manual Start

If restart script doesn't work, try manual:

```powershell
cd packages\desktop

# 1. Kill everything
taskkill /F /IM electron.exe
taskkill /F /IM node.exe

# 2. Clean cache
Remove-Item -Recurse -Force node_modules\.vite

# 3. Build main
npm run build:main

# 4. Wait 3 seconds
Start-Sleep -Seconds 3

# 5. Start dev
npm run dev
```

## ✅ Success Indicators

When working correctly, you should see:

1. **No TypeScript errors**
   ```
   Found 0 errors. Watching for file changes.
   ```

2. **Vite server running**
   ```
   ➜  Local:   http://localhost:5175/
   ```

3. **Electron window opens** with Login form showing "Register here" link

4. **No console errors** about "export named 'default'"

## 🐛 Troubleshooting

### Error: "export named 'default'"
**Solution:** Cache issue, run restart-clean.ps1 again

### Error: "Cannot find module"
**Solution:** 
```bash
npm run build:main
```

### Error: "Port 5175 already in use"
**Solution:**
```powershell
$conn = Get-NetTCPConnection -LocalPort 5175
Stop-Process -Id $conn.OwningProcess -Force
```

### Error: "wait-on timeout"
**Solution:**
```powershell
# Start only Vite first
npm run dev:renderer

# Wait until you see "Local: http://localhost:5175/"
# Then in new terminal:
npm run dev:electron
```

### Electron opens but blank screen
**Solution:**
1. Check browser console (F12)
2. Look for JavaScript errors
3. Make sure Vite is running on port 5175
4. Try refreshing: Ctrl+R

## 📝 What Each Process Does

### dev:main
- Compiles TypeScript for Electron main process
- Watches for changes
- Output: `src/main/*.js`

### dev:renderer
- Runs Vite dev server
- Serves React app on port 5175
- Hot Module Replacement enabled

### dev:electron
- Waits for Vite to be ready
- Starts Electron app
- Loads http://localhost:5175

## 🎯 Testing the Fix

After app starts, verify:
1. ✅ Login form displays
2. ✅ Click "Register here" → Register form shows
3. ✅ Register form shows "Login here" link
4. ✅ Can switch between forms
5. ✅ No console errors

## 💡 Tips

### Always use restart-clean.ps1 when:
- Switching git branches
- After pulling new code
- After npm install
- When seeing module errors
- When HMR stops working

### Don't need restart when:
- Just editing React components
- Changing CSS/styling
- Adding new components (HMR handles it)

### Force restart needed when:
- Changing imports/exports structure
- Adding new dependencies
- Modifying electron main process
- Changing vite config

---

**Quick Command:**
```powershell
cd packages\desktop && .\restart-clean.ps1
```

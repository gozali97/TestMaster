# TestMaster - Windows Installation (FIXED)

## 🎯 Skip Electron - Install API + Web Only

The Electron (Desktop IDE) is causing file lock issues on Windows. We'll skip it and use the Web Portal instead.

---

## ✅ **WORKING SOLUTION - Manual Install**

### Step 1: Close Everything
- Close ALL terminals
- Close VS Code
- Open Task Manager → End all `node.exe` and `electron.exe` processes
- Wait 10 seconds

### Step 2: Install Shared Package

```powershell
cd D:\Project\TestMaster\packages\shared
npm install
npm run build
```

Wait for it to complete. You should see `dist/` folder created.

### Step 3: Install Test Engine

```powershell
cd ..\test-engine
npm install
npm run build
```

### Step 4: Install API

```powershell
cd ..\api
npm install
npm run build
```

### Step 5: Install Web Portal

```powershell
cd ..\web
npm install
```

**DO NOT run `npm install` from root** - it tries to install Electron which causes the EBUSY errors.

---

## 🗄️ **Database Setup**

```powershell
# Create database
mysql -u root -p -e "CREATE DATABASE testmaster"

# Import schema
cd D:\Project\TestMaster
mysql -u root -p testmaster < database\schema.sql
```

---

## ⚙️ **Configure Environment**

```powershell
cd D:\Project\TestMaster
copy .env.example .env
notepad .env
```

Edit these:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=testmaster
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE

JWT_SECRET=my-secret-key-change-this
REFRESH_TOKEN_SECRET=another-secret-key-change-this
```

---

## 🚀 **Run the Platform**

### Terminal 1 - API Server

```powershell
cd D:\Project\TestMaster\packages\api
npm run dev
```

You should see:
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

### Terminal 2 - Web Portal

```powershell
cd D:\Project\TestMaster\packages\web
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
```

---

## ✅ **Test It Works**

1. **Test API**: Open http://localhost:3001/health
   - Should show: `{"status":"ok","message":"TestMaster API is running"}`

2. **Test Web**: Open http://localhost:3000
   - Should show the login page

3. **Create Account**:
   - Click "Sign up"
   - Enter email, password, name, organization
   - Click "Create"

4. **Use the Platform**:
   - Create projects
   - Create test cases
   - Execute tests
   - View analytics

---

## 🔧 **Alternative: PowerShell Script**

Save this as `install.ps1` and run:

```powershell
# Run as Administrator
cd D:\Project\TestMaster
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install-windows.ps1
```

The script will install everything automatically.

---

## 🎯 **What You Get Without Desktop IDE**

### ✅ You HAVE:
- Full Web Portal (all features)
- Backend API (complete)
- Project management
- Test case creation (visual + script)
- Test execution with Playwright
- Object repository
- Analytics & reporting
- AI assistant
- Everything works in the browser!

### ❌ You DON'T HAVE:
- Desktop Electron app (optional)
- Offline mode (optional)

**The Web Portal has ALL features** - you don't need the Desktop IDE!

---

## 💡 **Troubleshooting**

### "Cannot find module '@testmaster/shared'"

```powershell
cd packages\shared
npm run build
```

### "Cannot find module '@testmaster/test-engine'"

```powershell
cd packages\test-engine
npm run build
```

### Database connection fails

```powershell
# Check MySQL is running
mysql -u root -p

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Recreate if needed
mysql -u root -p -e "DROP DATABASE IF EXISTS testmaster; CREATE DATABASE testmaster;"
mysql -u root -p testmaster < database\schema.sql
```

### Port already in use

```powershell
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## 📊 **Verify Everything Works**

```powershell
# Check API is running
curl http://localhost:3001/health

# Check Web is running
curl http://localhost:3000
```

---

## 🎉 **You're Done!**

Open your browser:
- **Web Portal**: http://localhost:3000
- **API Docs**: http://localhost:3001/health

Create an account and start automating tests! 🚀

---

## 📝 **Package Build Order**

Always build in this order:
1. `shared` (base types, no dependencies)
2. `test-engine` (depends on shared)
3. `api` (depends on shared + test-engine)
4. `web` (depends on shared)

---

## 🔥 **Nuclear Option (Complete Reset)**

If nothing works:

```powershell
# Close EVERYTHING first!

cd D:\Project\TestMaster

# Delete all node_modules
Get-ChildItem -Path . -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force

# Delete all dist folders
Get-ChildItem -Path . -Recurse -Directory -Filter "dist" | Remove-Item -Recurse -Force

# Start fresh
cd packages\shared
npm install && npm run build

cd ..\test-engine
npm install && npm run build

cd ..\api
npm install && npm run build

cd ..\web
npm install
```

---

This will work! The Electron issues are Windows-specific file locking. Skip it for now. 👍

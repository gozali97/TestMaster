# TestMaster - Installation Instructions

## ⚠️ Important: Close all processes first!

Before installing, make sure to close:
- Visual Studio Code
- Any running Node.js processes
- Any Electron windows
- Command prompts/terminals running npm

---

## 🚀 Quick Installation (Recommended)

### Step 1: Clean Install

```powershell
# Close all VS Code and terminals first!

# Go to project directory
cd D:\Project\TestMaster

# Remove node_modules if exists
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Install dependencies
npm install --legacy-peer-deps
```

### Step 2: Build Shared Package

```powershell
cd packages\shared
npm run build
```

### Step 3: Build Test Engine

```powershell
cd ..\test-engine
npm run build
```

### Step 4: Build API

```powershell
cd ..\api
npm run build
```

### Step 5: Setup Database

```powershell
# Create database
mysql -u root -p -e "CREATE DATABASE testmaster"

# Import schema
cd D:\Project\TestMaster
mysql -u root -p testmaster < database\schema.sql
```

### Step 6: Configure Environment

```powershell
# Copy environment file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

Required settings:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=testmaster
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD

JWT_SECRET=change-me-to-random-string
REFRESH_TOKEN_SECRET=another-random-string
```

### Step 7: Run API Server

```powershell
cd packages\api
npm run dev
```

You should see:
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

### Step 8: Run Web Portal (New Terminal)

```powershell
cd D:\Project\TestMaster\packages\web
npm run dev
```

Open: http://localhost:3000

---

## 🔧 Troubleshooting

### Issue: EBUSY errors with electron/esbuild

**Solution**:
1. Close ALL VS Code windows
2. Close ALL terminals
3. Open Task Manager and end any `node.exe` or `electron.exe` processes
4. Wait 10 seconds
5. Try `npm install --legacy-peer-deps` again

### Issue: Appium installation fails

**Solution**: Already fixed! Appium has been removed from dependencies as it's optional.

### Issue: "Cannot find module '@testmaster/shared'"

**Solution**: Build the shared package first:
```powershell
cd packages\shared
npm run build
```

### Issue: "Cannot find module '@testmaster/test-engine'"

**Solution**: Build the test-engine package:
```powershell
cd packages\test-engine
npm run build
```

### Issue: Database connection fails

**Solution**:
1. Make sure MySQL is running: `mysql -u root -p`
2. Check credentials in `.env` file
3. Create database: `CREATE DATABASE testmaster;`
4. Import schema: `mysql -u root -p testmaster < database\schema.sql`

### Issue: Port 3000 or 3001 already in use

**Solution**:
- Find and kill the process: `netstat -ano | findstr :3000`
- Or change the port in `.env` or package.json

---

## 📦 Alternative: Install Without Electron (Lighter)

If you only want API and Web (skip Desktop IDE):

```powershell
# Install only API and Web dependencies
cd packages\api
npm install

cd ..\web
npm install

cd ..\shared
npm install

cd ..\test-engine
npm install
```

---

## ✅ Verify Installation

### Test API:
```powershell
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","message":"TestMaster API is running"}
```

### Test Web:
Open browser: http://localhost:3000

You should see the login page.

---

## 🎯 Quick Start After Installation

1. **Register Account**:
   - Go to http://localhost:3000/login
   - Click "Sign up"
   - Fill in details
   - Create account

2. **Create Project**:
   - Go to "Projects"
   - Click "Create Project"
   - Enter name and description

3. **Create Test Case**:
   - Open project
   - Click "Create Test Case"
   - Add test steps
   - Save

4. **Run Tests**:
   - Go to "Executions"
   - Select tests
   - Click "Run"

---

## 🔥 Fresh Start (If Everything Fails)

```powershell
# Close ALL programs first!

# Remove everything
cd D:\Project\TestMaster
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\*\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\*\dist -ErrorAction SilentlyContinue

# Clean npm cache
npm cache clean --force

# Install fresh
npm install --legacy-peer-deps

# Build in order
cd packages\shared && npm run build
cd ..\test-engine && npm run build
cd ..\api && npm run build

# Setup database
mysql -u root -p -e "CREATE DATABASE testmaster"
mysql -u root -p testmaster < D:\Project\TestMaster\database\schema.sql

# Configure
cd D:\Project\TestMaster
copy .env.example .env
# Edit .env with your MySQL password

# Run API
cd packages\api
npm run dev

# Run Web (new terminal)
cd packages\web
npm run dev
```

---

## 💡 Minimal Setup (Just to See It Work)

If you want to just see it running:

1. **Skip Desktop IDE** (avoid Electron installation issues)
2. **Use SQLite** instead of MySQL (optional)
3. **Skip AI features** (no API keys needed)

```powershell
# Install only what's needed
cd D:\Project\TestMaster\packages\shared
npm install && npm run build

cd ..\test-engine
npm install && npm run build

cd ..\api
npm install && npm run build

cd ..\web
npm install

# Run them
cd ..\api
npm run dev

# New terminal
cd ..\web
npm run dev
```

---

## 🆘 Still Having Issues?

1. **Check Node version**: `node --version` (should be 18+)
2. **Check npm version**: `npm --version` (should be 9+)
3. **Run as Administrator** if permission issues
4. **Disable antivirus** temporarily during installation
5. **Check firewall** for ports 3000 and 3001

---

Good luck! 🚀 The platform is worth the setup effort!

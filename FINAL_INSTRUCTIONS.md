# ⚠️ IMPORTANT: How to Run TestMaster

## ❌ **DO NOT RUN THIS:**
```powershell
npm run dev  # This tries to start Desktop and will fail!
```

## ✅ **DO THIS INSTEAD:**

---

## 🚀 **Correct Way to Start TestMaster**

### Step 1: Setup Database (One Time Only)

```powershell
# Create database
mysql -u root -p -e "CREATE DATABASE testmaster"

# Import schema
mysql -u root -p testmaster < "D:\Project\TestMaster\database\schema.sql"

# Verify (should show 22 tables)
mysql -u root -p -e "USE testmaster; SHOW TABLES;"
```

---

### Step 2: Configure .env (One Time Only)

```powershell
notepad D:\Project\TestMaster\.env
```

**Change these 3 lines:**
```env
DB_PASSWORD=your_mysql_password_here
JWT_SECRET=my-secret-key-change-this-12345
REFRESH_TOKEN_SECRET=my-refresh-key-change-this-67890
```

Save and close Notepad.

---

### Step 3: Start API Server

**Open PowerShell Terminal #1:**

```powershell
cd D:\Project\TestMaster\packages\api
npm run dev
```

✅ **Wait for this message:**
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

**Leave this terminal running!**

---

### Step 4: Start Web Portal

**Open PowerShell Terminal #2 (NEW WINDOW):**

```powershell
cd D:\Project\TestMaster\packages\web
npm run dev
```

✅ **Wait for this message:**
```
- Local:        http://localhost:3000
- Ready in 2.5s
```

**Leave this terminal running!**

---

### Step 5: Open Browser

Go to: **http://localhost:3000**

You should see the **TestMaster Login Page**!

---

## 🎯 **Quick Test**

### Test API:
```powershell
curl http://localhost:3001/health
```
Should return: `{"status":"ok","message":"TestMaster API is running"}`

### Test Web:
Open browser: http://localhost:3000
Should show login page.

---

## 🎊 **First Use**

### Create Account:
1. Click **"Sign up"**
2. Email: `admin@test.com`
3. Password: `Admin123!@#`
4. Name: `Admin User`
5. Organization: `My Company`
6. Click **"Create"**

### You're In!
Now you can:
- Create projects
- Add test cases
- Run tests
- View analytics
- Use AI assistant

---

## ❓ **Why Not Run From Root?**

The root `npm run dev` tries to start **ALL 6 packages**:
- ✅ shared
- ✅ test-engine
- ✅ api
- ✅ web
- ❌ **desktop** ← Missing dependencies (Electron issues)
- ❌ **cli** ← Not needed for web usage

We skipped Desktop to avoid Windows file lock issues. You only need API + Web!

---

## 🎯 **Summary**

**Two terminals running:**
1. Terminal 1: `packages/api` → `npm run dev`
2. Terminal 2: `packages/web` → `npm run dev`

**One browser:**
- http://localhost:3000

**That's it!** 🚀

---

## 🔧 **Troubleshooting**

### "Database connection failed":
- Check MySQL is running
- Check `.env` has correct `DB_PASSWORD`
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "Port 3001 already in use":
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Port 3000 already in use":
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Cannot find module":
```powershell
# Rebuild packages
cd D:\Project\TestMaster\packages\shared
npm run build

cd ..\test-engine
npm run build

cd ..\api
npm run build
```

---

## ✅ **You Have Everything Working**

- ✅ 32 API endpoints
- ✅ 7 web pages
- ✅ User authentication
- ✅ Project management
- ✅ Test execution
- ✅ Analytics
- ✅ AI assistant

**Just start the two servers separately!** 🎉

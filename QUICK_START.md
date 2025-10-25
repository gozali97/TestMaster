# 🚀 TestMaster - Quick Start (Windows)

## ⚡ Fastest Way to Get Running (5 Minutes)

**Skip the Desktop IDE** and install only API + Web Portal.

---

## 📝 Step-by-Step Instructions

### 1️⃣ **Install Shared Package** (30 seconds)

```powershell
cd D:\Project\TestMaster\packages\shared
npm install
npm run build
```

✅ You should see `dist/` folder created.

---

### 2️⃣ **Install Test Engine** (1 minute)

```powershell
cd ..\test-engine
npm install
npm run build
```

✅ You should see `dist/` folder created.

---

### 3️⃣ **Install API** (2 minutes)

```powershell
cd ..\api
npm install
npm run build
```

✅ You should see `dist/` folder created with `index.js`.

---

### 4️⃣ **Install Web Portal** (1 minute)

```powershell
cd ..\web
npm install
```

✅ `node_modules/` folder created.

---

### 5️⃣ **Setup Database** (30 seconds)

```powershell
# Open MySQL (enter your password)
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE testmaster;
exit;

# Import schema
cd D:\Project\TestMaster
mysql -u root -p testmaster < database\schema.sql
```

✅ Database `testmaster` created with 22 tables.

---

### 6️⃣ **Configure Environment** (30 seconds)

```powershell
cd D:\Project\TestMaster
copy .env.example .env
notepad .env
```

**Required changes in `.env`**:
```env
DB_PASSWORD=your_mysql_password_here
JWT_SECRET=change-this-to-something-random
REFRESH_TOKEN_SECRET=change-this-too
```

Save and close.

---

### 7️⃣ **Start API Server** (10 seconds)

```powershell
cd packages\api
npm run dev
```

✅ You should see:
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

**Leave this terminal running!**

---

### 8️⃣ **Start Web Portal** (10 seconds)

**Open a NEW PowerShell window**:

```powershell
cd D:\Project\TestMaster\packages\web
npm run dev
```

✅ You should see:
```
- Local:        http://localhost:3000
- Ready in 2.3s
```

**Leave this terminal running!**

---

### 9️⃣ **Access the Platform** 🎉

Open your browser: **http://localhost:3000**

You should see the **TestMaster Login Page**!

---

## 🎊 First Use

### Create Account:
1. Click **"Sign up"**
2. Enter:
   - Email: `admin@test.com`
   - Password: `Test123!@#`
   - Name: `Admin User`
   - Organization: `My Company`
3. Click **"Create"**

### Create First Project:
1. Click **"Projects"**
2. Click **"Create Project"**
3. Enter:
   - Name: `My First Project`
   - Description: `Learning TestMaster`
4. Click **"Create"**

### Explore Features:
- Dashboard → View metrics
- Projects → Manage test projects
- Executions → View test runs
- Analytics → See trends
- AI Assistant → Generate tests with AI

---

## ✅ Success Checklist

- [ ] Shared package built (`packages/shared/dist/` exists)
- [ ] Test-engine built (`packages/test-engine/dist/` exists)
- [ ] API built (`packages/api/dist/index.js` exists)
- [ ] Web installed (`packages/web/node_modules/` exists)
- [ ] Database created (MySQL `testmaster` database)
- [ ] .env configured (DB password, JWT secrets)
- [ ] API running (http://localhost:3001/health works)
- [ ] Web running (http://localhost:3000 shows login)

---

## ❌ **Don't Do These:**

- ❌ Don't run `npm install` from root directory
- ❌ Don't try to install Desktop package (Electron causes issues)
- ❌ Don't close the terminals running API and Web

---

## 🔥 **If Still Having Issues**

### Quick Reset:

```powershell
# Close all terminals!

# Remove all node_modules
cd D:\Project\TestMaster
Remove-Item -Recurse -Force packages\shared\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\test-engine\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\api\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\web\node_modules -ErrorAction SilentlyContinue

# Remove all dist folders
Remove-Item -Recurse -Force packages\shared\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\test-engine\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\api\dist -ErrorAction SilentlyContinue

# Start fresh (follow steps 1-8 above)
```

---

## 💡 **Why This Works**

By installing each package individually:
- ✅ No root-level node_modules conflicts
- ✅ No Electron file locking issues
- ✅ No workspace protocol errors
- ✅ Clean, isolated installations
- ✅ Windows-friendly process

---

## 🎯 **Time Estimate**

- Installation: 5 minutes
- Database setup: 30 seconds
- Configuration: 30 seconds
- **Total: ~6 minutes**

---

## 🆘 **Need Help?**

If stuck:
1. Make sure MySQL is running
2. Make sure ports 3000 and 3001 are free
3. Make sure Node.js version is 18+: `node --version`
4. Check error messages in terminal
5. Check API logs in console

---

## ✨ **You'll Have Access To:**

- 🌐 Complete Web Portal
- 🔐 User authentication
- 📊 Dashboard with metrics
- 📁 Project management
- ✅ Test case creation
- ▶️ Test execution
- 📈 Analytics & reporting
- 🤖 AI Assistant
- 📊 Execution monitoring

**Everything works in the browser - no Desktop app needed!** 🎉

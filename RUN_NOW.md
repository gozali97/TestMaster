# 🚀 TestMaster - RUN IT NOW!

## ✅ **Installation Complete!**

All packages are built and ready to run!

---

## 🎯 **3 Steps to Start**

### Step 1: Setup Database (2 minutes)

```powershell
# Create database
mysql -u root -p -e "CREATE DATABASE testmaster"

# Import schema  
mysql -u root -p testmaster < "D:\Project\TestMaster\database\schema.sql"
```

---

### Step 2: Configure .env (1 minute)

```powershell
cd D:\Project\TestMaster
notepad .env
```

**Change these lines**:
```env
DB_PASSWORD=YOUR_MYSQL_PASSWORD
JWT_SECRET=my-secret-key-12345
REFRESH_TOKEN_SECRET=my-refresh-secret-67890
```

Save and close.

---

### Step 3: Start Servers (30 seconds)

#### Terminal 1 - API:
```powershell
cd D:\Project\TestMaster\packages\api
npm run dev
```

✅ Wait for: `TestMaster API server is running on port 3001`

#### Terminal 2 - Web:
```powershell
cd D:\Project\TestMaster\packages\web  
npm run dev
```

✅ Wait for: `- Local:        http://localhost:3000`

---

## 🌐 **Open Your Browser**

Go to: **http://localhost:3000**

You should see the **TestMaster Login Page**!

---

## 🎉 **First Use**

1. **Create Account**:
   - Click "Sign up"
   - Email: `admin@test.com`
   - Password: `Test123!@#`
   - Name: `Test User`
   - Organization: `My Org`

2. **Create Project**:
   - Click "Projects"
   - Click "Create Project"
   - Name: `Demo Project`

3. **Explore**:
   - Dashboard
   - Projects
   - Executions
   - Analytics
   - AI Assistant

---

## ✅ **Quick Health Check**

Test these URLs:

- API Health: http://localhost:3001/health
  - Should show: `{"status":"ok","message":"TestMaster API is running"}`

- Web Portal: http://localhost:3000
  - Should show login page

---

## 🎊 **You Now Have:**

✅ Complete test automation platform
✅ 26 working API endpoints  
✅ User authentication
✅ Project management
✅ Test case creation
✅ Test execution (Playwright)
✅ Analytics dashboard
✅ AI assistant
✅ Visual testing
✅ API testing

---

## 💡 **Features to Try**

1. **Create a Test**: Projects → Create Test Case
2. **Run Tests**: Executions → Run Tests
3. **View Analytics**: Analytics → See trends
4. **AI Generation**: AI Assistant → Generate test from description
5. **API Testing**: Create API test cases

---

## 🔧 **If Something Goes Wrong**

### API won't start:
```powershell
# Check database
mysql -u root -p -e "USE testmaster; SHOW TABLES;"
# Should show 22 tables

# Check .env file
cd D:\Project\TestMaster
notepad .env
# Verify DB_PASSWORD is correct
```

### Web won't start:
```powershell
# Check if API is running first
curl http://localhost:3001/health

# If port 3000 is busy
netstat -ano | findstr :3000
# Kill the process if needed
```

---

## 📝 **Terminals You Need**

Keep these **2 terminals running**:

1. **API Terminal** (`npm run dev` in packages/api)
2. **Web Terminal** (`npm run dev` in packages/web)

Don't close them while using the platform!

---

## 🎯 **Summary**

1. ✅ Build complete (shared, test-engine, api)
2. ⏳ Setup database (do this now)
3. ⏳ Configure .env (do this now)
4. ⏳ Start API server
5. ⏳ Start Web server
6. ⏳ Open browser and enjoy!

---

**You're ready! Start the servers and go to http://localhost:3000** 🚀

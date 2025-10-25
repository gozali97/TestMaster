# 🚀 TestMaster API - Start Guide

## Quick Start Commands

### ⚡ Recommended: Start Fresh (Auto-kills port if needed)
```bash
npm run start:fresh
```
This will automatically kill any process using port 3001 and then start the API.

### 🔄 Regular Start (Manual port management)
```bash
# If you get port conflict, first kill the port:
npm run kill-port

# Then start:
npm start
```

### 🛑 Stop API
```bash
npm run stop
```

### 🔁 Restart (Rebuild + Start)
```bash
npm run restart
```

## 📋 Complete Command Reference

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run start:fresh` | Kill port → Start API | **RECOMMENDED** - First time or after errors |
| `npm start` | Start API only | When port is already clear |
| `npm run stop` | Stop running API | Before closing terminal |
| `npm run restart` | Stop → Build → Start | After code changes |
| `npm run kill-port` | Kill port 3001 only | When you get port conflict |
| `npm run dev` | Dev mode (auto-reload) | During development |
| `npm run build` | Build TypeScript | After code changes |

## 🎯 Common Scenarios

### Scenario 1: First Time Setup
```bash
cd packages/api
npm install
npm run build
npm run start:fresh
```

### Scenario 2: Error - Port Already in Use
```bash
# You see: Error: listen EADDRINUSE: address already in use :::3001

# Solution:
npm run start:fresh
```

### Scenario 3: Development Work
```bash
# Option A: Auto-reload (Recommended for dev)
npm run dev

# Option B: Manual restart after changes
# ... make code changes ...
npm run restart
```

### Scenario 4: Switching from Dev to Production Mode
```bash
# Stop dev mode (Ctrl+C in terminal)
npm run build
npm run start:fresh
```

### Scenario 5: Before Closing Terminal
```bash
npm run stop
```

### Scenario 6: Complete Restart
```bash
npm run stop
npm run build
npm run start:fresh
```

## 🔍 Troubleshooting

### ❌ Error: "Cannot find module 'moment'"
```bash
npm install
npm run build
npm run start:fresh
```

### ❌ Error: "EADDRINUSE: address already in use"
```bash
npm run start:fresh
```

### ❌ Error: "Database connection failed"
Check your `.env` file configuration.

### ❌ API not responding
```bash
# Check if API is running
netstat -ano | findstr :3001

# Restart API
npm run restart
```

### ❌ Changes not reflecting
```bash
# Rebuild and restart
npm run restart
```

## 📊 Verify API is Running

### Method 1: Check Console
You should see:
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

### Method 2: Check Port
```powershell
netstat -ano | findstr :3001
```

### Method 3: Test HTTP Request
```bash
curl http://localhost:3001/health
```

### Method 4: Open in Browser
```
http://localhost:3001
```

## 🎨 Terminal Output Colors

When using helper scripts, you'll see colored output:

- 🟡 **Yellow** = Finding/Processing
- 🟢 **Green** = Success
- 🔵 **Cyan** = Info
- 🔴 **Red** = Error/Warning

## 💡 Best Practices

### ✅ DO:
- Use `npm run start:fresh` for first start
- Use `npm run dev` during development
- Use `npm run stop` before closing terminal
- Use `npm run restart` after code changes

### ❌ DON'T:
- Don't run multiple instances simultaneously
- Don't force quit terminal without stopping API
- Don't edit code while API is running in production mode

## 🚦 Workflow Examples

### Daily Development Workflow
```bash
# Morning: Start work
cd packages/api
npm run dev

# ... code all day, auto-reload on save ...

# Evening: Stop work
# Press Ctrl+C to stop dev mode
```

### Testing Workflow
```bash
# Build and start API
npm run build
npm run start:fresh

# In another terminal, run tests
npm test

# Stop API
npm run stop
```

### Deployment Preparation
```bash
# Clean build
npm run clean
npm run build

# Test start
npm run start:fresh

# Verify everything works
curl http://localhost:3001/health

# Stop
npm run stop
```

## 🔐 Security Note

Remember to:
- Keep `.env` file secure (never commit to git)
- Change default JWT_SECRET in production
- Use strong database passwords

## 📞 Still Having Issues?

If you still encounter problems after trying `npm run start:fresh`:

1. **Check if another app uses port 3001:**
   ```powershell
   netstat -ano | findstr :3001
   ```

2. **Try different port:** Edit `.env` or config
   ```env
   PORT=3002
   ```

3. **Restart your computer** (last resort)

4. **Check Node.js version:**
   ```bash
   node --version  # Should be >= 18.0.0
   ```

---

## ✅ Quick Reference Card

```
Start API:          npm run start:fresh
Stop API:           npm run stop
Restart API:        npm run restart
Dev Mode:           npm run dev
Build:              npm run build
Kill Port:          npm run kill-port
```

**Default Port:** 3001  
**Health Check:** http://localhost:3001/health  
**API Docs:** http://localhost:3001/api-docs

---

**Happy Coding! 🚀**

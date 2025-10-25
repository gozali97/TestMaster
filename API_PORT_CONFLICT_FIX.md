# API Port Conflict Fix - EADDRINUSE Error

## 🐛 Problem
API gagal start dengan error:
```
Error: listen EADDRINUSE: address already in use :::3001
```

Ini terjadi karena:
- Port 3001 sudah digunakan oleh proses lain
- Biasanya karena API server sebelumnya masih running
- Atau ada aplikasi lain yang menggunakan port yang sama

## ✅ Solution

### Quick Fix (Manual)

#### 1. Find Process Using Port 3001
```powershell
netstat -ano | findstr :3001
```

Output akan menunjukkan PID (Process ID):
```
TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       21000
```

#### 2. Kill the Process
```powershell
taskkill /F /PID 21000
```

#### 3. Start API Again
```bash
npm start
```

### Automated Solution (Helper Scripts)

Saya telah membuat helper scripts untuk mempermudah management:

#### 1. `kill-port.ps1`
Kill process yang menggunakan port 3001:
```powershell
.\kill-port.ps1
```

#### 2. `stop-api.ps1`
Stop API server dengan aman:
```powershell
.\stop-api.ps1
```
atau
```bash
npm run stop
```

#### 3. `start-api.ps1`
Start API dengan auto-check port conflict:
```powershell
.\start-api.ps1
```

#### 4. Restart API
Rebuild dan restart API:
```bash
npm run restart
```

### NPM Scripts Available

Sekarang tersedia npm scripts berikut:

```json
{
  "scripts": {
    "start": "node dist/index.js",           // Start API
    "stop": "powershell -File stop-api.ps1", // Stop API
    "restart": "npm run stop && npm run build && npm start", // Restart
    "kill-port": "powershell -File kill-port.ps1", // Kill port 3001
    "dev": "tsx watch src/index.ts",         // Dev mode with hot reload
    "build": "tsc"                           // Build TypeScript
  }
}
```

## 🚀 Usage Examples

### Start API Server
```bash
cd packages/api
npm start
```

### Stop API Server
```bash
npm run stop
```

### Restart API (with rebuild)
```bash
npm run restart
```

### Kill Port 3001 Only
```bash
npm run kill-port
```

### Development Mode (Auto-reload)
```bash
npm run dev
```

## 🔍 Troubleshooting

### Port still in use after killing?
Wait a few seconds and try again:
```powershell
# Kill port
npm run kill-port

# Wait
Start-Sleep -Seconds 2

# Start again
npm start
```

### Find all node processes
```powershell
Get-Process node
```

### Kill all node processes (CAUTION!)
```powershell
Get-Process node | Stop-Process -Force
```

### Check if API is running
```powershell
# Method 1: Check port
netstat -ano | findstr :3001

# Method 2: Test HTTP
curl http://localhost:3001
```

## 📁 Files Created

### Helper Scripts
```
packages/api/
├── kill-port.ps1      # Kill process using port 3001
├── stop-api.ps1       # Stop API server gracefully
└── start-api.ps1      # Start API with port check
```

### Updated Files
- `packages/api/package.json` - Added stop, restart, kill-port scripts

## 💡 Best Practices

### 1. Always Stop Before Starting
```bash
npm run stop
npm start
```

### 2. Use Dev Mode for Development
Dev mode auto-reloads on file changes:
```bash
npm run dev
```

### 3. Clean Restart
```bash
npm run restart  # Stops, rebuilds, and starts
```

### 4. Check Logs
Monitor console output for errors

### 5. Use Different Ports for Different Environments
Edit `.env` or config:
```env
PORT=3001  # Production
# PORT=3002  # Staging
# PORT=3003  # Development
```

## 🎯 Prevention

### Option 1: Use Different Ports
Modify `src/index.ts` to support dynamic ports:
```typescript
const PORT = process.env.PORT || 3001;
```

### Option 2: Auto-kill on Start
Add pre-start script in package.json:
```json
{
  "scripts": {
    "prestart": "npm run kill-port",
    "start": "node dist/index.js"
  }
}
```

### Option 3: Use PM2 for Process Management
```bash
npm install -g pm2
pm2 start dist/index.js --name testmaster-api
pm2 stop testmaster-api
pm2 restart testmaster-api
```

## ✅ Verification

API berhasil start jika melihat output:
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

Test dengan curl:
```bash
curl http://localhost:3001
```

Atau buka di browser:
```
http://localhost:3001
```

## 🔗 Related Issues

- **Missing moment dependency** - See `API_BUG_FIX.md`
- **Database connection issues** - Check `.env` configuration
- **Build errors** - Run `npm run build` to see TypeScript errors

## 📞 Need Help?

If you still encounter issues:
1. Check if another app is using port 3001
2. Try changing port in configuration
3. Restart your computer (last resort)
4. Check firewall settings

---

**Status**: ✅ RESOLVED

API server dapat distart dan distop dengan mudah menggunakan helper scripts yang telah dibuat.

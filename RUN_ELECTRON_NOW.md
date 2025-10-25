# 🚀 Cara Benar Jalankan Electron Desktop

## ⚠️ Yang Anda Jalankan Tadi

```powershell
npm run dev:main
```

Ini **HANYA** compile TypeScript saja! Tidak launch Electron window.

---

## ✅ Cara Yang Benar

### **Option 1: Automatic (1 Command) - RECOMMENDED**

Stop proses yang sekarang (Ctrl+C), lalu jalankan:

```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev
```

Ini akan jalankan **3 process sekaligus**:
1. ✅ TypeScript compiler (compile main + preload)
2. ✅ Vite dev server (serve UI di port 5173)
3. ✅ Electron launcher (buka window)

**Electron window akan terbuka!** 🎊

---

### **Option 2: Manual (3 Terminal) - Untuk Debug**

Jika Option 1 error, jalankan secara manual:

#### **Terminal 1 - TypeScript Compiler:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev:main
```
✅ Wait: `Found 0 errors. Watching for file changes.`

#### **Terminal 2 - Vite Dev Server:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev:renderer
```
✅ Wait: `VITE v... ready in ...ms`
✅ Should show: `Local: http://localhost:5173/`

#### **Terminal 3 - Electron:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev:electron
```
✅ This will wait for Vite (5173) then launch Electron window

---

## 🔍 Kenapa 3 Process?

Desktop IDE terdiri dari:

1. **Main Process** (Node.js/Electron)
   - Backend Electron
   - IPC handlers
   - File system access
   - Script: `npm run dev:main`

2. **Renderer Process** (React UI)
   - Frontend React app
   - Served by Vite
   - Port 5173
   - Script: `npm run dev:renderer`

3. **Electron Launcher**
   - Launch Electron app
   - Load renderer from Vite
   - Script: `npm run dev:electron`

---

## 📝 Step by Step

### Sekarang:

1. **Stop proses yang running** (Ctrl+C)

2. **Jalankan full dev mode:**
   ```powershell
   npm run dev
   ```

3. **Tunggu sampai muncul:**
   ```
   [0] Found 0 errors. Watching for file changes.
   [1] VITE ready in ...ms
   [1] Local: http://localhost:5173/
   [2] Electron launched
   ```

4. **Electron window akan terbuka!** 🎉

---

## 🔧 Troubleshooting

### Jika `npm run dev` error dengan concurrently:

Jalankan manual di 3 terminal terpisah (Option 2 di atas).

### Jika Vite error "port 5173 in use":

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Jika Electron tidak muncul tapi tidak error:

Check apakah `dist/` folder ada:
```powershell
ls packages\desktop\dist
```

Jika tidak ada, build dulu:
```powershell
npm run build:main
```

---

## ✅ Expected Output

Ketika berhasil, Anda akan lihat:

```
[0] > @testmaster/desktop@1.0.0 dev:main
[0] > tsc -p tsconfig.main.json --watch
[0] 
[0] [1:19:18 AM] Starting compilation in watch mode...
[0] [1:19:18 AM] Found 0 errors. Watching for file changes.
[1]
[1] > @testmaster/desktop@1.0.0 dev:renderer
[1] > vite
[1]
[1] VITE v5.0.8  ready in 523 ms
[1]
[1] ➜  Local:   http://localhost:5173/
[1] ➜  Network: use --host to expose
[2]
[2] > @testmaster/desktop@1.0.0 dev:electron
[2] > wait-on http://localhost:5173 && electron .
[2]
[2] Electron app launching...
```

**Dan Electron window terbuka!** 🚀

---

## 🎯 Quick Command

```powershell
# Stop current process (Ctrl+C)
# Then run:
cd D:\Project\TestMaster\packages\desktop
npm run dev
```

**That's it!** Electron window akan muncul dalam 5-10 detik. 🎊

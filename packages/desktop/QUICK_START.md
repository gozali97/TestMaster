# 🚀 Quick Start - Desktop Package

## ✅ Masalah Sudah Diperbaiki!

Error **"Port 5175 is already in use"** sudah diperbaiki dengan:
- ✅ Sinkronisasi konfigurasi port antara `vite.config.ts` dan `package.json`
- ✅ Auto-kill port 5175 pada restart script
- ✅ Script utility untuk manage port conflicts

---

## 🎯 Cara Menjalankan

### Option 1: Normal Start (Recommended)
```powershell
npm run dev
```

### Option 2: Clean Restart (jika ada masalah)
```powershell
.\restart-clean.ps1
```

### Option 3: Kill Port Manual (jika diperlukan)
```powershell
npm run kill-port
# atau
.\kill-port.ps1 -Port 5175
```

---

## 🔧 Script yang Tersedia

| Script | Command | Deskripsi |
|--------|---------|-----------|
| **dev** | `npm run dev` | Start development server (main + renderer + electron) |
| **kill-port** | `npm run kill-port` | Kill proses pada port 5175 |
| **clean** | `npm run clean` | Bersihkan folder dist dan cache |
| **build:main** | `npm run build:main` | Build main process |
| **build:renderer** | `npm run build:renderer` | Build renderer process |
| **build** | `npm run build` | Build full electron app |

---

## ⚡ Troubleshooting

### Port Masih Digunakan?
```powershell
# Kill port 5175
npm run kill-port

# Kill semua Node processes
Get-Process node | Stop-Process -Force

# Kemudian start lagi
npm run dev
```

### Vite CJS Warning?
- ⚠️ Hanya warning, tidak error
- 📌 Tidak mempengaruhi development
- 🔄 Akan hilang saat update dependencies

### Electron Tidak Muncul?
```powershell
# Clean restart
.\restart-clean.ps1
```

---

## 📦 Konfigurasi

### Port Configuration
- **Renderer (Vite)**: Port 5175
- **Config Location**: `vite.config.ts`
- **Strict Port**: Enabled (akan error jika port sudah dipakai)

### File yang Diupdate
- ✅ `vite.config.ts` - Port sync ke 5175
- ✅ `package.json` - Scripts updated
- ✅ `restart-clean.ps1` - Auto kill port
- ✅ `kill-port.ps1` - NEW utility script

---

## 🎉 Ready to Use!

Sekarang jalankan:
```powershell
npm run dev
```

Desktop app akan:
1. ✅ Build main process
2. ✅ Start Vite dev server (port 5175)
3. ✅ Launch Electron window otomatis

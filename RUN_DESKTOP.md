# 🖥️ Cara Jalankan Desktop IDE dalam Dev Mode

## ✅ Dependencies Sudah Terinstall!

Saya sudah install:
- ✅ rxjs
- ✅ lodash  
- ✅ date-fns
- ✅ chalk
- ✅ shell-quote
- ✅ spawn-command
- ✅ tree-kill
- ✅ yargs
- ✅ typescript

## 🚀 Cara Jalankan Desktop (Dev Mode)

### Opsi 1: Manual (3 Terminal)

**Terminal 1 - Build Main Process:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev:main
```

**Terminal 2 - Run Vite Dev Server:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev:renderer
```

**Terminal 3 - Launch Electron:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev:electron
```

---

### Opsi 2: Automatic (1 Command)

```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev
```

Ini akan jalankan ketiga process di atas secara bersamaan menggunakan `concurrently`.

---

## 📋 Apa yang Terjadi?

1. **dev:main** - Compile TypeScript untuk Electron main process (background)
2. **dev:renderer** - Start Vite dev server di port 5173 (UI React)
3. **dev:electron** - Launch Electron window yang load UI dari Vite

---

## ✅ Jika Berhasil:

Anda akan melihat:
- ✅ Vite server running di http://localhost:5173
- ✅ TypeScript compiler watching changes
- ✅ **Electron window terbuka** dengan TestMaster Desktop IDE

---

## 🎯 Desktop IDE Features:

Ketika window terbuka, Anda bisa:
- ✅ Create/edit test cases
- ✅ Use visual test builder
- ✅ Record browser actions
- ✅ Manage object repository
- ✅ Execute tests locally
- ✅ View test results

---

## 🔧 Troubleshooting

### Electron window tidak muncul:

```powershell
# Check apakah Vite sudah running
curl http://localhost:5173
```

Jika error, jalankan manual (Opsi 1) step by step.

---

### Port 5173 sudah dipakai:

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### TypeScript compile error:

```powershell
cd packages\desktop
npm run build:main
```

Check error messages.

---

## 🎊 Desktop vs Web - Kapan Pakai Mana?

### Gunakan **Desktop IDE** jika:
- ✅ Mau kerja offline
- ✅ Butuh native desktop experience
- ✅ Developer individual
- ✅ Testing di local machine

### Gunakan **Web Portal** jika:
- ✅ Team collaboration
- ✅ Multi-user access
- ✅ Cloud/CI/CD integration
- ✅ Akses dari mana saja
- ✅ No installation needed

---

## 💡 Pro Tips

**Desktop + Web bisa jalan bersamaan:**

```powershell
# Terminal 1 - API
cd packages\api
npm run dev

# Terminal 2 - Web  
cd packages\web
npm run dev

# Terminal 3 - Desktop
cd packages\desktop
npm run dev
```

Desktop akan connect ke API yang sama, jadi data sync!

---

## 📝 Summary

**Untuk Dev Mode Desktop:**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run dev
```

**Untuk Production Build (.exe):**
```powershell
cd D:\Project\TestMaster\packages\desktop
npm run build
```

Hasil build akan di folder `release/`.

---

Sekarang coba jalankan! 🚀

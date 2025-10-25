# 🚀 Quick Start Guide - Authentication & Video Recording

## ⚡ Cara Cepat Mencoba Fitur Baru

### 1️⃣ Start Server & App

**Terminal 1 - API Server:**
```powershell
cd D:\Project\TestMaster
npm run dev --workspace=packages/api
```

**Terminal 2 - Desktop App:**
```powershell
cd D:\Project\TestMaster
npm run dev --workspace=packages/desktop
```

**Terminal 3 - Open DevTools Console:**
- Buka Electron app
- Tekan `F12` untuk DevTools
- Klik tab **Console**

---

### 2️⃣ Test Website dengan Login

#### Example: https://comathedu.id

1. **Di Autonomous Testing page:**
   
   📝 **Website URL:** `https://comathedu.id`
   
   ✅ **Centang:** "🔐 Website requires login/authentication"
   
   📧 **Username/Email:** `your-username`
   
   🔑 **Password:** `your-password`
   
   ✅ **Centang:** "🎥 Record video of test execution" (default: ON)
   
   🎯 **Test Depth:** Deep (50-100 tests)

2. **Klik:** 🚀 Start Autonomous Testing

3. **Monitor Progress:**
   - **Terminal API:** Lihat log authentication dan video
   - **DevTools Console:** Lihat log frontend
   - **UI:** Progress bar dan status updates

4. **Setelah Selesai:**
   - Klik **🎥 Open Video Recording** untuk melihat video
   - Video otomatis terbuka dengan default player
   - Lokasi video: `C:\Users\YourName\Downloads\TestMaster-Videos\`

---

### 3️⃣ Test Website Publik (Tanpa Login)

#### Example: https://example.com

1. **Di Autonomous Testing page:**
   
   📝 **Website URL:** `https://example.com`
   
   ❌ **JANGAN centang:** "Website requires login"
   
   ✅ **Centang:** "🎥 Record video" (default: ON)

2. **Klik:** 🚀 Start Autonomous Testing

3. **Hasil:**
   - Testing langsung dimulai (tanpa authentication step)
   - Video tetap direkam
   - Buka video setelah selesai

---

## 🔍 Expected Logs

### Jika Authentication Enabled:

**Terminal API akan menampilkan:**
```
🚀 [START] Autonomous Testing Request
🔐 [AUTH] Authentication credentials provided for user: your-username
🎥 [VIDEO] Video will be saved to: C:\Users\...\Downloads\TestMaster-Videos\...
🔐 [AUTH] Simulating login process...
✅ [AUTH] Login simulation completed
📊 [PHASE] Running phase 1/5
```

**DevTools Console akan menampilkan:**
```
[FRONTEND] Starting Autonomous Testing
[FRONTEND] Input: { websiteUrl: "...", hasAuthentication: true }
[FRONTEND] Progress update: { phase: "authentication", message: "Logging in..." }
[FRONTEND] Progress update: { phase: "authenticated", message: "Login successful..." }
```

---

### Jika Video Recording Enabled:

**Terminal API akan menampilkan:**
```
🎥 [VIDEO] Setting up video recording...
🎥 [VIDEO] Downloads folder: C:\Users\YourName\Downloads
🎥 [VIDEO] TestMaster videos folder: C:\Users\YourName\Downloads\TestMaster-Videos
🎥 [VIDEO] Video will be saved to: C:\Users\...\Downloads\TestMaster-Videos\autonomous-test-....webm
✅ [VIDEO] Video recording setup completed
🎥 [VIDEO] Recording saved to: C:\Users\...\Downloads\TestMaster-Videos\...
```

**DevTools Console akan menampilkan:**
```
[FRONTEND] Request body: { recordVideo: true, ... }
[FRONTEND] ✅ Results received: { videoPath: "C:\...\..." }
```

---

## ✅ Checklist Hasil Testing

### Setelah Testing Selesai, Pastikan:

- [ ] Progress bar mencapai 100%
- [ ] Status menampilkan "✅ Autonomous Testing Completed!"
- [ ] Results menampilkan summary (Total Tests, Passed, Failed, etc.)
- [ ] Button "🎥 Open Video Recording" muncul (jika video enabled)
- [ ] Video bisa dibuka dan diputar
- [ ] Video tersimpan di: `C:\Users\YourName\Downloads\TestMaster-Videos\`
- [ ] Nama file video mengandung timestamp dan sessionId

---

## 📁 Lokasi File Video

### Default Path:
```
C:\Users\{YourUsername}\Downloads\TestMaster-Videos\
```

### Format Nama File:
```
autonomous-test-{YYYY-MM-DD}-{HH-MM-SS}-{sessionId}.webm

Contoh:
autonomous-test-2025-01-15-14-30-45-abc123.webm
```

### Cara Membuka Manual:

1. **Buka File Explorer**
2. **Navigate ke:** `C:\Users\YourUsername\Downloads\TestMaster-Videos\`
3. **Double-click file video** untuk membuka dengan default player
4. **Atau klik kanan > Open with** untuk pilih player lain

---

## 🎥 Isi Video Recording

Video akan merekam:

✅ **Login Process** (jika authentication enabled)
- Form login terisi
- Button login diklik
- Redirect setelah login

✅ **Test Execution:**
- Page navigation
- Element discovery
- Form interactions
- Button clicks
- Input text
- Assertions
- Failures dan errors

✅ **Test Results:**
- Success indicators
- Failure indicators
- Screenshots

---

## 🐛 Troubleshooting Cepat

### ❌ Error: "No token provided"

**Solusi:**
1. Enable authentication checkbox
2. Masukkan username dan password
3. Coba lagi

---

### ❌ Video tidak ada / Button tidak muncul

**Cek:**
1. Checkbox "Record video" tercentang?
2. Log menampilkan: `🎥 [VIDEO] Video will be saved to: ...`?
3. Folder exists: `C:\Users\YourName\Downloads\TestMaster-Videos\`?

**Solusi:**
- Buat folder manual jika tidak ada
- Pastikan permission folder Downloads OK

---

### ❌ Video tidak bisa dibuka

**Solusi:**
1. Buka manual dari folder Downloads/TestMaster-Videos
2. Install VLC Media Player jika belum ada
3. Klik kanan video > Open with > VLC

---

## 📊 Test Cases Recommended

### Test Case 1: Full Featured Test
```
URL: https://comathedu.id
Authentication: ✅ Enabled
  Username: your-username
  Password: your-password
Video Recording: ✅ Enabled
Depth: Deep
```

### Test Case 2: Public Website
```
URL: https://example.com
Authentication: ❌ Disabled
Video Recording: ✅ Enabled
Depth: Shallow (quick test)
```

### Test Case 3: No Video
```
URL: https://example.com
Authentication: ❌ Disabled
Video Recording: ❌ Disabled
Depth: Shallow
```

---

## 🎯 Next Actions

Setelah testing berhasil:

1. ✅ **Share logs** - Copy dari Terminal API dan DevTools Console
2. ✅ **Share video path** - Path lengkap dari log
3. ✅ **Test video** - Pastikan video bisa dibuka dan diputar
4. ✅ **Report any issues** - Jika ada error atau masalah

---

## 📞 Butuh Bantuan?

**Share informasi berikut:**

1. **Full logs dari Terminal API** (dari start sampai complete)
2. **Full logs dari DevTools Console**
3. **Screenshot error** (jika ada)
4. **Video path** (dari log)
5. **Test configuration** (URL, auth enabled?, video enabled?)

---

## 🎉 Selamat Mencoba!

Fitur authentication dan video recording sudah siap digunakan. Semua log sudah lengkap untuk memudahkan debugging.

Happy Testing! 🚀

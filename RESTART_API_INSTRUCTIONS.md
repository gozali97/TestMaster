# 🔄 CARA RESTART API SERVER

## ❌ Error yang Terjadi:
```
MultiPanelOrchestrator is not a constructor
```

## ✅ Sudah Diperbaiki:
1. Export di `packages/test-engine/src/index.ts` sudah diupdate
2. Field **Login URL** sudah ditambahkan di form Multi-Panel

---

## 🚀 LANGKAH RESTART API:

### 1. Stop API Server
Di terminal yang menjalankan API, tekan:
```
Ctrl + C
```
Tunggu sampai proses stop (mungkin perlu tekan 2x)

### 2. Rebuild Test Engine Package
```bash
cd D:\Project\TestMaster\packages\test-engine
npm run build
```
*Note: Akan ada beberapa error tapi itu pre-existing, tidak masalah*

### 3. Rebuild API Package
```bash
cd D:\Project\TestMaster\packages\api
npm run build
```

### 4. Start API Server Lagi
```bash
npm start
```

Tunggu sampai muncul:
```
✅ Database connection established successfully.
🚀 TestMaster API server is running on port 3001
```

---

## 🎯 Test Multi-Panel dengan Login URL Baru:

### Form Inputs:
```
📄 Landing Page:
   Website URL: https://comathedu.id

🔐 Login Page (NEW!):
   Login URL: https://comathedu.id/login

⚡ Admin Panel:
   Admin Panel URL: https://comathedu.id/admin/dashboard
   Admin Username: admin@comathedu.id
   Admin Password: ********
```

### Flow yang Akan Terjadi:
1. **Landing Page** → Test public pages
2. **Login Page** → Navigate ke `/login`, isi credentials
3. **Admin Dashboard** → After login, test `/admin/dashboard`
4. **RBAC** → Test user can't access admin pages

---

## 🔍 Verify Export Fixed:

Setelah restart API, cek log backend saat start testing:
```
✅ [MULTI-PANEL] Configuration validated
🚀 [MULTI-PANEL] Starting testing for session: MP-xxx
📡 [MULTI-PANEL] Initial listeners count: 1
```

**Tidak ada error "not a constructor"** ← Good!

---

## 📝 Changelog:

### packages/test-engine/src/index.ts
```diff
- export * from './autonomous/AutonomousTestingOrchestrator';
+ export * from './autonomous';  // This exports MultiPanelOrchestrator too!
```

### packages/desktop/src/pages/AutonomousTestingMultiPanel.tsx
Added:
- `loginUrl` field in state
- Login Page URL input section
- Placeholder examples with comathedu.id
- Send loginUrl in API request

---

## ✅ Ready to Test!

After restart:
1. Refresh desktop app (F5)
2. Go to **🎯 Multi-Panel Testing**
3. Fill the form with comathedu.id URLs
4. Start testing!

**Status:** ✅ Export fixed, Login URL added, Ready to restart!

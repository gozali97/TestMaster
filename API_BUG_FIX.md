# API Bug Fix - Missing Moment Dependency

## 🐛 Problem
API package gagal start dengan error:
```
Error: Cannot find module 'moment'
Require stack:
- moment-timezone/moment-timezone.js
- sequelize/lib/data-types.js
```

## 🔍 Root Cause
- `sequelize` dependency membutuhkan `moment-timezone`
- `moment-timezone` membutuhkan `moment` sebagai peer dependency
- `moment` tidak ada di dependencies packages/api/package.json
- `moment` tidak terinstall di root node_modules

## ✅ Solution

### 1. Update packages/api/package.json
Menambahkan `moment` dan `moment-timezone` ke dependencies:
```json
"dependencies": {
  ...existing dependencies...
  "moment": "^2.30.1",
  "moment-timezone": "^0.5.45"
}
```

### 2. Install Dependencies
```bash
# Install di root level (workspace)
npm install moment moment-timezone

# Install di package API
cd packages/api
npm install
```

### 3. Rebuild API Package
```bash
cd packages/api
npm run build
```

### 4. Test API Start
```bash
cd packages/api
npm start
```

## ✅ Result
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

API server berhasil dijalankan tanpa error! ✨

## 📝 Files Modified
- `packages/api/package.json` - Added moment dependencies

## 🔧 Technical Details
- **moment**: v2.30.1
- **moment-timezone**: v0.5.45
- **sequelize**: v6.35.2 (requires moment for date/time handling)

## 🚀 How to Run
```bash
# From project root
npm install

# Build API
cd packages/api
npm run build

# Start API
npm start
```

## 🎯 Prevention
Untuk menghindari masalah serupa di masa depan:
1. Selalu check peer dependencies saat install package baru
2. Run `npm install` di root setelah menambahkan dependencies
3. Gunakan `npm ls <package>` untuk verify package installation
4. Consider using tools seperti `depcheck` untuk detect missing dependencies

# Port Conflict Fix - Desktop Package

## Masalah yang Diperbaiki

1. **Port Conflict**: Port 5175 sudah digunakan oleh proses sebelumnya
2. **Ketidaksesuaian Konfigurasi**: `vite.config.ts` menggunakan port 5173, sedangkan `package.json` menggunakan port 5175
3. **CJS Deprecation Warning**: Vite menggunakan CJS build yang deprecated

## Solusi yang Diterapkan

### 1. Sinkronisasi Konfigurasi Port
- ✅ **`vite.config.ts`**: Diupdate untuk menggunakan port 5175 dengan `strictPort: true`
- ✅ **`package.json`**: Script `dev:renderer` sekarang menggunakan konfigurasi dari `vite.config.ts`

### 2. Script Kill Port Otomatis
- ✅ Dibuat `kill-port.ps1` untuk membunuh proses yang menggunakan port tertentu
- ✅ Ditambahkan npm script `kill-port` untuk kemudahan akses
- ✅ `restart-clean.ps1` diupdate untuk otomatis check dan kill port 5175

### 3. Perbaikan Clean Script
- ✅ Script `clean` diupdate untuk menggunakan PowerShell command yang benar
- ✅ Menghapus cache Vite (`node_modules/.vite`) otomatis

## Cara Penggunaan

### Menjalankan Development Server
```bash
# Cara 1: Normal start (jika port sudah clear)
npm run dev

# Cara 2: Clean restart (membersihkan cache dan kill proses)
.\restart-clean.ps1

# Cara 3: Kill port manual jika diperlukan
npm run kill-port
```

### Jika Masih Ada Error Port
```bash
# Kill port 5175 secara manual
.\kill-port.ps1 -Port 5175

# Atau kill semua node processes
Get-Process node | Stop-Process -Force
```

## File yang Dimodifikasi

1. **`vite.config.ts`**: 
   - Port diubah dari 5173 → 5175
   - Ditambahkan `strictPort: true` dan `host: 'localhost'`
   - Ditambahkan konfigurasi build

2. **`package.json`**: 
   - Script `dev:renderer`: Dihapus flag `--port` dan `--strictPort` (menggunakan config file)
   - Script `clean`: Diubah ke PowerShell command
   - Script baru `kill-port`: Untuk kill port 5175

3. **`restart-clean.ps1`**: 
   - Ditambahkan check dan kill port 5175 sebelum membersihkan

4. **`kill-port.ps1`** (NEW): 
   - Script utility untuk kill proses pada port tertentu

## Tips Troubleshooting

### Jika Error "Port is already in use"
1. Jalankan: `npm run kill-port`
2. Atau jalankan: `.\kill-port.ps1 -Port 5175`
3. Kemudian: `npm run dev`

### Jika Vite CJS Warning Muncul
- Warning ini hanya informasi dari Vite tentang migrasi ke ESM
- Tidak mempengaruhi fungsionalitas
- Akan hilang ketika dependencies diupdate ke versi terbaru

### Jika Electron Tidak Muncul
1. Pastikan Vite server sudah running di `http://localhost:5175`
2. Check terminal output untuk error
3. Jalankan `.\restart-clean.ps1` untuk clean restart

## Testing
Setelah fix ini diterapkan, development server harus bisa berjalan tanpa error port conflict.

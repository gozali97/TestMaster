# Fitur Edit Script Test Case

## Fitur Baru yang Ditambahkan

### 1. **Status Test Case** 📊
Sekarang Anda bisa mengubah status test case saat edit dengan 4 pilihan:
- **📝 DRAFT** - Test case masih dalam tahap pengembangan
- **✅ ACTIVE** - Test case aktif dan siap dijalankan
- **⏸️ DISABLED** - Test case dinonaktifkan sementara
- **📦 ARCHIVED** - Test case diarsipkan (tidak digunakan lagi)

Status ini membantu Anda mengorganisir test case berdasarkan lifecycle-nya.

### 2. **Edit Script Langsung** ✏️
Di tab "Script" sekarang Anda bisa:
- **Edit JSON langsung** - Ubah test case dalam format JSON
- **Generate Steps from Script** - Convert script JSON ke visual steps
- **Update from Steps** - Sinkronisasi script dari visual steps

#### Cara Menggunakan:
1. Klik tab **"Script"**
2. Edit JSON di textarea (ubah name, description, status, steps)
3. Klik **"Generate Steps from Script"**
4. Test case akan berubah ke mode visual dengan steps yang baru

### 3. **Button Generate Steps** 🔄
Tombol **"Generate Steps from Script"** memungkinkan Anda:
- Membuat steps dari script JSON yang Anda tulis
- Import test case dari file JSON
- Duplikasi test dengan modifikasi manual di JSON

### 4. **Update from Steps** ↻
Tombol **"Update from Steps"** untuk:
- Sync script dengan visual steps yang sudah Anda edit
- Melihat struktur JSON dari test case yang sudah dibuat

## Workflow Baru

### Scenario 1: Membuat Test Case Serupa (Success & Error)
1. Buat test case untuk **success scenario**
2. Klik **📋 Copy** untuk duplicate
3. Edit test case hasil copy:
   - Ubah nama menjadi "Login - Error Scenario"
   - Ubah status jadi **DRAFT**
   - Modifikasi steps yang diperlukan
4. Save test case

### Scenario 2: Edit via Script (Advanced)
1. Buka test case yang ingin diedit
2. Klik tab **"Script"**
3. Edit JSON langsung:
   ```json
   {
     "name": "Login Test - Updated",
     "description": "Test login with multiple scenarios",
     "status": "ACTIVE",
     "steps": [
       {
         "id": "1",
         "action": "navigate",
         "value": "https://example.com/login"
       },
       {
         "id": "2",
         "action": "fill",
         "locator": "#username",
         "value": "testuser"
       }
     ]
   }
   ```
4. Klik **"Generate Steps from Script"**
5. Steps akan muncul di visual mode
6. Save test case

### Scenario 3: Copy JSON untuk Manual Edit
1. Klik **📄 JSON** di test case list
2. JSON ter-copy ke clipboard
3. Paste ke text editor
4. Edit sesuai kebutuhan
5. Copy JSON yang sudah diedit
6. Buat test case baru → Tab "Script" → Paste → Generate Steps

## Tips & Best Practices

### ✅ DO:
- Gunakan status **DRAFT** untuk test yang masih development
- Set status **ACTIVE** setelah test sudah diverifikasi
- Gunakan **DISABLED** untuk test yang temporary tidak digunakan
- Gunakan **ARCHIVED** untuk test case lama yang sudah tidak relevan

### ❌ DON'T:
- Jangan edit script JSON dengan syntax error (akan gagal generate)
- Jangan langsung set status **ACTIVE** untuk test yang belum diverifikasi
- Jangan archive test case yang masih digunakan di automation pipeline

## Struktur JSON Test Case

```json
{
  "name": "Test Name",
  "description": "Test Description",
  "status": "DRAFT|ACTIVE|DISABLED|ARCHIVED",
  "steps": [
    {
      "id": "unique-id",
      "action": "navigate|click|fill|assert|wait|etc",
      "locator": "css selector",
      "value": "value for action",
      "description": "Step description",
      "timeout": 5000,
      "enabled": true
    }
  ]
}
```

## Migration Database

Jika Anda sudah memiliki test case dengan status lama (DEPRECATED), migration akan otomatis mengkonversi ke:
- **DEPRECATED** → **ARCHIVED**

Jalankan migration dengan:
```bash
npm run migrate
```

## Troubleshooting

### Error: "Failed to parse script"
**Solusi**: Pastikan JSON valid. Gunakan JSON validator atau format dengan Prettier.

### Status tidak tersimpan
**Solusi**: Pastikan sudah jalankan migration untuk update database schema.

### Steps tidak muncul setelah generate
**Solusi**: Periksa format array steps di JSON. Harus berupa array of objects.

---

**Update**: 28 Oktober 2025
**Version**: 1.1.0

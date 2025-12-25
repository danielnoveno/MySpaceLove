# 🔍 Audit Detail Hardcoded Text - LoveSpace

## File yang Perlu Diperbaiki

### 1. ✅ **AuthenticatedLayout.jsx** - SUDAH DIPERBAIKI
**Lokasi:** `resources/js/Layouts/AuthenticatedLayout.jsx`

**Perubahan yang sudah dilakukan:**
- ✅ Line 56: `"Fitur couple akan aktif..."` → `"Couple features unlock..."`
- ✅ Line 153: `"Pilih Space"` → `"Choose Space"`
- ✅ Line 182: `"Kelola Spaces"` → `"Manage Spaces"`
- ✅ Line 452: `"Pilih Space"` → `"Choose Space"`

---

### 2. ⏳ **Dashboard.tsx** - PERLU DIPERBAIKI
**Lokasi:** `resources/js/Pages/Dashboard.tsx`

**Hardcoded text yang ditemukan:**

#### Fallback Messages (Bahasa Indonesia):
- Line 129: `"Hubungkan pasanganmu terlebih dahulu untuk membuka fitur ini."`
- Line 132: `"Hanya pemilik space yang dapat mengatur fitur ini."`
- Line 254: `"Tambah Momen"`
- Line 257: `"Catat momen spesial"`
- Line 269: `"Kelola countdown romantis"`
- Line 279: `"Buka hub permainan & skor space"`
- Line 286: `"Upload Foto"`
- Line 289: `"Simpan kenangan"`
- Line 298: `"Pesan Harian"`
- Line 301: `"Lihat pesan cinta"`
- Line 313: `"Panduan surprise 3 tahap + storybook"`
- Line 322: `"Atur Memory Lane"`
- Line 325: `"Upload puzzle & pesan tiap level"`
- Line 336: `"Sinkronisasi musik & mood jarak jauh"`
- Line 344: `"Tulis Journal"`
- Line 347: `"Ekspresikan perasaan"`
- Line 355: `"Masuk Nobar"`
- Line 358: `"Mulai nonton bareng"`
- Line 385: `"Space kamu bersama pasangan"`
- Line 409: `"Fitur Nobar Segera Hadir"`
- Line 412: `"Kami masih menyiapkan pengalaman nobar terbaik..."`
- Line 419: `"Tutup"`
- Line 440: `"Tutup"`
- Line 449: `"Pesan Cinta Hari Ini"`
- Line 471: `"Tutup"`
- Line 480: `"Fitur Terkunci"`
- Line 491: `"Mengerti"`
- Line 508: `"Pasangan belum terhubung"`
- Line 513: `"Ajak pasanganmu bergabung agar kalian bisa menikmati semua fitur berdua."`
- Line 522: `"Hubungkan Pasangan"`
- Line 537: `"Total Timeline"`
- Line 553: `"Foto & Video"`
- Line 569: `"Berbagi Lokasi"`
- Line 585: `"Buka Peta"`
- Line 596: `"Aksi Cepat"`
- Line 607: `"Fitur nobar masih dalam pengembangan. Nantikan segera!"`
- Line 659: `"Segera Hadir"`
- Line 667: `"Terkunci"`
- Line 685: `"Event Mendatang"`
- Line 691: `"Belum ada event yang dijadwalkan. Yuk buat countdown pertama kalian!"`
- Line 712: `":count hari lagi"`
- Line 735: `"Lihat Semua"`
- Line 743: `"Pesan Terbaru"`
- Line 749: `"Belum ada pesan terbaru. Coba tulis pesan spesial untuk pasanganmu!"`
- Line 774: `"Sembunyikan"`
- Line 776: `"Baca selengkapnya"`
- Line 797: `"Lihat Semua"`

**Total:** ~45 hardcoded strings dalam bahasa Indonesia

---

### 3. ⏳ **Timeline/Index.tsx** - PERLU DIPERBAIKI
**Lokasi:** `resources/js/Pages/Timeline/Index.tsx`

**Hardcoded text:**
- Line 175: `"Love Timeline – {spaceTitle}"`

---

### 4. ⏳ **MediaGallery/Index.tsx** - PERLU DIPERBAIKI
**Lokasi:** `resources/js/Pages/MediaGallery/Index.tsx`

**Hardcoded text:**
- Line 187: `"Gallery Photos — {spaceTitle}"`

---

### 5. ⏳ **Nobar/ComingSoon.tsx** - PERLU DIPERBAIKI
**Lokasi:** `resources/js/Pages/Nobar/ComingSoon.tsx`

**Hardcoded text:**
- Line 404: `"Kembali ke Dashboard"`

---

### 6. ⏳ **Spotify/LongDistanceSpotifyHub.tsx** - PERLU DIPERBAIKI BESAR
**Lokasi:** `resources/js/Pages/Spotify/LongDistanceSpotifyHub.tsx`

**Hardcoded text:** ~50+ strings dalam bahasa Indonesia (sudah didokumentasikan di LANGUAGE_AUDIT.md)

---

## Strategi Perbaikan

### Fase 1: Update File Translasi ✅ SELESAI
- ✅ `resources/lang/en/spotify.php` - Sudah dilengkapi
- ✅ `resources/lang/id/spotify.php` - Sudah dilengkapi

### Fase 2: Perbaiki Komponen React
1. ✅ **AuthenticatedLayout.jsx** - SELESAI
2. ⏳ **Dashboard.tsx** - Dalam Progress
3. ⏳ **Timeline/Index.tsx**
4. ⏳ **MediaGallery/Index.tsx**
5. ⏳ **Nobar/ComingSoon.tsx**
6. ⏳ **Spotify/LongDistanceSpotifyHub.tsx**

### Fase 3: Verifikasi
- Test semua halaman dalam bahasa Indonesia
- Test semua halaman dalam bahasa Inggris
- Pastikan tidak ada lagi hardcoded text

---

## Prinsip Perbaikan

### ❌ SEBELUM (Hardcoded):
```tsx
const message = "Hubungkan pasanganmu terlebih dahulu";
```

### ✅ SESUDAH (Menggunakan Translasi):
```tsx
const message = dashboardStrings.locks?.requires_partner ?? 
    "Connect your partner first to unlock this feature.";
```

**Catatan:** Fallback HARUS dalam bahasa Inggris untuk konsistensi!

---

## Progress Tracking

- [x] Fase 1: Update File Translasi
- [x] AuthenticatedLayout.jsx
- [ ] Dashboard.tsx (45 strings)
- [ ] Timeline/Index.tsx (1 string)
- [ ] MediaGallery/Index.tsx (1 string)
- [ ] Nobar/ComingSoon.tsx (1 string)
- [ ] Spotify/LongDistanceSpotifyHub.tsx (50+ strings)

**Total Estimasi:** ~100 hardcoded strings yang perlu diperbaiki

---

**Dibuat:** 2025-12-25
**Status:** Dalam Progress

# 🔍 Audit Konsistensi Bahasa - LoveSpace Project

## Status: 🟡 Perlu Perbaikan

### ✅ Yang Sudah Baik
1. **Sistem translasi sudah ada** - Laravel + React dengan `useTranslation` hook
2. **File bahasa sudah tersedia** - `resources/lang/en/` dan `resources/lang/id/`
3. **Dropdown pemilih bahasa** - Sudah ada di navigation bar
4. **Middleware locale** - Sudah berfungsi dengan baik

### ❌ Yang Perlu Diperbaiki

#### 1. **File dengan Hardcoded Text (Indonesia)**

##### `resources/js/Pages/Spotify/LongDistanceSpotifyHub.tsx`
**Baris yang perlu diperbaiki:**
- Line 263, 268: `"Gagal memuat data Spotify."`
- Line 286: `"Masukkan tautan atau ID lagu Spotify yang valid."`
- Line 325: `"Lagu kejutan berhasil dijadwalkan!"`
- Line 330, 334: `"Gagal menjadwalkan lagu kejutan. Coba lagi."`
- Line 351: `"Masukkan tautan atau ID lagu Spotify yang valid."`
- Line 392: `"Kapsul memori berhasil disimpan!"`
- Line 397, 401: `"Gagal menyimpan kapsul memori. Coba lagi."`
- Line 480: `"Tidak ada sesi playback yang bisa diikuti saat ini."`
- Line 499: `"Playback kamu sudah sinkron dengan sesi live."`
- Line 506: `"Gagal gabung playback. Pastikan Spotify-mu sedang aktif."`
- Line 516: `"Gagal gabung playback. Coba ulang sebentar lagi."`
- Line 548: `"Spotify Companion Kit"`
- Line 550: `"Ruang {space.title}: sinkronkan musik, mood, dan momen kalian biar tetap dekat walau terpisah jarak."`
- Line 573: `"Status Koneksi Spotify"`
- Line 575: `"Setiap akun perlu tersambung supaya playlist sinkron, mood tracking, dan kejutan berjalan optimal."`
- Line 585: `"Kamu"` / `"Pasangan"`
- Line 588-591: `"Terhubung {date}"` / `"Terhubung"` / `"Belum tersambung"`
- Line 608: `"Terhubung"`
- Line 619: `"Sambungkan"`
- Line 624: `"Belum terhubung"`
- Line 645: `"Hubungkan Spotify"`
- Line 647: `"Sambungkan akun Spotify kalian untuk menyalakan playlist sinkron, mood check-in, dan kejutan lagu."`
- Line 659: `"Hubungkan Spotify"`
- Line 669: `"Memuat data Spotify..."`
- Line 682: `"Coba Muat Ulang"`
- Line 696: `"Playlist Sinkron"`
- Line 698: `"Playlist otomatis update tiap kalian tambah lagu favorit minggu ini."`
- Line 706-715: `"Total lagu"`, `"Tambahan minggu ini"`, `"Energi rata-rata"`
- Line 721: `"Lagu terbaru"`
- Line 727: `"Ditambah {date}"`
- Line 741: `"Buka di Spotify"`
- Line 749: `"Dengarkan cuplikan favorit"`
- Line 766: `"Ditambahkan {date}"`
- Line 778: `"Browser kamu tidak mendukung audio HTML5."`
- Line 782: `"Preview tidak tersedia, buka di Spotify untuk memutar penuh."`
- Line 792: `"Buka di Spotify"`

Dan masih banyak lagi...

##### `resources/js/Pages/Surprise/MemoryLaneConfig.tsx`
- Line 294: `"Lihat Memory Lane"`
- Line 531: `"Preview Memory Lane"`

##### `resources/js/Pages/Surprise/MemoryLanePublic.tsx`
- Line 282, 324: `"Buka Memory Lane"`

#### 2. **File Translasi yang Perlu Dilengkapi**

##### `resources/lang/en/spotify.php` & `resources/lang/id/spotify.php`
Perlu menambahkan key untuk:
- Error messages (loading, validation, submission)
- Success messages
- Connection status labels
- Playlist section labels
- Mood section labels
- Surprise drop section labels
- Memory capsule section labels
- Live listening section labels
- Button labels
- Modal titles and descriptions

#### 3. **Format Tanggal Hardcoded**

File `LongDistanceSpotifyHub.tsx` menggunakan:
```typescript
date.toLocaleString("id-ID", { ... })
date.toLocaleDateString("id-ID", { ... })
```

Harus diganti dengan locale dinamis berdasarkan bahasa aktif.

## 📋 Rencana Perbaikan

### Fase 1: Lengkapi File Translasi ✅
1. Update `resources/lang/en/spotify.php`
2. Update `resources/lang/id/spotify.php`
3. Tambahkan semua key yang dibutuhkan

### Fase 2: Refactor Komponen React
1. Perbaiki `LongDistanceSpotifyHub.tsx`
2. Perbaiki `MemoryLaneConfig.tsx`
3. Perbaiki `MemoryLanePublic.tsx`
4. Perbaiki komponen lain yang masih hardcoded

### Fase 3: Dynamic Locale untuk Format Tanggal
1. Buat helper function untuk format tanggal
2. Gunakan locale dari `usePage().props.locale`

### Fase 4: Testing
1. Test semua halaman dalam bahasa Indonesia
2. Test semua halaman dalam bahasa Inggris
3. Test pergantian bahasa real-time

## 🎯 Target
- **100% teks menggunakan sistem translasi**
- **Tidak ada hardcoded text** dalam bahasa tertentu
- **Format tanggal dinamis** sesuai bahasa aktif
- **Konsisten** di seluruh aplikasi

## 📊 Progress Tracking

- [ ] Fase 1: Lengkapi File Translasi
- [ ] Fase 2: Refactor Komponen React
- [ ] Fase 3: Dynamic Locale untuk Format Tanggal
- [ ] Fase 4: Testing

---

**Catatan:** File ini akan diupdate seiring progress perbaikan.

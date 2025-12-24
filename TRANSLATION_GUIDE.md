# 🌍 Panduan Multi-Bahasa LoveSpace

## Ringkasan
Project LoveSpace mendukung **multi-bahasa** (Indonesia dan Inggris) dengan sistem translasi yang konsisten menggunakan Laravel dan React.

## 📁 Struktur File Bahasa

### Backend (Laravel)
```
resources/lang/
├── en/              # Bahasa Inggris
│   ├── app.php
│   ├── errors.php
│   ├── memory_lane.php
│   ├── spotify.php
│   ├── surprise.php
│   └── timeline.php
└── id/              # Bahasa Indonesia
    ├── app.php
    ├── errors.php
    ├── memory_lane.php
    ├── spotify.php
    ├── surprise.php
    └── timeline.php
```

### Frontend (React/TypeScript)
- Hook: `resources/js/hooks/useTranslation.ts`
- Middleware: `app/Http/Middleware/SetLocale.php`
- Middleware Inertia: `app/Http/Middleware/HandleInertiaRequests.php`

## 🔧 Konfigurasi

### File: `config/app.php`
```php
'locale' => env('APP_LOCALE', 'en'),
'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
'available_locales' => [
    'en',
    'id',
],
```

### File: `.env`
```env
APP_LOCALE=id  # atau 'en' untuk bahasa Inggris
APP_FALLBACK_LOCALE=en
```

## 💻 Cara Penggunaan

### 1. Di Backend (Laravel Controller/Blade)
```php
// Menggunakan helper __()
$message = __('app.common.actions.save');

// Dengan parameter
$greeting = __('app.notifications.mail.greeting', ['name' => $user->name]);
```

### 2. Di Frontend (React/TypeScript)
```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
    // Menggunakan namespace
    const { translations: layoutTranslations } = useTranslation('layout');
    const navigation = layoutTranslations.navigation ?? {};
    
    return (
        <div>
            <h1>{navigation.dashboard ?? 'Dashboard'}</h1>
        </div>
    );
}
```

### 3. Menggunakan fungsi `t()` untuk nested keys
```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
    const { t } = useTranslation('dashboard');
    
    return (
        <div>
            <h1>{t('cards.partner_pending.title', 'Partner not connected yet')}</h1>
        </div>
    );
}
```

## 🔄 Mengganti Bahasa

### Cara 1: Melalui UI
Pengguna dapat mengganti bahasa melalui dropdown di navigation bar (sudah tersedia).

### Cara 2: Melalui Route
```php
Route::post('/locale/switch', [LocaleController::class, 'switch'])->name('locale.switch');
```

### Cara 3: Melalui Session
```php
session()->put('locale', 'id'); // atau 'en'
```

## 📝 Menambah Terjemahan Baru

### 1. Tambahkan ke file bahasa
**File: `resources/lang/en/app.php`**
```php
return [
    'my_feature' => [
        'title' => 'My Feature',
        'description' => 'This is my feature description',
    ],
];
```

**File: `resources/lang/id/app.php`**
```php
return [
    'my_feature' => [
        'title' => 'Fitur Saya',
        'description' => 'Ini adalah deskripsi fitur saya',
    ],
];
```

### 2. Gunakan di Frontend
```tsx
const { translations } = useTranslation('app');
const myFeature = translations.my_feature ?? {};

<h1>{myFeature.title ?? 'My Feature'}</h1>
```

## 🎯 Best Practices

### ✅ DO (Lakukan)
1. **Selalu gunakan sistem translasi** untuk semua teks yang terlihat user
2. **Berikan fallback** untuk setiap translasi
   ```tsx
   {navigation.dashboard ?? 'Dashboard'}
   ```
3. **Gunakan namespace** yang sesuai dengan fitur
   ```tsx
   useTranslation('dashboard')
   useTranslation('timeline')
   useTranslation('memory_lane')
   ```
4. **Konsisten** dalam penamaan key
   ```php
   'actions' => [
       'save' => 'Simpan',
       'cancel' => 'Batal',
   ]
   ```

### ❌ DON'T (Jangan)
1. **Jangan hardcode teks** dalam bahasa tertentu
   ```tsx
   // ❌ Salah
   <button>Simpan</button>
   
   // ✅ Benar
   <button>{t('common.actions.save', 'Save')}</button>
   ```

2. **Jangan campurkan bahasa** dalam satu file
   ```php
   // ❌ Salah
   'title' => 'Dashboard',
   'subtitle' => 'Space kamu bersama pasangan',
   ```

3. **Jangan lupa tambahkan ke KEDUA bahasa** (en dan id)

## 🗂️ Namespace yang Tersedia

| Namespace | File | Deskripsi |
|-----------|------|-----------|
| `app` | `app.php` | Translasi umum aplikasi |
| `layout` | `app.php` | Navigation dan layout |
| `auth` | `app.php` | Autentikasi dan profil |
| `dashboard` | `app.php` | Dashboard |
| `timeline` | `timeline.php` | Timeline feature |
| `memory_lane` | `memory_lane.php` | Memory Lane Kit |
| `surprise` | `surprise.php` | Surprise features |
| `spotify` | `spotify.php` | Spotify integration |
| `errors` | `errors.php` | Error messages |

## 🔍 Debugging

### Melihat bahasa aktif
```tsx
import { usePage } from '@inertiajs/react';

const { props } = usePage();
console.log('Current locale:', props.locale);
console.log('Available locales:', props.availableLocales);
```

### Melihat semua translasi
```tsx
const { raw } = useTranslation();
console.log('All translations:', raw);
```

## 📦 File yang Perlu Diperhatikan

### Middleware
- `app/Http/Middleware/SetLocale.php` - Mengatur bahasa berdasarkan session/cookie
- `app/Http/Middleware/HandleInertiaRequests.php` - Mengirim translasi ke frontend

### Controllers
- `app/Http/Controllers/LocaleController.php` - Menangani pergantian bahasa

### Frontend
- `resources/js/hooks/useTranslation.ts` - Hook untuk mengakses translasi
- `resources/js/Layouts/AuthenticatedLayout.jsx` - Dropdown pemilih bahasa

## 🚀 Menambah Bahasa Baru

Jika ingin menambah bahasa baru (misal: Jepang - `ja`):

1. **Update config**
   ```php
   // config/app.php
   'available_locales' => [
       'en',
       'id',
       'ja', // Tambahkan di sini
   ],
   ```

2. **Buat folder bahasa**
   ```
   resources/lang/ja/
   ├── app.php
   ├── errors.php
   ├── memory_lane.php
   ├── spotify.php
   ├── surprise.php
   └── timeline.php
   ```

3. **Tambahkan label di translasi**
   ```php
   // resources/lang/en/app.php
   'language' => [
       'options' => [
           'en' => 'English',
           'id' => 'Bahasa Indonesia',
           'ja' => 'Japanese', // Tambahkan
       ],
   ],
   
   // resources/lang/id/app.php
   'language' => [
       'options' => [
           'en' => 'Bahasa Inggris',
           'id' => 'Bahasa Indonesia',
           'ja' => 'Bahasa Jepang', // Tambahkan
       ],
   ],
   ```

## 📞 Troubleshooting

### Translasi tidak muncul?
1. Cek apakah key sudah ada di file bahasa
2. Pastikan namespace benar
3. Clear cache: `php artisan config:clear`

### Bahasa tidak berubah?
1. Cek session: `php artisan session:clear`
2. Cek middleware `SetLocale` sudah terdaftar
3. Cek browser console untuk error

---

**Dibuat dengan ❤️ untuk LoveSpace Project**

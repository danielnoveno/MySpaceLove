# Notification Dropdown Feature

## Overview
Fitur notification dropdown memungkinkan user untuk melihat ringkasan notifikasi terbaru tanpa harus pindah ke halaman notifikasi. Dropdown ini muncul di navigation bar dan dapat diakses dari halaman manapun.

## Features
- ✅ Menampilkan 5 notifikasi terbaru
- ✅ Badge unread count dengan animasi pulse
- ✅ Relative time formatting (e.g., "2h ago", "3d ago")
- ✅ Lazy loading - notifikasi hanya di-fetch saat dropdown dibuka
- ✅ **Auto mark-as-read** - notifikasi otomatis ditandai sudah dibaca saat diklik
- ✅ **Quick Actions** - tombol cepat untuk tandai baca dan hapus pada setiap notifikasi
- ✅ Optimistic UI updates - UI langsung update sebelum API response (untuk read & delete)
- ✅ Clickable notification items (jika ada action_url)
- ✅ Link ke halaman notifikasi lengkap
- ✅ Multi-language support (EN & ID)
- ✅ Responsive design dengan smooth animations
- ✅ Empty state yang informatif

## Components

### NotificationDropdown.jsx
Component utama yang menampilkan dropdown notifikasi.

**Props:**
- `spaceSlug` (string, required) - Slug dari space yang aktif
- `unreadCount` (number, optional) - Jumlah notifikasi yang belum dibaca
- `translations` (object, optional) - Object translations untuk multi-language

**Features:**
- Auto-fetch notifications saat dropdown dibuka
- Menampilkan loading state
- Format waktu relatif (Just now, 2m ago, 3h ago, 5d ago)
- Truncate text untuk judul dan body
- Highlight untuk notifikasi yang belum dibaca

### Dropdown.jsx (Updated)
Component dropdown yang sudah di-update untuk support:
- `onOpenChange` callback - dipanggil saat dropdown dibuka/ditutup
- `width="96"` option - untuk dropdown yang lebih lebar (24rem)

## Backend

### NotificationController.php
Added new method: `recent()`
- Endpoint: `GET /spaces/{space}/notifications/recent`
- Returns: JSON dengan 5 notifikasi terbaru untuk space tertentu
- Filter: Hanya notifikasi yang terkait dengan space yang diminta

### Routes
```php
Route::get('/spaces/{space:slug}/notifications/recent', [NotificationController::class, 'recent'])
    ->name('spaces.notifications.recent');
```

## Translations

### English (resources/lang/en/app.php)
```php
'notifications' => [
    'actions' => [
        'view_all' => 'View All Notifications',
        // ...
    ],
    'dropdown' => [
        'no_notifications' => 'No notifications',
        'no_notifications_desc' => 'You\'re all caught up!',
    ],
]
```

### Indonesian (resources/lang/id/app.php)
```php
'notifications' => [
    'actions' => [
        'view_all' => 'Lihat Semua Notifikasi',
        // ...
    ],
    'dropdown' => [
        'no_notifications' => 'Tidak ada notifikasi',
        'no_notifications_desc' => 'Semua sudah terbaca!',
    ],
]
```

## Usage

Di `AuthenticatedLayout.jsx`:
```jsx
import NotificationDropdown from "@/Components/NotificationDropdown";
import { useTranslation } from "@/hooks/useTranslation";

// Inside component
const { translations: notificationTranslations } = useTranslation("notifications");

// In JSX
<NotificationDropdown 
    spaceSlug={activeSpace.slug}
    unreadCount={unreadNotificationsCount}
    translations={notificationTranslations}
/>
```

## Styling
- Menggunakan Tailwind CSS
- Pink/Purple theme sesuai dengan design system LoveSpace
- Smooth transitions dan hover effects
- Responsive max-height dengan scroll

## Performance Optimizations
1. **Lazy Loading**: Notifikasi hanya di-fetch saat dropdown dibuka pertama kali
2. **Caching**: Setelah di-fetch, data disimpan di state (tidak fetch ulang)
3. **Limited Results**: Hanya mengambil 5 notifikasi terbaru
4. **Efficient Filtering**: Backend melakukan filtering berdasarkan space_id

## Future Enhancements
- [ ] Mark as read dari dropdown
- [ ] Real-time updates dengan WebSocket/Pusher
- [ ] Infinite scroll untuk notifikasi lebih banyak
- [ ] Notification categories/filters
- [ ] Sound/desktop notifications

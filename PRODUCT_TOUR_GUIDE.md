# Product Tour (User Onboarding) - LoveSpace

## 📋 Overview

Product Tour telah diimplementasikan untuk memberikan pengalaman onboarding yang interaktif dan menarik bagi user baru. Tour ini akan otomatis dimulai saat user pertama kali mengakses Dashboard setelah membuat akun.

## ✨ Features

### 1. **Automatic Tour for New Users**
- Tour otomatis dimulai saat user pertama kali mengakses Dashboard
- Menggunakan localStorage untuk tracking apakah user sudah pernah melihat tour
- User dapat melewati tour kapan saja dengan tombol close

### 2. **Comprehensive Coverage**
Tour mencakup 19 langkah yang menjelaskan semua fitur utama:

1. **Welcome** - Sambutan awal
2. **Statistics** - Statistik hubungan (hari bersama, memories, dll)
3. **Timeline** - Love Timeline untuk momen spesial
4. **Gallery** - Media Gallery untuk foto & video
5. **Countdown** - Countdown untuk event spesial
6. **Daily Messages** - Pesan cinta harian
7. **Journal** - Love Journal untuk catatan pribadi
8. **Location Sharing** - Berbagi lokasi real-time
9. **Spotify Companion** - Dengarkan musik bersama
10. **Games** - Game couple (Chess, Tic-Tac-Toe, dll)
11. **Memory Lane** - Surprise interaktif dengan puzzle & flipbook
12. **Video Call** - Ruang video call pribadi
13. **Wishlist** - Wishlist untuk hadiah
14. **Documents** - Penyimpanan dokumen penting
15. **Surprise Notes** - Catatan kejutan
16. **Goals** - Target hubungan
17. **Notifications** - Pusat notifikasi
18. **Profile** - Pengaturan profil
19. **Complete** - Pesan penutup

### 3. **Multi-Language Support**
- Mendukung Bahasa Indonesia dan English
- Translasi lengkap untuk semua step
- Otomatis mengikuti bahasa yang dipilih user

### 4. **Beautiful UI**
- Gradient background (purple to violet)
- Smooth animations
- Progress indicator
- Responsive design
- Custom styling yang match dengan tema LoveSpace

## 🎯 Implementation Details

### Files Created/Modified

#### 1. **ProductTour Component**
```
resources/js/Components/ProductTour/ProductTour.tsx
```
- Main component untuk Product Tour
- Menggunakan library `driver.js`
- Custom styling dengan gradient purple-violet
- Auto-start logic dengan localStorage

#### 2. **Translations**
```
resources/lang/en/app.php
resources/lang/id/app.php
```
- Menambahkan section `tour` dengan 19 step translations
- Lengkap untuk EN dan ID

#### 3. **Dashboard Integration**
```
resources/js/Pages/Dashboard.tsx
```
- Import ProductTour component
- Add IDs to key elements:
  - `#space-title` - Header dengan nama space
  - `#stats-section` - Section statistik
  - `#quick-actions-section` - Quick actions
  - `#countdown-section` - Upcoming events
  - `#daily-messages-section` - Recent messages
- Auto-start logic dengan localStorage check

### Required IDs for Navigation Menu

⚠️ **IMPORTANT**: Untuk tour bekerja sempurna, tambahkan IDs berikut ke navigation menu:

```tsx
// Di file navigation component (biasanya di Layout atau Sidebar)
<nav>
  <a id="location-menu" href="/location">Location</a>
  <a id="spotify-menu" href="/spotify">Spotify</a>
  <a id="games-menu" href="/games">Games</a>
  <a id="memory-lane-menu" href="/memory-lane">Memory Lane</a>
  <a id="video-call-menu" href="/video-call">Video Call</a>
  <a id="wishlist-menu" href="/wishlist">Wishlist</a>
  <a id="docs-menu" href="/docs">Documents</a>
  <a id="surprise-notes-menu" href="/surprise-notes">Surprise Notes</a>
  <a id="goals-menu" href="/goals">Goals</a>
  <button id="notifications-button">Notifications</button>
  <button id="profile-menu">Profile</button>
</nav>
```

## 🚀 Usage

### For New Users
Tour akan otomatis dimulai saat pertama kali mengakses Dashboard.

### Manual Tour Start
User dapat memulai tour kapan saja dengan:
1. Menghapus localStorage: `localStorage.removeItem('lovespace_tour_completed')`
2. Refresh halaman Dashboard

### Disable Auto-Start
Jika ingin disable auto-start sementara untuk testing:
```tsx
<ProductTour 
  autoStart={false}  // Set to false
  onComplete={() => {
    localStorage.setItem('lovespace_tour_completed', 'true');
  }}
/>
```

## 🎨 Customization

### Styling
Edit di `ProductTour.tsx`:
```tsx
<style>{`
  .lovespace-tour-popover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    // Customize gradient colors here
  }
`}</style>
```

### Tour Steps
Tambah/edit steps di `ProductTour.tsx`:
```tsx
const dashboardSteps = [
  {
    element: '#your-element-id',
    popover: {
      title: t('tour.your_step.title', 'Default Title'),
      description: t('tour.your_step.description', 'Default Description'),
      side: 'bottom', // top, bottom, left, right
      align: 'center' // start, center, end
    }
  },
  // ... more steps
];
```

### Translations
Tambah translations di `resources/lang/en/app.php` dan `resources/lang/id/app.php`:
```php
'tour' => [
  'your_step' => [
    'title' => 'Your Title',
    'description' => 'Your Description',
  ],
],
```

## 📦 Dependencies

### NPM Package
```bash
npm install driver.js --save
```

### Import CSS
CSS sudah di-import otomatis di component:
```tsx
import 'driver.js/dist/driver.css';
```

## 🔧 Configuration Options

ProductTour component menerima props:

```tsx
interface ProductTourProps {
  onComplete?: () => void;      // Callback saat tour selesai
  autoStart?: boolean;          // Auto-start tour (default: false)
  tourType?: 'dashboard' | 'full'; // Tipe tour (future feature)
}
```

## 📱 Responsive Design

Tour sudah responsive dan akan menyesuaikan dengan ukuran layar:
- Desktop: Full experience dengan semua steps
- Tablet: Adjusted positioning
- Mobile: Optimized untuk layar kecil

## 🎯 Best Practices

1. **Keep Steps Concise**: Setiap step harus jelas dan ringkas
2. **Use Emojis**: Emoji membuat tour lebih menarik
3. **Logical Flow**: Urutkan steps sesuai alur user journey
4. **Test on All Devices**: Pastikan tour bekerja di semua ukuran layar
5. **Update Translations**: Selalu update kedua bahasa (EN & ID)

## 🐛 Troubleshooting

### Tour tidak muncul?
1. Check localStorage: `localStorage.getItem('lovespace_tour_completed')`
2. Pastikan element IDs sudah ditambahkan
3. Check console untuk errors

### Element tidak ter-highlight?
1. Pastikan ID element benar
2. Element harus visible saat tour dimulai
3. Check z-index conflicts

### Translations tidak muncul?
1. Clear cache Laravel: `php artisan cache:clear`
2. Pastikan translations sudah di-publish
3. Check locale setting

## 🔮 Future Enhancements

1. **Different Tour Types**
   - Dashboard tour (current)
   - Feature-specific tours
   - Advanced features tour

2. **Tour Analytics**
   - Track completion rate
   - Identify drop-off points
   - A/B testing different flows

3. **Interactive Elements**
   - Allow users to interact during tour
   - Mini-tasks to complete
   - Gamification elements

4. **Personalization**
   - Different tours for different user types
   - Skip irrelevant features
   - Adaptive based on usage

## 📝 Notes

- Tour menggunakan localStorage, jadi akan reset jika user clear browser data
- Tour hanya muncul di Dashboard page
- User bisa skip tour kapan saja dengan tombol close
- Tour akan otomatis scroll ke element yang sedang di-highlight

## 🎉 Credits

- **Library**: [Driver.js](https://driverjs.com/)
- **Design**: Custom LoveSpace theme
- **Implementation**: December 2025

---

**Made with ❤️ for LoveSpace Users**

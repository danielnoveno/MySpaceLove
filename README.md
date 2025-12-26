# 💖 LoveSpace - Platform Kenangan Romantis

> Platform berbasis web untuk menyimpan dan berbagi kenangan romantis dengan pasangan Anda

## 📋 Daftar Isi

- [Tentang LoveSpace](#-tentang-lovespace)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Deployment Guide](#-deployment-guide)
- [Component Library](#-component-library)
- [Maintenance](#-maintenance)

---

## 🌟 Tentang LoveSpace

LoveSpace adalah platform yang memungkinkan pasangan untuk:
- Membuat space pribadi untuk kenangan bersama
- Upload foto dan video kenangan
- Membuat timeline interaktif (Memory Lane)
- Puzzle games untuk membuka kenangan
- Flipbook digital untuk momen spesial
- Integrasi Spotify untuk playlist romantis
- Video call dengan TUI Room Kit

---

## ✨ Fitur Utama

### 🏠 Spaces
- Buat space pribadi untuk pasangan
- Undang partner dengan kode unik
- Kelola kenangan bersama

### 📸 Media Gallery
- Upload foto dan video
- Optimasi otomatis (WebP conversion)
- Lazy loading untuk performa

### 🎯 Memory Lane
- Timeline interaktif kenangan
- 3 level puzzle games
- Lucky box rewards
- Flipbook digital

### 🎵 Spotify Integration
- Playlist romantis
- Sync dengan Spotify account
- Music player terintegrasi

### 📞 Video Call
- TUI Room Kit integration
- Private video call dengan partner

### 🌍 Multi-Language
- Bahasa Indonesia
- English
- Switch language real-time

---

## 🛠️ Teknologi

### Backend
- **Laravel 11** - PHP Framework
- **MySQL** - Database
- **Redis** - Cache & Sessions (optional)

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Inertia.js** - SPA Framework
- **Tailwind CSS** - Styling
- **Vite** - Build Tool

### External Services
- **Gemini AI** - AI Features
- **Spotify API** - Music Integration
- **TUI Room Kit** - Video Call

---

## 🚀 Deployment Guide

### Persiapan di Local

#### 1. Build Assets Production
```bash
npm run build
```

Ini akan menghasilkan:
- Optimized React bundles
- Code splitting (vendor chunks)
- Minified CSS & JS
- Assets di folder `public/build`

#### 2. Database Migration
```bash
# Backup database dulu!
php artisan migrate --force
```

Migration akan menambahkan:
- Performance indexes
- Optimasi query database

#### 3. Optimize Laravel
```bash
# Clear cache
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Build cache untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

### Deployment ke cPanel

#### Step 1: Compress Project

**File yang HARUS di-upload:**
```
✅ app/
✅ bootstrap/
✅ config/
✅ database/
✅ public/
✅ resources/
✅ routes/
✅ storage/
✅ .env (update untuk production)
✅ composer.json
✅ composer.lock
✅ artisan
✅ vite.config.js
```

**File yang TIDAK perlu:**
```
❌ node_modules (terlalu besar)
❌ vendor (install di server)
❌ .git
❌ storage/logs/*.log
❌ *.md (dokumentasi)
```

#### Step 2: Upload ke cPanel

1. Login ke cPanel
2. Buka **File Manager**
3. Upload file zip ke folder domain
4. Extract file zip
5. Hapus file zip

#### Step 3: Setup Environment

Edit file `.env` via cPanel File Manager:

```env
# WAJIB DIUBAH
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database (dari cPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_database
DB_USERNAME=your_cpanel_user
DB_PASSWORD=your_cpanel_password

# Cache & Session
CACHE_STORE=database
SESSION_DRIVER=database

# API Keys (sesuaikan)
GEMINI_API_KEY=your_key
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
```

#### Step 4: Install Dependencies

**Jika ada SSH access:**
```bash
cd public_html/your-folder
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan storage:link
```

**Jika TIDAK ada SSH:**
1. Install `composer install` di local
2. Upload folder `vendor` juga
3. Jalankan migration manual via phpMyAdmin

#### Step 5: Set Permissions

Via cPanel File Manager:
- Folder `storage/*` → **755**
- Folder `bootstrap/cache` → **755**
- File `.env` → **644**

#### Step 6: Configure Web Server

1. Set **Document Root** ke: `public_html/your-folder/public`
2. Pastikan `.htaccess` ada di folder `public`
3. Enable PHP 8.2+
4. Enable PHP extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, XML

---

### Deployment ke VPS/Dedicated Server

#### Server Requirements

**Minimum:**
- PHP 8.2+
- MySQL 5.7+ / MariaDB 10.3+
- Nginx / Apache
- Composer
- Node.js 18+

**Recommended:**
- PHP 8.2+ with OPcache
- MySQL 8.0+ / MariaDB 10.6+
- Redis 6.0+
- Nginx with HTTP/2
- SSL Certificate (Let's Encrypt)

#### Quick Deploy Script

```bash
#!/bin/bash
# deploy.sh

# Pull latest code
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci && npm run build

# Run migrations
php artisan migrate --force

# Clear and rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Link storage
php artisan storage:link

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

Jalankan:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    root /var/www/lovespace/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 📦 Component Library

### UI Components

#### Buttons
```tsx
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

<PrimaryButton onClick={handleClick}>Simpan</PrimaryButton>
<SecondaryButton>Batal</SecondaryButton>
<DangerButton>Hapus</DangerButton>
```

#### Card (Compound Component)
```tsx
import Card from '@/Components/Card';

<Card variant="romantic" hover>
    <Card.Header>
        <Card.Title>Judul</Card.Title>
        <Card.Description>Deskripsi</Card.Description>
    </Card.Header>
    <Card.Body>Konten</Card.Body>
    <Card.Footer>
        <PrimaryButton>Action</PrimaryButton>
    </Card.Footer>
</Card>
```

**Variants:** `default`, `elevated`, `glass`, `romantic`

#### Form Components
```tsx
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

<InputLabel value="Email" />
<TextInput type="email" placeholder="Email Anda" />
<InputError message={errors.email} />
<Checkbox checked={isChecked} onChange={handleChange} />
```

#### Loading States
```tsx
import Spinner, { LoadingOverlay, LoadingButton } from '@/Components/Loading';

<Spinner size="lg" variant="primary" />

<LoadingOverlay isLoading={isLoading} text="Memuat...">
    <YourContent />
</LoadingOverlay>

<LoadingButton isLoading={isSubmitting} loadingText="Menyimpan...">
    Simpan
</LoadingButton>
```

#### Other Components
```tsx
import Avatar, { AvatarGroup } from '@/Components/Avatar';
import Badge from '@/Components/Badge';
import Alert from '@/Components/Alert';
import Tooltip from '@/Components/Tooltip';
import Dropdown from '@/Components/Dropdown';

<Avatar name="John Doe" size="lg" status="online" />
<Badge variant="primary" rounded>New</Badge>
<Alert variant="success" title="Berhasil!">Data tersimpan</Alert>
<Tooltip content="Helpful tip" position="top">
    <button>Hover me</button>
</Tooltip>
```

### Custom Hooks

```tsx
import { 
    useToggle,        // Boolean state management
    useDebounce,      // Debounce values
    useClickOutside,  // Detect outside clicks
    useLocalStorage   // Persistent state
} from '@/hooks';

// useToggle
const [isOpen, toggle, setTrue, setFalse] = useToggle(false);

// useDebounce
const debouncedSearch = useDebounce(search, 500);

// useClickOutside
const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => console.log('Clicked outside'));

// useLocalStorage
const [user, setUser, removeUser] = useLocalStorage('user', null);
```

### Utility Functions

```tsx
import { 
    cn,                  // Conditional classNames
    formatDate,          // Format tanggal
    formatRelativeTime,  // "2 jam yang lalu"
    truncate,            // Potong text
    capitalize,          // Kapital huruf pertama
    getInitials,         // Dapatkan inisial
    formatFileSize,      // Format ukuran file
    shuffle,             // Acak array
    unique,              // Hapus duplikat
    groupBy,             // Group array
    debounce,            // Debounce function
    throttle             // Throttle function
} from '@/utils/helpers';

// Examples
const className = cn('base', isActive && 'active');
formatDate(new Date(), 'id-ID'); // "26 Desember 2025"
getInitials('John Doe'); // "JD"
formatFileSize(1024); // "1 KB"
```

### Theme System

```tsx
import { theme } from '@/utils/theme';

// Colors
theme.colors.primary[500] // #ec4899

// Gradients
className={theme.gradients.primary}
className="bg-gradient-to-r from-pink-500 to-rose-500"

// Component variants
className={theme.buttonVariants.primary}
className={theme.cardVariants.romantic}
```

---

## 🔧 Maintenance

### Cache Management

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Storage Optimization

```bash
# Clean orphaned files (custom command)
php artisan storage:cleanup

# Storage report
php artisan storage:report

# Clear old sessions
php artisan session:gc
```

### Database Maintenance

```bash
# Optimize database
php artisan db:optimize

# Backup database
php artisan backup:run

# Check database connection
php artisan db:show
```

### Monitoring

```bash
# Check logs
tail -f storage/logs/laravel.log

# Check Redis (if using)
redis-cli ping

# Check queue status
php artisan queue:work --once
```

### Maintenance Mode

```bash
# Enable maintenance mode
php artisan down --refresh=15

# Disable maintenance mode
php artisan up
```

---

## 🔒 Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production`
- [ ] SSL certificate installed
- [ ] Strong database password
- [ ] API keys secured in `.env`
- [ ] File permissions correct (755/644)
- [ ] `.env` not in version control
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] XSS protection enabled

---

## 📊 Performance Optimizations

### ✅ Database
- Indexes on all foreign keys
- Selective column loading
- Query caching (30 minutes)
- Connection pooling

### ✅ Frontend
- Code splitting (vendor chunks)
- Lazy loading images
- Minification (Terser)
- Gzip/Brotli compression
- Asset optimization

### ✅ Laravel
- Config caching
- Route caching
- View caching
- OPcache enabled
- Autoloader optimized

### ✅ Caching Strategy
- Redis for cache & sessions (recommended)
- Database cache (fallback)
- Query result caching
- CDN for static assets

---

## 🐛 Troubleshooting

### Error 500 - Internal Server Error
```bash
# Check logs
tail -f storage/logs/laravel.log

# Check permissions
chmod -R 755 storage bootstrap/cache

# Clear and rebuild cache
php artisan cache:clear
php artisan config:cache
```

### Assets Not Loading
```bash
# Rebuild assets
npm run build

# Check public directory
ls -la public/build

# Check .htaccess
cat public/.htaccess
```

### Database Connection Failed
```bash
# Test connection
php artisan db:show

# Check .env
cat .env | grep DB_

# Test MySQL
mysql -u username -p database_name
```

### Slow Performance
```bash
# Check Redis
redis-cli ping

# Check OPcache
php -i | grep opcache

# Enable query logging
# Add to .env: DB_LOG_QUERIES=true
```

---

## 📝 Environment Variables

```env
# Application
APP_NAME=LoveSpace
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_KEY=base64:...

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=lovespace
DB_USERNAME=root
DB_PASSWORD=

# Cache & Session
CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

# External APIs
GEMINI_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=
```

---

## 📞 Support

### Logs Location
- Laravel: `storage/logs/laravel.log`
- Nginx: `/var/log/nginx/error.log`
- PHP-FPM: `/var/log/php8.2-fpm.log`

### Performance Metrics
- Page Load Time: < 2 seconds
- Database Queries: < 20 per page
- Memory Usage: < 128MB per request
- Cache Hit Rate: > 80%

### Useful Commands
```bash
# Check PHP version
php -v

# Check installed extensions
php -m

# Check Laravel version
php artisan --version

# List all routes
php artisan route:list

# List all commands
php artisan list
```

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Credits

**Built with ❤️ for LoveSpace**  
**Version**: 1.0.0  
**Framework**: Laravel 11 + React 18 + TypeScript + Inertia.js  
**Last Updated**: December 2025

---

## 🎯 Quick Start Checklist

### Development
- [ ] Clone repository
- [ ] `composer install`
- [ ] `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] `php artisan key:generate`
- [ ] Setup database
- [ ] `php artisan migrate`
- [ ] `npm run dev`
- [ ] `php artisan serve`

### Production Deployment
- [ ] `npm run build`
- [ ] `composer install --optimize-autoloader --no-dev`
- [ ] Update `.env` for production
- [ ] `php artisan migrate --force`
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] `php artisan storage:link`
- [ ] Set correct file permissions
- [ ] Configure web server
- [ ] Setup SSL certificate
- [ ] Test all features
- [ ] Monitor logs

---

**🚀 Ready to deploy? Follow the deployment guide above!**

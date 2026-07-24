# LoveSpace - Panduan Deploy GRATIS ke Internet

## Arsitektur Deploy

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   Railway    │───▶│  PlanetScale │    │Cloudflare │ │
│  │  (Backend)   │    │  (Database)  │    │   R2      │ │
│  │  PHP/Laravel │    │  MySQL Free  │    │(File 10GB)│ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│                                                         │
│  Total: $0/bulan (semua free tier)                      │
└─────────────────────────────────────────────────────────┘
```

---

## Langkah 1: Setup PlanetScale (Database Gratis)

1. Buka [planetscale.com](https://planetscale.com)
2. Sign up dengan GitHub/Google
3. Klik **"Create database"**
   - Name: `lovespace`
   - Region: `us-east-1` (atau terdekat)
4. Setelah database dibuat, klik **"Connect"**
5. Pilih **"PHP"** → Copy connection string
6. Catat values ini:
   - `DB_HOST` = `aws.connect.psdb.cloud`
   - `DB_USERNAME` = `your_username`
   - `DB_PASSWORD` = `your_password`

---

## Langkah 2: Setup Cloudflare R2 (File Storage Gratis)

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com)
2. Login atau buat akun
3. Klik **"R2"** di sidebar
4. Klik **"Create bucket"**
   - Name: `lovespace-uploads`
   - Location: `Automatic`
5. Setelah bucket dibuat, klik **"Manage R2 API Tokens"**
6. Klik **"Create API token"**
   - Permissions: `Object Read & Write`
   - Scope: `lovespace-uploads`
7. Catat values ini:
   - `R2_ENDPOINT` = `https://<account-id>.r2.cloudflarestorage.com`
   - `R2_KEY` = `<access_key_id>`
   - `R2_SECRET` = `<secret_access_key>`
   - `R2_BUCKET` = `lovespace-uploads`

---

## Langkah 3: Setup Railway (Backend Gratis)

1. Buka [railway.app](https://railway.app)
2. Sign up dengan GitHub
3. Klik **"New Project"** → **"Deploy from GitHub repo"**
4. Pilih repository `MySpaceLove`
5. Railway akan mendeteksi Dockerfile otomatis

### Set Environment Variables:
Klik tab **"Variables"** lalu tambahkan:

```bash
# App
APP_NAME=LoveSpace
APP_ENV=production
APP_KEY=base64:generate_this_with_php_artisan_key_generate
APP_DEBUG=false
APP_URL=https://your-app.up.railway.app

# Database (dari PlanetScale)
DB_CONNECTION=mysql
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_DATABASE=lovespace
DB_USERNAME=your_planetscale_username
DB_PASSWORD=your_planetscale_password
DB_SSLMODE=require

# Session/Cache/Queue (Database driver - Gratis)
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# File Storage (dari Cloudflare R2)
FILESYSTEM_DISK=r2
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_KEY=your_r2_key
R2_SECRET=your_r2_secret
R2_BUCKET=lovespace-uploads
R2_REGION=auto

# Mail (opsional - pakai Mailtrap free)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_pass
MAIL_ENCRYPTION=tls

# Logging
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=error
```

---

## Langkah 4: Deploy!

1. Setelah variables diisi, Railway akan otomatis rebuild
2. Tunggu 3-5 menit untuk build selesai
3. Klik tab **"Settings"** → **"Networking"**
4. Klik **"Generate Domain"** untuk dapat URL gratis
5. Website akan bisa diakses di: `https://your-app.up.railway.app`

---

## Langkah 5: Setup Database Tables

1. Buka terminal di Railway (atau SSH ke container)
2. Jalankan:
```bash
php artisan migrate --force
```

---

## (Opsional) Setup Domain Sendiri

1. Beli domain di [Namecheap](https://namecheap.com) atau [Cloudflare Registrar](https://cloudflare.com/products/registrar/)
2. Di Railway → Settings → Networking → Custom Domain
3. Tambahkan domain Anda
4. Update DNS records sesuai instruksi Railway
5. Update `APP_URL` dan `SESSION_DOMAIN` di environment variables

---

## Troubleshooting

### Error 502 Bad Pasti
- Cek logs di Railway → Deployments → View Logs
- Pastikan `APP_KEY` sudah di-set
- Pastikan database connection string benar

### File Upload Gagal
- Pastikan `FILESYSTEM_DISK=r2`
- Pastikan R2 credentials benar
- Cek R2 bucket permissions

### Session Expired
- Pastikan `SESSION_DRIVER=database`
- Jalankan `php artisan migrate` untuk buat sessions table

---

## Biaya

| Service | Free Tier | Keterangan |
|---|---|---|
| Railway | $5/bulan kredit | Cukup untuk app kecil |
| PlanetScale | 5 GB, 1B reads | MySQL-compatible |
| Cloudflare R2 | 10 GB, 1 juta requests | S3-compatible |
| **TOTAL** | **$0/bulan** | Semua gratis! |

---

## Useful Commands

```bash
# Lihat logs
railway logs

# Jalankan artisan command
railway run php artisan <command>

# Migrate database
railway run php artisan migrate --force

# Clear cache
railway run php artisan cache:clear
railway run php artisan config:clear
railway run php artisan route:clear
```
